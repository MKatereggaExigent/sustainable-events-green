import { Router } from 'express';
import * as organizationController from '../controllers/organization.controller';
import { authenticate, requireOrganization } from '../middleware/auth';
import { loadUserPermissions, requirePermission } from '../middleware/rbac';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(loadUserPermissions);

// GET /api/organizations/mine - List user's organizations
router.get('/mine', organizationController.getMyOrganizations);

// POST /api/organizations - Create new organization
router.post(
  '/',
  organizationController.createOrgValidation,
  organizationController.createOrganization
);

// Routes that require organization context
router.use(requireOrganization);

// GET /api/organizations/current - Get current organization
router.get(
  '/current',
  requirePermission('organization:read'),
  organizationController.getOrganization
);

// PUT /api/organizations/current - Update current organization
router.put(
  '/current',
  requirePermission('organization:update'),
  organizationController.updateOrgValidation,
  organizationController.updateOrganization
);

// GET /api/organizations/members - List members
router.get(
  '/members',
  requirePermission('organization:read'),
  organizationController.getMembers
);

// POST /api/organizations/members - Add member
router.post(
  '/members',
  requirePermission('organization:manage_members'),
  organizationController.addMemberValidation,
  organizationController.addMember
);

// DELETE /api/organizations/members/:userId - Remove member
router.delete(
  '/members/:userId',
  requirePermission('organization:manage_members'),
  organizationController.removeMember
);

export default router;

