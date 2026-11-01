// backend/src/services/groq.service.ts
// Secure Groq AI Code Assistant Service

import { Groq } from 'groq-sdk';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

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
}

export interface AiCodeAssistantResponse {
  reply: string;
  model: string;
  action?: string;
}

export class GroqService {
  private groqClient: Groq | null = null;
  private model: string;

  constructor() {
    this.model = env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    if (this.isConfigured()) {
      this.groqClient = new Groq({
        apiKey: env.GROQ_API_KEY,
      });
    }
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

  /**
   * Generates AI DSA theory assistance and conceptual mentoring using Groq
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
    } = params;

    if (!this.isConfigured() || !this.groqClient) {
      return {
        reply: `⚠️ **Groq API is not configured yet.**\n\nTo enable live AI DSA mentoring, please add your **GROQ_API_KEY** in \`backend/.env\`:\n\n\`\`\`env\nGROQ_API_KEY=gsk_your_groq_api_key_here\nGROQ_MODEL=${this.model}\n\`\`\`\n\n*(You can get a free, ultra-fast API key from https://console.groq.com/keys)*`,
        model: this.model,
        action,
      };
    }

    // 1. Build strict DSA Teacher & Programming Mentor system prompt (THEORY-ONLY MODE)
    const examplesText = examples.length > 0
      ? examples.map((ex, i) => `Example ${i + 1}:\n  Input: ${ex.input}\n  Output: ${ex.output}${ex.explanation ? `\n  Explanation: ${ex.explanation}` : ''}`).join('\n')
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
   - If the user asks:
     * "Solve this problem."
     * "Give me the code."
     * "Write the complete solution."
     * "Tell me the answer."
     * "Show me the implementation."
   You MUST politely and encouragingly redirect them toward understanding the theory, concepts, and guided approach.
   Example refusal & redirection:
   "I can help you master this problem, but I won't provide the complete solution code. Let's first understand the key concept behind it. This problem can be approached using [Concept/Data Structure] because..."

3. CODE USAGE PERMISSION:
   - You may show at most 1 to 3 isolated lines of syntax illustrating a standard library method or language primitive (e.g., how to push to a heap or instantiate a map in ${language}), but NEVER the full algorithmic logic or problem solution.

4. PLATFORM INTEGRITY:
   - NEVER claim the user's code was executed or run in a sandbox. Feedback is based on theoretical static reasoning.
   - Format responses using clear, readable GitHub-flavored markdown with clean bullet points and bold headings.`;

    // 2. Prepare user prompt based on action or question
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
          promptContent = `Please review my conceptual approach to "${problemTitle}". Provide feedback on correctness, edge cases, and algorithmic efficiency without writing the complete solution code for me:\n\n\`\`\`${language}\n${code || '# No code written yet'}\n\`\`\``;
          break;
        default:
          promptContent = `Regarding "${problemTitle}": ${question || action}`;
      }
    } else {
      promptContent = question || `How should I approach "${problemTitle}"?`;
    }

    // 3. Assemble chat history payload
    const groqMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Append up to last 10 messages for conversation context
    if (messages && messages.length > 0) {
      const recent = messages.slice(-10);
      for (const msg of recent) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          groqMessages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }
    }

    // Append current prompt
    groqMessages.push({
      role: 'user',
      content: promptContent,
    });

    try {
      const completion = await this.groqClient.chat.completions.create({
        model: this.model,
        messages: groqMessages,
        temperature: 0.3,
        max_tokens: 1500,
        top_p: 0.95,
      });

      const reply = completion.choices[0]?.message?.content || 'I was unable to generate a response. Please try asking again.';
      return {
        reply,
        model: completion.model || this.model,
        action,
      };
    } catch (err: any) {
      // Handle rate limits (429)
      if (err.status === 429 || (err.message && err.message.includes('rate_limit'))) {
        throw ApiError.tooManyRequests('Groq API rate limit reached. Please wait a few seconds before sending another message.');
      }

      // Handle invalid API key (401)
      if (err.status === 401 || (err.message && err.message.includes('invalid_api_key'))) {
        throw ApiError.unauthorized('Invalid Groq API key configured in backend/.env.');
      }

      // Handle generic API error
      const errorMessage = err.message || 'An error occurred while communicating with the Groq AI service.';
      throw ApiError.internal(`AI Assistant error: ${errorMessage}`);
    }
  }
}

