// backend/src/middleware/error.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: Error | ApiError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: unknown = undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = err;
  } else if (err.message) {
    message = err.message;
  }

  const responseBody = {
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(env.isDevelopment ? { stack: err.stack } : {}),
  };

  res.status(statusCode).json(responseBody);
}

