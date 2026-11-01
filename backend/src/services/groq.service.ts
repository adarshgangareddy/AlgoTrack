// backend/src/services/groq.service.ts
// Secure Groq AI Code Assistant Service with BYOK & Usage Resolution

import { Groq } from 'groq-sdk';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { AiProviderService, type UserAiUsageSummary } from './aiProvider.service.js';

export interface ChatMessageContext {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiCodeAssistantRequest {
  problemTitle: string;
  problemDescription?: string;
  language?: string;
  code?: string;
  action?: string;
  question?: string;
  examples?: Array<{ input: string; output: string; explanation?: string }>;
  constraints?: string[];
  theoryContent?: string;
  hints?: string[];
  messages?: ChatMessageContext[];
  userId?: string;
}

export interface AiCodeAssistantResponse {
  reply: string;
  model: string;
  action?: string;
  providerType: 'application' | 'user';
  usage?: UserAiUsageSummary;
}

export class GroqService {
  private defaultModel: string;
  private fallbackModels = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'openai/gpt-oss-120b',
    'mixtral-8x7b-32768',
  ];

  constructor() {
    this.defaultModel = env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  }

  isConfigured(): boolean {
    const key = env.GROQ_API_KEY;
    return Boolean(
      key &&
      key.trim().length > 0 &&
      key !== 'your_actual_groq_api_key' &&
      key !== 'YOUR_GROQ_API_KEY'
    );
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }

  /**
   * Dispatches chat completion to Groq with dynamic model fallback if model is decommissioned or not found (404)
   */
  private async executeGroqChat(
    groqClient: Groq,
    model: string,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  ): Promise<{ reply: string; model: string }> {
    const candidateModels = [
      model,
      ...this.fallbackModels.filter((m) => m !== model),
    ];

    let lastError: any = null;

    for (const candidate of candidateModels) {
      try {
        const completion = await groqClient.chat.completions.create({
          model: candidate,
          messages,
          temperature: 0.3,
          max_tokens: 1500,
          top_p: 0.95,
        });

        const reply =
          completion.choices[0]?.message?.content ||
          'I was unable to generate a response. Please try asking again.';

        return {
          reply,
          model: completion.model || candidate,
        };
      } catch (err: any) {
        lastError = err;
        // If 404 model not found, try the next model in the fallback list
        if (
          err.status === 404 ||
          (err.message && (err.message.includes('model_not_found') || err.message.includes('does not exist')))
        ) {
          continue;
        }
        // Non-model errors (401, 429, etc.) shouldn't cycle through models
        throw err;
      }
    }

    throw lastError || new Error('Failed to find a supported Groq model');
  }

  /**
   * Generates AI DSA theory assistance with BYOK provider resolution and server-enforced usage limits
   */
  async generateCodeAssistance(params: AiCodeAssistantRequest): Promise<AiCodeAssistantResponse> {
    const {
      problemTitle,
      problemDescription = '',
      language = 'python',
      code = '',
      action,
      question,
      examples = [],
      constraints = [],
      theoryContent = '',
      hints = [],
      messages = [],
      userId,
    } = params;

    // 1. Check User AI Usage and Personal Key Configuration
    let usageSummary: UserAiUsageSummary | null = null;
    let userCustomKey: string | null = null;

    if (userId) {
      usageSummary = await AiProviderService.getSummary(userId);
      userCustomKey = await AiProviderService.getUserCustomKey(userId);
    }

    // Determine Provider Execution Strategy
    const hasPersonalKey = Boolean(userCustomKey && userCustomKey.trim().length > 0);
    const hasFreeRequestsRemaining = Boolean(
      !usageSummary || usageSummary.freeRequestsRemaining > 0
    );

    // Case 4: Free limit reached and user has no personal key
    if (!hasPersonalKey && !hasFreeRequestsRemaining) {
      throw ApiError.forbidden(
        'You have used all 3 free AI Tutor messages. Please configure your own Groq API key in AI Settings to continue unlimited practice.'
      );
    }

    // 2. Build strict DSA Teacher & Programming Mentor system prompt
    const examplesText =
      examples.length > 0
        ? examples
            .map(
              (ex, i) =>
                `Example ${i + 1}:\n  Input: ${ex.input}\n  Output: ${ex.output}${
                  ex.explanation ? `\n  Explanation: ${ex.explanation}` : ''
                }`
            )
            .join('\n')
        : '';

    const constraintsText = constraints.length > 0 ? constraints.join('\n- ') : '';
    const hintsText = hints.length > 0 ? hints.join('\n- ') : '';

    const systemPrompt = `You are an expert DSA (Data Structures & Algorithms) Teacher and Programming Mentor on AlgoTrack.
Your core mission is to help students learn, understand, and master algorithmic problem solving through deep conceptual understanding and guided intuition.

CURRENT PROBLEM CONTEXT:
- Target Problem: "${problemTitle}"
${problemDescription ? `- Problem Statement: ${problemDescription}` : ''}
${examplesText ? `- Examples:\n${examplesText}` : ''}
${constraintsText ? `- Constraints:\n- ${constraintsText}` : ''}
${theoryContent ? `- Editorial & Background Theory: ${theoryContent}` : ''}
${hintsText ? `- Curated Hints:\n- ${hintsText}` : ''}
- Active Language Context: ${language}

================================================================================
STRICT MENTORING RULES & ABSOLUTE RESTRICTIONS (MANDATORY):
================================================================================
1. STRICT THEORY-ONLY & CONCEPTUAL TEACHING:
   - Teach the underlying concepts, mathematical intuition, and core algorithmic patterns (e.g. Two Pointers, Sliding Window, Fast & Slow Pointers, Monotonic Stack, Dynamic Programming, Graph Traversals, Binary Search, Heaps, Greedy).
   - Explain what the problem is asking in simple terms.
   - Clarify how to understand inputs and expected outputs.
   - Explain which data structures apply and WHY they are chosen over alternatives.
   - Break the problem down into logical, intuitive steps.
   - Walk through step-by-step example dry runs (tracing variables step by step).
   - Analyze time and space complexity theory (Big-O analysis).
   - Point out common traps, pitfalls, off-by-one errors, and subtle edge cases.
   - Provide progressive, incremental hints that empower the user to code it themselves.

2. ABSOLUTE PROHIBITION ON COMPLETE SOLUTION CODE:
   - You MUST NOT provide complete C, C++, Java, Python, JavaScript, or TypeScript solutions.
   - You MUST NOT provide copy-paste-ready implementations or complete function bodies.
   - You MUST NOT provide the exact final code, even if the user explicitly demands it.
   - You MUST NOT provide full pseudocode that effectively reveals the entire implementation line-by-line.
   - If the user asks for complete code, politely redirect them toward understanding the theory, concepts, and guided approach.

3. CODE USAGE PERMISSION:
   - You may show at most 1 to 3 isolated lines of syntax illustrating a standard library method or language primitive (e.g., how to push to a heap or instantiate a map in ${language}), but NEVER the full algorithmic logic or problem solution.

4. PLATFORM INTEGRITY:
   - NEVER claim the user's code was executed or run in a sandbox. Feedback is based on theoretical static reasoning.
   - Format responses using clear, readable GitHub-flavored markdown with clean bullet points and bold headings.`;

    // 3. Prepare user prompt based on action or question
    let promptContent = '';
    if (action) {
      switch (action) {
        case 'explain_concept':
        case 'explain':
          promptContent = `Please explain the core conceptual theory, problem intuition, and underlying algorithmic pattern behind "${problemTitle}". Focus on teaching the logic, input/output meaning, and high-level strategy without writing the solution code.`;
          break;
        case 'pattern':
          promptContent = `Please teach the primary algorithmic pattern behind "${problemTitle}" (e.g., Two Pointers, Sliding Window, Dynamic Programming, etc.). Explain how to recognize when this pattern applies and why it's optimal, without writing solution code.`;
          break;
        case 'intuition':
          promptContent = `Explain the core problem intuition for "${problemTitle}". What key observation unlocks the optimal approach? Explain clearly in intuitive conceptual terms.`;
          break;
        case 'dry_run':
          promptContent = `Please demonstrate a step-by-step example dry run for "${problemTitle}" tracing the variables and state changes for sample input. Explain each state transition clearly without writing the full code.`;
          break;
        case 'hint':
          promptContent = `Give me a progressive conceptual hint for solving "${problemTitle}". Do not give away the whole solution—just guide my intuition toward the optimal approach.`;
          break;
        case 'common_mistakes':
        case 'edge_cases':
          promptContent = `What are the most common mistakes, pitfalls, off-by-one errors, and tricky edge cases candidates encounter when tackling "${problemTitle}"?`;
          break;
        case 'complexity':
          promptContent = `Explain the theoretical Time and Space Complexity bounds (optimal Big-O) for "${problemTitle}". Why is this the theoretical lower bound?`;
          break;
        case 'analyze':
          promptContent = `Please review my conceptual approach to "${problemTitle}". Provide feedback on correctness, edge cases, and algorithmic efficiency without writing the complete solution code for me:\n\n\`\`\`${language}\n${
            code || '# No code written yet'
          }\n\`\`\``;
          break;
        default:
          promptContent = `Regarding "${problemTitle}": ${question || action}`;
      }
    } else {
      promptContent = question || `How should I approach "${problemTitle}"?`;
    }

    // 4. Assemble and sanitize chat history payload (prevent empty messages or invalid roles)
    const groqMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    if (messages && Array.isArray(messages) && messages.length > 0) {
      const recent = messages.slice(-10);
      for (const msg of recent) {
        if (
          (msg.role === 'user' || msg.role === 'assistant') &&
          typeof msg.content === 'string' &&
          msg.content.trim().length > 0
        ) {
          groqMessages.push({
            role: msg.role,
            content: msg.content.trim().slice(0, 8000),
          });
        }
      }
    }

    // Append current prompt
    groqMessages.push({
      role: 'user',
      content: promptContent.trim().slice(0, 4000),
    });

    // =========================================================================
    // 5. Provider Execution & Automatic Fallback Hierarchy
    // =========================================================================

    // CASE 1: User has personal Groq key configured -> use user key directly
    if (hasPersonalKey && userCustomKey) {
      try {
        const userClient = new Groq({ apiKey: userCustomKey });
        const result = await this.executeGroqChat(userClient, this.defaultModel, groqMessages);

        // Usage is unlimited for BYOK; reload summary
        const currentSummary = userId ? await AiProviderService.getSummary(userId) : undefined;
        return {
          reply: result.reply,
          model: result.model,
          action,
          providerType: 'user',
          usage: currentSummary,
        };
      } catch (err: any) {
        // Case 5: User key failed -> mark invalid, report user-friendly error
        if (userId) {
          await AiProviderService.markUserKeyInvalid(userId);
        }
        if (err.status === 401 || (err.message && err.message.includes('invalid_api_key'))) {
          throw ApiError.unauthorized('Your personal Groq API key is invalid. Please update it in AI Settings.');
        }
        if (err.status === 429) {
          throw ApiError.tooManyRequests('Your personal Groq API key rate limit has been reached. Please check your Groq console.');
        }
        throw ApiError.badRequest(`Your personal Groq API key returned an error: ${err.message || 'Provider failure'}. Please update your key.`);
      }
    }

    // CASE 2: No personal key, use Application Key
    if (!this.isConfigured()) {
      return {
        reply: `⚠️ **Groq API is not configured yet.**\n\nTo enable live AI mentoring, configure your own **Groq API Key** in AI Settings or add \`GROQ_API_KEY\` in \`backend/.env\`.\n\n*(You can get a free, fast API key from https://console.groq.com/keys)*`,
        model: this.defaultModel,
        action,
        providerType: 'application',
        usage: usageSummary || undefined,
      };
    }

    try {
      const appClient = new Groq({ apiKey: env.GROQ_API_KEY });
      const result = await this.executeGroqChat(appClient, this.defaultModel, groqMessages);

      // Increment free usage atomically ONLY after successful generation
      if (userId) {
        await AiProviderService.incrementFreeUsage(userId);
      }
      const updatedSummary = userId ? await AiProviderService.getSummary(userId) : undefined;

      return {
        reply: result.reply,
        model: result.model,
        action,
        providerType: 'application',
        usage: updatedSummary,
      };
    } catch (appErr: any) {
      // CASE 3: Application key failed (401, 429, or unavailable) -> Fallback to user key if available
      if (userCustomKey) {
        try {
          const userClient = new Groq({ apiKey: userCustomKey });
          const result = await this.executeGroqChat(userClient, this.defaultModel, groqMessages);
          const currentSummary = userId ? await AiProviderService.getSummary(userId) : undefined;
          return {
            reply: result.reply,
            model: result.model,
            action,
            providerType: 'user',
            usage: currentSummary,
          };
        } catch {
          // If fallback user key also fails, throw classified error
        }
      }

      // Handle classified errors from application key
      if (appErr.status === 429 || (appErr.message && appErr.message.includes('rate_limit'))) {
        throw ApiError.tooManyRequests('AlgoTrack AI service is temporarily experiencing high traffic. Please wait a moment or configure your own Groq key for instant access.');
      }

      if (appErr.status === 401) {
        throw ApiError.internal('AlgoTrack AI configuration is temporarily unavailable. Please configure your own Groq key in AI Settings to continue.');
      }

      const errorMessage = appErr.message || 'An error occurred while communicating with the Groq AI service.';
      throw ApiError.internal(`AI Mentor error: ${errorMessage}`);
    }
  }
}
