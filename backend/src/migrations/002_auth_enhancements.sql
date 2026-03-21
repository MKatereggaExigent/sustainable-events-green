-- Authentication Enhancements Migration
-- Email verification, password reset, and 2FA support

-- ============================================
-- EMAIL VERIFICATION TOKENS
-- ============================================
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_email_verification_tokens_user ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_expires ON email_verification_tokens(expires_at);

-- ============================================
-- PASSWORD RESET TOKENS
-- ============================================
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(45),
    user_agent TEXT
);

CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

-- ============================================
-- TWO-FACTOR AUTHENTICATION
-- ============================================
CREATE TABLE user_2fa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    secret VARCHAR(255) NOT NULL,
    is_enabled BOOLEAN DEFAULT false,
    backup_codes TEXT[], -- Array of hashed backup codes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    enabled_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_user_2fa_user ON user_2fa(user_id);

-- ============================================
-- LOGIN ATTEMPTS (for security monitoring)
-- ============================================
CREATE TABLE login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    success BOOLEAN DEFAULT false,
    failure_reason VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_created ON login_attempts(created_at);

-- ============================================
-- UPDATE USERS TABLE
-- ============================================
-- Add email verification timestamp
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP WITH TIME ZONE;

-- Add password reset timestamp
ALTER TABLE users ADD COLUMN password_reset_at TIMESTAMP WITH TIME ZONE;

-- Add 2FA requirement flag
ALTER TABLE users ADD COLUMN requires_2fa BOOLEAN DEFAULT false;

-- Update existing verified users
UPDATE users SET email_verified_at = created_at WHERE is_email_verified = true;

-- ============================================
-- SECURITY EVENTS LOG
-- ============================================
CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- 'password_reset', 'email_verified', '2fa_enabled', '2fa_disabled', 'suspicious_login'
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_security_events_user ON security_events(user_id);
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_created ON security_events(created_at);

-- ============================================
-- CLEANUP FUNCTION (to remove expired tokens)
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_tokens() RETURNS void AS $$
BEGIN
    DELETE FROM email_verification_tokens WHERE expires_at < CURRENT_TIMESTAMP AND used_at IS NULL;
    DELETE FROM password_reset_tokens WHERE expires_at < CURRENT_TIMESTAMP AND used_at IS NULL;
    DELETE FROM login_attempts WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron extension, optional)
-- SELECT cron.schedule('cleanup-tokens', '0 2 * * *', 'SELECT cleanup_expired_tokens()');

