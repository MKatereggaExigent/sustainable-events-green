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

    // Send email notification to admin
    await sendLoginNotificationEmail(data);

    logger.info(`User login tracked: ${data.email} from ${data.ipAddress}`);
  } catch (error) {
    logger.error('Failed to track user login:', error);
    // Don't throw - tracking failure shouldn't block login
  }
}

/**
 * Send login notification email to admin
 */
async function sendLoginNotificationEmail(data: LoginTrackingData): Promise<void> {
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
        .header { background: #10b981; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 5px; }
        .label { font-weight: bold; color: #059669; }
        .value { color: #374151; }
        .footer { margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 0 0 5px 5px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🔔 New User Login - EcobServe Platform</h2>
        </div>
        <div class="content">
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
    subject: `🔔 New Login: ${data.email} from ${locationStr}`,
    html: emailHtml,
  });
}

