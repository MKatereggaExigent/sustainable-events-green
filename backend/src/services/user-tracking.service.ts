import { query } from '../config/database';
import { logger } from '../utils/logger';
import { sendEmail } from './email.service';
import geoip from 'geoip-lite';

interface LoginTrackingData {
  userId: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  location?: {
    country: string;
    region: string;
    city: string;
    timezone: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
}

/**
 * Track user login and send notification to admin
 */
export async function trackUserLogin(data: LoginTrackingData): Promise<void> {
  try {
    // Get geolocation from IP
    const geo = geoip.lookup(data.ipAddress);

    if (geo) {
      data.location = {
        country: geo.country,
        region: geo.region,
        city: geo.city,
        timezone: geo.timezone,
        coordinates: {
          latitude: geo.ll[0],
          longitude: geo.ll[1],
        },
      };
    }

    // Check for suspicious login
    const isSuspicious = await detectSuspiciousLogin(data);

    // Save to database
    await query(
      `INSERT INTO user_login_tracking (
        user_id, email, ip_address, user_agent, device_fingerprint,
        location_country, location_region, location_city, location_timezone,
        location_latitude, location_longitude, login_timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)`,
      [
        data.userId,
        data.email,
        data.ipAddress,
        data.userAgent,
        data.deviceFingerprint || null,
        data.location?.country || null,
        data.location?.region || null,
        data.location?.city || null,
        data.location?.timezone || null,
        data.location?.coordinates.latitude || null,
        data.location?.coordinates.longitude || null,
      ]
    );

    // Send email notification to admin (always)
    await sendLoginNotificationEmail(data, isSuspicious);

    logger.info(`User login tracked: ${data.email} from ${data.ipAddress}${isSuspicious ? ' [SUSPICIOUS]' : ''}`);
  } catch (error) {
    logger.error('Failed to track user login:', error);
    // Don't throw - tracking failure shouldn't block login
  }
}

/**
 * Detect suspicious login patterns
 */
async function detectSuspiciousLogin(data: LoginTrackingData): Promise<boolean> {
  try {
    // Get user's login history
    const history = await query(
      `SELECT DISTINCT
        location_country, location_city, device_fingerprint, ip_address
      FROM user_login_tracking
      WHERE user_id = $1
      ORDER BY login_timestamp DESC
      LIMIT 10`,
      [data.userId]
    );

    // First login - not suspicious
    if (history.length === 0) {
      return false;
    }

    let suspiciousReasons: string[] = [];

    // Check for new country
    const knownCountries = new Set(history.map((h: any) => h.location_country).filter(Boolean));
    if (data.location?.country && !knownCountries.has(data.location.country)) {
      suspiciousReasons.push(`New country: ${data.location.country}`);
    }

    // Check for new device fingerprint
    if (data.deviceFingerprint) {
      const knownDevices = new Set(history.map((h: any) => h.device_fingerprint).filter(Boolean));
      if (!knownDevices.has(data.deviceFingerprint)) {
        suspiciousReasons.push('New device detected');
      }
    }

    // Check for new IP address
    const knownIPs = new Set(history.map((h: any) => h.ip_address).filter(Boolean));
    if (!knownIPs.has(data.ipAddress)) {
      suspiciousReasons.push(`New IP: ${data.ipAddress}`);
    }

    // Check for rapid location changes (impossible travel)
    if (history.length > 0 && data.location) {
      const lastLogin = history[0];
      if (lastLogin.location_country && lastLogin.location_country !== data.location.country) {
        // Different country within 1 hour = suspicious
        const recentLogins = await query(
          `SELECT login_timestamp FROM user_login_tracking
           WHERE user_id = $1
           AND login_timestamp > NOW() - INTERVAL '1 hour'
           LIMIT 1`,
          [data.userId]
        );
        if (recentLogins.length > 0) {
          suspiciousReasons.push('Impossible travel detected');
        }
      }
    }

    if (suspiciousReasons.length > 0) {
      logger.warn(`Suspicious login detected for ${data.email}: ${suspiciousReasons.join(', ')}`);
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Failed to detect suspicious login:', error);
    return false;
  }
}

/**
 * Send login notification email to admin
 */
async function sendLoginNotificationEmail(data: LoginTrackingData, isSuspicious: boolean = false): Promise<void> {
  const locationStr = data.location
    ? `${data.location.city}, ${data.location.region}, ${data.location.country}`
    : 'Unknown';

  const coordinatesStr = data.location
    ? `${data.location.coordinates.latitude}, ${data.location.coordinates.longitude}`
    : 'N/A';

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${isSuspicious ? '#ef4444' : '#10b981'}; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 5px; }
        .label { font-weight: bold; color: #059669; }
        .value { color: #374151; }
        .alert { background: #fee2e2; border: 2px solid #ef4444; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .alert-text { color: #991b1b; font-weight: bold; }
        .footer { margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 0 0 5px 5px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${isSuspicious ? '🚨 SUSPICIOUS LOGIN DETECTED' : '🔔 New User Login'} - EcobServe Platform</h2>
        </div>
        <div class="content">
          ${isSuspicious ? `
          <div class="alert">
            <p class="alert-text">⚠️ This login has been flagged as potentially suspicious due to unusual patterns (new location, device, or impossible travel).</p>
          </div>
          ` : ''}
          <p>A user has logged into the EcobServe platform. Here are the details:</p>
          
          <div class="info-row">
            <span class="label">👤 User Email:</span>
            <span class="value">${data.email}</span>
          </div>
          
          <div class="info-row">
            <span class="label">🆔 User ID:</span>
            <span class="value">${data.userId}</span>
          </div>
          
          <div class="info-row">
            <span class="label">🌐 IP Address:</span>
            <span class="value">${data.ipAddress}</span>
          </div>
          
          <div class="info-row">
            <span class="label">📍 Location:</span>
            <span class="value">${locationStr}</span>
          </div>
          
          <div class="info-row">
            <span class="label">🗺️ Coordinates:</span>
            <span class="value">${coordinatesStr}</span>
          </div>
          
          <div class="info-row">
            <span class="label">🕐 Timezone:</span>
            <span class="value">${data.location?.timezone || 'N/A'}</span>
          </div>
          
          <div class="info-row">
            <span class="label">💻 Device/Browser:</span>
            <span class="value">${data.userAgent}</span>
          </div>
          
          ${data.deviceFingerprint ? `
          <div class="info-row">
            <span class="label">🔑 Device Fingerprint:</span>
            <span class="value">${data.deviceFingerprint}</span>
          </div>
          ` : ''}
          
          <div class="info-row">
            <span class="label">⏰ Login Time:</span>
            <span class="value">${new Date().toLocaleString('en-ZA', { timeZone: data.location?.timezone || 'Africa/Johannesburg' })}</span>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated notification from EcobServe Platform.</p>
          <p>© ${new Date().getFullYear()} EcobServe - Sustainable Event Management</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: 'estelle.kateregga@greenovationevents.com',
    subject: isSuspicious
      ? `🚨 SUSPICIOUS LOGIN: ${data.email} from ${locationStr}`
      : `🔔 New Login: ${data.email} from ${locationStr}`,
    html: emailHtml,
  });
}

