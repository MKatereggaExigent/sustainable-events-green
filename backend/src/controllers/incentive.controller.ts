import { Request, Response } from 'express';
import { validationResult, body, param, query as queryValidator } from 'express-validator';
import * as incentiveService from '../services/incentive.service';
import * as eventService from '../services/event.service';
import { logger } from '../utils/logger';

export const applyIncentiveValidation = [
  param('eventId').isUUID(),
  param('incentiveId').isUUID(),
  body('estimatedValue').optional().isFloat({ min: 0 }),
];

export async function getAllIncentives(req: Request, res: Response) {
  try {
    const region = req.query.region as string;
    const incentives = await incentiveService.getAllIncentives(region);
    return res.json({ incentives });
  } catch (error) {
    logger.error('Get incentives error:', error);
    return res.status(500).json({ error: 'Failed to fetch incentives' });
  }
}

export async function getIncentiveById(req: Request, res: Response) {
  try {
    const incentive = await incentiveService.getIncentiveById(req.params.id);
    
    if (!incentive) {
      return res.status(404).json({ error: 'Incentive not found' });
    }

    return res.json({ incentive });
  } catch (error) {
    logger.error('Get incentive error:', error);
    return res.status(500).json({ error: 'Failed to fetch incentive' });
  }
}

export async function getIncentivesByRegion(req: Request, res: Response) {
  try {
    const incentives = await incentiveService.getIncentivesByRegion(req.params.region);
    return res.json({ incentives });
  } catch (error) {
    logger.error('Get incentives by region error:', error);
    return res.status(500).json({ error: 'Failed to fetch incentives' });
  }
}

export async function getEventIncentives(req: Request, res: Response) {
  try {
    if (!req.organizationId) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    const incentives = await incentiveService.getEventIncentives(
      req.params.eventId,
      req.organizationId
    );
    
    return res.json({ incentives });
  } catch (error) {
    logger.error('Get event incentives error:', error);
    return res.status(500).json({ error: 'Failed to fetch event incentives' });
  }
}

export async function applyIncentiveToEvent(req: Request, res: Response) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.organizationId) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    // Verify event belongs to organization
    const event = await eventService.getEventById(req.params.eventId, req.organizationId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify incentive exists
    const incentive = await incentiveService.getIncentiveById(req.params.incentiveId);
    if (!incentive) {
      return res.status(404).json({ error: 'Incentive not found' });
    }

    await incentiveService.applyIncentiveToEvent(
      req.params.eventId,
      req.params.incentiveId,
      req.body.estimatedValue || 0
    );

    return res.json({ message: 'Incentive applied to event' });
  } catch (error) {
    logger.error('Apply incentive error:', error);
    return res.status(500).json({ error: 'Failed to apply incentive' });
  }
}

export async function updateIncentiveStatus(req: Request, res: Response) {
  try {
    if (!req.organizationId) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    const { status } = req.body;
    if (!['potential', 'applied', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await incentiveService.updateIncentiveStatus(
      req.params.eventId,
      req.params.incentiveId,
      status
    );

    return res.json({ message: 'Incentive status updated' });
  } catch (error) {
    logger.error('Update incentive status error:', error);
    return res.status(500).json({ error: 'Failed to update incentive status' });
  }
}

export async function calculateEventIncentives(req: Request, res: Response) {
  try {
    if (!req.organizationId) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    const { region, totalCosts } = req.body;

    const incentives = await incentiveService.calculateEventIncentives(
      req.params.eventId,
      req.organizationId,
      region,
      totalCosts
    );

    return res.json({ incentives });
  } catch (error) {
    logger.error('Calculate incentives error:', error);
    return res.status(500).json({ error: 'Failed to calculate incentives' });
  }
}

