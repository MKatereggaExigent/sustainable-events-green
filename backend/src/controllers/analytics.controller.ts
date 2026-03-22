import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { trackEvent, getConversionRate } from '../services/analytics.service';
import { query } from '../config/database';
import { logger } from '../utils/logger';

export const trackEventValidation = [
  body('eventType').trim().isLength({ min: 1, max: 100 }).withMessage('Event type required'),
  body('eventData').isObject().withMessage('Event data must be an object'),
];

/**
 * Track an analytics event
 */
export async function track(req: Request, res: Response) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.organizationId || !req.user) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    await trackEvent({
      organizationId: req.organizationId,
      userId: req.user.userId,
      eventType: req.body.eventType,
      eventData: req.body.eventData,
      metadata: req.body.metadata || {},
    });

    return res.json({ success: true });
  } catch (error) {
    logger.error('Track analytics event error:', error);
    return res.status(500).json({ error: 'Failed to track event' });
  }
}

/**
 * Get conversion rate analytics (admin only)
 */
export async function getConversionStats(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate required' });
    }

    const stats = await getConversionRate(
      startDate as string,
      endDate as string
    );

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Get conversion stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch conversion stats' });
  }
}

/**
 * Get login analytics overview
 */
export async function getLoginAnalytics(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    // Only admins can view all analytics
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';

    // Get total logins
    const totalLoginsQuery = isAdmin
      ? 'SELECT COUNT(*) as count FROM user_login_tracking'
      : 'SELECT COUNT(*) as count FROM user_login_tracking WHERE user_id = $1';
    const totalLoginsParams = isAdmin ? [] : [userId];
    const totalLogins = await query(totalLoginsQuery, totalLoginsParams);

    // Get unique users (admin only)
    let uniqueUsers = 0;
    if (isAdmin) {
      const uniqueUsersResult = await query(
        'SELECT COUNT(DISTINCT user_id) as count FROM user_login_tracking'
      );
      uniqueUsers = parseInt(uniqueUsersResult[0]?.count || '0');
    }

    // Get logins by country
    const loginsByCountryQuery = isAdmin
      ? `SELECT location_country as country, COUNT(*) as count
         FROM user_login_tracking
         WHERE location_country IS NOT NULL
         GROUP BY location_country
         ORDER BY count DESC
         LIMIT 10`
      : `SELECT location_country as country, COUNT(*) as count
         FROM user_login_tracking
         WHERE user_id = $1 AND location_country IS NOT NULL
         GROUP BY location_country
         ORDER BY count DESC
         LIMIT 10`;
    const loginsByCountryParams = isAdmin ? [] : [userId];
    const loginsByCountry = await query(loginsByCountryQuery, loginsByCountryParams);

    // Get logins over time (last 30 days)
    const loginsOverTimeQuery = isAdmin
      ? `SELECT DATE(login_timestamp) as date, COUNT(*) as count
         FROM user_login_tracking
         WHERE login_timestamp > NOW() - INTERVAL '30 days'
         GROUP BY DATE(login_timestamp)
         ORDER BY date DESC`
      : `SELECT DATE(login_timestamp) as date, COUNT(*) as count
         FROM user_login_tracking
         WHERE user_id = $1 AND login_timestamp > NOW() - INTERVAL '30 days'
         GROUP BY DATE(login_timestamp)
         ORDER BY date DESC`;
    const loginsOverTimeParams = isAdmin ? [] : [userId];
    const loginsOverTime = await query(loginsOverTimeQuery, loginsOverTimeParams);

    // Get recent logins
    const recentLoginsQuery = isAdmin
      ? `SELECT
           email, ip_address, location_country, location_city,
           user_agent, login_timestamp
         FROM user_login_tracking
         ORDER BY login_timestamp DESC
         LIMIT 20`
      : `SELECT
           email, ip_address, location_country, location_city,
           user_agent, login_timestamp
         FROM user_login_tracking
         WHERE user_id = $1
         ORDER BY login_timestamp DESC
         LIMIT 20`;
    const recentLoginsParams = isAdmin ? [] : [userId];
    const recentLogins = await query(recentLoginsQuery, recentLoginsParams);

    // Get unique devices
    const uniqueDevicesQuery = isAdmin
      ? `SELECT COUNT(DISTINCT device_fingerprint) as count
         FROM user_login_tracking
         WHERE device_fingerprint IS NOT NULL`
      : `SELECT COUNT(DISTINCT device_fingerprint) as count
         FROM user_login_tracking
         WHERE user_id = $1 AND device_fingerprint IS NOT NULL`;
    const uniqueDevicesParams = isAdmin ? [] : [userId];
    const uniqueDevices = await query(uniqueDevicesQuery, uniqueDevicesParams);

    res.json({
      totalLogins: parseInt(totalLogins[0]?.count || '0'),
      uniqueUsers: isAdmin ? uniqueUsers : 1,
      uniqueDevices: parseInt(uniqueDevices[0]?.count || '0'),
      loginsByCountry: loginsByCountry.map((row: any) => ({
        country: row.country,
        count: parseInt(row.count),
      })),
      loginsOverTime: loginsOverTime.map((row: any) => ({
        date: row.date,
        count: parseInt(row.count),
      })),
      recentLogins: recentLogins.map((row: any) => ({
        email: row.email,
        ipAddress: row.ip_address,
        location: row.location_city && row.location_country
          ? `${row.location_city}, ${row.location_country}`
          : row.location_country || 'Unknown',
        userAgent: row.user_agent,
        timestamp: row.login_timestamp,
      })),
    });
  } catch (error) {
    logger.error('Failed to get login analytics:', error);
    res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
}

