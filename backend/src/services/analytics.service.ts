import { query } from '../config/database';
import { logger } from '../utils/logger';

export interface AnalyticsEvent {
  organizationId: string;
  userId: string;
  eventType: string;
  eventData: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Track analytics events for business intelligence
 * Examples: upgrade_clicked, limit_reached, plan_changed, etc.
 */
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  try {
    await query(
      `INSERT INTO analytics_events (organization_id, user_id, event_type, event_data, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        event.organizationId,
        event.userId,
        event.eventType,
        JSON.stringify(event.eventData),
        JSON.stringify(event.metadata || {}),
      ]
    );

    logger.info(`Analytics event tracked: ${event.eventType}`, {
      organizationId: event.organizationId,
      userId: event.userId,
    });
  } catch (error) {
    // Don't fail the request if analytics tracking fails
    logger.error('Failed to track analytics event:', error);
  }
}

/**
 * Track when a user clicks "Upgrade" after hitting a limit
 */
export async function trackUpgradeClick(
  organizationId: string,
  userId: string,
  fromPlan: string,
  reason: 'limit_reached' | 'approaching_limit' | 'feature_locked'
): Promise<void> {
  await trackEvent({
    organizationId,
    userId,
    eventType: 'upgrade_clicked',
    eventData: {
      fromPlan,
      reason,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Track when a subscription plan changes
 */
export async function trackPlanChange(
  organizationId: string,
  userId: string,
  fromPlan: string,
  toPlan: string,
  amount: number
): Promise<void> {
  await trackEvent({
    organizationId,
    userId,
    eventType: 'plan_changed',
    eventData: {
      fromPlan,
      toPlan,
      amount,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Track when a user hits a subscription limit
 */
export async function trackLimitReached(
  organizationId: string,
  userId: string,
  planCode: string,
  resourceType: 'events' | 'users',
  limit: number
): Promise<void> {
  await trackEvent({
    organizationId,
    userId,
    eventType: 'limit_reached',
    eventData: {
      planCode,
      resourceType,
      limit,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Get conversion rate from Explorer to paid plans
 */
export async function getConversionRate(
  startDate: string,
  endDate: string
): Promise<{ totalExplorerUsers: number; conversions: number; conversionRate: number }> {
  try {
    // Count total Explorer users created in date range
    const explorerResult = await query<{ count: string }>(
      `SELECT COUNT(DISTINCT s.organization_id) as count
       FROM subscriptions s
       WHERE s.plan_code = 'explorer'
       AND s.created_at >= $1 AND s.created_at <= $2`,
      [startDate, endDate]
    );

    const totalExplorerUsers = parseInt(explorerResult[0]?.count || '0', 10);

    // Count how many upgraded to paid plans
    const conversionResult = await query<{ count: string }>(
      `SELECT COUNT(DISTINCT ae.organization_id) as count
       FROM analytics_events ae
       WHERE ae.event_type = 'plan_changed'
       AND ae.event_data->>'fromPlan' = 'explorer'
       AND ae.event_data->>'toPlan' != 'explorer'
       AND ae.created_at >= $1 AND ae.created_at <= $2`,
      [startDate, endDate]
    );

    const conversions = parseInt(conversionResult[0]?.count || '0', 10);
    const conversionRate = totalExplorerUsers > 0 ? (conversions / totalExplorerUsers) * 100 : 0;

    return {
      totalExplorerUsers,
      conversions,
      conversionRate: Math.round(conversionRate * 100) / 100, // Round to 2 decimals
    };
  } catch (error) {
    logger.error('Failed to calculate conversion rate:', error);
    return { totalExplorerUsers: 0, conversions: 0, conversionRate: 0 };
  }
}

