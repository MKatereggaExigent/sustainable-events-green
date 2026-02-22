#!/usr/bin/env bash
# entrypoint.sh - Docker entrypoint script

set -e

echo "Starting EventCarbon Backend..."

# Wait for database
echo "Waiting for PostgreSQL..."
/app/scripts/wait-for-it.sh "${DB_HOST:-db}:${DB_PORT:-5432}" -t 60

# Wait for Redis
echo "Waiting for Redis..."
/app/scripts/wait-for-it.sh "${REDIS_HOST:-redis}:${REDIS_PORT:-6379}" -t 30

# Run migrations
echo "Running database migrations..."
npm run migrate

# Check if seeding is needed (first run)
if [ "$RUN_SEEDS" = "true" ]; then
  echo "Running seed data..."
  npm run seed
fi

# Start the application
echo "Starting server..."
exec npm start

