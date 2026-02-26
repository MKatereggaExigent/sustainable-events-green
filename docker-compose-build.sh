#!/usr/bin/env bash

# EcobServe Docker Compose Build Script
# Run this script on the server to build all Docker containers
# After building, run deploy_to_caprover.sh to deploy to CapRover

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}🐳 EcobServe Docker Compose Build${NC}"
echo "======================================"
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if Docker is running
echo -e "${YELLOW}🔍 Checking Docker status...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"

# Check if docker-compose is available
echo -e "${YELLOW}🔍 Checking docker-compose...${NC}"
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo -e "${RED}❌ docker-compose is not installed. Please install it and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Using: $COMPOSE_CMD${NC}"

# Step 1: Stop existing containers (if any)
echo ""
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
$COMPOSE_CMD down --remove-orphans 2>/dev/null || true
echo -e "${GREEN}✅ Containers stopped${NC}"

# Step 2: Remove old images (optional - uncomment if you want fresh builds)
# echo ""
# echo -e "${YELLOW}🧹 Removing old images...${NC}"
# docker rmi sustainable-events-green-frontend sustainable-events-green-backend 2>/dev/null || true
# echo -e "${GREEN}✅ Old images removed${NC}"

# Step 3: Pull latest base images
echo ""
echo -e "${YELLOW}📥 Pulling latest base images...${NC}"
docker pull postgres:16-alpine
docker pull redis:7-alpine
docker pull node:20-alpine
docker pull nginx:alpine
echo -e "${GREEN}✅ Base images updated${NC}"

# Step 4: Build all containers
echo ""
echo -e "${BLUE}🔨 Building all containers...${NC}"
echo ""
$COMPOSE_CMD build --no-cache
echo ""
echo -e "${GREEN}✅ All containers built successfully${NC}"

# Step 5: Start all containers
echo ""
echo -e "${BLUE}🚀 Starting all containers...${NC}"
$COMPOSE_CMD up -d
echo ""

# Step 6: Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 5

# Check container status
echo ""
echo -e "${CYAN}📊 Container Status:${NC}"
echo "-------------------"
$COMPOSE_CMD ps

# Step 7: Show logs summary
echo ""
echo -e "${CYAN}📋 Recent logs (last 10 lines per service):${NC}"
echo "---------------------------------------------"
echo -e "${YELLOW}Database:${NC}"
docker logs ecobserve-db --tail 5 2>&1 || echo "No logs available"
echo ""
echo -e "${YELLOW}Redis:${NC}"
docker logs ecobserve-redis --tail 5 2>&1 || echo "No logs available"
echo ""
echo -e "${YELLOW}Backend:${NC}"
docker logs ecobserve-backend --tail 5 2>&1 || echo "No logs available"
echo ""
echo -e "${YELLOW}Frontend:${NC}"
docker logs ecobserve-frontend --tail 5 2>&1 || echo "No logs available"

# Step 8: Health check
echo ""
echo -e "${YELLOW}🏥 Running health checks...${NC}"
sleep 3

# Check frontend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8065 | grep -q "200"; then
    echo -e "${GREEN}✅ Frontend is healthy (http://localhost:8065)${NC}"
else
    echo -e "${RED}⚠️  Frontend may not be ready yet${NC}"
fi

# Check backend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8035/api/health 2>/dev/null | grep -q "200"; then
    echo -e "${GREEN}✅ Backend is healthy (http://localhost:8035)${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check endpoint not responding (may still be starting)${NC}"
fi

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Docker Compose Build Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}Services running:${NC}"
echo -e "  📦 PostgreSQL:  localhost:8055"
echo -e "  📦 Redis:       localhost:8095"
echo -e "  📦 Backend:     localhost:8035"
echo -e "  📦 Frontend:    localhost:8065"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Verify the app is working: ${CYAN}http://localhost:8065${NC}"
echo -e "  2. Deploy to CapRover: ${CYAN}./deploy_to_caprover.sh${NC}"
echo ""

