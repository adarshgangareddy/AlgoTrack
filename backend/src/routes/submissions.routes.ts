// backend/src/routes/submissions.routes.ts
// Architectural endpoint preparation for Judge0 Code Execution (Phase 6)

import { Router } from 'express';
import { SubmissionsController } from '../controllers/submissions.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { runCodeSchema, submitCodeSchema } from '../validators/submission.validator.js';

const router = Router();

// POST /api/submissions/run (Quick run with test input)
router.post('/run', optionalAuth, validateBody(runCodeSchema), SubmissionsController.runCode);

// POST /api/submissions/submit (Submit solution against problem test suite)
router.post('/submit', requireAuth, validateBody(submitCodeSchema), SubmissionsController.submitCode);

// GET /api/submissions/history/:problemId
router.get('/history/:problemId', requireAuth, SubmissionsController.getHistory);

export default router;

