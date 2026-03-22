import { Request, Response } from 'express';
import { validationResult, body } from 'express-validator';
import crypto from 'crypto';
import { pool, query } from '../config/database';
import * as paymentService from '../services/payment.service';
import { config } from '../config';
import { logger } from '../utils/logger';

// Validation rules
export const initializePaymentValidation = [
  body('planCode').trim().notEmpty().withMessage('Plan code is required'),
  body('email').isEmail().withMessage('Valid email is required'),
];

/**
 * Initialize a payment transaction
 * POST /api/payments/initialize
 */
export async function initializePayment(req: Request, res: Response) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { planCode, email, metadata } = req.body;

    // Get or create user's organization
    let organizationId: string = req.organizationId || '';

    if (!organizationId) {
      // Get user's first organization or create a default one
      const userOrgs = await query<{ organization_id: string }>(
        'SELECT organization_id FROM user_organizations WHERE user_id = $1 LIMIT 1',
        [req.user.userId]
      );

      if (userOrgs.length > 0) {
        organizationId = userOrgs[0].organization_id;
      } else {
        // Create a default organization for the user
        const newOrg = await query<{ id: string }>(
          `INSERT INTO organizations (name, slug, subscription_tier)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [`${email.split('@')[0]}'s Organization`, `org-${Date.now()}`, 'explorer']
        );
        organizationId = newOrg[0].id;

        // Link user to organization
        await query(
          'INSERT INTO user_organizations (user_id, organization_id) VALUES ($1, $2)',
          [req.user.userId, organizationId]
        );
      }
    }

    // Get plan details to determine amount
    const planResult = await pool.query(
      'SELECT * FROM subscription_plans WHERE code = $1 AND is_active = true',
      [planCode]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    const plan = planResult.rows[0];
    const amountInKobo = Math.round(parseFloat(plan.amount) * 100); // Convert to kobo

    const result = await paymentService.initializePayment(pool, {
      organizationId,
      email,
      amount: amountInKobo,
      planCode,
      currency: plan.currency,
      metadata,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Initialize payment controller error:', error);
    return res.status(500).json({ error: error.message || 'Failed to initialize payment' });
  }
}

/**
 * Verify a payment transaction
 * GET /api/payments/verify/:reference
 */
export async function verifyPayment(req: Request, res: Response) {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ error: 'Payment reference is required' });
    }

    const result = await paymentService.verifyPayment(pool, { reference });

    return res.json({
      success: result.success,
      data: result.transaction,
    });
  } catch (error: any) {
    logger.error('Verify payment controller error:', error);
    return res.status(500).json({ error: error.message || 'Failed to verify payment' });
  }
}

/**
 * Payment callback handler (redirect from Paystack)
 * GET /api/payments/callback
 */
export async function paymentCallback(req: Request, res: Response) {
  try {
    const { reference, trxref } = req.query;
    const paymentReference = (reference || trxref) as string;

    if (!paymentReference) {
      return res.redirect(`${config.frontendUrl}/payment/failed?error=no_reference`);
    }

    // Verify the payment
    const result = await paymentService.verifyPayment(pool, { reference: paymentReference });

    if (result.success) {
      return res.redirect(`${config.frontendUrl}/payment/success?reference=${paymentReference}`);
    } else {
      return res.redirect(`${config.frontendUrl}/payment/failed?reference=${paymentReference}`);
    }
  } catch (error: any) {
    logger.error('Payment callback error:', error);
    return res.redirect(`${config.frontendUrl}/payment/failed?error=verification_failed`);
  }
}

/**
 * Webhook handler for Paystack events
 * POST /api/payments/webhook
 */
export async function paystackWebhook(req: Request, res: Response) {
  try {
    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', config.paystack.secretKey)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      logger.warn('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    
    // Process webhook asynchronously
    paymentService.handleWebhook(pool, event).catch(error => {
      logger.error('Webhook processing error:', error);
    });

    // Respond immediately to Paystack
    return res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error('Webhook controller error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

/**
 * Get all subscription plans
 * GET /api/payments/plans
 */
export async function getSubscriptionPlans(req: Request, res: Response) {
  try {
    const plans = await paymentService.getSubscriptionPlans(pool);
    return res.json({ success: true, data: plans });
  } catch (error: any) {
    logger.error('Get subscription plans error:', error);
    return res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
}

/**
 * Get organization's current subscription
 * GET /api/payments/subscription
 */
export async function getSubscription(req: Request, res: Response) {
  try {
    if (!req.organizationId) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    const subscription = await paymentService.getOrganizationSubscription(pool, req.organizationId);

    return res.json({
      success: true,
      data: subscription
    });
  } catch (error: any) {
    logger.error('Get subscription error:', error);
    return res.status(500).json({ error: 'Failed to fetch subscription' });
  }
}

/**
 * Get payment transaction history
 * GET /api/payments/transactions
 */
export async function getTransactions(req: Request, res: Response) {
  try {
    if (!req.organizationId) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const transactions = await paymentService.getOrganizationTransactions(
      pool,
      req.organizationId,
      limit
    );

    return res.json({
      success: true,
      data: transactions
    });
  } catch (error: any) {
    logger.error('Get transactions error:', error);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}

/**
 * Cancel subscription
 * POST /api/payments/subscription/cancel
 */
export async function cancelSubscription(req: Request, res: Response) {
  try {
    if (!req.organizationId) {
      return res.status(400).json({ error: 'Organization context required' });
    }

    await paymentService.cancelSubscription(pool, req.organizationId);

    return res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error: any) {
    logger.error('Cancel subscription error:', error);
    return res.status(500).json({ error: 'Failed to cancel subscription' });
  }
}

/**
 * Downgrade subscription
 * POST /api/payments/subscription/downgrade
 */
export async function downgradeSubscription(req: Request, res: Response) {
  try {
    if (!req.organizationId || !req.user?.id) {
      return res.status(400).json({ error: 'Organization and user context required' });
    }

    const { planCode, reason } = req.body;

    if (!planCode) {
      return res.status(400).json({ error: 'Plan code is required' });
    }

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a reason for downgrading (minimum 10 characters)' });
    }

    const result = await paymentService.downgradeSubscription(
      pool,
      req.organizationId,
      req.user.id,
      planCode,
      reason
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({
      success: true,
      message: 'Subscription downgraded successfully'
    });
  } catch (error: any) {
    logger.error('Downgrade subscription error:', error);
    return res.status(500).json({ error: 'Failed to downgrade subscription' });
  }
}

