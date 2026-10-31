// backend/src/routes/problems.routes.ts

import { Router } from 'express';
import { ProblemsController } from '../controllers/problems.controller.js';
import { validateQuery } from '../middleware/validate.middleware.js';
import { problemQuerySchema } from '../validators/problem.validator.js';

const router = Router();

// GET /api/problems/search?q=two+sum
router.get('/search', ProblemsController.searchProblems);

// GET /api/problems (with query pagination & filters)
router.get('/', validateQuery(problemQuerySchema), ProblemsController.getProblems);

// GET /api/problems/:id (or :slug)
router.get('/:id', ProblemsController.getProblemById);

export default router;

