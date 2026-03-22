-- Migration 016: Add display_order to subscription_plans for proper sorting
-- This ensures plans display in the correct order: Explorer, Planner, Impact Leader, Enterprise

-- Add display_order column
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Update display order for each plan
UPDATE subscription_plans SET display_order = 1 WHERE code = 'explorer';
UPDATE subscription_plans SET display_order = 2 WHERE code = 'planner';
UPDATE subscription_plans SET display_order = 2 WHERE code = 'planner_monthly';
UPDATE subscription_plans SET display_order = 2 WHERE code = 'planner_yearly';
UPDATE subscription_plans SET display_order = 3 WHERE code = 'impact_leader';
UPDATE subscription_plans SET display_order = 3 WHERE code = 'impact_monthly';
UPDATE subscription_plans SET display_order = 3 WHERE code = 'impact_yearly';
UPDATE subscription_plans SET display_order = 4 WHERE code = 'enterprise';

-- Create index for faster sorting
CREATE INDEX IF NOT EXISTS idx_subscription_plans_display_order ON subscription_plans(display_order);

