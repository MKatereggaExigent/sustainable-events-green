#!/bin/bash

# Deploy Planner Tier Backend Features
# Run this on the production server after pulling the latest code

set -e

echo "🚀 Deploying Planner Tier Backend Features..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Install backend dependencies
echo -e "${BLUE}📦 Step 1: Installing backend dependencies...${NC}"
cd backend
npm install
cd ..
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 2: Run database migrations
echo -e "${BLUE}📊 Step 2: Running database migrations...${NC}"

# Migration 009: Planner tier features
echo "Running migration 009..."
docker exec ecobserve-db psql -U postgres -d ecobserve << 'EOF'
-- Migration 009: Planner Tier Features

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    sustainability_score INTEGER,
    carbon_saved_kg DECIMAL(10, 2),
    achievements JSONB,
    pdf_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tax incentives table
CREATE TABLE IF NOT EXISTS tax_incentives (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    carbon_reduction_kg DECIMAL(10, 2) NOT NULL,
    investment_amount_zar DECIMAL(12, 2),
    section_12l_deduction DECIMAL(12, 2),
    section_12b_allowance DECIMAL(12, 2),
    total_tax_benefit DECIMAL(12, 2),
    tax_year VARCHAR(20),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Carbon offsets table
CREATE TABLE IF NOT EXISTS carbon_offsets (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    project_type VARCHAR(100),
    location VARCHAR(255),
    certification VARCHAR(100),
    price_per_ton_zar DECIMAL(10, 2) NOT NULL,
    available_tons DECIMAL(10, 2) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offset purchases table
CREATE TABLE IF NOT EXISTS offset_purchases (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    offset_id INTEGER REFERENCES carbon_offsets(id),
    tons_purchased DECIMAL(10, 2) NOT NULL,
    total_cost_zar DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    carbon_score INTEGER CHECK (carbon_score >= 0 AND carbon_score <= 100),
    sustainability_rating VARCHAR(10),
    certifications TEXT[],
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website_url TEXT,
    description TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event suppliers junction table
CREATE TABLE IF NOT EXISTS event_suppliers (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    category VARCHAR(100),
    cost_zar DECIMAL(12, 2),
    carbon_impact_kg DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, supplier_id, category)
);

-- Industry benchmarks table
CREATE TABLE IF NOT EXISTS industry_benchmarks (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    attendee_range VARCHAR(50) NOT NULL,
    avg_carbon_per_attendee DECIMAL(10, 2),
    avg_water_per_attendee DECIMAL(10, 2),
    avg_waste_per_attendee DECIMAL(10, 2),
    avg_sustainability_score INTEGER,
    sample_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_type, attendee_range)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_certificates_event ON certificates(event_id);
CREATE INDEX IF NOT EXISTS idx_tax_incentives_event ON tax_incentives(event_id);
CREATE INDEX IF NOT EXISTS idx_offset_purchases_event ON offset_purchases(event_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);
CREATE INDEX IF NOT EXISTS idx_suppliers_carbon_score ON suppliers(carbon_score);
CREATE INDEX IF NOT EXISTS idx_event_suppliers_event ON event_suppliers(event_id);
CREATE INDEX IF NOT EXISTS idx_benchmarks_type_range ON industry_benchmarks(event_type, attendee_range);
EOF

echo -e "${GREEN}✅ Migration 009 completed${NC}"

# Migration 010: Update subscription plans
echo "Running migration 010..."
docker exec ecobserve-db psql -U postgres -d ecobserve << 'EOF'
-- Migration 010: Update Subscription Plans

-- Update Explorer Plan (Free)
UPDATE subscription_plans
SET 
    max_events = 1,
    features = '[
        "Pre-Assessment Wizard",
        "Event Footprint Calculator (1 event/month)",
        "Basic carbon, water, waste calculations",
        "Simple sustainability score",
        "View calculation results"
    ]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE code = 'explorer';

-- Update Planner Plan (R499/month, 6 events/year)
UPDATE subscription_plans
SET 
    max_events = 6,
    features = '[
        "Everything in Explorer",
        "6 event calculations per year",
        "Cost & Savings Calculator with ROI",
        "Save & manage events (My Events)",
        "Smart AI-powered recommendations (GPT)",
        "Green Score Card certificates",
        "Tax Incentive Calculator (SA)",
        "Carbon Offset Marketplace",
        "Supplier Carbon Tracking",
        "Benchmark Comparison",
        "Priority email support"
    ]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE code = 'planner';
EOF

echo -e "${GREEN}✅ Migration 010 completed${NC}"

# Step 3: Rebuild backend container
echo -e "${BLUE}🔨 Step 3: Rebuilding backend container...${NC}"
docker-compose build backend
echo -e "${GREEN}✅ Backend rebuilt${NC}"

# Step 4: Restart backend
echo -e "${BLUE}🔄 Step 4: Restarting backend...${NC}"
docker-compose up -d backend
echo -e "${GREEN}✅ Backend restarted${NC}"

# Step 5: Wait for backend to be ready
echo -e "${BLUE}⏳ Step 5: Waiting for backend to be ready...${NC}"
sleep 10

# Step 6: Seed initial data
echo -e "${BLUE}🌱 Step 6: Seeding initial data...${NC}"

docker exec ecobserve-db psql -U postgres -d ecobserve << 'EOF'
-- Seed Carbon Offset Projects
INSERT INTO carbon_offsets (project_name, project_type, location, certification, price_per_ton_zar, available_tons, description)
VALUES 
    ('Kruger National Park Reforestation', 'reforestation', 'Mpumalanga, South Africa', 'Gold Standard', 180, 10000, 'Indigenous tree planting project in the Greater Kruger area, supporting biodiversity and local communities.'),
    ('Cape Town Wind Farm', 'renewable_energy', 'Western Cape, South Africa', 'VCS', 220, 5000, 'Offshore wind energy project reducing reliance on coal-powered electricity.'),
    ('Durban Mangrove Restoration', 'blue_carbon', 'KwaZulu-Natal, South Africa', 'Gold Standard', 250, 3000, 'Coastal mangrove restoration project protecting marine ecosystems and sequestering carbon.')
ON CONFLICT DO NOTHING;

-- Seed Suppliers
INSERT INTO suppliers (name, category, location, carbon_score, sustainability_rating, certifications, contact_email, website_url, description, is_verified)
VALUES 
    ('The Green Venue', 'venue', 'Cape Town, Western Cape', 92, 'A+', ARRAY['ISO 14001', 'Green Building Council SA'], 'info@greenvenue.co.za', 'https://greenvenue.co.za', '100% solar-powered event venue with rainwater harvesting', true),
    ('Eco Conference Center', 'venue', 'Johannesburg, Gauteng', 88, 'A', ARRAY['ISO 14001', 'LEED Gold'], 'bookings@ecoconf.co.za', NULL, 'Energy-efficient venue with waste-to-energy systems', true),
    ('Plant-Based Catering Co', 'catering', 'Durban, KwaZulu-Natal', 95, 'A+', ARRAY['Organic SA', 'Fair Trade'], 'hello@plantbasedcatering.co.za', NULL, '100% plant-based menus using local organic ingredients', true),
    ('Sustainable Events Catering', 'catering', 'Pretoria, Gauteng', 85, 'A', ARRAY['ISO 22000'], 'info@sustainablecatering.co.za', NULL, 'Zero-waste catering with compostable packaging', true),
    ('Green Fleet Shuttles', 'transport', 'Cape Town, Western Cape', 90, 'A+', ARRAY['Carbon Neutral Certified'], 'bookings@greenfleet.co.za', NULL, 'Electric and hybrid vehicle fleet for event transport', true)
ON CONFLICT DO NOTHING;

-- Seed Industry Benchmarks
INSERT INTO industry_benchmarks (event_type, attendee_range, avg_carbon_per_attendee, avg_water_per_attendee, avg_waste_per_attendee, avg_sustainability_score, sample_size)
VALUES 
    ('conference', '0-50', 35, 100, 1.8, 60, 100),
    ('conference', '51-200', 42, 130, 2.2, 58, 100),
    ('conference', '201-500', 48, 150, 2.5, 55, 100),
    ('conference', '500+', 55, 180, 3.0, 52, 100),
    ('wedding', '0-50', 50, 200, 3.5, 50, 100),
    ('wedding', '51-200', 60, 250, 4.0, 48, 100),
    ('corporate', '0-50', 30, 90, 1.5, 65, 100),
    ('corporate', '51-200', 38, 120, 2.0, 62, 100)
ON CONFLICT DO NOTHING;
EOF

echo -e "${GREEN}✅ Initial data seeded${NC}"

# Step 7: Verify deployment
echo -e "${BLUE}🔍 Step 7: Verifying deployment...${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Add your OpenAI API key to backend/.env:${NC}"
echo "   OPENAI_API_KEY=sk-your-actual-key"
echo ""
echo -e "${BLUE}📖 See PLANNER_TIER_IMPLEMENTATION.md for full documentation${NC}"

