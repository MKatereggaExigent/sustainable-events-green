import { Request, Response } from 'express';
import { validationResult, body, param } from 'express-validator';
import * as costService from '../services/cost.service';
import * as eventService from '../services/event.service';
import { logger } from '../utils/logger';

export const saveCostValidation = [
  param('eventId').isUUID(),
  body('venueCost').isFloat({ min: 0 }),
  body('energyCost').isFloat({ min: 0 }),
  body('cateringCost').isFloat({ min: 0 }),
  body('transportCost').isFloat({ min: 0 }),
  body('materialsCost').isFloat({ min: 0 }),
  body('wasteDisposalCost').isFloat({ min: 0 }),
  body('region').isIn(['us', 'eu', 'uk', 'ca', 'au']),
];

export async function calculateCosts(req: Request, res: Response) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Calculate without saving (preview mode)
    const results = costService.calculateCostSavings(req.body);
    return res.json({ results });
  } catch (error) {
    logger.error('Calculate costs error:', error);
    return res.status(500).json({ error: 'Failed to calculate costs' });
  }
}

export async function saveCostData(req: Request, res: Response) {
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

    const results = await costService.saveCostData(
      req.params.eventId,
      req.organizationId,
      req.body
    );

    return res.json({ results, message: 'Cost data saved successfully' });
  } catch (error) {
    logger.error('Save cost data error:', error);
    return res.status(500).json({ error: 'Failed to save cost data' });
  }
}

export async function getCostData(req: Request, res: Response) {
  try {
    if (!req.organizationId) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    const costData = await costService.getCostData(req.params.eventId, req.organizationId);
    
    if (!costData) {
      return res.status(404).json({ error: 'Cost data not found' });
    }

    return res.json({ costData });
  } catch (error) {
    logger.error('Get cost data error:', error);
    return res.status(500).json({ error: 'Failed to fetch cost data' });
  }
}

export async function getCostSummary(req: Request, res: Response) {
  try {
    if (!req.organizationId) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    const summary = await costService.getCostSummary(req.organizationId);
    return res.json({ summary });
  } catch (error) {
    logger.error('Get cost summary error:', error);
    return res.status(500).json({ error: 'Failed to fetch cost summary' });
  }
}

