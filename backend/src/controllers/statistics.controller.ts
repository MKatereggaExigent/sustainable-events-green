import { Request, Response } from 'express';
import { getCombinedStatistics } from '../services/statistics.service';
import { logger } from '../utils/logger';

/**
 * Get platform statistics
 * Public endpoint - no authentication required
 */
export async function getStatistics(req: Request, res: Response): Promise<void> {
  try {
    const stats = await getCombinedStatistics();
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Failed to get statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve platform statistics',
    });
  }
}

