import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { loadUserPermissions } from '../middleware/rbac';

const router = Router();

// Public routes
router.post('/register', authController.registerValidation, authController.register);
router.post('/login', authController.loginValidation, authController.login);
router.post('/refresh', authController.refresh);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, loadUserPermissions, authController.me);

export default router;

