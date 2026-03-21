import { query } from '../config/database';
import { logger } from '../utils/logger';

export interface PlatformStatistics {
  eventsTracked: number;
  co2OffsetKg: number;
  plannersActive: number;
  avgSatisfaction: number;
  countries: number;
  treesPlanted: number;
  waterSavedLiters: number;
  eventsThisMonth: number;
}

/**
 * Get platform-wide statistics
 * Calculates real-time stats from actual user data
 */
export async function getPlatformStatistics(): Promise<PlatformStatistics> {
  try {
    // Get total events tracked
    const eventsResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM events WHERE status != $1',
      ['draft']
    );
    const eventsTracked = parseInt(eventsResult[0]?.count || '0', 10);

    // Get events this month
    const eventsThisMonthResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM events 
       WHERE status != $1 
       AND created_at >= DATE_TRUNC('month', CURRENT_TIMESTAMP)`,
      ['draft']
    );
    const eventsThisMonth = parseInt(eventsThisMonthResult[0]?.count || '0', 10);

    // Get total CO2 offset (sum of all event carbon data)
    const co2Result = await query<{ total: string }>(
      'SELECT COALESCE(SUM(carbon_kg), 0) as total FROM event_carbon_data'
    );
    const co2OffsetKg = parseFloat(co2Result[0]?.total || '0');

    // Get total water saved
    const waterResult = await query<{ total: string }>(
      'SELECT COALESCE(SUM(water_liters), 0) as total FROM event_carbon_data'
    );
    const waterSavedLiters = parseFloat(waterResult[0]?.total || '0');

    // Get active planners (users who have created at least one event)
    const plannersResult = await query<{ count: string }>(
      `SELECT COUNT(DISTINCT created_by) as count FROM events WHERE created_by IS NOT NULL`
    );
    const plannersActive = parseInt(plannersResult[0]?.count || '0', 10);

    // Get average green score as satisfaction proxy
    const satisfactionResult = await query<{ avg: string }>(
      'SELECT COALESCE(AVG(green_score), 0) as avg FROM event_carbon_data WHERE green_score > 0'
    );
    const avgSatisfaction = Math.round(parseFloat(satisfactionResult[0]?.avg || '0'));

    // Get unique countries (from organization settings or user data)
    // For now, we'll use a placeholder until we add country tracking
    const countries = 0;

    // Calculate trees planted equivalent (1 tree = ~20kg CO2/year)
    const treesPlanted = Math.floor(co2OffsetKg / 20);

    return {
      eventsTracked,
      co2OffsetKg,
      plannersActive,
      avgSatisfaction,
      countries,
      treesPlanted,
      waterSavedLiters,
      eventsThisMonth,
    };
  } catch (error) {
    logger.error('Failed to get platform statistics:', error);
    // Return zeros on error
    return {
      eventsTracked: 0,
      co2OffsetKg: 0,
      plannersActive: 0,
      avgSatisfaction: 0,
      countries: 0,
      treesPlanted: 0,
      waterSavedLiters: 0,
      eventsThisMonth: 0,
    };
  }
}

/**
 * Get or create admin-managed statistics
 * These are manually set values that override calculated ones
 */
export async function getAdminStatistics(): Promise<Partial<PlatformStatistics> | null> {
  try {
    const result = await query<any>(
      'SELECT * FROM platform_statistics WHERE id = 1'
    );
    
    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      eventsTracked: row.events_tracked,
      co2OffsetKg: parseFloat(row.co2_offset_kg || '0'),
      plannersActive: row.planners_active,
      avgSatisfaction: row.avg_satisfaction,
      countries: row.countries,
      treesPlanted: row.trees_planted,
      waterSavedLiters: parseFloat(row.water_saved_liters || '0'),
      eventsThisMonth: row.events_this_month,
    };
  } catch (error) {
    // Table might not exist yet
    return null;
  }
}

/**
 * Get combined statistics (admin overrides + calculated)
 */
export async function getCombinedStatistics(): Promise<PlatformStatistics> {
  const calculated = await getPlatformStatistics();
  const admin = await getAdminStatistics();

  if (!admin) {
    return calculated;
  }

  // Admin values override calculated ones (if set)
  return {
    eventsTracked: admin.eventsTracked ?? calculated.eventsTracked,
    co2OffsetKg: admin.co2OffsetKg ?? calculated.co2OffsetKg,
    plannersActive: admin.plannersActive ?? calculated.plannersActive,
    avgSatisfaction: admin.avgSatisfaction ?? calculated.avgSatisfaction,
    countries: admin.countries ?? calculated.countries,
    treesPlanted: admin.treesPlanted ?? calculated.treesPlanted,
    waterSavedLiters: admin.waterSavedLiters ?? calculated.waterSavedLiters,
    eventsThisMonth: admin.eventsThisMonth ?? calculated.eventsThisMonth,
  };
}

