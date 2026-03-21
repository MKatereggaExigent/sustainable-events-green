import { Router } from 'express';
import * as statisticsController from '../controllers/statistics.controller';

const router = Router();

/**
 * @route   GET /api/statistics
 * @desc    Get platform-wide statistics
 * @access  Public
 */
router.get('/', statisticsController.getStatistics);

export default router;

