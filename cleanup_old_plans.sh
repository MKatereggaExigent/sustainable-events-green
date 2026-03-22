#!/bin/bash

# Quick script to deactivate old subscription plans
# Run this to clean up planner_monthly, planner_yearly, impact_monthly, impact_yearly

set -e

echo "🧹 Cleaning up old subscription plans..."

docker exec ecobserve-db psql -U postgres -d ecobserve << 'EOF'
-- Deactivate old monthly/yearly variants
UPDATE subscription_plans
SET is_active = false, updated_at = CURRENT_TIMESTAMP
WHERE code IN ('planner_monthly', 'planner_yearly', 'impact_monthly', 'impact_yearly');

-- Verify the changes
SELECT code, name, amount, is_active 
FROM subscription_plans 
ORDER BY amount ASC;
EOF

echo "✅ Old plans deactivated!"
echo ""
echo "Active plans should now be:"
echo "  - explorer (Free)"
echo "  - planner (R499)"
echo "  - impact_leader (R1,999)"
echo "  - enterprise (Custom)"

