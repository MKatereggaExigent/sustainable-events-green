import { Request, Response } from 'express';
import { validationResult, body } from 'express-validator';
import * as authService from '../services/auth.service';
import { logger } from '../utils/logger';

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

    return res.json({
      user: {
        id: req.user.userId,
        email: req.user.email,
        organizationId: req.user.organizationId,
        permissions: req.user.permissions,
      },
    });
  } catch (error) {
    logger.error('Me endpoint error:', error);
    return res.status(500).json({ error: 'Failed to get user info' });
  }
}

