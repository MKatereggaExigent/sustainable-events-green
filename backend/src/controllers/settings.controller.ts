import { Request, Response } from 'express';
import * as settingsService from '../services/settings.service';
import { logger } from '../utils/logger';

/**
 * Get current user's settings
 */
export async function getSettings(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const settings = await settingsService.getUserSettings(userId);
    return res.json(settings);
  } catch (error) {
    logger.error('Get settings error:', error);
    return res.status(500).json({ error: 'Failed to get settings' });
  }
}

/**
 * Update current user's settings
 */
export async function updateSettings(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { metricSystem, currencyCode, hideValues } = req.body;

    // Validate metric system
    if (metricSystem && !['metric', 'imperial', 'uk'].includes(metricSystem)) {
      return res.status(400).json({ error: 'Invalid metric system. Must be metric, imperial, or uk' });
    }

    // Validate currency code (basic validation - 3 uppercase letters)
    if (currencyCode && !/^[A-Z]{3}$/.test(currencyCode)) {
      return res.status(400).json({ error: 'Invalid currency code' });
    }

    const settings = await settingsService.updateUserSettings(userId, {
      metricSystem,
      currencyCode,
      hideValues,
    });

    return res.json(settings);
  } catch (error) {
    logger.error('Update settings error:', error);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
}

/**
 * Get all supported currencies
 */
export async function getCurrencies(req: Request, res: Response) {
  try {
    const currencies = await settingsService.getSupportedCurrencies();
    return res.json(currencies);
  } catch (error) {
    logger.error('Get currencies error:', error);
    return res.status(500).json({ error: 'Failed to get currencies' });
  }
}

/**
 * Get live exchange rates
 */
export async function getExchangeRate(req: Request, res: Response) {
  try {
    const { currency } = req.params;
    
    if (!currency || !/^[A-Z]{3}$/.test(currency)) {
      return res.status(400).json({ error: 'Invalid currency code' });
    }

    const rate = await settingsService.fetchExchangeRate(currency);
    return res.json({ currency, rate, base: 'USD' });
  } catch (error) {
    logger.error('Get exchange rate error:', error);
    return res.status(500).json({ error: 'Failed to get exchange rate' });
  }
}

