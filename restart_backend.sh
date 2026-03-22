#!/bin/bash

# Quick script to restart backend after migration fixes

set -e

echo "🔄 Restarting backend with migration fixes..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull

# Rebuild backend
echo "🔨 Rebuilding backend..."
docker-compose build backend

# Restart backend
echo "🔄 Restarting backend..."
docker-compose stop backend
docker-compose rm -f backend
docker-compose up -d backend

# Wait for startup
echo "⏳ Waiting for backend to start..."
sleep 10

# Check status
echo "📊 Backend status:"
docker-compose ps backend

# Check logs
echo ""
echo "📋 Recent logs:"
docker-compose logs backend | tail -30

echo ""
echo "✅ Backend restarted!"

