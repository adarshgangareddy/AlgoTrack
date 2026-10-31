// backend/src/types/problem.types.ts

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export type ProblemProgressStatus = 'not_started' | 'attempted' | 'solved';

export interface ProblemEntity {
  id: string;
  problem_number?: number;
  title: string;
  slug: string;
  difficulty: DifficultyLevel;
  pattern?: string;
  leetcode_url?: string;
  description?: string;
  theory_content?: string;
  topics?: string[];
  hints?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UserWorkspaceEntity {
  id?: string;
  user_id: string;
  problem_id: string;
  personal_notes?: string;
  personal_approach?: string;
  time_complexity?: string;
  space_complexity?: string;
  mistakes_and_edge_cases?: string;
  updated_at?: string;
}

export interface UserSolutionEntity {
  id?: string;
  user_id: string;
  problem_id: string;
  language: string;
  source_code: string;
  updated_at?: string;
}

export interface SubmissionPayload {
  problemId: string;
  language: string;
  sourceCode: string;
  stdin?: string;
}
