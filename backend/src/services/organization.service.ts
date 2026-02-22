import { query, transaction } from '../config/database';
import { invalidateCachePattern, getCache, setCache } from '../config/redis';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface OrganizationInput {
  name: string;
  slug?: string;
  logoUrl?: string;
  settings?: Record<string, any>;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  settings: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
}

export async function getOrganization(organizationId: string): Promise<Organization | null> {
  const orgs = await query<Organization>(
    `SELECT id, name, slug, logo_url as "logoUrl", settings, is_active as "isActive", 
     created_at as "createdAt"
     FROM organizations WHERE id = $1`,
    [organizationId]
  );
  return orgs[0] || null;
}

export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  const cacheKey = `user_orgs:${userId}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const orgs = await query<Organization & { isOwner: boolean }>(
    `SELECT o.id, o.name, o.slug, o.logo_url as "logoUrl", o.settings,
     o.is_active as "isActive", o.created_at as "createdAt", uo.is_owner as "isOwner"
     FROM organizations o
     JOIN user_organizations uo ON o.id = uo.organization_id
     WHERE uo.user_id = $1 AND o.is_active = true
     ORDER BY uo.is_owner DESC, uo.joined_at ASC`,
    [userId]
  );

  await setCache(cacheKey, orgs, 300);
  return orgs;
}

export async function createOrganization(userId: string, input: OrganizationInput) {
  return transaction(async (client) => {
    const slug = input.slug || `${input.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${uuidv4().slice(0, 8)}`;

    const orgResult = await client.query(
      `INSERT INTO organizations (name, slug, logo_url, settings)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, slug, logo_url as "logoUrl", settings`,
      [input.name, slug, input.logoUrl, input.settings || {}]
    );
    const organization = orgResult.rows[0];

    // Add user as owner
    await client.query(
      `INSERT INTO user_organizations (user_id, organization_id, is_owner)
       VALUES ($1, $2, true)`,
      [userId, organization.id]
    );

    // Assign org_owner role
    const roleResult = await client.query(
      `SELECT id FROM roles WHERE name = 'org_owner' AND is_system_role = true`
    );
    if (roleResult.rows.length > 0) {
      await client.query(
        `INSERT INTO user_roles (user_id, role_id, organization_id)
         VALUES ($1, $2, $3)`,
        [userId, roleResult.rows[0].id, organization.id]
      );
    }

    await invalidateCachePattern(`user_orgs:${userId}`);
    return organization;
  });
}

export async function updateOrganization(organizationId: string, input: Partial<OrganizationInput>) {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (input.name) {
    fields.push(`name = $${paramIndex++}`);
    values.push(input.name);
  }
  if (input.logoUrl !== undefined) {
    fields.push(`logo_url = $${paramIndex++}`);
    values.push(input.logoUrl);
  }
  if (input.settings) {
    fields.push(`settings = $${paramIndex++}`);
    values.push(input.settings);
  }

  if (fields.length === 0) return null;

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(organizationId);

  const result = await query(
    `UPDATE organizations SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result[0] || null;
}

export async function getOrganizationMembers(organizationId: string) {
  return query(
    `SELECT u.id, u.email, u.first_name as "firstName", u.last_name as "lastName",
     u.avatar_url as "avatarUrl", uo.is_owner as "isOwner", uo.joined_at as "joinedAt",
     array_agg(r.name) as roles
     FROM users u
     JOIN user_organizations uo ON u.id = uo.user_id
     LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.organization_id = $1
     LEFT JOIN roles r ON ur.role_id = r.id
     WHERE uo.organization_id = $1
     GROUP BY u.id, uo.is_owner, uo.joined_at
     ORDER BY uo.is_owner DESC, uo.joined_at ASC`,
    [organizationId]
  );
}

export async function addMember(organizationId: string, userId: string, roleNames: string[] = ['org_member']) {
  return transaction(async (client) => {
    // Add to organization
    await client.query(
      `INSERT INTO user_organizations (user_id, organization_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, organizationId]
    );

    // Assign roles
    for (const roleName of roleNames) {
      const roleResult = await client.query(
        'SELECT id FROM roles WHERE name = $1 AND (is_system_role = true OR organization_id = $2)',
        [roleName, organizationId]
      );
      if (roleResult.rows.length > 0) {
        await client.query(
          `INSERT INTO user_roles (user_id, role_id, organization_id)
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [userId, roleResult.rows[0].id, organizationId]
        );
      }
    }

    await invalidateCachePattern(`user_orgs:${userId}`);
    await invalidateCachePattern(`permissions:${userId}:${organizationId}`);
  });
}

export async function removeMember(organizationId: string, userId: string) {
  await query(
    'DELETE FROM user_organizations WHERE user_id = $1 AND organization_id = $2',
    [userId, organizationId]
  );
  await query(
    'DELETE FROM user_roles WHERE user_id = $1 AND organization_id = $2',
    [userId, organizationId]
  );
  await invalidateCachePattern(`user_orgs:${userId}`);
  await invalidateCachePattern(`permissions:${userId}:${organizationId}`);
}

