-- Migration: production_cleanup_and_statistics
-- Created: Sat 21 Mar 2026 18:13:50 SAST
-- Description: Production cleanup - Remove all dummy/mock data and create platform_statistics table

-- ============================================
-- UP Migration
-- ============================================

-- 1. Create platform_statistics table for admin-managed global stats
CREATE TABLE IF NOT EXISTS platform_statistics (
    id INTEGER PRIMARY KEY DEFAULT 1,
    events_tracked INTEGER DEFAULT 0,
    co2_offset_kg DECIMAL(15, 2) DEFAULT 0,
    planners_active INTEGER DEFAULT 0,
    avg_satisfaction INTEGER DEFAULT 0,
    countries INTEGER DEFAULT 0,
    trees_planted INTEGER DEFAULT 0,
    water_saved_liters DECIMAL(15, 2) DEFAULT 0,
    events_this_month INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row_check CHECK (id = 1)
);

-- Insert initial row with all zeros (clean slate for production)
INSERT INTO platform_statistics (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- 2. Clean up dummy/test data from events table
-- Keep the table structure but remove all test/dummy events
TRUNCATE TABLE IF EXISTS event_carbon_data CASCADE;
TRUNCATE TABLE IF EXISTS event_costs CASCADE;
TRUNCATE TABLE IF EXISTS event_tax_incentives CASCADE;
TRUNCATE TABLE IF EXISTS events CASCADE;

-- 3. Clean up test users (keep only admin users with role_id = 1)
-- First, remove user sessions
DELETE FROM user_sessions WHERE user_id IN (
    SELECT id FROM users WHERE role_id != 1
);

-- Remove non-admin users
DELETE FROM users WHERE role_id != 1;

-- 4. Clean up test organizations (optional - keep structure)
-- If you want to remove test organizations, uncomment:
-- DELETE FROM organization_members;
-- DELETE FROM organizations;

-- 5. Reset sequences to start fresh
-- This ensures new records start from ID 1
ALTER SEQUENCE IF EXISTS events_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS event_carbon_data_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS event_costs_id_seq RESTART WITH 1;

-- ============================================
-- Rollback (for reference - not auto-executed)
-- ============================================

-- To rollback this migration:
-- DROP TABLE IF EXISTS platform_statistics;
-- Note: Data cleanup cannot be rolled back - ensure you have backups!

