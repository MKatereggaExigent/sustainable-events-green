import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as tourService from '../services/tour.service';
import { logger } from '../utils/logger';

export const updateValidation = [
  body('hasCompletedTour').optional().isBoolean(),
  body('tourEnabled').optional().isBoolean(),
  body('showTourOnNewFeatures').optional().isBoolean(),
  body('completedSteps').optional().isArray(),
  body('lastSeenStep').optional().isString(),
  body('timesStarted').optional().isInt({ min: 0 }),
  body('timesCompleted').optional().isInt({ min: 0 }),
  body('timesSkipped').optional().isInt({ min: 0 }),
  body('totalTimeSeconds').optional().isInt({ min: 0 }),
];

export async function getTourPreferences(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const preferences = await tourService.getOrCreateTourPreferences(userId);
    
    return res.json({ preferences });
  } catch (error) {
    logger.error('Error getting tour preferences:', error);
    return res.status(500).json({ error: 'Failed to get tour preferences' });
  }
}

export async function updateTourPreferences(req: Request, res: Response) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Ensure preferences exist first
    await tourService.getOrCreateTourPreferences(userId);

    const preferences = await tourService.updateTourPreferences(userId, req.body);
    
    return res.json({ preferences });
  } catch (error) {
    logger.error('Error updating tour preferences:', error);
    return res.status(500).json({ error: 'Failed to update tour preferences' });
  }
}

export async function startTour(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get current preferences
    const current = await tourService.getOrCreateTourPreferences(userId);

    // Increment times started
    const preferences = await tourService.updateTourPreferences(userId, {
      timesStarted: current.timesStarted + 1,
    });
    
    return res.json({ preferences });
  } catch (error) {
    logger.error('Error starting tour:', error);
    return res.status(500).json({ error: 'Failed to start tour' });
  }
}

export async function completeTour(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get current preferences
    const current = await tourService.getOrCreateTourPreferences(userId);

    // Mark as completed
    const preferences = await tourService.updateTourPreferences(userId, {
      hasCompletedTour: true,
      timesCompleted: current.timesCompleted + 1,
      totalTimeSeconds: current.totalTimeSeconds + (req.body.timeSpent || 0),
    });
    
    return res.json({ preferences });
  } catch (error) {
    logger.error('Error completing tour:', error);
    return res.status(500).json({ error: 'Failed to complete tour' });
  }
}

export async function skipTour(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get current preferences
    const current = await tourService.getOrCreateTourPreferences(userId);

    // Increment skipped count
    const preferences = await tourService.updateTourPreferences(userId, {
      timesSkipped: current.timesSkipped + 1,
      lastSeenStep: req.body.lastSeenStep,
    });
    
    return res.json({ preferences });
  } catch (error) {
    logger.error('Error skipping tour:', error);
    return res.status(500).json({ error: 'Failed to skip tour' });
  }
}

