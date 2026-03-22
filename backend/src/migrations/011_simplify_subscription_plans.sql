-- Migration 011: Simplify Subscription Plans
-- Remove monthly/yearly variants and keep only 4 tiers:
-- 1. Explorer (Free)
-- 2. Planner (R499/month)
-- 3. Impact Leader (R1,999/month)
-- 4. Enterprise (Custom)

-- Deactivate old monthly/yearly variants
UPDATE subscription_plans
SET is_active = false
WHERE code IN ('planner_monthly', 'planner_yearly', 'impact_monthly', 'impact_yearly');

-- Ensure the simplified plans exist and are active
-- Explorer (already exists, just ensure it's active)
UPDATE subscription_plans
SET is_active = true
WHERE code = 'explorer';

-- Planner (created by migration 010, ensure it's active)
UPDATE subscription_plans
SET is_active = true
WHERE code = 'planner';

-- Create Impact Leader (simplified, no monthly/yearly)
INSERT INTO subscription_plans (
    code,
    name,
    description,
    max_events,
    max_users,
    features,
    amount,
    currency,
    interval,
    is_active
) VALUES (
    'impact_leader',
    'Impact Leader',
    'For large agencies and corporate teams',
    -1,
    -1,
    '[
        "Everything in Planner",
        "Impact Dashboard with visual analytics",
        "Industry benchmarking",
        "Portfolio sustainability tracking",
        "UN SDG alignment reporting",
        "Unlimited team members",
        "Custom branded reports",
        "Advanced data export (CSV, Excel)",
        "Priority support",
        "Multi-location tracking",
        "Custom event categories"
    ]'::jsonb,
    1999.00,
    'ZAR',
    'monthly',
    true
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

-- Enterprise (already exists, ensure it's active)
UPDATE subscription_plans
SET is_active = true
WHERE code = 'enterprise';

-- Record migration
INSERT INTO schema_migrations (migration_name, executed_at)
VALUES ('011_simplify_subscription_plans.sql', CURRENT_TIMESTAMP)
ON CONFLICT (migration_name) DO NOTHING;

