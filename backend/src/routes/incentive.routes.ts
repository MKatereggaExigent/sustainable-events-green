import { Router } from 'express';
import * as incentiveController from '../controllers/incentive.controller';
import { authenticate, requireOrganization, optionalAuth } from '../middleware/auth';
import { loadUserPermissions, requirePermission } from '../middleware/rbac';

const router = Router();

// Public routes - view available incentives
router.get('/', incentiveController.getAllIncentives);
router.get('/region/:region', incentiveController.getIncentivesByRegion);
router.get('/:id', incentiveController.getIncentiveById);

// Protected routes for event-specific incentive management
router.use(authenticate);
router.use(loadUserPermissions);
router.use(requireOrganization);

// GET /api/incentives/event/:eventId - Get incentives for an event
router.get(
  '/event/:eventId',
  requirePermission('incentive:read'),
  incentiveController.getEventIncentives
);

// POST /api/incentives/event/:eventId/calculate - Calculate applicable incentives
router.post(
  '/event/:eventId/calculate',
  requirePermission('incentive:read'),
  incentiveController.calculateEventIncentives
);

// POST /api/incentives/event/:eventId/:incentiveId - Apply incentive to event
router.post(
  '/event/:eventId/:incentiveId',
  requirePermission('incentive:apply'),
  incentiveController.applyIncentiveValidation,
  incentiveController.applyIncentiveToEvent
);

// PUT /api/incentives/event/:eventId/:incentiveId - Update incentive status
router.put(
  '/event/:eventId/:incentiveId',
  requirePermission('incentive:apply'),
  incentiveController.updateIncentiveStatus
);

export default router;

