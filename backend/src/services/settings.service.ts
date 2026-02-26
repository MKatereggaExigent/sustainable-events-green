import { query, transaction } from '../config/database';
import { logger } from '../utils/logger';

export interface UserSettings {
  id: string;
  userId: string;
  metricSystem: 'metric' | 'imperial' | 'uk';
  currencyCode: string;
  hideValues: boolean;
  exchangeRate: number;
  exchangeRateUpdatedAt: Date | null;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
}

export interface UpdateSettingsInput {
  metricSystem?: 'metric' | 'imperial' | 'uk';
  currencyCode?: string;
  hideValues?: boolean;
}

// Free exchange rate API - exchangerate-api.com (free tier)
const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/USD';

/**
 * Get user settings, creating default if not exists
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  // Try to get existing settings
  const result = await query<any>(
    `SELECT id, user_id, metric_system, currency_code, hide_values, 
            exchange_rate, exchange_rate_updated_at
     FROM user_settings WHERE user_id = $1`,
    [userId]
  );

  if (result.length > 0) {
    const row = result[0];
    return {
      id: row.id,
      userId: row.user_id,
      metricSystem: row.metric_system,
      currencyCode: row.currency_code,
      hideValues: row.hide_values,
      exchangeRate: parseFloat(row.exchange_rate),
      exchangeRateUpdatedAt: row.exchange_rate_updated_at,
    };
  }

  // Create default settings
  const insertResult = await query<any>(
    `INSERT INTO user_settings (user_id, metric_system, currency_code, hide_values)
     VALUES ($1, 'metric', 'USD', false)
     RETURNING id, user_id, metric_system, currency_code, hide_values, exchange_rate, exchange_rate_updated_at`,
    [userId]
  );

  const row = insertResult[0];
  return {
    id: row.id,
    userId: row.user_id,
    metricSystem: row.metric_system,
    currencyCode: row.currency_code,
    hideValues: row.hide_values,
    exchangeRate: parseFloat(row.exchange_rate),
    exchangeRateUpdatedAt: row.exchange_rate_updated_at,
  };
}

/**
 * Update user settings
 */
export async function updateUserSettings(
  userId: string,
  input: UpdateSettingsInput
): Promise<UserSettings> {
  // If currency is changing, fetch new exchange rate
  let exchangeRate: number | undefined;
  if (input.currencyCode && input.currencyCode !== 'USD') {
    exchangeRate = await fetchExchangeRate(input.currencyCode);
  } else if (input.currencyCode === 'USD') {
    exchangeRate = 1.0;
  }

  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (input.metricSystem !== undefined) {
    updates.push(`metric_system = $${paramCount++}`);
    values.push(input.metricSystem);
  }

  if (input.currencyCode !== undefined) {
    updates.push(`currency_code = $${paramCount++}`);
    values.push(input.currencyCode);
  }

  if (input.hideValues !== undefined) {
    updates.push(`hide_values = $${paramCount++}`);
    values.push(input.hideValues);
  }

  if (exchangeRate !== undefined) {
    updates.push(`exchange_rate = $${paramCount++}`);
    values.push(exchangeRate);
    updates.push(`exchange_rate_updated_at = CURRENT_TIMESTAMP`);
  }

  if (updates.length === 0) {
    return getUserSettings(userId);
  }

  values.push(userId);

  // Upsert settings
  const result = await query<any>(
    `INSERT INTO user_settings (user_id, metric_system, currency_code, hide_values)
     VALUES ($${paramCount}, 
             COALESCE($1, 'metric'), 
             COALESCE($2, 'USD'), 
             COALESCE($3, false))
     ON CONFLICT (user_id) DO UPDATE SET ${updates.join(', ')}
     RETURNING id, user_id, metric_system, currency_code, hide_values, exchange_rate, exchange_rate_updated_at`,
    values
  );

  const row = result[0];
  return {
    id: row.id,
    userId: row.user_id,
    metricSystem: row.metric_system,
    currencyCode: row.currency_code,
    hideValues: row.hide_values,
    exchangeRate: parseFloat(row.exchange_rate),
    exchangeRateUpdatedAt: row.exchange_rate_updated_at,
  };
}

/**
 * Get all supported currencies
 */
export async function getSupportedCurrencies(): Promise<Currency[]> {
  const result = await query<any>(
    `SELECT code, name, symbol, decimal_places 
     FROM supported_currencies 
     WHERE is_active = true 
     ORDER BY code`,
    []
  );

  return result.map((row: any) => ({
    code: row.code,
    name: row.name,
    symbol: row.symbol,
    decimalPlaces: row.decimal_places,
  }));
}

/**
 * Fetch exchange rate from API
 */
export async function fetchExchangeRate(currencyCode: string): Promise<number> {
  try {
    const response = await fetch(EXCHANGE_RATE_API);
    const data = await response.json();
    
    if (data.rates && data.rates[currencyCode]) {
      return data.rates[currencyCode];
    }
    
    logger.warn(`Exchange rate not found for ${currencyCode}, using 1.0`);
    return 1.0;
  } catch (error) {
    logger.error('Failed to fetch exchange rate:', error);
    return 1.0;
  }
}

