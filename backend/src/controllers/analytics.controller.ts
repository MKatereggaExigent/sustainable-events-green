import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { trackEvent, getConversionRate } from '../services/analytics.service';
import { logger } from '../utils/logger';

export const trackEventValidation = [
  body('eventType').trim().isLength({ min: 1, max: 100 }).withMessage('Event type required'),
  body('eventData').isObject().withMessage('Event data must be an object'),
];

/**
 * Track an analytics event
 */
export async function track(req: Request, res: Response) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.organizationId || !req.user) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    await trackEvent({
      organizationId: req.organizationId,
      userId: req.user.userId,
      eventType: req.body.eventType,
      eventData: req.body.eventData,
      metadata: req.body.metadata || {},
    });

    return res.json({ success: true });
  } catch (error) {
    logger.error('Track analytics event error:', error);
    return res.status(500).json({ error: 'Failed to track event' });
  }
}

/**
 * Get conversion rate analytics (admin only)
 */
export async function getConversionStats(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate required' });
    }

    const stats = await getConversionRate(
      startDate as string,
      endDate as string
    );

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Get conversion stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch conversion stats' });
  }
}

