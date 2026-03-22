-- Migration 013: Impact Leader Tier Features
-- Adds tables and functions for AI-powered features, monitoring, reports, and badges

-- ============================================================================
-- 1. Executive Reports Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS executive_reports (
    id VARCHAR(255) PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_executive_reports_org ON executive_reports(organization_id);
CREATE INDEX idx_executive_reports_created ON executive_reports(created_at DESC);

-- ============================================================================
-- 2. Sustainability Badges Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS sustainability_badges (
    id VARCHAR(255) PRIMARY KEY,
    organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL CHECK (badge_type IN ('carbon_neutral', 'eco_certified', 'sustainability_leader', 'green_event')),
    level VARCHAR(20) NOT NULL CHECK (level IN ('bronze', 'silver', 'gold', 'platinum')),
    metrics JSONB NOT NULL,
    verification_code VARCHAR(255) UNIQUE NOT NULL,
    issued_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_badges_org ON sustainability_badges(organization_id);
CREATE INDEX idx_badges_verification ON sustainability_badges(verification_code);
CREATE INDEX idx_badges_active ON sustainability_badges(is_active);

-- ============================================================================
-- 3. Event Alerts Table (for live monitoring)
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('normal', 'high', 'critical')),
    message TEXT NOT NULL,
    details JSONB,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_alerts_event ON event_alerts(event_id);
CREATE INDEX idx_event_alerts_org ON event_alerts(organization_id);
CREATE INDEX idx_event_alerts_level ON event_alerts(level);
CREATE INDEX idx_event_alerts_acknowledged ON event_alerts(acknowledged);
CREATE INDEX idx_event_alerts_created ON event_alerts(created_at DESC);

-- ============================================================================
-- 4. Chatbot Conversations Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    messages JSONB NOT NULL DEFAULT '[]',
    context JSONB,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_chatbot_user ON chatbot_conversations(user_id);
CREATE INDEX idx_chatbot_org ON chatbot_conversations(organization_id);
CREATE INDEX idx_chatbot_active ON chatbot_conversations(is_active);
CREATE INDEX idx_chatbot_last_message ON chatbot_conversations(last_message_at DESC);

-- ============================================================================
-- 5. AI Research Cache Table (to avoid redundant API calls)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_research_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    research_type VARCHAR(100) NOT NULL,
    research_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_research_cache_key ON ai_research_cache(cache_key);
CREATE INDEX idx_research_cache_type ON ai_research_cache(research_type);
CREATE INDEX idx_research_cache_expires ON ai_research_cache(expires_at);

-- ============================================================================
-- 6. Weather Data Cache Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS weather_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location VARCHAR(255) NOT NULL,
    weather_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_weather_cache_location ON weather_cache(location);
CREATE INDEX idx_weather_cache_expires ON weather_cache(expires_at);

-- ============================================================================
-- 7. Add columns to events table for enhanced tracking
-- ============================================================================
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS weather_data JSONB,
ADD COLUMN IF NOT EXISTS sdg_alignments JSONB,
ADD COLUMN IF NOT EXISTS industry_benchmark JSONB,
ADD COLUMN IF NOT EXISTS monitoring_score INTEGER,
ADD COLUMN IF NOT EXISTS last_monitored_at TIMESTAMP;

-- ============================================================================
-- 8. Function: Clean up expired cache entries
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM ai_research_cache WHERE expires_at < CURRENT_TIMESTAMP;
    DELETE FROM weather_cache WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. Function: Get organization sustainability score
-- ============================================================================
CREATE OR REPLACE FUNCTION get_sustainability_score(org_id UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER;
    total_carbon NUMERIC;
    total_offset NUMERIC;
    offset_percentage NUMERIC;
BEGIN
    SELECT 
        COALESCE(SUM(total_carbon), 0),
        COALESCE(SUM(carbon_offset), 0)
    INTO total_carbon, total_offset
    FROM events
    WHERE organization_id = org_id
      AND deleted_at IS NULL;
    
    IF total_carbon > 0 THEN
        offset_percentage := (total_offset / total_carbon) * 100;
        score := LEAST(100, GREATEST(0, offset_percentage::INTEGER));
    ELSE
        score := 0;
    END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. Function: Get event monitoring status
-- ============================================================================
CREATE OR REPLACE FUNCTION get_event_monitoring_status(evt_id UUID)
RETURNS TABLE (
    status VARCHAR(20),
    critical_alerts INTEGER,
    high_alerts INTEGER,
    normal_alerts INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN COUNT(*) FILTER (WHERE level = 'critical') > 0 THEN 'critical'
            WHEN COUNT(*) FILTER (WHERE level = 'high') > 0 THEN 'warning'
            WHEN COUNT(*) FILTER (WHERE level = 'normal') > 0 THEN 'good'
            ELSE 'unknown'
        END::VARCHAR(20) as status,
        COUNT(*) FILTER (WHERE level = 'critical')::INTEGER as critical_alerts,
        COUNT(*) FILTER (WHERE level = 'high')::INTEGER as high_alerts,
        COUNT(*) FILTER (WHERE level = 'normal')::INTEGER as normal_alerts
    FROM event_alerts
    WHERE event_id = evt_id
      AND acknowledged = false;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE executive_reports IS 'Stores AI-generated executive reports for board meetings';
COMMENT ON TABLE sustainability_badges IS 'Stores sustainability badges and certifications for organizations';
COMMENT ON TABLE event_alerts IS 'Stores real-time monitoring alerts for events';
COMMENT ON TABLE chatbot_conversations IS 'Stores chatbot conversation history';
COMMENT ON TABLE ai_research_cache IS 'Caches AI research results to reduce API costs';
COMMENT ON TABLE weather_cache IS 'Caches weather data to reduce API calls';

