import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate, requireOrganization } from '../middleware/auth';
import { loadUserPermissions, requirePermission } from '../middleware/rbac';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);
router.use(loadUserPermissions);
router.use(requireOrganization);

// POST /api/analytics/track - Track an analytics event
router.post(
  '/track',
  analyticsController.trackEventValidation,
  analyticsController.track
);

// GET /api/analytics/conversion - Get conversion rate stats (admin only)
router.get(
  '/conversion',
  requirePermission('admin:access'),
  analyticsController.getConversionStats
);

export default router;

