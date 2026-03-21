import { query, transaction } from '../config/database';
import { generate2FASecret, generateQRCode, verify2FAToken } from '../utils/2fa';
import { generateBackupCodes, hashBackupCodes, verifyBackupCode } from '../utils/tokens';
import { emailService } from './email.service';
import { logger } from '../utils/logger';

export interface Setup2FAResult {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

/**
 * Initialize 2FA setup for a user
 */
export async function setup2FA(userId: string, email: string): Promise<Setup2FAResult> {
  // Check if 2FA already exists
  const existing = await query<any>(
    'SELECT id FROM user_2fa WHERE user_id = $1',
    [userId]
  );

  if (existing.length > 0) {
    throw new Error('2FA already set up for this user');
  }

  // Generate secret and QR code
  const { secret, otpauthUrl } = generate2FASecret(email);
  const qrCode = await generateQRCode(otpauthUrl);

  // Generate backup codes
  const backupCodes = generateBackupCodes(10);
  const hashedBackupCodes = await hashBackupCodes(backupCodes);

  // Store in database (not enabled yet)
  await query(
    `INSERT INTO user_2fa (user_id, secret, is_enabled, backup_codes)
     VALUES ($1, $2, false, $3)`,
    [userId, secret, hashedBackupCodes]
  );

  return {
    secret,
    qrCode,
    backupCodes,
  };
}

/**
 * Enable 2FA after user verifies they can generate valid tokens
 */
export async function enable2FA(userId: string, token: string): Promise<void> {
  return transaction(async (client) => {
    // Get user's 2FA secret
    const result = await client.query(
      'SELECT secret, is_enabled FROM user_2fa WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('2FA not set up');
    }

    const { secret, is_enabled } = result.rows[0];

    if (is_enabled) {
      throw new Error('2FA already enabled');
    }

    // Verify token
    const isValid = await verify2FAToken(token, secret);
    if (!isValid) {
      throw new Error('Invalid verification code');
    }

    // Enable 2FA
    await client.query(
      `UPDATE user_2fa 
       SET is_enabled = true, enabled_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1`,
      [userId]
    );

    // Update user
    await client.query(
      'UPDATE users SET requires_2fa = true WHERE id = $1',
      [userId]
    );

    // Log security event
    await client.query(
      `INSERT INTO security_events (user_id, event_type)
       VALUES ($1, '2fa_enabled')`,
      [userId]
    );

    // Get user email for notification
    const userResult = await client.query(
      'SELECT email, first_name FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      // Send notification email (don't await)
      emailService.send2FAEnabledEmail(user.email, user.first_name || '')
        .catch(err => logger.error('Failed to send 2FA enabled email:', err));
    }
  });
}

/**
 * Disable 2FA
 */
export async function disable2FA(userId: string, password: string): Promise<void> {
  return transaction(async (client) => {
    // Verify password
    const userResult = await client.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, userResult.rows[0].password_hash);
    
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    // Disable 2FA
    await client.query(
      'DELETE FROM user_2fa WHERE user_id = $1',
      [userId]
    );

    await client.query(
      'UPDATE users SET requires_2fa = false WHERE id = $1',
      [userId]
    );

    // Log security event
    await client.query(
      `INSERT INTO security_events (user_id, event_type)
       VALUES ($1, '2fa_disabled')`,
      [userId]
    );
  });
}

/**
 * Verify 2FA token during login
 */
export async function verify2FA(userId: string, token: string): Promise<boolean> {
  const result = await query<any>(
    'SELECT secret, is_enabled, backup_codes FROM user_2fa WHERE user_id = $1',
    [userId]
  );

  if (result.length === 0 || !result[0].is_enabled) {
    return false;
  }

  const { secret, backup_codes } = result[0];

  // Try TOTP token first
  const isValid = await verify2FAToken(token, secret);
  if (isValid) {
    // Update last used
    await query(
      'UPDATE user_2fa SET last_used_at = CURRENT_TIMESTAMP WHERE user_id = $1',
      [userId]
    );
    return true;
  }

  // Try backup codes
  if (backup_codes && backup_codes.length > 0) {
    const codeIndex = await verifyBackupCode(token, backup_codes);
    if (codeIndex >= 0) {
      // Remove used backup code
      const newBackupCodes = [...backup_codes];
      newBackupCodes.splice(codeIndex, 1);
      
      await query(
        'UPDATE user_2fa SET backup_codes = $1, last_used_at = CURRENT_TIMESTAMP WHERE user_id = $1',
        [newBackupCodes, userId]
      );
      
      return true;
    }
  }

  return false;
}

/**
 * Get 2FA status for a user
 */
export async function get2FAStatus(userId: string): Promise<{ enabled: boolean; backupCodesCount: number }> {
  const result = await query<any>(
    'SELECT is_enabled, backup_codes FROM user_2fa WHERE user_id = $1',
    [userId]
  );

  if (result.length === 0) {
    return { enabled: false, backupCodesCount: 0 };
  }

  return {
    enabled: result[0].is_enabled,
    backupCodesCount: result[0].backup_codes ? result[0].backup_codes.length : 0,
  };
}

