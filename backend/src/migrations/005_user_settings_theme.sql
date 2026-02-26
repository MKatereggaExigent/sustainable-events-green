-- User Settings Theme Migration
-- Adds theme preference column to user_settings table
-- EcobServe Platform

-- ============================================
-- ADD THEME COLUMN TO USER SETTINGS
-- ============================================

-- Add theme column with default 'emerald' (current green theme)
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS theme VARCHAR(30) DEFAULT 'emerald' 
CHECK (theme IN ('light', 'dark', 'emerald', 'blue', 'violet', 'rose', 'amber', 'slate', 'zinc'));

-- Update existing records to have the default theme
UPDATE user_settings SET theme = 'emerald' WHERE theme IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_settings.theme IS 'UI theme preference: light, dark, emerald (default), blue, violet, rose, amber, slate, zinc';

