import { Router } from 'express';
import * as subscriptionController from '../controllers/subscription.controller';
import { authenticate, requireOrganization } from '../middleware/auth';
import { loadUserPermissions } from '../middleware/rbac';

const router = Router();

// All subscription routes require authentication and organization context
router.use(authenticate);
router.use(loadUserPermissions);
router.use(requireOrganization);

// GET /api/subscription/usage - Get current subscription usage
router.get('/usage', subscriptionController.getSubscriptionUsage);

export default router;

