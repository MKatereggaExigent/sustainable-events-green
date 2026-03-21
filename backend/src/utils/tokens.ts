import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a token for storage
 */
export async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

/**
 * Verify a token against its hash
 */
export async function verifyToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash);
}

/**
 * Generate backup codes for 2FA
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Hash backup codes for storage
 */
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map(code => bcrypt.hash(code, 10)));
}

/**
 * Verify a backup code against hashed codes
 */
export async function verifyBackupCode(code: string, hashedCodes: string[]): Promise<number> {
  for (let i = 0; i < hashedCodes.length; i++) {
    const isValid = await bcrypt.compare(code, hashedCodes[i]);
    if (isValid) {
      return i; // Return index of matched code
    }
  }
  return -1; // No match found
}

