import { Router } from 'express';
import * as costController from '../controllers/cost.controller';
import { authenticate, requireOrganization, optionalAuth } from '../middleware/auth';
import { loadUserPermissions, requirePermission } from '../middleware/rbac';

const router = Router();

// Public route for calculating costs (preview/demo mode)
router.post('/calculate', costController.calculateCosts);

// Protected routes
router.use(authenticate);
router.use(loadUserPermissions);
router.use(requireOrganization);

// GET /api/costs/summary - Get organization cost summary
router.get('/summary', requirePermission('cost:read'), costController.getCostSummary);

// GET /api/costs/:eventId - Get cost data for an event
router.get('/:eventId', requirePermission('cost:read'), costController.getCostData);

// POST /api/costs/:eventId - Save cost data for an event
router.post(
  '/:eventId',
  requirePermission('cost:update'),
  costController.saveCostValidation,
  costController.saveCostData
);

export default router;

