// backend/src/services/problems.service.ts

import { ProblemsRepository } from '../repositories/problems.repository.js';
import { ProblemEntity } from '../types/problem.types.js';
import { ApiError } from '../utils/ApiError.js';

export class ProblemsService {
  private repository: ProblemsRepository;

  constructor() {
    this.repository = new ProblemsRepository();
  }

  async getProblems(params: {
    page?: number;
    limit?: number;
    difficulty?: string;
    search?: string;
  }): Promise<{ problems: ProblemEntity[]; total: number; totalPages: number }> {
    const { problems, total } = await this.repository.findAll(params);
    const limit = params.limit || 48;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      problems,
      total,
      totalPages,
    };
  }

  async getProblemById(idOrSlug: string): Promise<ProblemEntity> {
    const problem = await this.repository.findBySlugOrId(idOrSlug);
    if (!problem) {
      throw ApiError.notFound(`Problem with identifier "${idOrSlug}" was not found.`);
    }
    return problem;
  }

  async searchProblems(query: string, limit = 20): Promise<ProblemEntity[]> {
    const { problems } = await this.repository.findAll({
      search: query,
      limit,
      page: 1,
    });
    return problems;
  }
}

