import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { getCache, setCache } from '../config/redis';
import { logger } from '../utils/logger';

// Cache user permissions for 5 minutes
const PERMISSION_CACHE_TTL = 300;

export async function loadUserPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user || !req.organizationId) {
    next();
    return;
  }

  try {
    const cacheKey = `permissions:${req.user.userId}:${req.organizationId}`;
    let permissions = await getCache(cacheKey);

    if (!permissions) {
      // Load permissions from database
      const result = await query<{ name: string }>(
        `SELECT DISTINCT p.name
         FROM permissions p
         JOIN role_permissions rp ON p.id = rp.permission_id
         JOIN user_roles ur ON rp.role_id = ur.role_id
         WHERE ur.user_id = $1 AND ur.organization_id = $2`,
        [req.user.userId, req.organizationId]
      );

      permissions = result.map(r => r.name);
      await setCache(cacheKey, permissions, PERMISSION_CACHE_TTL);
    }

    req.user.permissions = permissions;
    next();
  } catch (error) {
    logger.error('Error loading permissions:', error);
    next();
  }
}

export function requirePermission(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userPermissions = req.user.permissions || [];

    // Check if user has any of the required permissions
    const hasPermission = requiredPermissions.some(perm =>
      userPermissions.includes(perm) || userPermissions.includes('admin:access')
    );

    if (!hasPermission) {
      logger.warn(`Permission denied for user ${req.user.userId}: required ${requiredPermissions.join(' or ')}`);
      res.status(403).json({
        error: 'Permission denied',
        required: requiredPermissions,
      });
      return;
    }

    next();
  };
}

export function requireAllPermissions(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userPermissions = req.user.permissions || [];

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(perm =>
      userPermissions.includes(perm) || userPermissions.includes('admin:access')
    );

    if (!hasAllPermissions) {
      res.status(403).json({
        error: 'Permission denied',
        required: requiredPermissions,
      });
      return;
    }

    next();
  };
}

export function requireRole(...requiredRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || !req.organizationId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    try {
      const result = await query<{ name: string }>(
        `SELECT r.name
         FROM roles r
         JOIN user_roles ur ON r.id = ur.role_id
         WHERE ur.user_id = $1 AND ur.organization_id = $2`,
        [req.user.userId, req.organizationId]
      );

      const userRoles = result.map(r => r.name);
      const hasRole = requiredRoles.some(role => userRoles.includes(role));

      if (!hasRole) {
        res.status(403).json({
          error: 'Role required',
          required: requiredRoles,
        });
        return;
      }

      req.user.roles = userRoles;
      next();
    } catch (error) {
      logger.error('Error checking roles:', error);
      res.status(500).json({ error: 'Authorization failed' });
    }
  };
}

