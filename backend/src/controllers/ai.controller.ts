// backend/src/controllers/ai.controller.ts

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.types.js';
import { GroqService } from '../services/groq.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const groqService = new GroqService();

export class AiController {
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
        messages
      } = req.body;

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
      });

      res.status(200).json(ApiResponse.success(result, 'AI code assistance response generated'));
    } catch (error) {
      next(error);
    }
  }

  static async status(_req: AuthenticatedRequest, res: Response): Promise<void> {
    res.status(200).json(
      ApiResponse.success(
        {
          configured: groqService.isConfigured(),
          provider: 'Groq',
          model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        },
        'AI status'
      )
    );
  }
}

