-- Migration 014: Standardize Currency to ZAR and Expand Regional Data
-- This migration updates all currency defaults to ZAR (South African Rand)
-- and adds comprehensive regional data for tax incentives and cost factors

-- ============================================
-- UPDATE CURRENCY DEFAULTS
-- ============================================

-- Update event_costs table default currency to ZAR
ALTER TABLE event_costs ALTER COLUMN currency SET DEFAULT 'ZAR';
ALTER TABLE event_costs ALTER COLUMN region SET DEFAULT 'za';

-- Update existing USD records to ZAR (convert at approximate rate 1 USD = 18 ZAR)
UPDATE event_costs 
SET currency = 'ZAR',
    venue_cost = venue_cost * 18,
    energy_cost = energy_cost * 18,
    catering_cost = catering_cost * 18,
    transport_cost = transport_cost * 18,
    materials_cost = materials_cost * 18,
    waste_disposal_cost = waste_disposal_cost * 18,
    traditional_total = traditional_total * 18,
    sustainable_total = sustainable_total * 18,
    total_savings = total_savings * 18,
    carbon_value_saved = carbon_value_saved * 18,
    water_value_saved = water_value_saved * 18,
    waste_value_saved = waste_value_saved * 18
WHERE currency = 'USD';

-- ============================================
-- REGIONAL COST FACTORS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS regional_cost_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_code VARCHAR(10) UNIQUE NOT NULL,
    region_name VARCHAR(100) NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    
    -- Carbon pricing (per kg)
    carbon_price_per_kg DECIMAL(10,4) NOT NULL,
    
    -- Water costs (per liter)
    water_cost_per_liter DECIMAL(10,6) NOT NULL,
    
    -- Waste disposal (per kg)
    waste_cost_per_kg DECIMAL(10,4) NOT NULL,
    
    -- Energy costs (per kWh)
    energy_cost_per_kwh DECIMAL(10,4) NOT NULL,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert comprehensive regional data (ZAR-based for South Africa, others in local currency)
INSERT INTO regional_cost_factors (region_code, region_name, currency_code, carbon_price_per_kg, water_cost_per_liter, waste_cost_per_kg, energy_cost_per_kwh) VALUES
-- Africa
('za', 'South Africa', 'ZAR', 0.159, 0.072, 2.16, 2.50),  -- R159/ton carbon tax, municipal water rates
('ng', 'Nigeria', 'NGN', 15.00, 0.50, 80.00, 45.00),
('ke', 'Kenya', 'KES', 3.50, 0.80, 120.00, 25.00),
('eg', 'Egypt', 'EGP', 8.00, 0.30, 50.00, 1.50),
('gh', 'Ghana', 'GHS', 2.00, 0.60, 45.00, 3.50),

-- North America
('us', 'United States', 'USD', 0.025, 0.004, 0.12, 0.13),
('ca', 'Canada', 'CAD', 0.065, 0.003, 0.10, 0.11),
('mx', 'Mexico', 'MXN', 0.45, 0.06, 1.80, 2.20),

-- Europe
('eu', 'European Union', 'EUR', 0.085, 0.006, 0.18, 0.25),
('uk', 'United Kingdom', 'GBP', 0.075, 0.005, 0.15, 0.22),
('ch', 'Switzerland', 'CHF', 0.090, 0.007, 0.20, 0.18),

-- Asia-Pacific
('au', 'Australia', 'AUD', 0.030, 0.008, 0.14, 0.28),
('nz', 'New Zealand', 'NZD', 0.035, 0.007, 0.13, 0.26),
('jp', 'Japan', 'JPY', 3.50, 0.60, 18.00, 25.00),
('cn', 'China', 'CNY', 0.18, 0.025, 0.80, 0.55),
('in', 'India', 'INR', 2.00, 0.30, 9.00, 6.50),
('sg', 'Singapore', 'SGD', 0.040, 0.010, 0.16, 0.20),

-- Middle East
('ae', 'United Arab Emirates', 'AED', 0.10, 0.015, 0.45, 0.35),
('sa', 'Saudi Arabia', 'SAR', 0.095, 0.012, 0.40, 0.18),

-- South America
('br', 'Brazil', 'BRL', 0.13, 0.020, 0.55, 0.45),
('ar', 'Argentina', 'ARS', 4.50, 0.80, 20.00, 12.00),
('cl', 'Chile', 'CLP', 20.00, 3.50, 95.00, 110.00)
ON CONFLICT (region_code) DO NOTHING;

-- ============================================
-- EXPAND TAX INCENTIVES
-- ============================================

-- Add South African and other regional tax incentives
INSERT INTO tax_incentives (id, name, description, region, category, percentage_credit, max_credit, eligibility_criteria, is_active) VALUES
-- South Africa
('za-section-12l', 'Section 12L Energy Efficiency Tax Incentive', 'R0.95 per kWh saved through energy efficiency improvements', 'za', 'energy', 95, 18000000, ARRAY['Achieve measurable energy savings', 'Submit application to SANEDI', 'Obtain M&V report from approved provider'], true),
('za-section-12b', 'Section 12B Renewable Energy Depreciation', '50% accelerated depreciation in year 1 for renewable energy equipment', 'za', 'energy', 50, 50000000, ARRAY['Install renewable energy equipment', 'Equipment must be new', 'Used for business purposes'], true),
('za-carbon-tax-allowance', 'Carbon Tax Basic Tax-Free Allowance', '60% tax-free allowance on carbon emissions', 'za', 'carbon', 60, 10000000, ARRAY['Register as carbon taxpayer', 'Submit annual emissions report', 'Comply with reporting requirements'], true),
('za-green-building-incentive', 'Green Building Tax Incentive', 'Deduction for costs of green-rated buildings', 'za', 'general', 55, 25000000, ARRAY['Achieve Green Star SA rating', 'Building must be certified', 'Submit certification to SARS'], true),

-- Nigeria
('ng-renewable-energy-credit', 'Pioneer Status Tax Holiday', '100% tax holiday for renewable energy projects', 'ng', 'energy', 100, 500000000, ARRAY['Invest in renewable energy', 'Register with NIPC', 'Meet minimum investment threshold'], true),

-- Kenya
('ke-vat-exemption', 'VAT Exemption on Solar Equipment', 'VAT exemption on solar and renewable energy equipment', 'ke', 'energy', 16, 10000000, ARRAY['Purchase certified solar equipment', 'Equipment for business use'], true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- UPDATE USER SETTINGS DEFAULT CURRENCY
-- ============================================

-- Update default currency in user_settings to ZAR
UPDATE user_settings SET currency_code = 'ZAR', exchange_rate = 1.0 WHERE currency_code = 'USD';

-- ============================================
-- CREATE INDEX FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_regional_cost_factors_region ON regional_cost_factors(region_code);
CREATE INDEX IF NOT EXISTS idx_tax_incentives_region ON tax_incentives(region);

