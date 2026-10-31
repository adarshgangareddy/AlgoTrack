// backend/src/services/progress.service.ts

import { ProgressRepository } from '../repositories/progress.repository.js';
import { ProblemProgressStatus } from '../types/problem.types.js';

export class ProgressService {
  private repository: ProgressRepository;

  constructor() {
    this.repository = new ProgressRepository();
  }

  async getProgressForProblem(userId: string, problemId: string): Promise<ProblemProgressStatus> {
    return this.repository.getStatusForProblem(userId, problemId);
  }

  async getAllProgress(userId: string): Promise<Record<string, ProblemProgressStatus>> {
    return this.repository.getAllProgressForUser(userId);
  }

  async setProgress(params: {
    userId: string;
    problemId: string;
    status: ProblemProgressStatus;
    problemTitle?: string;
    problemDifficulty?: string;
  }): Promise<{ status: ProblemProgressStatus; updated_at: string }> {
    return this.repository.updateProgress(params);
  }
}

