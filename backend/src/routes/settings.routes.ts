import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as settingsController from '../controllers/settings.controller';

const router = Router();

// Get all supported currencies (public endpoint)
router.get('/currencies', settingsController.getCurrencies);

// Get exchange rate for a currency (public endpoint)
router.get('/exchange-rate/:currency', settingsController.getExchangeRate);

// Protected routes - require authentication
router.use(authenticate);

// Get current user's settings
router.get('/', settingsController.getSettings);

// Update current user's settings
router.put('/', settingsController.updateSettings);

export default router;

