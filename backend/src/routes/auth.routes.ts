// backend/src/routes/auth.routes.ts

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/auth/verify
router.get('/verify', AuthController.verify);

// GET /api/auth/me
router.get('/me', requireAuth, AuthController.me);

export default router;
