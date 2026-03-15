import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { loadUserPermissions } from '../middleware/rbac';

const router = Router();

// Specific rate limiter for login/register to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login/register attempts per 15 minutes per IP
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Public routes
router.post('/register', authLimiter, authController.registerValidation, authController.register);
router.post('/login', authLimiter, authController.loginValidation, authController.login);
router.post('/refresh', authController.refresh);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, loadUserPermissions, authController.me);

export default router;

