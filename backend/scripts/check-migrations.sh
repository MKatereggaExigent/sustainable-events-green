#!/bin/bash

# Script to check migration status
# Usage: ./scripts/check-migrations.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Database Migration Status${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

# Check if database container is running
if ! docker ps | grep -q ecobserve-db; then
    echo -e "${RED}❌ Database container is not running${NC}"
    echo -e "${YELLOW}Start it with: docker-compose up -d db${NC}"
    exit 1
fi

echo -e "${CYAN}📋 Applied Migrations:${NC}"
echo ""
docker exec ecobserve-db psql -U postgres -d ecobserve -c "SELECT id, name, applied_at FROM migrations ORDER BY id;" 2>/dev/null || {
    echo -e "${RED}❌ Could not connect to database${NC}"
    exit 1
}

echo ""
echo -e "${CYAN}📁 Migration Files:${NC}"
echo ""

if [ -d "src/migrations" ]; then
    ls -1 src/migrations/*.sql 2>/dev/null | while read file; do
        filename=$(basename "$file")
        # Check if this migration is applied
        if docker exec ecobserve-db psql -U postgres -d ecobserve -t -c "SELECT 1 FROM migrations WHERE name = '$filename';" 2>/dev/null | grep -q 1; then
            echo -e "  ${GREEN}✅ $filename${NC}"
        else
            echo -e "  ${YELLOW}⏳ $filename (pending)${NC}"
        fi
    done
else
    echo -e "${RED}❌ Migration directory not found${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"

# Count pending migrations
TOTAL_FILES=$(ls -1 src/migrations/*.sql 2>/dev/null | wc -l | tr -d ' ')
APPLIED_COUNT=$(docker exec ecobserve-db psql -U postgres -d ecobserve -t -c "SELECT COUNT(*) FROM migrations;" 2>/dev/null | tr -d ' ')
PENDING_COUNT=$((TOTAL_FILES - APPLIED_COUNT))

if [ "$PENDING_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  You have $PENDING_COUNT pending migration(s)${NC}"
    echo -e "${YELLOW}Run: ./scripts/deploy-migration.sh${NC}"
else
    echo -e "${GREEN}✅ All migrations are up to date!${NC}"
fi

echo ""

