#!/bin/bash

# Deploy Payment Verification Fixes and Downgrade Functionality
# This script fixes the payment tier update issue and adds downgrade features

set -e

echo "🚀 Deploying Payment Fixes and Downgrade Functionality..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Pull latest changes
echo -e "${BLUE}📥 Step 1: Pulling latest changes...${NC}"
git pull origin test-development
echo -e "${GREEN}✅ Code updated${NC}"

# Step 2: Run migration 011 (simplify subscription plans)
echo -e "${BLUE}📊 Step 2: Running migration 011 (simplify plans)...${NC}"
docker exec ecobserve-db psql -U postgres -d ecobserve << 'EOF'
-- Migration 011: Simplify Subscription Plans

-- Deactivate old monthly/yearly variants
UPDATE subscription_plans
SET is_active = false
WHERE code IN ('planner_monthly', 'planner_yearly', 'impact_monthly', 'impact_yearly');

-- Ensure the simplified plans exist and are active
UPDATE subscription_plans SET is_active = true WHERE code = 'explorer';
UPDATE subscription_plans SET is_active = true WHERE code = 'planner';

-- Create Impact Leader (simplified)
INSERT INTO subscription_plans (
    code, name, description, max_events, max_users, features, amount, currency, interval, is_active
) VALUES (
    'impact_leader',
    'Impact Leader',
    'For large agencies and corporate teams',
    -1, -1,
    '["Everything in Planner", "Impact Dashboard with visual analytics", "Industry benchmarking", "Portfolio sustainability tracking", "UN SDG alignment reporting", "Unlimited team members", "Custom branded reports", "Advanced data export (CSV, Excel)", "Priority support", "Multi-location tracking", "Custom event categories"]'::jsonb,
    1999.00, 'ZAR', 'monthly', true
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    max_events = EXCLUDED.max_events,
    max_users = EXCLUDED.max_users,
    features = EXCLUDED.features,
    amount = EXCLUDED.amount,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

UPDATE subscription_plans SET is_active = true WHERE code = 'enterprise';

-- Record migration
INSERT INTO schema_migrations (migration_name, executed_at)
VALUES ('011_simplify_subscription_plans.sql', CURRENT_TIMESTAMP)
ON CONFLICT (migration_name) DO NOTHING;
EOF

echo -e "${GREEN}✅ Migration 011 completed${NC}"

# Step 3: Run migration 012 (downgrade tracking)
echo -e "${BLUE}📊 Step 3: Running migration 012 (downgrade tracking)...${NC}"
docker exec ecobserve-db psql -U postgres -d ecobserve << 'EOF'
-- Migration 012: Subscription Downgrades Tracking

-- Create subscription_changes table
CREATE TABLE IF NOT EXISTS subscription_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    from_tier VARCHAR(50) NOT NULL,
    to_tier VARCHAR(50) NOT NULL,
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('upgrade', 'downgrade', 'cancel')),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscription_changes_org ON subscription_changes(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscription_changes_type ON subscription_changes(change_type);
CREATE INDEX IF NOT EXISTS idx_subscription_changes_created ON subscription_changes(created_at DESC);

-- Add downgrade tracking columns
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS downgrade_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_downgrade_at TIMESTAMP WITH TIME ZONE;

-- Function to count recent downgrades
CREATE OR REPLACE FUNCTION get_recent_downgrade_count(org_id UUID)
RETURNS INTEGER AS $$
DECLARE
    downgrade_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO downgrade_count
    FROM subscription_changes
    WHERE organization_id = org_id
      AND change_type = 'downgrade'
      AND created_at >= NOW() - INTERVAL '12 months';
    
    RETURN COALESCE(downgrade_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Record migration
INSERT INTO schema_migrations (migration_name, executed_at)
VALUES ('012_subscription_downgrades.sql', CURRENT_TIMESTAMP)
ON CONFLICT (migration_name) DO NOTHING;
EOF

echo -e "${GREEN}✅ Migration 012 completed${NC}"

# Step 4: Verify subscription plans
echo -e "${BLUE}🔍 Step 4: Verifying subscription plans...${NC}"
docker exec ecobserve-db psql -U postgres -d ecobserve -c "SELECT code, name, amount, currency, is_active FROM subscription_plans ORDER BY amount ASC;"

# Step 5: Rebuild backend
echo -e "${BLUE}🔨 Step 5: Rebuilding backend...${NC}"
docker-compose build backend
echo -e "${GREEN}✅ Backend rebuilt${NC}"

# Step 6: Rebuild frontend
echo -e "${BLUE}🔨 Step 6: Rebuilding frontend...${NC}"
docker-compose build frontend
echo -e "${GREEN}✅ Frontend rebuilt${NC}"

# Step 7: Restart services
echo -e "${BLUE}🔄 Step 7: Restarting services...${NC}"
docker-compose stop backend frontend
docker-compose rm -f backend frontend
docker-compose up -d backend frontend
echo -e "${GREEN}✅ Services restarted${NC}"

# Step 8: Wait and verify
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 15

echo -e "${BLUE}📊 Step 8: Checking service status...${NC}"
docker-compose ps

echo -e "${BLUE}📋 Checking backend logs...${NC}"
docker-compose logs backend | tail -20

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Summary of Changes:${NC}"
echo "  ✅ Fixed payment verification tier mapping (planner, impact_leader)"
echo "  ✅ Fixed blank home page issue (force page reload)"
echo "  ✅ Added downgrade functionality with reason tracking"
echo "  ✅ Implemented 3 downgrades per 12 months limit"
echo "  ✅ Created subscription_changes tracking table"
echo ""
echo -e "${BLUE}🧪 Test the following:${NC}"
echo "  1. Make a test payment and verify tier updates correctly"
echo "  2. Click 'Start Using Features' and verify no blank page"
echo "  3. Try downgrading to a lower tier from Pricing page"
echo "  4. Verify downgrade modal appears with reason field"
echo ""
echo -e "${BLUE}🌐 URLs:${NC}"
echo "  - Pricing: https://ecobserve.com/pricing"
echo "  - Payment Success: https://ecobserve.com/payment/success"

