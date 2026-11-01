// src/services/aiService.ts
// AlgoTrack: Groq AI Code Assistant Client Service with BYOK & Free Usage Tracking

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  action?: string;
  isError?: boolean;
}

export interface ProblemContext {
  title: string;
  problem_number?: number;
  difficulty: string;
  pattern?: string;
  topics: string[];
  description?: string;
  theory_content?: string;
  hints?: string[];
  examples?: Array<{ input: string; output: string; explanation?: string }>;
  constraints?: string[];
}

export interface UserAiUsageSummary {
  freeRequestsLimit: number;
  freeRequestsUsed: number;
  freeRequestsRemaining: number;
  hasCustomKey: boolean;
  customKeyMasked: string | null;
  customKeyStatus: 'connected' | 'invalid' | 'none';
}

export interface AskAiParams {
  problemTitle: string;
  problemDescription?: string;
  language: string;
  code?: string;
  action?: string;
  question?: string;
  examples?: Array<{ input: string; output: string; explanation?: string }>;
  constraints?: string[];
  theoryContent?: string;
  hints?: string[];
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  token?: string | null;
  userId?: string | null;
}

export interface AiResponse {
  reply: string;
  model: string;
  action?: string;
  providerType?: 'application' | 'user';
  usage?: UserAiUsageSummary;
}

function buildAuthHeaders(token?: string | null, userId?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (userId) {
    headers['x-user-id'] = userId;
  }
  return headers;
}

/**
 * Sends problem context and question to backend Groq AI Assistant
 */
export async function askGroqAI(params: AskAiParams): Promise<AiResponse> {
  const headers = buildAuthHeaders(params.token, params.userId);

  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        problemTitle: params.problemTitle,
        problemDescription: params.problemDescription || '',
        language: params.language,
        code: params.code || '',
        action: params.action,
        question: params.question,
        examples: params.examples,
        constraints: params.constraints,
        theoryContent: params.theoryContent,
        hints: params.hints,
        messages: params.messages || [],
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      const errorMsg =
        errJson?.message || `AI service returned HTTP ${response.status}: ${response.statusText}`;

      const err = new Error(errorMsg) as Error & { status?: number; isLimitReached?: boolean };
      err.status = response.status;
      if (
        response.status === 403 ||
        errorMsg.toLowerCase().includes('free ai tutor messages') ||
        errorMsg.toLowerCase().includes('used all 3')
      ) {
        err.isLimitReached = true;
      }
      throw err;
    }

    const data = await response.json();
    return data.data;
  } catch (err: any) {
    // If backend server is unreachable
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error(
        'Unable to reach AlgoTrack backend API at http://localhost:5000. Ensure the backend server is running (`npm run dev:backend`).'
      );
    }
    throw err;
  }
}

/**
 * Fetches user's AI free usage and personal key status
 */
export async function fetchAiUsage(
  token?: string | null,
  userId?: string | null
): Promise<UserAiUsageSummary> {
  const headers = buildAuthHeaders(token, userId);
  try {
    const res = await fetch(`${API_BASE_URL}/ai/usage`, { headers });
    if (!res.ok) {
      return {
        freeRequestsLimit: 3,
        freeRequestsUsed: 0,
        freeRequestsRemaining: 3,
        hasCustomKey: false,
        customKeyMasked: null,
        customKeyStatus: 'none',
      };
    }
    const data = await res.json();
    return data.data;
  } catch {
    return {
      freeRequestsLimit: 3,
      freeRequestsUsed: 0,
      freeRequestsRemaining: 3,
      hasCustomKey: false,
      customKeyMasked: null,
      customKeyStatus: 'none',
    };
  }
}

/**
 * Verifies a submitted Groq API key with Groq without storing it
 */
export async function verifyGroqApiKey(
  apiKey: string,
  token?: string | null,
  userId?: string | null
): Promise<{ valid: boolean; model: string }> {
  const headers = buildAuthHeaders(token, userId);
  const res = await fetch(`${API_BASE_URL}/ai/key/verify`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ apiKey }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to verify Groq API key.');
  }
  return data.data;
}

/**
 * Verifies, encrypts, and securely saves the user's personal Groq API key
 */
export async function saveGroqApiKey(
  apiKey: string,
  token?: string | null,
  userId?: string | null
): Promise<{ status: string; maskedKey: string; model: string }> {
  const headers = buildAuthHeaders(token, userId);
  const res = await fetch(`${API_BASE_URL}/ai/key`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ apiKey }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to save Groq API key.');
  }
  return data.data;
}

/**
 * Removes the user's stored personal Groq key
 */
export async function deleteGroqApiKey(
  token?: string | null,
  userId?: string | null
): Promise<{ status: string }> {
  const headers = buildAuthHeaders(token, userId);
  const res = await fetch(`${API_BASE_URL}/ai/key`, {
    method: 'DELETE',
    headers,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to remove Groq API key.');
  }
  return data.data;
}

/**
 * Checks backend Groq configuration status
 */
export async function checkAiStatus(): Promise<{ configured: boolean; provider: string; model: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/status`);
    if (!res.ok) return { configured: false, provider: 'Groq', model: 'llama-3.3-70b-versatile' };
    const data = await res.json();
    return data.data;
  } catch {
    return { configured: false, provider: 'Groq', model: 'llama-3.3-70b-versatile' };
  }
}
