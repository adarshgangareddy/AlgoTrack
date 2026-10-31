// backend/src/validators/submission.validator.ts

import { z } from 'zod';

export const runCodeSchema = z.object({
  problemId: z.string().min(1, 'Problem ID is required'),
  language: z.enum(['python', 'javascript', 'typescript', 'java', 'cpp']),
  sourceCode: z.string().min(1, 'Source code cannot be empty'),
  stdin: z.string().optional(),
});

export const submitCodeSchema = z.object({
  problemId: z.string().min(1, 'Problem ID is required'),
  language: z.enum(['python', 'javascript', 'typescript', 'java', 'cpp']),
  sourceCode: z.string().min(1, 'Source code cannot be empty'),
});

