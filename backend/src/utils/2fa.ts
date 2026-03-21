import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * Generate a new 2FA secret
 */
export function generate2FASecret(email: string): { secret: string; otpauthUrl: string } {
  // Generate a random base32 secret
  const secret = authenticator.generateSecret();

  // Create otpauth URL
  const otpauthUrl = authenticator.keyuri(email, 'EcobServe', secret);

  return {
    secret,
    otpauthUrl,
  };
}

/**
 * Generate QR code as data URL
 */
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Verify a TOTP token
 */
export function verify2FAToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    return false;
  }
}

/**
 * Generate a TOTP token (for testing)
 */
export function generate2FAToken(secret: string): string {
  return authenticator.generate(secret);
}

