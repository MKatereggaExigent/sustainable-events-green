-- Migration 009: Planner Tier Features
-- Add tables for all premium Planner features

-- 1. Green Score Card Certificates
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    sustainability_score INTEGER NOT NULL,
    carbon_footprint_kg DECIMAL(10, 2) NOT NULL,
    water_usage_liters DECIMAL(10, 2),
    waste_generated_kg DECIMAL(10, 2),
    issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pdf_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_certificates_event_id ON certificates(event_id);
CREATE INDEX idx_certificates_org_id ON certificates(organization_id);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);

-- 2. Tax Incentive Calculations (South Africa)
CREATE TABLE IF NOT EXISTS tax_incentives (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    carbon_reduction_kg DECIMAL(10, 2) NOT NULL,
    investment_amount_zar DECIMAL(12, 2) NOT NULL,
    section_12l_deduction DECIMAL(12, 2),
    section_12b_allowance DECIMAL(12, 2),
    total_tax_benefit DECIMAL(12, 2) NOT NULL,
    calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tax_year VARCHAR(10),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tax_incentives_event_id ON tax_incentives(event_id);
CREATE INDEX idx_tax_incentives_org_id ON tax_incentives(organization_id);

-- 3. Carbon Offset Marketplace
CREATE TABLE IF NOT EXISTS carbon_offsets (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    project_type VARCHAR(100) NOT NULL, -- reforestation, renewable_energy, etc.
    location VARCHAR(255) NOT NULL,
    certification VARCHAR(100), -- VCS, Gold Standard, etc.
    price_per_ton_zar DECIMAL(10, 2) NOT NULL,
    available_tons DECIMAL(10, 2) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_carbon_offsets_type ON carbon_offsets(project_type);
CREATE INDEX idx_carbon_offsets_active ON carbon_offsets(is_active);

-- 4. Carbon Offset Purchases
CREATE TABLE IF NOT EXISTS offset_purchases (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    offset_id INTEGER NOT NULL REFERENCES carbon_offsets(id),
    tons_purchased DECIMAL(10, 2) NOT NULL,
    total_cost_zar DECIMAL(12, 2) NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    certificate_url TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, cancelled
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offset_purchases_event_id ON offset_purchases(event_id);
CREATE INDEX idx_offset_purchases_org_id ON offset_purchases(organization_id);

-- 5. Supplier Carbon Tracking
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- venue, catering, transport, etc.
    location VARCHAR(255),
    carbon_score INTEGER, -- 0-100 score
    sustainability_rating VARCHAR(10), -- A+, A, B, C, D
    certifications TEXT[], -- array of certifications
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website_url TEXT,
    description TEXT,
    is_verified BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suppliers_category ON suppliers(category);
CREATE INDEX idx_suppliers_carbon_score ON suppliers(carbon_score);
CREATE INDEX idx_suppliers_verified ON suppliers(is_verified);

-- 6. Event Supplier Relationships
CREATE TABLE IF NOT EXISTS event_suppliers (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
    category VARCHAR(100) NOT NULL,
    cost_zar DECIMAL(12, 2),
    carbon_impact_kg DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, supplier_id, category)
);

CREATE INDEX idx_event_suppliers_event_id ON event_suppliers(event_id);
CREATE INDEX idx_event_suppliers_supplier_id ON event_suppliers(supplier_id);

-- 7. Industry Benchmarks
CREATE TABLE IF NOT EXISTS industry_benchmarks (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    attendee_range VARCHAR(50) NOT NULL, -- 0-50, 51-200, 201-500, 500+
    avg_carbon_per_attendee DECIMAL(10, 2) NOT NULL,
    avg_water_per_attendee DECIMAL(10, 2),
    avg_waste_per_attendee DECIMAL(10, 2),
    avg_sustainability_score INTEGER,
    sample_size INTEGER,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX idx_benchmarks_event_type ON industry_benchmarks(event_type);
CREATE INDEX idx_benchmarks_attendee_range ON industry_benchmarks(attendee_range);

-- 8. AI Recommendations (GPT-powered)
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    recommendations JSONB NOT NULL, -- array of AI-generated recommendations
    gpt_model VARCHAR(50),
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_cost_usd DECIMAL(10, 4),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_recommendations_event_id ON ai_recommendations(event_id);
CREATE INDEX idx_ai_recommendations_org_id ON ai_recommendations(organization_id);

