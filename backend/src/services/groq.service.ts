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
  language: string;
  code?: string;
  action?: string;
  question?: string;
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
   * Generates AI coding assistance, review, or custom answer using Groq
   */
  async generateCodeAssistance(params: AiCodeAssistantRequest): Promise<AiCodeAssistantResponse> {
    const {
      problemTitle,
      problemDescription = '',
      language = 'python',
      code = '',
      action,
      question,
      messages = [],
    } = params;

    if (!this.isConfigured() || !this.groqClient) {
      return {
        reply: `⚠️ **Groq API is not configured yet.**\n\nTo enable live AI code analysis and mentoring, please add your **GROQ_API_KEY** in \`backend/.env\`:\n\n\`\`\`env\nGROQ_API_KEY=gsk_your_groq_api_key_here\nGROQ_MODEL=${this.model}\n\`\`\`\n\n*(You can get a free, ultra-fast API key from https://console.groq.com/keys)*`,
        model: this.model,
        action,
      };
    }

    // 1. Build authoritative mentor system prompt
    const systemPrompt = `You are an expert programming mentor and senior software engineer on AlgoTrack.
Your role is to guide, review, analyze, and teach coding interview algorithms.

Current Context:
- Target Problem: "${problemTitle}"
${problemDescription ? `- Problem Description: ${problemDescription.slice(0, 800)}...` : ''}
- Active Language: ${language}

Mentoring Principles:
1. NEVER claim the user's code was executed, compiled, or tested in a runtime sandbox. AlgoTrack is a code-analysis and learning platform; all feedback is theoretical static analysis and mental execution.
2. Be encouraging, precise, and educational. Help the user build problem-solving intuition.
3. If the user asks for a hint or asks "Give Me a Hint", offer progressive hints first without immediately revealing the full answer.
4. When reviewing code, highlight logical errors, edge cases (e.g. empty inputs, single elements, negative numbers, overflow), and asymptotic complexity (Big-O Time & Space).
5. If the user explicitly asks for code improvements or a complete solution, write clean, idiomatic code in ${language} with clear line-by-line explanations.
6. Use clear GitHub-flavored markdown with code blocks (\`\`\`${language}) for readability.`;

    // 2. Prepare user prompt based on action or question
    let promptContent = '';

    if (action) {
      switch (action) {
        case 'analyze':
          promptContent = `Please perform a comprehensive code analysis of my ${language} solution for "${problemTitle}".\n\n\`\`\`${language}\n${code || '# No code written yet'}\n\`\`\`\n\nProvide:\n1. Algorithmic Approach Summary\n2. Correctness & Logical Analysis\n3. Time & Space Complexity\n4. Recommended Next Steps`;
          break;
        case 'explain':
          promptContent = `Please explain how my current ${language} code works step by step for "${problemTitle}".\n\n\`\`\`${language}\n${code || '# No code written yet'}\n\`\`\``;
          break;
        case 'errors':
          promptContent = `Please inspect my ${language} code for any bugs, logical errors, or infinite loops for "${problemTitle}".\n\n\`\`\`${language}\n${code || '# No code written yet'}\n\`\`\``;
          break;
        case 'edge_cases':
          promptContent = `What edge cases should I be careful of for "${problemTitle}"? How does my current code handle them?\n\n\`\`\`${language}\n${code || '# No code written yet'}\n\`\`\``;
          break;
        case 'complexity':
          promptContent = `Analyze the exact Time and Space Complexity (Big-O) of this ${language} implementation for "${problemTitle}". Explain why each bound holds:\n\n\`\`\`${language}\n${code || '# No code written yet'}\n\`\`\``;
          break;
        case 'hint':
          promptContent = `Give me a conceptual hint for solving "${problemTitle}". Do not give away the whole solution—just guide me in the right direction.`;
          break;
        case 'optimize':
          promptContent = `How can I optimize this ${language} solution for "${problemTitle}" in terms of runtime and memory consumption?\n\n\`\`\`${language}\n${code || '# No code written yet'}\n\`\`\``;
          break;
        default:
          promptContent = `Regarding "${problemTitle}": ${question || action}`;
      }
    } else {
      promptContent = question || 'Can you review my approach?';
      if (code && code.trim()) {
        promptContent += `\n\nHere is my current ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``;
      }
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
