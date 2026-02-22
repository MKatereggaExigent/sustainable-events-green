import { Request, Response } from 'express';
import { validationResult, body, param } from 'express-validator';
import * as organizationService from '../services/organization.service';
import { logger } from '../utils/logger';

export const createOrgValidation = [
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Organization name required'),
  body('slug').optional().trim().isLength({ min: 3, max: 100 }).matches(/^[a-z0-9-]+$/),
  body('logoUrl').optional().isURL(),
];

export const updateOrgValidation = [
  body('name').optional().trim().isLength({ min: 1, max: 255 }),
  body('logoUrl').optional().isURL(),
];

export const addMemberValidation = [
  body('userId').isUUID(),
  body('roles').optional().isArray(),
  body('roles.*').optional().isString(),
];

export async function getMyOrganizations(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const organizations = await organizationService.getUserOrganizations(req.user.userId);
    return res.json({ organizations });
  } catch (error) {
    logger.error('Get organizations error:', error);
    return res.status(500).json({ error: 'Failed to fetch organizations' });
  }
}

export async function getOrganization(req: Request, res: Response) {
  try {
    if (!req.organizationId) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    const organization = await organizationService.getOrganization(req.organizationId);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    return res.json({ organization });
  } catch (error) {
    logger.error('Get organization error:', error);
    return res.status(500).json({ error: 'Failed to fetch organization' });
  }
}

export async function createOrganization(req: Request, res: Response) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const organization = await organizationService.createOrganization(
      req.user.userId,
      req.body
    );

    return res.status(201).json({ organization });
  } catch (error: any) {
    logger.error('Create organization error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Organization slug already exists' });
    }
    return res.status(500).json({ error: 'Failed to create organization' });
  }
}

export async function updateOrganization(req: Request, res: Response) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.organizationId) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    const organization = await organizationService.updateOrganization(
      req.organizationId,
      req.body
    );

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    return res.json({ organization });
  } catch (error) {
    logger.error('Update organization error:', error);
    return res.status(500).json({ error: 'Failed to update organization' });
  }
}

export async function getMembers(req: Request, res: Response) {
  try {
    if (!req.organizationId) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    const members = await organizationService.getOrganizationMembers(req.organizationId);
    return res.json({ members });
  } catch (error) {
    logger.error('Get members error:', error);
    return res.status(500).json({ error: 'Failed to fetch members' });
  }
}

export async function addMember(req: Request, res: Response) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.organizationId) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    await organizationService.addMember(
      req.organizationId,
      req.body.userId,
      req.body.roles
    );

    return res.json({ message: 'Member added successfully' });
  } catch (error) {
    logger.error('Add member error:', error);
    return res.status(500).json({ error: 'Failed to add member' });
  }
}

export async function removeMember(req: Request, res: Response) {
  try {
    if (!req.organizationId) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    await organizationService.removeMember(req.organizationId, req.params.userId);
    return res.json({ message: 'Member removed successfully' });
  } catch (error) {
    logger.error('Remove member error:', error);
    return res.status(500).json({ error: 'Failed to remove member' });
  }
}

