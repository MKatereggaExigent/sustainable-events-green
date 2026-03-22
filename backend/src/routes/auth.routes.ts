import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { loadUserPermissions } from '../middleware/rbac';
import { authRateLimiter, passwordResetRateLimiter } from '../middleware/rate-limiter';

const router = Router();

// Public routes with enhanced rate limiting
router.post('/register', authRateLimiter, authController.registerValidation, authController.register);
router.post('/login', authRateLimiter, authController.loginValidation, authController.login);
router.post('/refresh', authController.refresh);

// Email verification
router.post('/verify-email', authController.verifyEmailValidation, authController.verifyEmail);
router.post('/resend-verification', authRateLimiter, authController.resendVerificationValidation, authController.resendVerification);

// Password reset with strict rate limiting
router.post('/forgot-password', passwordResetRateLimiter, authController.forgotPasswordValidation, authController.forgotPassword);
router.post('/reset-password', passwordResetRateLimiter, authController.resetPasswordValidation, authController.resetPassword);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, loadUserPermissions, authController.me);

// Two-Factor Authentication (protected)
router.post('/2fa/setup', authenticate, authController.setup2FA);
router.post('/2fa/enable', authenticate, authController.enable2FAValidation, authController.enable2FA);
router.post('/2fa/disable', authenticate, authController.disable2FAValidation, authController.disable2FA);
router.get('/2fa/status', authenticate, authController.get2FAStatus);
router.post('/2fa/verify', authenticate, authController.verify2FAValidation, authController.verify2FA);

export default router;

