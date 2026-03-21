-- Migration: Analytics Events Tracking
-- Description: Create table for tracking business analytics events (conversions, upgrades, etc.)
-- Author: System
-- Date: 2026-03-21

-- ============================================
-- ANALYTICS EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_org_id ON analytics_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created ON analytics_events(event_type, created_at);

-- Composite index for conversion tracking
CREATE INDEX IF NOT EXISTS idx_analytics_events_conversion 
ON analytics_events(event_type, organization_id, created_at) 
WHERE event_type = 'plan_changed';

-- Record migration
INSERT INTO migrations (name) VALUES ('007_analytics_events')
ON CONFLICT (name) DO NOTHING;

