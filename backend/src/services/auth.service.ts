import bcrypt from 'bcryptjs';
import { query, transaction } from '../config/database';
import { generateTokens, hashToken, verifyRefreshToken, JwtTokens, TokenPayload } from '../utils/jwt';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
  tokens: JwtTokens;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  return transaction(async (client) => {
    // Check if user exists
    const existingUsers = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [input.email.toLowerCase()]
    );

    if (existingUsers.rows.length > 0) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, config.bcryptRounds);

    // Create user
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, first_name, last_name, avatar_url`,
      [input.email.toLowerCase(), passwordHash, input.firstName, input.lastName]
    );
    const user = userResult.rows[0];

    // Create default organization if name provided
    let organization;
    if (input.organizationName) {
      const slug = input.organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const orgResult = await client.query(
        `INSERT INTO organizations (name, slug)
         VALUES ($1, $2)
         RETURNING id, name, slug`,
        [input.organizationName, `${slug}-${uuidv4().slice(0, 8)}`]
      );
      organization = orgResult.rows[0];

      // Add user to organization as owner
      await client.query(
        `INSERT INTO user_organizations (user_id, organization_id, is_owner)
         VALUES ($1, $2, true)`,
        [user.id, organization.id]
      );

      // Assign org_owner role
      const roleResult = await client.query(
        `SELECT id FROM roles WHERE name = 'org_owner' AND is_system_role = true`
      );
      if (roleResult.rows.length > 0) {
        await client.query(
          `INSERT INTO user_roles (user_id, role_id, organization_id)
           VALUES ($1, $2, $3)`,
          [user.id, roleResult.rows[0].id, organization.id]
        );
      }
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      organizationId: organization?.id,
    });

    // Store refresh token
    await storeRefreshToken(client, user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
      },
      tokens,
      organization: organization ? {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      } : undefined,
    };
  });
}

export async function login(input: LoginInput): Promise<AuthResult> {
  // Find user
  const users = await query<any>(
    `SELECT id, email, password_hash, first_name, last_name, avatar_url, is_active
     FROM users WHERE email = $1`,
    [input.email.toLowerCase()]
  );

  if (users.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = users[0];

  if (!user.is_active) {
    throw new Error('Account is deactivated');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(input.password, user.password_hash);
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // Get user's primary organization
  const orgs = await query<any>(
    `SELECT o.id, o.name, o.slug 
     FROM organizations o
     JOIN user_organizations uo ON o.id = uo.organization_id
     WHERE uo.user_id = $1
     ORDER BY uo.is_owner DESC, uo.joined_at ASC
     LIMIT 1`,
    [user.id]
  );
  const organization = orgs[0];

  // Generate tokens
  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    organizationId: organization?.id,
  });

  // Store refresh token and update last login
  await Promise.all([
    storeRefreshToken(null, user.id, tokens.refreshToken),
    query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]),
  ]);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      avatarUrl: user.avatar_url,
    },
    tokens,
    organization: organization ? { id: organization.id, name: organization.name, slug: organization.slug } : undefined,
  };
}

export async function refreshTokens(refreshToken: string): Promise<JwtTokens> {
  const payload = verifyRefreshToken(refreshToken);

  if (!payload) {
    throw new Error('Invalid refresh token');
  }

  // Check if token exists and not revoked
  const tokenHash = hashToken(refreshToken);
  const tokens = await query<any>(
    `SELECT id, revoked_at FROM refresh_tokens
     WHERE token_hash = $1 AND user_id = $2 AND expires_at > CURRENT_TIMESTAMP`,
    [tokenHash, payload.userId]
  );

  if (tokens.length === 0 || tokens[0].revoked_at) {
    throw new Error('Refresh token expired or revoked');
  }

  // Revoke old token
  await query(
    'UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE id = $1',
    [tokens[0].id]
  );

  // Generate new tokens
  const newTokens = generateTokens({
    userId: payload.userId,
    email: payload.email,
    organizationId: payload.organizationId,
  });

  // Store new refresh token
  await storeRefreshToken(null, payload.userId, newTokens.refreshToken);

  return newTokens;
}

export async function logout(userId: string, refreshToken?: string): Promise<void> {
  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await query(
      'UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = $1 AND user_id = $2',
      [tokenHash, userId]
    );
  } else {
    // Revoke all refresh tokens for user
    await query(
      'UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND revoked_at IS NULL',
      [userId]
    );
  }
}

async function storeRefreshToken(client: any, userId: string, token: string): Promise<void> {
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const sql = `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
               VALUES ($1, $2, $3)`;
  const params = [userId, tokenHash, expiresAt];

  if (client) {
    await client.query(sql, params);
  } else {
    await query(sql, params);
  }
}

// OAuth account linking
export async function findOrCreateOAuthUser(
  provider: string,
  providerId: string,
  profile: { email: string; firstName?: string; lastName?: string; avatarUrl?: string }
): Promise<AuthResult> {
  return transaction(async (client) => {
    // Check if OAuth account exists
    const oauthAccounts = await client.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.avatar_url
       FROM oauth_accounts oa
       JOIN users u ON oa.user_id = u.id
       WHERE oa.provider = $1 AND oa.provider_user_id = $2`,
      [provider, providerId]
    );

    let user;
    if (oauthAccounts.rows.length > 0) {
      user = oauthAccounts.rows[0];
    } else {
      // Check if user with email exists
      const existingUsers = await client.query(
        'SELECT id, email, first_name, last_name, avatar_url FROM users WHERE email = $1',
        [profile.email.toLowerCase()]
      );

      if (existingUsers.rows.length > 0) {
        user = existingUsers.rows[0];
      } else {
        // Create new user
        const userResult = await client.query(
          `INSERT INTO users (email, first_name, last_name, avatar_url, is_email_verified)
           VALUES ($1, $2, $3, $4, true)
           RETURNING id, email, first_name, last_name, avatar_url`,
          [profile.email.toLowerCase(), profile.firstName, profile.lastName, profile.avatarUrl]
        );
        user = userResult.rows[0];
      }

      // Create OAuth account link
      await client.query(
        `INSERT INTO oauth_accounts (user_id, provider, provider_user_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (provider, provider_user_id) DO NOTHING`,
        [user.id, provider, providerId]
      );
    }

    // Get organization
    const orgs = await client.query(
      `SELECT o.id, o.name, o.slug FROM organizations o
       JOIN user_organizations uo ON o.id = uo.organization_id
       WHERE uo.user_id = $1 LIMIT 1`,
      [user.id]
    );
    const organization = orgs.rows[0];

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      organizationId: organization?.id,
    });

    await storeRefreshToken(client, user.id, tokens.refreshToken);

    return {
      user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, avatarUrl: user.avatar_url },
      tokens,
      organization: organization ? { id: organization.id, name: organization.name, slug: organization.slug } : undefined,
    };
  });
}

