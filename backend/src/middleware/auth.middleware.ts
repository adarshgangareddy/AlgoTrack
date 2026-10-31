// backend/src/middleware/auth.middleware.ts

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.types.js';
import { getSupabaseClient } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

export async function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const fallbackUserId = req.headers['x-user-id'] as string | undefined;

  // 1. Bearer Token Check with Supabase
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
          };
          return next();
        }
      } catch {
        // Continue to fallback check
      }
    }
  }

  // 2. Development fallback via custom header if configured
  if (fallbackUserId && fallbackUserId.trim().length > 0) {
    req.user = {
      id: fallbackUserId.trim(),
    };
    return next();
  }

  return next(ApiError.unauthorized('Authentication token or session is missing or expired'));
}

export async function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const fallbackUserId = req.headers['x-user-id'] as string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
          };
        }
      } catch {
        // ignore
      }
    }
  } else if (fallbackUserId) {
    req.user = { id: fallbackUserId.trim() };
  }

  return next();
}

