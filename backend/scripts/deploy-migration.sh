#!/bin/bash

# Script to deploy migrations to production
# Usage: ./scripts/deploy-migration.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Database Migration Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must be run from the backend directory${NC}"
    exit 1
fi

# Check for pending migrations
PENDING_MIGRATIONS=$(ls -1 src/migrations/*.sql 2>/dev/null | wc -l)
echo -e "${YELLOW}📋 Found ${PENDING_MIGRATIONS} migration files${NC}"
echo ""

# Show what will be deployed
echo -e "${YELLOW}Migration files:${NC}"
ls -1 src/migrations/*.sql | while read file; do
    echo -e "  - $(basename $file)"
done
echo ""

# Confirm deployment
read -p "$(echo -e ${YELLOW}Do you want to deploy these migrations? [y/N]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Deployment cancelled${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 Starting deployment...${NC}"
echo ""

# Step 1: Install dependencies
echo -e "${YELLOW}Step 1/5: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 2: Build the backend
echo -e "${YELLOW}Step 2/5: Building backend...${NC}"
npm run build
echo -e "${GREEN}✅ Build complete${NC}"
echo ""

# Step 3: Rebuild Docker image
echo -e "${YELLOW}Step 3/5: Rebuilding Docker image...${NC}"
cd ..
docker-compose build --no-cache backend
echo -e "${GREEN}✅ Docker image rebuilt${NC}"
echo ""

# Step 4: Stop backend container
echo -e "${YELLOW}Step 4/5: Stopping backend container...${NC}"
docker-compose stop backend
echo -e "${GREEN}✅ Backend stopped${NC}"
echo ""

# Step 5: Start backend (migrations will run automatically)
echo -e "${YELLOW}Step 5/5: Starting backend with migrations...${NC}"
docker-compose up -d backend
echo -e "${GREEN}✅ Backend started${NC}"
echo ""

# Wait for backend to be ready
echo -e "${YELLOW}⏳ Waiting for backend to be ready...${NC}"
sleep 5

# Check logs for migration status
echo -e "${YELLOW}📋 Migration logs:${NC}"
docker-compose logs backend | grep -i "migration" | tail -20
echo ""

# Check if backend is running
if docker-compose ps backend | grep -q "Up"; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  ✅ Deployment Successful!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "1. Verify migrations: docker exec ecobserve-db psql -U postgres -d ecobserve -c 'SELECT * FROM migrations ORDER BY id;'"
    echo -e "2. Check backend logs: docker-compose logs -f backend"
    echo -e "3. Test your endpoints"
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}  ❌ Deployment Failed!${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Check logs for errors:${NC}"
    echo -e "  docker-compose logs backend"
    exit 1
fi

