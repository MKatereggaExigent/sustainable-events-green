import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';

export interface TokenPayload {
  userId: string;
  email: string;
  organizationId?: string;
  roles?: string[];
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwt.accessExpiresIn as StringValue,
    jwtid: uuidv4(),
  };
  return jwt.sign(payload as object, config.jwt.accessSecret, options);
}

export function generateRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as StringValue,
    jwtid: uuidv4(),
  };
  return jwt.sign(payload as object, config.jwt.refreshSecret, options);
}

export function generateTokens(payload: TokenPayload): JwtTokens {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  // Calculate expiry in seconds
  const expiresIn = parseExpiry(config.jwt.accessExpiresIn);
  
  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    return null;
  }
}

function parseExpiry(expiry: string): number {
  const unit = expiry.slice(-1);
  const value = parseInt(expiry.slice(0, -1), 10);
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return 900; // 15 minutes default
  }
}

export function hashToken(token: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(token).digest('hex');
}

