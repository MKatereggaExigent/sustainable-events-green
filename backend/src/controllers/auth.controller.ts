import { Request, Response } from 'express';
import { validationResult, body } from 'express-validator';
import * as authService from '../services/auth.service';
import * as twoFAService from '../services/2fa.service';
import { logger } from '../utils/logger';
import { query } from '../config/database';

export const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain number'),
  body('firstName').optional().trim().isLength({ min: 1, max: 100 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 100 }),
  body('organizationName').optional().trim().isLength({ min: 1, max: 255 }),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

export async function register(req: Request, res: Response) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await authService.register(req.body);
    
    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      user: result.user,
      organization: result.organization,
      accessToken: result.tokens.accessToken,
      expiresIn: result.tokens.expiresIn,
    });
  } catch (error: any) {
    logger.error('Registration error:', error);
    if (error.message === 'Email already registered') {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await authService.login(req.body);
    
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      user: result.user,
      organization: result.organization,
      accessToken: result.tokens.accessToken,
      expiresIn: result.tokens.expiresIn,
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    if (error.message === 'Invalid email or password' || error.message === 'Account is deactivated') {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Login failed' });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    const tokens = await authService.refreshTokens(refreshToken);
    
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
    });
  } catch (error: any) {
    logger.error('Token refresh error:', error);
    return res.status(401).json({ error: error.message || 'Token refresh failed' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const refreshToken = req.cookies.refreshToken;

    if (userId) {
      await authService.logout(userId, refreshToken);
    }

    res.clearCookie('refreshToken');
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    return res.status(500).json({ error: 'Logout failed' });
  }
}

export async function me(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get organization details with subscription info
    let organization = null;
    if (req.user.organizationId) {
      const orgResult = await query<any>(
        `SELECT id, name, slug, subscription_tier, subscription_expires_at
         FROM organizations
         WHERE id = $1`,
        [req.user.organizationId]
      );

      if (orgResult.length > 0) {
        const org = orgResult[0];
        organization = {
          id: org.id,
          name: org.name,
          slug: org.slug,
          subscriptionTier: org.subscription_tier || 'explorer',
          subscriptionExpiresAt: org.subscription_expires_at,
        };
      }
    }

    return res.json({
      user: {
        id: req.user.userId,
        email: req.user.email,
        organizationId: req.user.organizationId,
        permissions: req.user.permissions,
      },
      organization,
    });
  } catch (error) {
    logger.error('Me endpoint error:', error);
    return res.status(500).json({ error: 'Failed to get user info' });
  }
}

// ============================================
// EMAIL VERIFICATION
// ============================================

export const verifyEmailValidation = [
  body('token').notEmpty().withMessage('Token required'),
];

export async function verifyEmail(req: Request, res: Response) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await authService.verifyEmail(req.body.token);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    return res.json({ message: result.message });
  } catch (error) {
    logger.error('Email verification error:', error);
    return res.status(500).json({ error: 'Email verification failed' });
  }
}

export const resendVerificationValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
];

export async function resendVerification(req: Request, res: Response) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await authService.resendVerificationEmail(req.body.email);
    return res.json({ message: 'Verification email sent' });
  } catch (error: any) {
    logger.error('Resend verification error:', error);
    return res.status(400).json({ error: error.message || 'Failed to resend verification email' });
  }
}

// ============================================
// PASSWORD RESET
// ============================================

export const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
];

export async function forgotPassword(req: Request, res: Response) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await authService.requestPasswordReset(req.body.email, ipAddress, userAgent);

    // Always return success to prevent email enumeration
    return res.json({ message: 'If an account exists with this email, a password reset link has been sent' });
  } catch (error) {
    logger.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Failed to process password reset request' });
  }
}

export const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Token required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain number'),
];

export async function resetPassword(req: Request, res: Response) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await authService.resetPassword(req.body.token, req.body.password);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    return res.json({ message: result.message });
  } catch (error) {
    logger.error('Reset password error:', error);
    return res.status(500).json({ error: 'Password reset failed' });
  }
}

// ============================================
// TWO-FACTOR AUTHENTICATION
// ============================================

export async function setup2FA(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user email
    const users = await query<any>(
      'SELECT email FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await twoFAService.setup2FA(req.user.userId, users[0].email);

    return res.json({
      secret: result.secret,
      qrCode: result.qrCode,
      backupCodes: result.backupCodes,
    });
  } catch (error: any) {
    logger.error('2FA setup error:', error);
    return res.status(400).json({ error: error.message || 'Failed to setup 2FA' });
  }
}

export const enable2FAValidation = [
  body('token').notEmpty().withMessage('Verification code required'),
];

export async function enable2FA(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await twoFAService.enable2FA(req.user.userId, req.body.token);

    return res.json({ message: '2FA enabled successfully' });
  } catch (error: any) {
    logger.error('2FA enable error:', error);
    return res.status(400).json({ error: error.message || 'Failed to enable 2FA' });
  }
}

export const disable2FAValidation = [
  body('password').notEmpty().withMessage('Password required'),
];

export async function disable2FA(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await twoFAService.disable2FA(req.user.userId, req.body.password);

    return res.json({ message: '2FA disabled successfully' });
  } catch (error: any) {
    logger.error('2FA disable error:', error);
    return res.status(400).json({ error: error.message || 'Failed to disable 2FA' });
  }
}

export async function get2FAStatus(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const status = await twoFAService.get2FAStatus(req.user.userId);

    return res.json(status);
  } catch (error) {
    logger.error('2FA status error:', error);
    return res.status(500).json({ error: 'Failed to get 2FA status' });
  }
}

export const verify2FAValidation = [
  body('token').notEmpty().withMessage('Verification code required'),
];

export async function verify2FA(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const isValid = await twoFAService.verify2FA(req.user.userId, req.body.token);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    return res.json({ message: 'Verification successful' });
  } catch (error) {
    logger.error('2FA verification error:', error);
    return res.status(500).json({ error: 'Verification failed' });
  }
}

