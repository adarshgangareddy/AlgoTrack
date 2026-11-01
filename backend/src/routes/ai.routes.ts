// backend/src/routes/ai.routes.ts

import { Router } from 'express';
import { AiController } from '../controllers/ai.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { aiChatSchema } from '../validators/ai.validator.js';

const router = Router();

// POST /api/ai/chat (AI code analysis and interactive mentoring)
router.post('/chat', optionalAuth, validateBody(aiChatSchema), AiController.chat);

// GET /api/ai/status (Check if Groq API is active)
router.get('/status', AiController.status);

export default router;
