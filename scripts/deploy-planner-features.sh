#!/bin/bash

# Deploy Planner Tier Features
# This script deploys all new Planner tier features to production

set -e

echo "🚀 Deploying Planner Tier Features..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Run database migrations
echo -e "${BLUE}📊 Step 1: Running database migrations...${NC}"
docker exec ecobserve-db psql -U postgres -d ecobserve < backend/src/migrations/009_planner_tier_features.sql
docker exec ecobserve-db psql -U postgres -d ecobserve < backend/src/migrations/010_update_subscription_plans.sql
echo -e "${GREEN}✅ Migrations completed${NC}"

# Step 2: Install backend dependencies
echo -e "${BLUE}📦 Step 2: Installing backend dependencies...${NC}"
cd backend
npm install
cd ..
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 3: Build backend
echo -e "${BLUE}🔨 Step 3: Building backend...${NC}"
docker-compose build backend
echo -e "${GREEN}✅ Backend built${NC}"

# Step 4: Build frontend
echo -e "${BLUE}🔨 Step 4: Building frontend...${NC}"
docker-compose build frontend
echo -e "${GREEN}✅ Frontend built${NC}"

# Step 5: Restart services
echo -e "${BLUE}🔄 Step 5: Restarting services...${NC}"
docker-compose up -d backend frontend
echo -e "${GREEN}✅ Services restarted${NC}"

# Step 6: Verify services are running
echo -e "${BLUE}🔍 Step 6: Verifying services...${NC}"
sleep 5
docker-compose ps

# Step 7: Check backend health
echo -e "${BLUE}🏥 Step 7: Checking backend health...${NC}"
curl -f http://localhost:8035/api/health || echo -e "${YELLOW}⚠️  Backend health check failed${NC}"

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Don't forget to:${NC}"
echo "1. Add your OpenAI API key to backend/.env:"
echo "   OPENAI_API_KEY=sk-your-actual-key"
echo ""
echo "2. Seed initial data (run in backend container):"
echo "   docker exec -it ecobserve-backend npm run seed"
echo ""
echo "3. Test the new endpoints:"
echo "   - POST /api/planner/ai-recommendations"
echo "   - POST /api/planner/certificate"
echo "   - POST /api/planner/tax-incentives"
echo "   - GET /api/planner/carbon-offsets"
echo "   - GET /api/planner/suppliers/search"
echo "   - POST /api/planner/benchmarks/compare"
echo ""
echo -e "${BLUE}📖 See PLANNER_TIER_IMPLEMENTATION.md for full documentation${NC}"

