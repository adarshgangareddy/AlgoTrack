// backend/src/services/judge0.service.ts
// Architectural preparation for Judge0 Code Execution (Phase 6)

import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export interface Judge0SubmissionParams {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
}

export interface Judge0SubmissionResult {
  stdout: string | null;
  time: string | null;
  memory: number | null;
  stderr: string | null;
  token: string;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
}

export const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  python: 71, // Python (3.8.1)
  javascript: 63, // JavaScript (Node.js 12.14.0)
  typescript: 74, // TypeScript (3.7.4)
  java: 62, // Java (OpenJDK 13.0.1)
  cpp: 54, // C++ (GCC 9.2.0)
};

export class Judge0Service {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = env.JUDGE0_API_URL;
    this.apiKey = env.JUDGE0_API_KEY;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey !== 'YOUR_JUDGE0_API_KEY' && this.apiUrl);
  }

  async runCode(params: {
    language: string;
    sourceCode: string;
    stdin?: string;
  }): Promise<{ status: string; message: string; phase: string }> {
    if (!this.isConfigured()) {
      return {
        phase: 'Phase 6 Architecture Prepared',
        status: 'pending_configuration',
        message: 'Judge0 execution environment is architecturally configured and will be connected in Phase 6.',
      };
    }

    throw ApiError.badRequest('Judge0 live execution is scheduled for Phase 6.');
  }

  async submitCode(params: {
    userId: string;
    problemId: string;
    language: string;
    sourceCode: string;
  }): Promise<{ submissionId: string; status: string; message: string }> {
    return {
      submissionId: `sub-${Date.now()}`,
      status: 'queued',
      message: 'Code submission pipeline architecturally prepared for Phase 6.',
    };
  }
}
