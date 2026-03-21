import { Router } from 'express';
import { generateRecommendations } from '../controllers/recommendations.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/recommendations/generate
 * Generate basic sustainability recommendations based on event inputs
 * Available to all tiers (Explorer, Planner, Enterprise)
 */
router.post('/generate', generateRecommendations);

export default router;

