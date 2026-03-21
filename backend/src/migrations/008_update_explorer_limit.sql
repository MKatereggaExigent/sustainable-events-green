-- Migration: Update Explorer Tier Limit
-- Description: Reduce Explorer tier from 3 events/month to 1 event/month
-- Author: System
-- Date: 2026-03-21

-- Update the subscription plan
UPDATE subscription_plans
SET 
    max_events = 1,
    features = '["Event Footprint Calculator (1 event/month)", "Basic carbon, water, waste calculations", "Simple sustainability score", "Basic recommendations", "FAQ & Resources access", "View success stories"]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE code = 'explorer';

-- Record migration
INSERT INTO migrations (name) VALUES ('008_update_explorer_limit')
ON CONFLICT (name) DO NOTHING;

