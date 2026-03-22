-- Migration: User Login Tracking
-- Description: Track user logins with IP, location, and device fingerprint

CREATE TABLE IF NOT EXISTS user_login_tracking (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    location_country VARCHAR(100),
    location_region VARCHAR(100),
    location_city VARCHAR(100),
    location_timezone VARCHAR(100),
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    login_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_login_tracking_user_id ON user_login_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_user_login_tracking_ip ON user_login_tracking(ip_address);
CREATE INDEX IF NOT EXISTS idx_user_login_tracking_timestamp ON user_login_tracking(login_timestamp);

