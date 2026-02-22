#!/usr/bin/env bash

# EventCarbon CapRover Deployment Script
# This builds the frontend and deploys it to CapRover
# Port options available: 8065, 8035, 8055, 8095

set -e

# ============================================
# CONFIGURATION - Update these for your setup
# ============================================
CAPROVER_NAME="aidoc-server"           # Your CapRover server name (run: caprover list)
CAPROVER_APP="eventcarbon"              # CapRover app name
APP_PORT="8065"                         # Local Docker port (options: 8065, 8035, 8055, 8095)
TAR_FILE="eventcarbon-frontend.tar.gz"  # Deployment artifact name

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}🚀 EventCarbon CapRover Deployment${NC}"
echo "================================="
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Step 1: Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf dist
rm -f ~/"$TAR_FILE"

# Step 2: Fix permissions if node_modules was created by Docker/root
if [ -d "node_modules" ]; then
    echo -e "${YELLOW}🔧 Checking node_modules permissions...${NC}"
    if [ ! -w "node_modules" ]; then
        echo -e "${YELLOW}🔧 Fixing node_modules permissions...${NC}"
        sudo chown -R $(whoami):$(whoami) node_modules 2>/dev/null || rm -rf node_modules
    fi
fi

# Step 3: Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install || { echo -e "${RED}❌ npm install failed${NC}"; exit 1; }

# Step 4: Build the React/Vite project
echo -e "${BLUE}🔨 Building React frontend...${NC}"
npm run build || { echo -e "${RED}❌ Frontend build failed${NC}"; exit 1; }

# Step 5: Navigate to dist folder
DIST_DIR="dist"
if [ ! -d "$DIST_DIR" ]; then
    echo -e "${RED}❌ Build output directory '$DIST_DIR' not found${NC}"
    exit 1
fi
cd "$DIST_DIR"

# Step 6: Create captain-definition for CapRover
echo -e "${YELLOW}📝 Creating captain-definition...${NC}"
cat <<EOF > captain-definition
{
  "schemaVersion": 2,
  "dockerfilePath": "./Dockerfile"
}
EOF

# Step 7: Create production Dockerfile
echo -e "${YELLOW}📝 Creating Dockerfile...${NC}"
cat <<EOF > Dockerfile
FROM nginx:stable-alpine
COPY . /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Step 8: Create nginx configuration for SPA
echo -e "${YELLOW}📝 Creating nginx.conf...${NC}"
cat <<'EOF' > nginx.conf
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html index.htm;

    # Frontend - React SPA with client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static file caching
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg|webp|avif)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # Cache busting for versioned assets
    location ~* ^/assets/ {
        expires 1y;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml image/svg+xml;

    # Health check endpoint
    location = /health {
        access_log off;
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
EOF

# Step 9: Create deployment tarball
echo -e "${BLUE}📦 Packaging into ${TAR_FILE}...${NC}"
tar -czf ~/"$TAR_FILE" ./* || { echo -e "${RED}❌ Failed to create tar.gz${NC}"; exit 1; }

echo -e "${GREEN}✅ Tarball created at: ~/${TAR_FILE}${NC}"
echo ""

# Step 10: Deploy to CapRover
echo -e "${BLUE}🚀 Deploying to CapRover...${NC}"
caprover deploy \
  --caproverName "$CAPROVER_NAME" \
  --caproverApp "$CAPROVER_APP" \
  --tarFile ~/"$TAR_FILE"

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${BLUE}🌐 Visit: https://${CAPROVER_APP}.aidocumines.com${NC}"
echo ""

