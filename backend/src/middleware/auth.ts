import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { query } from '../config/database';
import { logger } from '../utils/logger';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & { permissions?: string[] };
      organizationId?: string;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Check if user still exists and is active
    const users = await query(
      'SELECT id, email, is_active FROM users WHERE id = $1',
      [payload.userId]
    );

    if (users.length === 0 || !users[0].is_active) {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }

    req.user = payload;

    // If organization context is provided, validate membership
    const orgId = req.headers['x-organization-id'] as string || payload.organizationId;
    if (orgId) {
      const membership = await query(
        'SELECT organization_id FROM user_organizations WHERE user_id = $1 AND organization_id = $2',
        [payload.userId, orgId]
      );

      if (membership.length > 0) {
        req.organizationId = orgId;
        req.user.organizationId = orgId;
      }
    }

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);

  if (payload) {
    req.user = payload;
  }

  next();
}

// Middleware to require organization context
export function requireOrganization(req: Request, res: Response, next: NextFunction): void {
  if (!req.organizationId) {
    res.status(400).json({ error: 'Organization context required' });
    return;
  }
  next();
}

// Tenant isolation middleware
export function tenantIsolation(req: Request, res: Response, next: NextFunction): void {
  if (!req.organizationId) {
    res.status(400).json({ error: 'Organization context required for this operation' });
    return;
  }

  // Add organization filter to all database queries
  req.query.organizationId = req.organizationId;
  next();
}

