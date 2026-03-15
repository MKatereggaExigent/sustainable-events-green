-- Payment and Subscription Tables for Paystack Integration
-- Tracks subscriptions, payment transactions, and payment history

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    plan_code VARCHAR(50) NOT NULL, -- 'free', 'premium', 'enterprise'
    plan_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'NGN',
    interval VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'yearly'
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'suspended'
    paystack_subscription_code VARCHAR(255),
    paystack_customer_code VARCHAR(255),
    paystack_email_token VARCHAR(255),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    next_payment_date TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_organization ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_paystack_code ON subscriptions(paystack_subscription_code);

-- ============================================
-- PAYMENT TRANSACTIONS
-- ============================================
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    reference VARCHAR(255) UNIQUE NOT NULL,
    paystack_reference VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'success', 'failed', 'abandoned'
    payment_method VARCHAR(50),
    channel VARCHAR(50), -- 'card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'
    ip_address VARCHAR(45),
    paid_at TIMESTAMP WITH TIME ZONE,
    paystack_response JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_organization ON payment_transactions(organization_id);
CREATE INDEX idx_transactions_subscription ON payment_transactions(subscription_id);
CREATE INDEX idx_transactions_reference ON payment_transactions(reference);
CREATE INDEX idx_transactions_status ON payment_transactions(status);
CREATE INDEX idx_transactions_created_at ON payment_transactions(created_at DESC);

-- ============================================
-- SUBSCRIPTION PLANS (Reference Data)
-- ============================================
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    interval VARCHAR(20) DEFAULT 'monthly',
    features JSONB DEFAULT '[]',
    max_events INTEGER,
    max_users INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default subscription plans
INSERT INTO subscription_plans (code, name, description, amount, currency, interval, features, max_events, max_users) VALUES
('free', 'Free', 'Basic features for small events', 0.00, 'NGN', 'monthly', 
 '["Carbon Calculator", "Basic Impact Dashboard", "Up to 5 saved events", "Community support"]'::jsonb, 
 5, 1),
('premium_monthly', 'Premium Monthly', 'Advanced features for professional event planners', 29000.00, 'NGN', 'monthly',
 '["Unlimited events", "Advanced analytics", "Custom branding", "Priority support", "API access", "Team collaboration"]'::jsonb,
 -1, 10),
('premium_yearly', 'Premium Yearly', 'Advanced features with annual discount', 290000.00, 'NGN', 'yearly',
 '["Unlimited events", "Advanced analytics", "Custom branding", "Priority support", "API access", "Team collaboration", "17% discount"]'::jsonb,
 -1, 10),
('enterprise', 'Enterprise', 'Custom solutions for large organizations', 0.00, 'NGN', 'monthly',
 '["Everything in Premium", "Dedicated account manager", "Custom training", "On-site support", "SLA guarantee", "Custom integrations"]'::jsonb,
 -1, -1);

-- ============================================
-- WEBHOOK EVENTS LOG
-- ============================================
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    paystack_event_id VARCHAR(255),
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- ============================================
-- UPDATE TRIGGER FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

