import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { logger } from '../utils/logger';
import { sendApproachingLimitNotification, sendLimitReachedNotification } from '../services/notification.service';
import { trackLimitReached } from '../services/analytics.service';

/**
 * Middleware to enforce subscription limits (e.g., max events per month for Explorer tier)
 * This creates a "payment wall" that blocks users from exceeding their plan limits
 */
export function enforceSubscriptionLimits(resource: 'event' | 'user') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.organizationId) {
        res.status(400).json({ error: 'Organization context required' });
        return;
      }

      // Get organization's subscription plan
      const subscriptionResult = await query<{
        plan_code: string;
        max_events: number;
        max_users: number;
      }>(
        `SELECT s.plan_code, sp.max_events, sp.max_users
         FROM subscriptions s
         LEFT JOIN subscription_plans sp ON s.plan_code = sp.code
         WHERE s.organization_id = $1 AND s.status = 'active'
         ORDER BY s.created_at DESC
         LIMIT 1`,
        [req.organizationId]
      );

      // If no subscription found, default to Explorer (free) tier
      let maxEvents = 3;
      let maxUsers = 1;
      let planCode = 'explorer';

      if (subscriptionResult.length > 0) {
        const sub = subscriptionResult[0];
        maxEvents = sub.max_events;
        maxUsers = sub.max_users;
        planCode = sub.plan_code;
      }

      // Check resource-specific limits
      if (resource === 'event') {
        // -1 means unlimited
        if (maxEvents === -1) {
          next();
          return;
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
        const usagePercentage = Math.round((eventsThisMonth / maxEvents) * 100);

        // Send notification at 80% usage (approaching limit)
        if (usagePercentage === 80) {
          sendApproachingLimitNotification({
            organizationId: req.organizationId,
            planName: planCode === 'explorer' ? 'Explorer' : 'Unknown',
            currentUsage: eventsThisMonth,
            limit: maxEvents,
            percentage: usagePercentage,
            resourceType: 'events',
          }).catch(err => logger.error('Failed to send approaching limit notification:', err));
        }

        if (eventsThisMonth >= maxEvents) {
          logger.warn(`Subscription limit reached for org ${req.organizationId}: ${eventsThisMonth}/${maxEvents} events this month`);

          // Track analytics event
          if (req.user) {
            trackLimitReached(
              req.organizationId,
              req.user.userId,
              planCode,
              'events',
              maxEvents
            ).catch(err => logger.error('Failed to track limit reached event:', err));
          }

          // Send notification at 100% usage (limit reached)
          sendLimitReachedNotification({
            organizationId: req.organizationId,
            planName: planCode === 'explorer' ? 'Explorer' : 'Unknown',
            currentUsage: eventsThisMonth,
            limit: maxEvents,
            percentage: 100,
            resourceType: 'events',
          }).catch(err => logger.error('Failed to send limit reached notification:', err));

          res.status(403).json({
            error: 'Subscription limit reached',
            message: `You've reached your plan limit of ${maxEvents} events per month. Upgrade to create more events.`,
            limit: maxEvents,
            current: eventsThisMonth,
            planCode,
            upgradeUrl: '/pricing',
          });
          return;
        }

        // Add usage info to request for logging/analytics
        req.subscriptionUsage = {
          eventsThisMonth,
          maxEvents,
          planCode,
        };
      }

      if (resource === 'user') {
        // -1 means unlimited
        if (maxUsers === -1) {
          next();
          return;
        }

        // Count current users in organization
        const userCountResult = await query<{ count: string }>(
          `SELECT COUNT(*) as count
           FROM user_organizations
           WHERE organization_id = $1`,
          [req.organizationId]
        );

        const currentUsers = parseInt(userCountResult[0]?.count || '0', 10);

        if (currentUsers >= maxUsers) {
          logger.warn(`User limit reached for org ${req.organizationId}: ${currentUsers}/${maxUsers} users`);
          res.status(403).json({
            error: 'User limit reached',
            message: `You've reached your plan limit of ${maxUsers} user(s). Upgrade to add more team members.`,
            limit: maxUsers,
            current: currentUsers,
            planCode,
            upgradeUrl: '/pricing',
          });
          return;
        }
      }

      next();
    } catch (error) {
      logger.error('Subscription limit check error:', error);
      // Fail open - don't block on errors, but log them
      next();
    }
  };
}

/**
 * Middleware to check if organization has an active subscription
 * Blocks access if subscription is expired or cancelled
 */
export async function requireActiveSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.organizationId) {
      res.status(400).json({ error: 'Organization context required' });
      return;
    }

    // Check organization subscription status
    const orgResult = await query<{
      subscription_tier: string;
      subscription_expires_at: string | null;
    }>(
      'SELECT subscription_tier, subscription_expires_at FROM organizations WHERE id = $1',
      [req.organizationId]
    );

    if (orgResult.length === 0) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }

    const org = orgResult[0];

    // Explorer (free) tier never expires
    if (org.subscription_tier === 'explorer' || org.subscription_tier === 'free') {
      next();
      return;
    }

    // Check if paid subscription has expired
    if (org.subscription_expires_at) {
      const expiresAt = new Date(org.subscription_expires_at);
      if (expiresAt < new Date()) {
        res.status(403).json({
          error: 'Subscription expired',
          message: 'Your subscription has expired. Please renew to continue using premium features.',
          expiresAt: org.subscription_expires_at,
          renewUrl: '/pricing',
        });
        return;
      }
    }

    next();
  } catch (error) {
    logger.error('Active subscription check error:', error);
    // Fail open
    next();
  }
}

