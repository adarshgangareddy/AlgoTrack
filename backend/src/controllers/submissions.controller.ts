// backend/src/controllers/submissions.controller.ts
// Architectural endpoint preparation for Judge0 Code Execution (Phase 6)

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.types.js';
import { Judge0Service } from '../services/judge0.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

const judge0Service = new Judge0Service();

export class SubmissionsController {
  static async runCode(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { language, sourceCode, stdin } = req.body;
      const result = await judge0Service.runCode({ language, sourceCode, stdin });
      res.status(200).json(ApiResponse.success(result, 'Execution pipeline'));
    } catch (error) {
      next(error);
    }
  }

  static async submitCode(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || (req.headers['x-user-id'] as string);
      if (!userId) {
        throw ApiError.unauthorized('User identity required to submit code');
      }

      const { problemId, language, sourceCode } = req.body;
      const result = await judge0Service.submitCode({
        userId,
        problemId,
        language,
        sourceCode,
      });

      res.status(200).json(ApiResponse.success(result, 'Submission queued'));
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || (req.headers['x-user-id'] as string);
      if (!userId) {
        throw ApiError.unauthorized('User identity required');
      }

      const problemId = req.params.problemId;

      res.status(200).json(
        ApiResponse.success(
          {
            problemId,
            submissions: [],
            message: 'Submission history pipeline prepared for Phase 6.',
          },
          'Submission history'
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
