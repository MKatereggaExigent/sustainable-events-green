import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { authenticate, requireOrganization } from '../middleware/auth';
import { loadUserPermissions, requirePermission } from '../middleware/rbac';
import { enforceSubscriptionLimits, requireActiveSubscription } from '../middleware/subscription';

const router = Router();

// All event routes require authentication and organization context
router.use(authenticate);
router.use(loadUserPermissions);
router.use(requireOrganization);
router.use(requireActiveSubscription); // Check subscription is active

// GET /api/events - List all events
router.get('/', requirePermission('event:read'), eventController.getEvents);

// GET /api/events/:id - Get single event
router.get('/:id', requirePermission('event:read'), eventController.getEvent);

// POST /api/events - Create event (with subscription limit enforcement)
router.post(
  '/',
  requirePermission('event:create'),
  enforceSubscriptionLimits('event'), // ⭐ Payment wall: Check if user can create more events
  eventController.createEventValidation,
  eventController.createEvent
);

// PUT /api/events/:id - Update event
router.put(
  '/:id',
  requirePermission('event:update'),
  eventController.updateEventValidation,
  eventController.updateEvent
);

// DELETE /api/events/:id - Delete event
router.delete('/:id', requirePermission('event:delete'), eventController.deleteEvent);

// POST /api/events/:id/carbon - Save carbon calculator data
router.post('/:id/carbon', requirePermission('event:update'), eventController.saveCarbonData);

export default router;

