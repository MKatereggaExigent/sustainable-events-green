import { Request, Response } from 'express';
import { validationResult, body, param, query as queryValidator } from 'express-validator';
import * as eventService from '../services/event.service';
import { logger } from '../utils/logger';

export const createEventValidation = [
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Event name required'),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('eventType').optional().trim().isLength({ max: 100 }),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('location').optional().trim().isLength({ max: 500 }),
  body('attendeeCount').optional().isInt({ min: 0 }),
];

export const updateEventValidation = [
  param('id').isUUID(),
  ...createEventValidation.map(v => v.optional()),
];

export async function getEvents(req: Request, res: Response) {
  try {
    if (!req.organizationId) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    const filters = {
      status: req.query.status as string,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    };

    const events = await eventService.getEvents(req.organizationId, filters);
    return res.json({ events });
  } catch (error) {
    logger.error('Get events error:', error);
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
}

export async function getEvent(req: Request, res: Response) {
  try {
    if (!req.organizationId) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    const event = await eventService.getEventById(req.params.id, req.organizationId);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.json({ event });
  } catch (error) {
    logger.error('Get event error:', error);
    return res.status(500).json({ error: 'Failed to fetch event' });
  }
}

export async function createEvent(req: Request, res: Response) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.organizationId || !req.user) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    const event = await eventService.createEvent(
      req.organizationId,
      req.user.userId,
      req.body
    );

    return res.status(201).json({ event });
  } catch (error) {
    logger.error('Create event error:', error);
    return res.status(500).json({ error: 'Failed to create event' });
  }
}

export async function updateEvent(req: Request, res: Response) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.organizationId) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    const event = await eventService.updateEvent(
      req.params.id,
      req.organizationId,
      req.body
    );

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.json({ event });
  } catch (error) {
    logger.error('Update event error:', error);
    return res.status(500).json({ error: 'Failed to update event' });
  }
}

export async function deleteEvent(req: Request, res: Response) {
  try {
    if (!req.organizationId) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    const deleted = await eventService.deleteEvent(req.params.id, req.organizationId);

    if (!deleted) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    logger.error('Delete event error:', error);
    return res.status(500).json({ error: 'Failed to delete event' });
  }
}

export async function saveCarbonData(req: Request, res: Response) {
  try {
    if (!req.organizationId) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    // Verify event belongs to organization
    const event = await eventService.getEventById(req.params.id, req.organizationId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await eventService.saveCarbonData(req.params.id, req.body);
    return res.json({ message: 'Carbon data saved successfully' });
  } catch (error) {
    logger.error('Save carbon data error:', error);
    return res.status(500).json({ error: 'Failed to save carbon data' });
  }
}

