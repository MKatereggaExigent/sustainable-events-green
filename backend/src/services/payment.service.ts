import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { logger } from '../utils/logger';

const paystack = require('paystack')(config.paystack.secretKey);

export interface InitializePaymentParams {
  organizationId: string;
  email: string;
  amount: number; // in kobo (smallest currency unit)
  planCode: string;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface VerifyPaymentParams {
  reference: string;
}

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  interval: string;
  features: string[];
  maxEvents: number;
  maxUsers: number;
}

/**
 * Initialize a payment transaction with Paystack
 */
export async function initializePayment(
  pool: Pool,
  params: InitializePaymentParams
): Promise<{ authorizationUrl: string; accessCode: string; reference: string }> {
  const reference = `ECO-${Date.now()}-${uuidv4().substring(0, 8)}`;
  
  try {
    // Get plan details
    const planResult = await pool.query(
      'SELECT * FROM subscription_plans WHERE code = $1 AND is_active = true',
      [params.planCode]
    );

    if (planResult.rows.length === 0) {
      throw new Error('Invalid subscription plan');
    }

    const plan = planResult.rows[0];

    // Create transaction record
    await pool.query(
      `INSERT INTO payment_transactions 
       (organization_id, reference, amount, currency, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        params.organizationId,
        reference,
        params.amount / 100, // Convert from kobo to naira for storage
        params.currency || 'NGN',
        'pending',
        JSON.stringify({ ...params.metadata, planCode: params.planCode }),
      ]
    );

    // Initialize payment with Paystack
    const paystackResponse = await paystack.transaction.initialize({
      email: params.email,
      amount: params.amount,
      reference,
      currency: params.currency || 'NGN',
      callback_url: config.paystack.callbackUrl,
      metadata: {
        organizationId: params.organizationId,
        planCode: params.planCode,
        ...params.metadata,
      },
    });

    if (!paystackResponse.status) {
      throw new Error(paystackResponse.message || 'Failed to initialize payment');
    }

    logger.info('Payment initialized', { reference, organizationId: params.organizationId });

    return {
      authorizationUrl: paystackResponse.data.authorization_url,
      accessCode: paystackResponse.data.access_code,
      reference: paystackResponse.data.reference,
    };
  } catch (error: any) {
    logger.error('Initialize payment error:', error);
    throw error;
  }
}

/**
 * Verify a payment transaction with Paystack
 */
export async function verifyPayment(
  pool: Pool,
  params: VerifyPaymentParams
): Promise<{ success: boolean; transaction: any }> {
  try {
    // Verify with Paystack
    const paystackResponse = await paystack.transaction.verify(params.reference);

    if (!paystackResponse.status) {
      throw new Error('Payment verification failed');
    }

    const data = paystackResponse.data;
    const status = data.status === 'success' ? 'success' : 'failed';

    // Update transaction in database
    const result = await pool.query(
      `UPDATE payment_transactions 
       SET status = $1, 
           paystack_reference = $2,
           payment_method = $3,
           channel = $4,
           paid_at = $5,
           paystack_response = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE reference = $7
       RETURNING *`,
      [
        status,
        data.reference,
        data.authorization?.authorization_code || null,
        data.channel,
        data.paid_at ? new Date(data.paid_at) : null,
        JSON.stringify(data),
        params.reference,
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('Transaction not found');
    }

    const transaction = result.rows[0];

    // If payment successful, update subscription
    if (status === 'success') {
      await updateSubscriptionAfterPayment(pool, transaction, data);
    }

    logger.info('Payment verified', { reference: params.reference, status });

    return {
      success: status === 'success',
      transaction: result.rows[0],
    };
  } catch (error: any) {
    logger.error('Verify payment error:', error);
    throw error;
  }
}

/**
 * Update subscription after successful payment
 */
async function updateSubscriptionAfterPayment(
  pool: Pool,
  transaction: any,
  paystackData: any
): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const metadata = transaction.metadata || {};
    const planCode = metadata.planCode;

    if (!planCode) {
      throw new Error('Plan code not found in transaction metadata');
    }

    // Get plan details
    const planResult = await client.query(
      'SELECT * FROM subscription_plans WHERE code = $1',
      [planCode]
    );

    if (planResult.rows.length === 0) {
      throw new Error('Subscription plan not found');
    }

    const plan = planResult.rows[0];

    // Calculate next payment date
    const nextPaymentDate = new Date();
    if (plan.interval === 'yearly') {
      nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
    } else {
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    }

    // Check if subscription exists
    const existingSubResult = await client.query(
      'SELECT * FROM subscriptions WHERE organization_id = $1 AND status = $2',
      [transaction.organization_id, 'active']
    );

    let subscriptionId: string;

    if (existingSubResult.rows.length > 0) {
      // Update existing subscription
      const updateResult = await client.query(
        `UPDATE subscriptions
         SET plan_code = $1,
             plan_name = $2,
             amount = $3,
             currency = $4,
             interval = $5,
             next_payment_date = $6,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $7
         RETURNING id`,
        [plan.code, plan.name, plan.amount, plan.currency, plan.interval, nextPaymentDate, existingSubResult.rows[0].id]
      );
      subscriptionId = updateResult.rows[0].id;
    } else {
      // Create new subscription
      const insertResult = await client.query(
        `INSERT INTO subscriptions
         (organization_id, plan_code, plan_name, amount, currency, interval, status, next_payment_date, paystack_customer_code)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          transaction.organization_id,
          plan.code,
          plan.name,
          plan.amount,
          plan.currency,
          plan.interval,
          'active',
          nextPaymentDate,
          paystackData.customer?.customer_code || null,
        ]
      );
      subscriptionId = insertResult.rows[0].id;
    }

    // Link transaction to subscription
    await client.query(
      'UPDATE payment_transactions SET subscription_id = $1 WHERE id = $2',
      [subscriptionId, transaction.id]
    );

    // Update organization subscription tier and expiry
    // Map plan codes to subscription tiers
    const tierMap: Record<string, string> = {
      explorer: 'explorer',
      planner: 'planner',
      planner_monthly: 'planner',
      planner_yearly: 'planner',
      impact_leader: 'impact',
      impact_monthly: 'impact',
      impact_yearly: 'impact',
      enterprise: 'enterprise',
    };

    await client.query(
      `UPDATE organizations
       SET subscription_tier = $1,
           subscription_expires_at = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [tierMap[plan.code] || 'explorer', nextPaymentDate, transaction.organization_id]
    );

    await client.query('COMMIT');
    logger.info('Subscription updated after payment', { subscriptionId, organizationId: transaction.organization_id });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Update subscription error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Handle Paystack webhook events
 */
export async function handleWebhook(
  pool: Pool,
  event: any
): Promise<void> {
  try {
    // Log webhook event
    await pool.query(
      `INSERT INTO webhook_events (event_type, paystack_event_id, payload)
       VALUES ($1, $2, $3)`,
      [event.event, event.data?.id || null, JSON.stringify(event)]
    );

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(pool, event.data);
        break;
      case 'subscription.create':
      case 'subscription.disable':
      case 'subscription.enable':
        await handleSubscriptionEvent(pool, event);
        break;
      default:
        logger.info('Unhandled webhook event', { event: event.event });
    }

    // Mark webhook as processed
    await pool.query(
      `UPDATE webhook_events
       SET processed = true, processed_at = CURRENT_TIMESTAMP
       WHERE paystack_event_id = $1`,
      [event.data?.id]
    );
  } catch (error: any) {
    logger.error('Webhook handling error:', error);

    // Log error in webhook_events
    await pool.query(
      `UPDATE webhook_events
       SET error_message = $1
       WHERE paystack_event_id = $2`,
      [error.message, event.data?.id]
    );

    throw error;
  }
}

async function handleChargeSuccess(pool: Pool, data: any): Promise<void> {
  // Verify and update transaction
  if (data.reference) {
    await verifyPayment(pool, { reference: data.reference });
  }
}

async function handleSubscriptionEvent(pool: Pool, event: any): Promise<void> {
  logger.info('Subscription event received', { event: event.event, data: event.data });
  // Handle subscription lifecycle events
  // This can be extended based on your subscription management needs
}

/**
 * Get all subscription plans
 */
export async function getSubscriptionPlans(pool: Pool): Promise<SubscriptionPlan[]> {
  const result = await pool.query(
    'SELECT * FROM subscription_plans WHERE is_active = true ORDER BY amount ASC'
  );

  return result.rows.map(row => ({
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    amount: parseFloat(row.amount),
    currency: row.currency,
    interval: row.interval,
    features: row.features,
    maxEvents: row.max_events,
    maxUsers: row.max_users,
  }));
}

/**
 * Get organization's active subscription
 */
export async function getOrganizationSubscription(
  pool: Pool,
  organizationId: string
): Promise<any> {
  const result = await pool.query(
    `SELECT s.*, sp.features, sp.max_events, sp.max_users
     FROM subscriptions s
     LEFT JOIN subscription_plans sp ON s.plan_code = sp.code
     WHERE s.organization_id = $1 AND s.status = 'active'
     ORDER BY s.created_at DESC
     LIMIT 1`,
    [organizationId]
  );

  return result.rows[0] || null;
}

/**
 * Get payment transactions for an organization
 */
export async function getOrganizationTransactions(
  pool: Pool,
  organizationId: string,
  limit: number = 50
): Promise<any[]> {
  const result = await pool.query(
    `SELECT * FROM payment_transactions
     WHERE organization_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [organizationId, limit]
  );

  return result.rows;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  pool: Pool,
  organizationId: string
): Promise<void> {
  await pool.query(
    `UPDATE subscriptions
     SET status = 'cancelled',
         cancelled_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE organization_id = $1 AND status = 'active'`,
    [organizationId]
  );

  // Revert organization to free tier
  await pool.query(
    `UPDATE organizations
     SET subscription_tier = 'explorer',
         subscription_expires_at = NULL,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [organizationId]
  );

  logger.info('Subscription cancelled', { organizationId });
}

/**
 * Downgrade subscription to a lower tier
 */
export async function downgradeSubscription(
  pool: Pool,
  organizationId: string,
  userId: string,
  newPlanCode: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get current organization tier
    const orgResult = await client.query(
      'SELECT subscription_tier FROM organizations WHERE id = $1',
      [organizationId]
    );

    if (orgResult.rows.length === 0) {
      throw new Error('Organization not found');
    }

    const currentTier = orgResult.rows[0].subscription_tier;

    // Get new plan details
    const planResult = await client.query(
      'SELECT * FROM subscription_plans WHERE code = $1 AND is_active = true',
      [newPlanCode]
    );

    if (planResult.rows.length === 0) {
      throw new Error('Invalid subscription plan');
    }

    const newPlan = planResult.rows[0];

    // Map plan codes to tier hierarchy
    const tierHierarchy: Record<string, number> = {
      explorer: 0,
      planner: 1,
      impact: 2,
      enterprise: 3,
    };

    const tierMap: Record<string, string> = {
      explorer: 'explorer',
      planner: 'planner',
      impact_leader: 'impact',
      enterprise: 'enterprise',
    };

    const newTier = tierMap[newPlan.code] || 'explorer';

    // Verify it's actually a downgrade
    if (tierHierarchy[newTier] >= tierHierarchy[currentTier]) {
      return { success: false, error: 'This is not a downgrade. Please use the upgrade flow.' };
    }

    // Check downgrade limit (max 3 downgrades in 12 months)
    const downgradeCountResult = await client.query(
      'SELECT get_recent_downgrade_count($1) as count',
      [organizationId]
    );

    const recentDowngrades = downgradeCountResult.rows[0].count;

    if (recentDowngrades >= 3) {
      return {
        success: false,
        error: 'You have reached the maximum number of downgrades (3) in the last 12 months. Please contact support.',
      };
    }

    // Record the downgrade
    await client.query(
      `INSERT INTO subscription_changes (organization_id, user_id, from_tier, to_tier, change_type, reason)
       VALUES ($1, $2, $3, $4, 'downgrade', $5)`,
      [organizationId, userId, currentTier, newTier, reason]
    );

    // Update organization tier
    await client.query(
      `UPDATE organizations
       SET subscription_tier = $1,
           downgrade_count = downgrade_count + 1,
           last_downgrade_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [newTier, organizationId]
    );

    // Cancel current subscription
    await client.query(
      `UPDATE subscriptions
       SET status = 'cancelled',
           cancelled_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE organization_id = $1 AND status = 'active'`,
      [organizationId]
    );

    // If downgrading to a paid tier, create new subscription
    if (newPlan.amount > 0) {
      const nextPaymentDate = new Date();
      if (newPlan.interval === 'yearly') {
        nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
      } else {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }

      await client.query(
        `INSERT INTO subscriptions
         (organization_id, plan_code, plan_name, amount, currency, interval, status, next_payment_date)
         VALUES ($1, $2, $3, $4, $5, $6, 'active', $7)`,
        [organizationId, newPlan.code, newPlan.name, newPlan.amount, newPlan.currency, newPlan.interval, nextPaymentDate]
      );
    }

    await client.query('COMMIT');
    logger.info('Subscription downgraded', { organizationId, from: currentTier, to: newTier, reason });

    return { success: true };
  } catch (error: any) {
    await client.query('ROLLBACK');
    logger.error('Downgrade subscription error:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

