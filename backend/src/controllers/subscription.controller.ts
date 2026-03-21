import { Request, Response } from 'express';
import { query } from '../config/database';
import { logger } from '../utils/logger';

/**
 * Get organization's subscription usage statistics
 * Returns current usage vs. limits for events, users, etc.
 */
export async function getSubscriptionUsage(req: Request, res: Response) {
  try {
    if (!req.organizationId) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    // Get subscription plan details
    const subscriptionResult = await query<{
      plan_code: string;
      plan_name: string;
      max_events: number;
      max_users: number;
      features: string[];
      amount: number;
      currency: string;
      interval: string;
      status: string;
      next_payment_date: string | null;
    }>(
      `SELECT s.plan_code, s.plan_name, s.status, s.next_payment_date,
              sp.max_events, sp.max_users, sp.features, sp.amount, sp.currency, sp.interval
       FROM subscriptions s
       LEFT JOIN subscription_plans sp ON s.plan_code = sp.code
       WHERE s.organization_id = $1 AND s.status = 'active'
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [req.organizationId]
    );

    // Default to Explorer if no subscription found
    let subscription = {
      planCode: 'explorer',
      planName: 'Explorer',
      maxEvents: 1,
      maxUsers: 1,
      features: [
        'Event Footprint Calculator (1 event/month)',
        'Basic carbon, water, waste calculations',
        'Simple sustainability score',
        'Basic recommendations',
        'FAQ & Resources access',
      ],
      amount: 0,
      currency: 'ZAR',
      interval: 'monthly',
      status: 'active',
      nextPaymentDate: null,
    };

    if (subscriptionResult.length > 0) {
      const sub = subscriptionResult[0];
      subscription = {
        planCode: sub.plan_code,
        planName: sub.plan_name,
        maxEvents: sub.max_events,
        maxUsers: sub.max_users,
        features: sub.features,
        amount: parseFloat(sub.amount.toString()),
        currency: sub.currency,
        interval: sub.interval,
        status: sub.status,
        nextPaymentDate: sub.next_payment_date || null,
      };
    }

    // Count events created this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const eventCountResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count
       FROM events
       WHERE organization_id = $1
       AND created_at >= $2`,
      [req.organizationId, firstDayOfMonth.toISOString()]
    );

    const eventsThisMonth = parseInt(eventCountResult[0]?.count || '0', 10);

    // Count total users in organization
    const userCountResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count
       FROM user_organizations
       WHERE organization_id = $1`,
      [req.organizationId]
    );

    const currentUsers = parseInt(userCountResult[0]?.count || '0', 10);

    // Calculate usage percentages
    const eventUsagePercent = subscription.maxEvents === -1 
      ? 0 
      : Math.round((eventsThisMonth / subscription.maxEvents) * 100);

    const userUsagePercent = subscription.maxUsers === -1 
      ? 0 
      : Math.round((currentUsers / subscription.maxUsers) * 100);

    // Determine if approaching limit (>= 80%)
    const approachingEventLimit = subscription.maxEvents !== -1 && eventUsagePercent >= 80;
    const approachingUserLimit = subscription.maxUsers !== -1 && userUsagePercent >= 80;

    return res.json({
      success: true,
      data: {
        subscription,
        usage: {
          events: {
            current: eventsThisMonth,
            limit: subscription.maxEvents,
            unlimited: subscription.maxEvents === -1,
            percentage: eventUsagePercent,
            remaining: subscription.maxEvents === -1 ? -1 : Math.max(0, subscription.maxEvents - eventsThisMonth),
            approachingLimit: approachingEventLimit,
            limitReached: subscription.maxEvents !== -1 && eventsThisMonth >= subscription.maxEvents,
          },
          users: {
            current: currentUsers,
            limit: subscription.maxUsers,
            unlimited: subscription.maxUsers === -1,
            percentage: userUsagePercent,
            remaining: subscription.maxUsers === -1 ? -1 : Math.max(0, subscription.maxUsers - currentUsers),
            approachingLimit: approachingUserLimit,
            limitReached: subscription.maxUsers !== -1 && currentUsers >= subscription.maxUsers,
          },
        },
        resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(), // First day of next month
      },
    });
  } catch (error) {
    logger.error('Get subscription usage error:', error);
    return res.status(500).json({ error: 'Failed to fetch subscription usage' });
  }
}

