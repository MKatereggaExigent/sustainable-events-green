import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as tourController from '../controllers/tour.controller';

const router = Router();

// All tour routes require authentication
router.use(authenticate);

// Get tour preferences
router.get('/preferences', tourController.getTourPreferences);

// Update tour preferences
router.put('/preferences', tourController.updateValidation, tourController.updateTourPreferences);

// Track tour start
router.post('/start', tourController.startTour);

// Track tour completion
router.post('/complete', tourController.completeTour);

// Track tour skip
router.post('/skip', tourController.skipTour);

export default router;

