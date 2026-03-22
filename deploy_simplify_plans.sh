#!/bin/bash

# Deploy Migration 011: Simplify Subscription Plans
# This script simplifies the pricing structure to 4 tiers only

set -e

echo "🚀 Deploying Simplified Subscription Plans..."

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

# Step 2: Run migration 011
echo -e "${BLUE}📊 Step 2: Running migration 011...${NC}"
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

# Step 3: Verify the plans
echo -e "${BLUE}🔍 Step 3: Verifying subscription plans...${NC}"
docker exec ecobserve-db psql -U postgres -d ecobserve -c "SELECT code, name, amount, currency, is_active FROM subscription_plans ORDER BY amount ASC;"

# Step 4: Rebuild and restart frontend
echo -e "${BLUE}🔨 Step 4: Rebuilding frontend...${NC}"
docker-compose build frontend
echo -e "${GREEN}✅ Frontend rebuilt${NC}"

echo -e "${BLUE}🔄 Step 5: Restarting frontend...${NC}"
docker-compose stop frontend
docker-compose rm -f frontend
docker-compose up -d frontend
echo -e "${GREEN}✅ Frontend restarted${NC}"

# Step 6: Wait and verify
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 10

echo -e "${BLUE}📊 Step 6: Checking service status...${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Summary:${NC}"
echo "  - Deactivated: planner_monthly, planner_yearly, impact_monthly, impact_yearly"
echo "  - Active Plans: explorer, planner, impact_leader, enterprise"
echo "  - Total Active Plans: 4"
echo ""
echo -e "${BLUE}🌐 Test the pricing page at: https://ecobserve.com/pricing${NC}"

