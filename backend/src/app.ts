// backend/src/app.ts

import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { rateLimit } from './middleware/rateLimit.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { ApiError } from './utils/ApiError.js';
import { ApiResponse } from './utils/ApiResponse.js';

// Import Route Handlers
import authRoutes from './routes/auth.routes.js';
import problemsRoutes from './routes/problems.routes.js';
import progressRoutes from './routes/progress.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';
import submissionsRoutes from './routes/submissions.routes.js';

export function createApp() {
  const app = express();

  // 1. Core Security & Parsing Middleware
  app.use(
    cors({
      origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));

  // 2. Health Check Endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json(
      ApiResponse.success(
        {
          status: 'ok',
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          service: 'AlgoTrack Backend API',
          version: '1.0.0',
        },
        'AlgoTrack API server is healthy and running'
      )
    );
  });

  // 3. Mount Modular API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/problems', problemsRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/workspace', workspaceRoutes);
  app.use('/api/submissions', submissionsRoutes);

  // 4. 404 Route Catch-all
  app.use('*', (req: Request, _res: Response, next) => {
    next(ApiError.notFound(`Endpoint "${req.originalUrl}" does not exist on this server.`));
  });

  // 5. Global Centralized Error Middleware
  app.use(errorHandler);

  return app;
}

