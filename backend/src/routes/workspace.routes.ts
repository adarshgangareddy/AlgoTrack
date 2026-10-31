// backend/src/routes/workspace.routes.ts

import { Router } from 'express';
import { WorkspaceController } from '../controllers/workspace.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { updateWorkspaceSchema } from '../validators/problem.validator.js';

const router = Router();

// GET /api/workspace/:problemId
router.get('/:problemId', requireAuth, WorkspaceController.getWorkspace);

// PUT /api/workspace/:problemId
router.put('/:problemId', requireAuth, validateBody(updateWorkspaceSchema), WorkspaceController.saveWorkspace);

export default router;

