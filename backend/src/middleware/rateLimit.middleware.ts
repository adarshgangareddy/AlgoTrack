// backend/src/middleware/rateLimit.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const requestCounts = new Map<string, RateLimitStore>();

export function rateLimit(options: { windowMs?: number; max?: number } = {}) {
  const windowMs = options.windowMs || 60 * 1000; // 1 minute default
  const max = options.max || 120; // 120 requests per window default

  return (req: Request, _res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
    const now = Date.now();

    const record = requestCounts.get(ip);

    if (!record || now > record.resetTime) {
      requestCounts.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    record.count += 1;

    if (record.count > max) {
      return next(ApiError.badRequest('Too many requests. Please slow down and try again shortly.'));
    }

    return next();
  };
}
