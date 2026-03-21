import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * Generate a new 2FA secret
 */
export function generate2FASecret(email: string): { secret: string; otpauthUrl: string } {
  const secret = speakeasy.generateSecret({
    name: `EcobServe (${email})`,
    issuer: 'EcobServe',
    length: 32,
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url || '',
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
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Allow 2 time steps before/after for clock drift
  });
}

/**
 * Generate a TOTP token (for testing)
 */
export function generate2FAToken(secret: string): string {
  return speakeasy.totp({
    secret,
    encoding: 'base32',
  });
}

