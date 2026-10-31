// backend/src/controllers/problems.controller.ts

import { Request, Response, NextFunction } from 'express';
import { ProblemsService } from '../services/problems.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const problemsService = new ProblemsService();

export class ProblemsController {
  static async getProblems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 48;
      const difficulty = (req.query.difficulty as string) || 'all';
      const search = (req.query.search as string) || '';

      const result = await problemsService.getProblems({
        page,
        limit,
        difficulty,
        search,
      });

      res.status(200).json(
        ApiResponse.success(result.problems, 'Problems fetched successfully', {
          page,
          limit,
          total: result.total,
          totalPages: result.totalPages,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getProblemById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const problem = await problemsService.getProblemById(id);
      res.status(200).json(ApiResponse.success(problem, 'Problem retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async searchProblems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req.query.q as string) || '';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const results = await problemsService.searchProblems(query, limit);
      res.status(200).json(ApiResponse.success(results, 'Search results'));
    } catch (error) {
      next(error);
    }
  }
}

