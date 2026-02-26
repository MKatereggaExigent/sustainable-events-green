-- User Settings Migration
-- Stores user preferences for metric systems, currencies, and display options
-- EcobServe Platform

-- ============================================
-- USER SETTINGS TABLE
-- ============================================
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Metric System Preferences
    -- 'metric' = SI units (kg, km, liters) - EU, most of world
    -- 'imperial' = US units (lbs, miles, gallons)
    -- 'uk' = UK mix (miles, kg, liters)
    metric_system VARCHAR(20) DEFAULT 'metric' CHECK (metric_system IN ('metric', 'imperial', 'uk')),
    
    -- Currency Preferences
    currency_code VARCHAR(3) DEFAULT 'USD',  -- ISO 4217 currency code
    
    -- Display Preferences
    hide_values BOOLEAN DEFAULT false,  -- Hide all numerical values with ***
    
    -- Cached exchange rates (updated periodically)
    exchange_rate DECIMAL(18, 8) DEFAULT 1.0,  -- Rate relative to USD
    exchange_rate_updated_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one settings record per user
    UNIQUE(user_id)
);

-- Index for quick lookups
CREATE INDEX idx_user_settings_user ON user_settings(user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_user_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating timestamps
CREATE TRIGGER trigger_user_settings_updated
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_settings_timestamp();

-- ============================================
-- SUPPORTED CURRENCIES REFERENCE TABLE
-- ============================================
CREATE TABLE supported_currencies (
    code VARCHAR(3) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    decimal_places INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT true
);

-- Insert common currencies (100+ supported)
INSERT INTO supported_currencies (code, name, symbol, decimal_places) VALUES
-- Major currencies
('USD', 'US Dollar', '$', 2),
('EUR', 'Euro', '€', 2),
('GBP', 'British Pound', '£', 2),
('JPY', 'Japanese Yen', '¥', 0),
('CHF', 'Swiss Franc', 'CHF', 2),
('CAD', 'Canadian Dollar', 'C$', 2),
('AUD', 'Australian Dollar', 'A$', 2),
('NZD', 'New Zealand Dollar', 'NZ$', 2),
('CNY', 'Chinese Yuan', '¥', 2),
('HKD', 'Hong Kong Dollar', 'HK$', 2),
('SGD', 'Singapore Dollar', 'S$', 2),
('INR', 'Indian Rupee', '₹', 2),
('KRW', 'South Korean Won', '₩', 0),
('MXN', 'Mexican Peso', '$', 2),
('BRL', 'Brazilian Real', 'R$', 2),
('ZAR', 'South African Rand', 'R', 2),
('RUB', 'Russian Ruble', '₽', 2),
('TRY', 'Turkish Lira', '₺', 2),
('SEK', 'Swedish Krona', 'kr', 2),
('NOK', 'Norwegian Krone', 'kr', 2),
('DKK', 'Danish Krone', 'kr', 2),
('PLN', 'Polish Zloty', 'zł', 2),
('THB', 'Thai Baht', '฿', 2),
('MYR', 'Malaysian Ringgit', 'RM', 2),
('IDR', 'Indonesian Rupiah', 'Rp', 0),
('PHP', 'Philippine Peso', '₱', 2),
('VND', 'Vietnamese Dong', '₫', 0),
('AED', 'UAE Dirham', 'د.إ', 2),
('SAR', 'Saudi Riyal', '﷼', 2),
('ILS', 'Israeli Shekel', '₪', 2),
('EGP', 'Egyptian Pound', 'E£', 2),
('NGN', 'Nigerian Naira', '₦', 2),
('KES', 'Kenyan Shilling', 'KSh', 2),
('GHS', 'Ghanaian Cedi', 'GH₵', 2),
('UGX', 'Ugandan Shilling', 'USh', 0),
('TZS', 'Tanzanian Shilling', 'TSh', 0),
('RWF', 'Rwandan Franc', 'FRw', 0),
('PKR', 'Pakistani Rupee', '₨', 2),
('BDT', 'Bangladeshi Taka', '৳', 2),
('LKR', 'Sri Lankan Rupee', 'Rs', 2),
('NPR', 'Nepalese Rupee', 'Rs', 2),
('MMK', 'Myanmar Kyat', 'K', 0),
('CZK', 'Czech Koruna', 'Kč', 2),
('HUF', 'Hungarian Forint', 'Ft', 0),
('RON', 'Romanian Leu', 'lei', 2),
('BGN', 'Bulgarian Lev', 'лв', 2),
('HRK', 'Croatian Kuna', 'kn', 2),
('UAH', 'Ukrainian Hryvnia', '₴', 2),
('CLP', 'Chilean Peso', '$', 0),
('COP', 'Colombian Peso', '$', 0),
('PEN', 'Peruvian Sol', 'S/', 2),
('ARS', 'Argentine Peso', '$', 2),
('TWD', 'Taiwan Dollar', 'NT$', 2),
('QAR', 'Qatari Riyal', '﷼', 2),
('KWD', 'Kuwaiti Dinar', 'د.ك', 3),
('BHD', 'Bahraini Dinar', '.د.ب', 3),
('OMR', 'Omani Rial', '﷼', 3),
('JOD', 'Jordanian Dinar', 'د.ا', 3),
('MAD', 'Moroccan Dirham', 'د.م.', 2),
('DZD', 'Algerian Dinar', 'د.ج', 2),
('TND', 'Tunisian Dinar', 'د.ت', 3);

-- Index for active currencies
CREATE INDEX idx_supported_currencies_active ON supported_currencies(is_active);

