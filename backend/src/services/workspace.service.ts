// backend/src/services/workspace.service.ts

import { WorkspaceRepository } from '../repositories/workspace.repository.js';
import { ProblemProgressStatus } from '../types/problem.types.js';

export class WorkspaceService {
  private repository: WorkspaceRepository;

  constructor() {
    this.repository = new WorkspaceRepository();
  }

  async getWorkspace(userId: string, problemId: string) {
    return this.repository.getWorkspace(userId, problemId);
  }

  async saveWorkspace(params: {
    userId: string;
    problemId: string;
    workspace: {
      personal_notes?: string;
      personal_approach?: string;
      time_complexity?: string;
      space_complexity?: string;
      mistakes_and_edge_cases?: string;
    };
    activeLanguage: string;
    sourceCode: string;
    status: ProblemProgressStatus;
    problemTitle?: string;
    problemDifficulty?: string;
  }) {
    return this.repository.saveWorkspace(params);
  }
}
