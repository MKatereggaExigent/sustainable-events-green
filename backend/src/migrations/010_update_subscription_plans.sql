-- Migration 010: Update Subscription Plans for Explorer and Planner tiers

-- Update Explorer Plan (Free)
UPDATE subscription_plans
SET 
    max_events = 1,
    features = '[
        "Pre-Assessment Wizard",
        "Event Footprint Calculator (1 event/month)",
        "Basic carbon, water, waste calculations",
        "Simple sustainability score",
        "View calculation results"
    ]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE code = 'explorer';

-- Update Planner Plan (R499/month, 6 events/year)
UPDATE subscription_plans
SET 
    max_events = 6,
    features = '[
        "Everything in Explorer",
        "6 event calculations per year",
        "Cost & Savings Calculator with ROI",
        "Save & manage events (My Events)",
        "Smart AI-powered recommendations (GPT)",
        "Green Score Card certificates",
        "Tax Incentive Calculator (SA)",
        "Carbon Offset Marketplace",
        "Supplier Carbon Tracking",
        "Benchmark Comparison",
        "Priority email support"
    ]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE code = 'planner';

-- Ensure Planner plan exists with correct pricing
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
    'planner',
    'Planner',
    'Perfect for professional event planners who need advanced sustainability tools and AI-powered recommendations',
    6,
    3,
    '[
        "Everything in Explorer",
        "6 event calculations per year",
        "Cost & Savings Calculator with ROI",
        "Save & manage events (My Events)",
        "Smart AI-powered recommendations (GPT)",
        "Green Score Card certificates",
        "Tax Incentive Calculator (SA)",
        "Carbon Offset Marketplace",
        "Supplier Carbon Tracking",
        "Benchmark Comparison",
        "Priority email support"
    ]'::jsonb,
    499.00,
    'ZAR',
    'monthly',
    true
)
ON CONFLICT (code) DO UPDATE SET
    max_events = EXCLUDED.max_events,
    features = EXCLUDED.features,
    amount = EXCLUDED.amount,
    updated_at = CURRENT_TIMESTAMP;

