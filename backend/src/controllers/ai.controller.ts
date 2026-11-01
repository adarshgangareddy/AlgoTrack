// backend/src/controllers/ai.controller.ts

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.types.js';
import { GroqService } from '../services/groq.service.js';
import { AiProviderService } from '../services/aiProvider.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

const groqService = new GroqService();

export class AiController {
  /**
   * POST /api/ai/chat
   * Interactive AI DSA theory assistance with automatic provider resolution and usage limits
   */
  static async chat(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        problemTitle,
        problemDescription,
        language,
        code,
        action,
        question,
        examples,
        constraints,
        theoryContent,
        hints,
        messages,
      } = req.body;

      const userId = req.user?.id;

      const result = await groqService.generateCodeAssistance({
        problemTitle,
        problemDescription,
        language,
        code,
        action,
        question,
        examples,
        constraints,
        theoryContent,
        hints,
        messages,
        userId,
      });

      res.status(200).json(ApiResponse.success(result, 'AI code assistance response generated'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ai/usage
   * Retrieves the authenticated user's free request count and custom key status
   */
  static async getUsage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('Authentication required to retrieve AI usage');
      }

      const summary = await AiProviderService.getSummary(userId);
      res.status(200).json(ApiResponse.success(summary, 'User AI usage details'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ai/key/verify
   * Verifies a submitted Groq API key without storing it
   */
  static async verifyKey(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { apiKey } = req.body;
      const result = await AiProviderService.verifyGroqKey(apiKey);
      res.status(200).json(ApiResponse.success(result, 'Groq API key successfully verified'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ai/key
   * Verifies and securely encrypts & saves the user's personal Groq API key
   */
  static async saveKey(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('Authentication required to save Groq API key');
      }

      const { apiKey } = req.body;
      const result = await AiProviderService.saveUserKey(userId, apiKey);

      res.status(200).json(
        ApiResponse.success(
          {
            status: 'connected',
            maskedKey: result.maskedKey,
            model: result.model,
          },
          'Personal Groq API key verified and securely saved'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/ai/key
   * Removes the user's personal Groq API key
   */
  static async deleteKey(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('Authentication required');
      }

      await AiProviderService.deleteUserKey(userId);
      res.status(200).json(ApiResponse.success({ status: 'none' }, 'Personal Groq API key removed'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ai/status
   * Reports system AI status and default model
   */
  static async status(_req: AuthenticatedRequest, res: Response): Promise<void> {
    res.status(200).json(
      ApiResponse.success(
        {
          configured: groqService.isConfigured(),
          provider: 'Groq',
          model: groqService.getDefaultModel(),
        },
        'AI status'
      )
    );
  }
}
