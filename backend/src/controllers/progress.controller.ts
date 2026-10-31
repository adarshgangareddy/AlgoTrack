// backend/src/controllers/progress.controller.ts

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.types.js';
import { ProgressService } from '../services/progress.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

const progressService = new ProgressService();

export class ProgressController {
  static async getAllProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || (req.headers['x-user-id'] as string);
      if (!userId) {
        throw ApiError.unauthorized('User identity required to fetch progress');
      }

      const progress = await progressService.getAllProgress(userId);
      res.status(200).json(ApiResponse.success(progress, 'User problem progress fetched'));
    } catch (error) {
      next(error);
    }
  }

  static async getProgressForProblem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || (req.headers['x-user-id'] as string);
      if (!userId) {
        throw ApiError.unauthorized('User identity required');
      }

      const status = await progressService.getProgressForProblem(userId, req.params.problemId);
      res.status(200).json(ApiResponse.success({ status }, 'Problem status retrieved'));
    } catch (error) {
      next(error);
    }
  }

  static async updateProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || (req.headers['x-user-id'] as string);
      if (!userId) {
        throw ApiError.unauthorized('User identity required');
      }

      const { status, problemTitle, problemDifficulty } = req.body;

      const result = await progressService.setProgress({
        userId,
        problemId: req.params.problemId,
        status,
        problemTitle,
        problemDifficulty,
      });

      res.status(200).json(ApiResponse.success(result, 'Progress updated successfully'));
    } catch (error) {
      next(error);
    }
  }
}
