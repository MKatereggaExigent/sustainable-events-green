-- Migration 012: Subscription Downgrades Tracking
-- Track subscription tier changes (upgrades and downgrades) with reasons and limits

-- Create subscription_changes table to track all tier changes
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

CREATE INDEX idx_subscription_changes_org ON subscription_changes(organization_id);
CREATE INDEX idx_subscription_changes_type ON subscription_changes(change_type);
CREATE INDEX idx_subscription_changes_created ON subscription_changes(created_at DESC);

-- Add downgrade_count to organizations table to track total downgrades
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS downgrade_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_downgrade_at TIMESTAMP WITH TIME ZONE;

-- Function to count downgrades in the last 12 months
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
