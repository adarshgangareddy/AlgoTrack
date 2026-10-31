// backend/src/routes/progress.routes.ts

import { Router } from 'express';
import { ProgressController } from '../controllers/progress.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { updateProgressSchema } from '../validators/problem.validator.js';

const router = Router();

// GET /api/progress - get all progress map for user
router.get('/', requireAuth, ProgressController.getAllProgress);

// GET /api/progress/:problemId - get specific problem status
router.get('/:problemId', requireAuth, ProgressController.getProgressForProblem);

// PUT /api/progress/:problemId - update problem status
router.put('/:problemId', requireAuth, validateBody(updateProgressSchema), ProgressController.updateProgress);

export default router;
