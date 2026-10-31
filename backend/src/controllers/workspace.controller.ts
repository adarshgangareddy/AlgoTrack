// backend/src/controllers/workspace.controller.ts

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.types.js';
import { WorkspaceService } from '../services/workspace.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

const workspaceService = new WorkspaceService();

export class WorkspaceController {
  static async getWorkspace(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || (req.headers['x-user-id'] as string);
      if (!userId) {
        throw ApiError.unauthorized('User identity required to load workspace');
      }

      const problemId = String(req.params.problemId);
      const data = await workspaceService.getWorkspace(userId, problemId);
      res.status(200).json(ApiResponse.success(data, 'Workspace loaded successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async saveWorkspace(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || (req.headers['x-user-id'] as string);
      if (!userId) {
        throw ApiError.unauthorized('User identity required to save workspace');
      }

      const problemId = String(req.params.problemId);
      const {
        personal_notes,
        personal_approach,
        time_complexity,
        space_complexity,
        mistakes_and_edge_cases,
        activeLanguage,
        sourceCode,
        status,
        problemTitle,
        problemDifficulty,
      } = req.body;

      const result = await workspaceService.saveWorkspace({
        userId,
        problemId,
        workspace: {
          personal_notes,
          personal_approach,
          time_complexity,
          space_complexity,
          mistakes_and_edge_cases,
        },
        activeLanguage,
        sourceCode,
        status,
        problemTitle,
        problemDifficulty,
      });

      res.status(200).json(ApiResponse.success(result, 'Workspace saved successfully'));
    } catch (error) {
      next(error);
    }
  }
}

