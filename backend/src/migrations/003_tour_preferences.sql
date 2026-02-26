-- Tour Preferences Migration
-- Stores user preferences for the interactive product tour

-- ============================================
-- USER TOUR PREFERENCES
-- ============================================
CREATE TABLE user_tour_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    -- Tour completion status
    has_completed_tour BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    -- Tour preferences
    tour_enabled BOOLEAN DEFAULT true,           -- Whether to show tour on login
    show_tour_on_new_features BOOLEAN DEFAULT true, -- Show tour for new features
    -- Specific section completion tracking (for resumable tours)
    completed_steps JSONB DEFAULT '[]',          -- Array of completed step IDs
    last_seen_step VARCHAR(100),                 -- Last step user was on
    -- Analytics
    times_started INTEGER DEFAULT 0,
    times_completed INTEGER DEFAULT 0,
    times_skipped INTEGER DEFAULT 0,
    total_time_seconds INTEGER DEFAULT 0,        -- Total time spent in tour
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Ensure one preference record per user
    UNIQUE(user_id)
);

-- Index for quick lookups
CREATE INDEX idx_tour_preferences_user ON user_tour_preferences(user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_tour_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating timestamps
CREATE TRIGGER trigger_tour_preferences_updated
    BEFORE UPDATE ON user_tour_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_tour_preferences_timestamp();

