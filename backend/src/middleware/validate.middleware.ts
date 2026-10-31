// backend/src/middleware/validate.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

export function validateBody(schema: ZodSchema) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
        next(ApiError.badRequest('Validation failed', issues));
      } else {
        next(error);
      }
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = (await schema.parseAsync(req.query)) as Request['query'];
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
        next(ApiError.badRequest('Query validation failed', issues));
      } else {
        next(error);
      }
    }
  };
}
