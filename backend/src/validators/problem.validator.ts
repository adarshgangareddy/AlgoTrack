// backend/src/validators/problem.validator.ts

import { z } from 'zod';

export const problemQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 48)),
  difficulty: z.enum(['all', 'Easy', 'Medium', 'Hard']).optional().default('all'),
  status: z.enum(['all', 'solved', 'attempted', 'not_started']).optional().default('all'),
  search: z.string().optional().default(''),
});

export const updateProgressSchema = z.object({
  status: z.enum(['not_started', 'attempted', 'solved']),
  problemTitle: z.string().optional(),
  problemDifficulty: z.string().optional(),
});

export const updateWorkspaceSchema = z.object({
  personal_notes: z.string().optional().default(''),
  personal_approach: z.string().optional().default(''),
  time_complexity: z.string().optional().default(''),
  space_complexity: z.string().optional().default(''),
  mistakes_and_edge_cases: z.string().optional().default(''),
  activeLanguage: z.string().optional().default('python'),
  sourceCode: z.string().optional().default(''),
  status: z.enum(['not_started', 'attempted', 'solved']).optional().default('not_started'),
  problemTitle: z.string().optional(),
  problemDifficulty: z.string().optional(),
});

