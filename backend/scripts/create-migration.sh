#!/bin/bash

# Script to create a new database migration
# Usage: ./scripts/create-migration.sh "migration_description"

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if description is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Migration description is required${NC}"
    echo -e "${YELLOW}Usage: ./scripts/create-migration.sh \"migration_description\"${NC}"
    echo -e "${YELLOW}Example: ./scripts/create-migration.sh \"add_user_preferences\"${NC}"
    exit 1
fi

DESCRIPTION=$1
TIMESTAMP=$(date +%s)
MIGRATION_DIR="src/migrations"

# Get the next migration number
LAST_MIGRATION=$(ls -1 ${MIGRATION_DIR}/*.sql 2>/dev/null | grep -E '^[0-9]+_' | tail -1 | sed 's/.*\/\([0-9]*\)_.*/\1/')
if [ -z "$LAST_MIGRATION" ]; then
    NEXT_NUMBER="001"
else
    NEXT_NUMBER=$(printf "%03d" $((10#$LAST_MIGRATION + 1)))
fi

# Create migration filename
FILENAME="${NEXT_NUMBER}_${DESCRIPTION}.sql"
FILEPATH="${MIGRATION_DIR}/${FILENAME}"

# Create migration file with template
cat > "${FILEPATH}" << 'EOF'
-- Migration: ${DESCRIPTION}
-- Created: $(date)
-- Description: Add your migration description here

-- ============================================
-- UP Migration
-- ============================================

-- Add your schema changes here
-- Example:
-- CREATE TABLE IF NOT EXISTS example_table (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE INDEX IF NOT EXISTS idx_example_name ON example_table(name);


-- ============================================
-- Rollback (for reference - not auto-executed)
-- ============================================

-- Add rollback commands here for documentation
-- Example:
-- DROP TABLE IF EXISTS example_table;

EOF

# Replace placeholders
sed -i.bak "s/\${DESCRIPTION}/${DESCRIPTION}/g" "${FILEPATH}"
sed -i.bak "s/\$(date)/$(date)/g" "${FILEPATH}"
rm "${FILEPATH}.bak"

echo -e "${GREEN}✅ Migration created successfully!${NC}"
echo -e "${BLUE}📄 File: ${FILEPATH}${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Edit the migration file: ${FILEPATH}"
echo -e "2. Add your SQL schema changes"
echo -e "3. Test locally: npm run migrate"
echo -e "4. Commit the migration file to git"
echo ""
echo -e "${YELLOW}To apply the migration:${NC}"
echo -e "  Local:      npm run migrate"
echo -e "  Docker:     docker-compose restart backend"
echo -e "  Production: ./scripts/deploy-migration.sh"

