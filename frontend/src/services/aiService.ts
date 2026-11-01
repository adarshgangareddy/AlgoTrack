// src/services/aiService.ts
// AlgoTrack Phase 6: Groq AI Code Assistant Client Service

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
}

export interface AskAiParams {
  problemTitle: string;
  problemDescription?: string;
  language: string;
  code?: string;
  action?: string;
  question?: string;
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  token?: string | null;
  userId?: string | null;
}

export interface AiResponse {
  reply: string;
  model: string;
  action?: string;
}

/**
 * Sends code and question to backend Groq AI Assistant
 */
export async function askGroqAI(params: AskAiParams): Promise<AiResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (params.token) {
    headers['Authorization'] = `Bearer ${params.token}`;
  }
  if (params.userId) {
    headers['x-user-id'] = params.userId;
  }

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
        messages: params.messages || [],
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      throw new Error(
        errJson?.message || `AI service returned HTTP ${response.status}: ${response.statusText}`
      );
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
