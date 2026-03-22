-- Migration 015: Add Carbon Tracking Columns to Events Table
-- This migration adds columns needed for Impact Dashboard and carbon tracking

-- ============================================
-- ADD CARBON TRACKING COLUMNS TO EVENTS TABLE
-- ============================================

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS total_carbon DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS travel_carbon DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS venue_carbon DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS catering_carbon DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS waste_carbon DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS carbon_offset DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS attendees INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS event_date DATE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- ============================================
-- SYNC EXISTING DATA FROM event_carbon_data
-- ============================================

-- Update events table with data from event_carbon_data
UPDATE events e
SET 
    total_carbon = COALESCE(ecd.carbon_kg, 0),
    venue_carbon = COALESCE(ecd.breakdown_venue, 0),
    catering_carbon = COALESCE(ecd.breakdown_fnb, 0),
    travel_carbon = COALESCE(ecd.breakdown_transport, 0),
    waste_carbon = COALESCE(ecd.breakdown_materials, 0),
    attendees = COALESCE(e.attendee_count, ecd.fnb_guests, 0),
    event_date = COALESCE(e.start_date, CURRENT_DATE),
    category = COALESCE(e.event_type, 'general')
FROM event_carbon_data ecd
WHERE e.id = ecd.event_id;

-- ============================================
-- CREATE TRIGGER TO AUTO-UPDATE CARBON TOTALS
-- ============================================

CREATE OR REPLACE FUNCTION update_event_carbon_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the events table when event_carbon_data is inserted/updated
    UPDATE events
    SET 
        total_carbon = NEW.carbon_kg,
        venue_carbon = NEW.breakdown_venue,
        catering_carbon = NEW.breakdown_fnb,
        travel_carbon = NEW.breakdown_transport,
        waste_carbon = NEW.breakdown_materials,
        attendees = COALESCE(attendees, NEW.fnb_guests),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.event_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_event_carbon_totals
AFTER INSERT OR UPDATE ON event_carbon_data
FOR EACH ROW
EXECUTE FUNCTION update_event_carbon_totals();

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_events_total_carbon ON events(total_carbon);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_deleted_at ON events(deleted_at);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_attendees ON events(attendees);

