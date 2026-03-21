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

-- Insert default subscription plans (South African Rand - ZAR)
INSERT INTO subscription_plans (code, name, description, amount, currency, interval, features, max_events, max_users) VALUES
-- Explorer (Free) - Lead generation tier
('explorer', 'Explorer', 'Perfect for students and individuals testing sustainability', 0.00, 'ZAR', 'monthly',
 '["Event Footprint Calculator (1 event/month)", "Basic carbon, water, waste calculations", "Simple sustainability score", "Basic recommendations", "FAQ & Resources access", "View success stories"]'::jsonb,
 1, 1),

-- Planner (Premium) - Professional tier
('planner_monthly', 'Planner Monthly', 'For professional event planners and agencies', 499.00, 'ZAR', 'monthly',
 '["Unlimited event calculations", "Cost & Savings Calculator with ROI", "Save & manage events (My Events)", "Smart AI-powered recommendations", "Green Score Card certificates", "Tax Incentive Calculator (SA)", "PDF report export", "Up to 3 team members", "Email support"]'::jsonb,
 -1, 3),

('planner_yearly', 'Planner Yearly', 'Annual plan with 17% savings', 4990.00, 'ZAR', 'yearly',
 '["Unlimited event calculations", "Cost & Savings Calculator with ROI", "Save & manage events (My Events)", "Smart AI-powered recommendations", "Green Score Card certificates", "Tax Incentive Calculator (SA)", "PDF report export", "Up to 3 team members", "Email support", "Save R1,000 annually"]'::jsonb,
 -1, 3),

-- Impact Leader (Enterprise) - Corporate tier
('impact_monthly', 'Impact Leader Monthly', 'For large agencies and corporate teams', 1999.00, 'ZAR', 'monthly',
 '["Everything in Planner", "Impact Dashboard with visual analytics", "Industry benchmarking", "Portfolio sustainability tracking", "UN SDG alignment reporting", "Unlimited team members", "Custom branded reports", "Advanced data export (CSV, Excel)", "Priority support", "Multi-location tracking", "Custom event categories"]'::jsonb,
 -1, -1),

('impact_yearly', 'Impact Leader Yearly', 'Annual enterprise plan with savings', 19990.00, 'ZAR', 'yearly',
 '["Everything in Planner", "Impact Dashboard with visual analytics", "Industry benchmarking", "Portfolio sustainability tracking", "UN SDG alignment reporting", "Unlimited team members", "Custom branded reports", "Advanced data export (CSV, Excel)", "Priority support", "Multi-location tracking", "Custom event categories", "Save R4,000 annually"]'::jsonb,
 -1, -1),

-- Enterprise Custom - Contact sales
('enterprise', 'Enterprise Custom', 'Custom solution for large organizations', 0.00, 'ZAR', 'yearly',
 '["Everything in Impact Leader", "API integrations", "Dedicated onboarding & training", "Custom feature development", "SLA guarantees (99.9% uptime)", "On-premise deployment option", "Compliance certifications", "Carbon offset marketplace", "Quarterly business reviews", "Contact for pricing"]'::jsonb,
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

