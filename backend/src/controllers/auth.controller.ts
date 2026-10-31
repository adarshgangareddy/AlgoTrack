// backend/src/controllers/auth.controller.ts

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.types.js';
import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

const authService = new AuthService();

export class AuthController {
  static async verify(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw ApiError.unauthorized('No bearer token supplied');
      }

      const token = authHeader.split(' ')[1];
      const user = await authService.verifySession(token);

      res.status(200).json(ApiResponse.success(user, 'Session verified'));
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const profile = await authService.getUserProfile(req.user.id);
      res.status(200).json(
        ApiResponse.success(
          {
            user: req.user,
            profile,
          },
          'User profile'
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
