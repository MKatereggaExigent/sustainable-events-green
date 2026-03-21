import { emailService } from './email.service';
import { query } from '../config/database';
import { logger } from '../utils/logger';

interface LimitNotificationData {
  organizationId: string;
  planName: string;
  currentUsage: number;
  limit: number;
  percentage: number;
  resourceType: 'events' | 'users';
}

/**
 * Send email notification when user approaches subscription limit (80%)
 */
export async function sendApproachingLimitNotification(data: LimitNotificationData): Promise<void> {
  try {
    // Get organization owner email
    const ownerResult = await query<{ email: string; first_name: string }>(
      `SELECT u.email, u.first_name
       FROM users u
       JOIN user_organizations uo ON u.id = uo.user_id
       WHERE uo.organization_id = $1 AND uo.is_owner = true
       LIMIT 1`,
      [data.organizationId]
    );

    if (ownerResult.length === 0) {
      logger.warn(`No owner found for organization ${data.organizationId}`);
      return;
    }

    const owner = ownerResult[0];
    const remaining = data.limit - data.currentUsage;

    await emailService.sendCustomEmail({
      to: owner.email,
      subject: `⚠️ Approaching ${data.planName} Plan Limit`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">You're Approaching Your Plan Limit</h2>
          
          <p>Hi ${owner.first_name || 'there'},</p>
          
          <p>You've used <strong>${data.currentUsage} out of ${data.limit}</strong> ${data.resourceType} in your <strong>${data.planName}</strong> plan this month.</p>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">⚠️ ${remaining} ${data.resourceType} remaining</p>
          </div>
          
          <p>To continue creating ${data.resourceType} without interruption, consider upgrading your plan:</p>
          
          <a href="${process.env.FRONTEND_URL}/pricing" 
             style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">
            View Upgrade Options
          </a>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Your usage resets on the 1st of next month.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px;">
            EcobServe - Sustainable Event Management<br>
            <a href="${process.env.FRONTEND_URL}" style="color: #10b981;">ecobserve.com</a>
          </p>
        </div>
      `,
    });

    logger.info(`Approaching limit notification sent to ${owner.email} for org ${data.organizationId}`);
  } catch (error) {
    logger.error('Failed to send approaching limit notification:', error);
  }
}

/**
 * Send email notification when user reaches subscription limit (100%)
 */
export async function sendLimitReachedNotification(data: LimitNotificationData): Promise<void> {
  try {
    // Get organization owner email
    const ownerResult = await query<{ email: string; first_name: string }>(
      `SELECT u.email, u.first_name
       FROM users u
       JOIN user_organizations uo ON u.id = uo.user_id
       WHERE uo.organization_id = $1 AND uo.is_owner = true
       LIMIT 1`,
      [data.organizationId]
    );

    if (ownerResult.length === 0) {
      logger.warn(`No owner found for organization ${data.organizationId}`);
      return;
    }

    const owner = ownerResult[0];

    await emailService.sendCustomEmail({
      to: owner.email,
      subject: `🚫 ${data.planName} Plan Limit Reached`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Plan Limit Reached</h2>
          
          <p>Hi ${owner.first_name || 'there'},</p>
          
          <p>You've reached your <strong>${data.planName}</strong> plan limit of <strong>${data.limit} ${data.resourceType}</strong> this month.</p>
          
          <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">🚫 No ${data.resourceType} remaining</p>
            <p style="margin: 8px 0 0 0; font-size: 14px;">You won't be able to create new ${data.resourceType} until you upgrade or your usage resets.</p>
          </div>
          
          <p><strong>What happens now?</strong></p>
          <ul>
            <li>You can still view and manage your existing ${data.resourceType}</li>
            <li>Creating new ${data.resourceType} is temporarily disabled</li>
            <li>Your usage will reset on the 1st of next month</li>
          </ul>
          
          <p>To continue creating ${data.resourceType} immediately, upgrade your plan:</p>
          
          <a href="${process.env.FRONTEND_URL}/pricing" 
             style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">
            Upgrade Now
          </a>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px;">
            EcobServe - Sustainable Event Management<br>
            <a href="${process.env.FRONTEND_URL}" style="color: #10b981;">ecobserve.com</a>
          </p>
        </div>
      `,
    });

    logger.info(`Limit reached notification sent to ${owner.email} for org ${data.organizationId}`);
  } catch (error) {
    logger.error('Failed to send limit reached notification:', error);
  }
}

