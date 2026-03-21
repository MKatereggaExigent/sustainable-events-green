import { TOTP, generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * Generate a new 2FA secret
 */
export function generate2FASecret(email: string): { secret: string; otpauthUrl: string } {
  // Generate a random base32 secret
  const secret = generateSecret();

  // Create otpauth URL
  const otpauthUrl = generateURI({
    issuer: 'EcobServe',
    label: email,
    secret,
    strategy: 'totp',
  });

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
export async function verify2FAToken(token: string, secret: string): Promise<boolean> {
  try {
    const totp = new TOTP({ secret });
    const result = await totp.verify(token);
    return result.valid;
  } catch (error) {
    return false;
  }
}

/**
 * Generate a TOTP token (for testing)
 */
export async function generate2FAToken(secret: string): Promise<string> {
  const totp = new TOTP({ secret });
  return await totp.generate();
}

