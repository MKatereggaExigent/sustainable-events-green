import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticate, requireOrganization } from '../middleware/auth';
import { loadUserPermissions, requirePermission } from '../middleware/rbac';

const router = Router();

// Public routes
// GET /api/payments/plans - Get all subscription plans (public)
router.get('/plans', paymentController.getSubscriptionPlans);

// Webhook endpoint (no authentication - verified by signature)
// POST /api/payments/webhook - Paystack webhook handler
router.post('/webhook', paymentController.paystackWebhook);

// Callback endpoint (no authentication - comes from Paystack redirect)
// GET /api/payments/callback - Payment callback after Paystack redirect
router.get('/callback', paymentController.paymentCallback);

// Protected routes - require authentication and organization context
router.use(authenticate);
router.use(loadUserPermissions);
router.use(requireOrganization);

// POST /api/payments/initialize - Initialize a payment
router.post(
  '/initialize',
  requirePermission('payment:create'),
  paymentController.initializePaymentValidation,
  paymentController.initializePayment
);

// GET /api/payments/verify/:reference - Verify a payment
router.get(
  '/verify/:reference',
  requirePermission('payment:read'),
  paymentController.verifyPayment
);

// GET /api/payments/subscription - Get current subscription
router.get(
  '/subscription',
  requirePermission('payment:read'),
  paymentController.getSubscription
);

// GET /api/payments/transactions - Get payment history
router.get(
  '/transactions',
  requirePermission('payment:read'),
  paymentController.getTransactions
);

// POST /api/payments/subscription/cancel - Cancel subscription
router.post(
  '/subscription/cancel',
  requirePermission('payment:manage'),
  paymentController.cancelSubscription
);

export default router;

