// backend/src/routes/ai.routes.ts

import { Router } from 'express';
import { AiController } from '../controllers/ai.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { aiChatSchema, apiKeySchema } from '../validators/ai.validator.js';

const router = Router();

// POST /api/ai/chat (Interactive AI mentoring with BYOK & usage limits)
router.post('/chat', optionalAuth, validateBody(aiChatSchema), AiController.chat);

// GET /api/ai/usage (Retrieve user free request count & BYOK status)
router.get('/usage', requireAuth, AiController.getUsage);

// POST /api/ai/key/verify (Verify personal Groq key without saving)
router.post('/key/verify', requireAuth, validateBody(apiKeySchema), AiController.verifyKey);

// POST /api/ai/key (Verify and securely encrypt & save personal Groq key)
router.post('/key', requireAuth, validateBody(apiKeySchema), AiController.saveKey);

// DELETE /api/ai/key (Remove personal Groq key)
router.delete('/key', requireAuth, AiController.deleteKey);

// GET /api/ai/status (System AI status and default model)
router.get('/status', AiController.status);

// GET /api/ai/diagnostics/recent (Authenticated developer diagnostic query)
router.get('/diagnostics/recent', requireAuth, AiController.getDiagnostics);

export default router;
