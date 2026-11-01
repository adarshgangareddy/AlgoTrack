// backend/src/validators/ai.validator.ts

import { z } from 'zod';

export const aiChatSchema = z.object({
  problemTitle: z.string().min(1, 'Problem title is required').max(200),
  problemDescription: z.string().max(10000).optional(),
  language: z.string().min(1).max(50).default('python'),
  code: z.string().max(50000, 'Code snippet exceeds maximum permitted size of 50,000 characters').optional(),
  action: z.string().max(50).optional(),
  question: z.string().max(4000, 'Question exceeds maximum permitted length of 4,000 characters').optional(),
  examples: z.any().optional(),
  constraints: z.any().optional(),
  theoryContent: z.string().max(10000).optional(),
  hints: z.array(z.string()).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().max(10000),
      })
    )
    .max(50)
    .optional(),
});

export const apiKeySchema = z.object({
  apiKey: z
    .string()
    .min(10, 'API key must be at least 10 characters')
    .max(200, 'API key is too long')
    .regex(/^gsk_[a-zA-Z0-9_-]+$/, 'Groq API keys must begin with "gsk_" followed by valid key characters'),
});
