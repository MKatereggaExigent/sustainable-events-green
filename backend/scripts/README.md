# 🚀 EcobServe Backend Scripts

Automated scripts for managing database migrations and deployments.

## 📁 Available Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| `create-migration.sh` | Create a new migration file | `./scripts/create-migration.sh "description"` |
| `check-migrations.sh` | Check migration status | `./scripts/check-migrations.sh` |
| `deploy-migration.sh` | Deploy migrations to production | `./scripts/deploy-migration.sh` |

---

## 🎯 Quick Start

### 1. Create a New Migration

```bash
# Using the script directly
./scripts/create-migration.sh "add_user_preferences"

# Or using npm
npm run migrate:create "add_user_preferences"
```

**Output:**
```
✅ Migration created successfully!
📄 File: src/migrations/007_add_user_preferences.sql
```

---

### 2. Edit the Migration

Open the created file and add your SQL:

```sql
-- Migration: add_user_preferences
-- Created: 2026-03-21
-- Description: Add user preferences table

-- ============================================
-- UP Migration
-- ============================================

CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(50) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- ============================================
-- Rollback (for reference - not auto-executed)
-- ============================================

-- DROP TABLE IF EXISTS user_preferences;
```

---

### 3. Test Locally

```bash
# Build and run migrations
npm run build
npm run migrate

# Or in development mode
npm run migrate:dev
```

---

### 4. Check Migration Status

```bash
# Using the script
./scripts/check-migrations.sh

# Or using npm
npm run migrate:check
```

**Output:**
```
========================================
  Database Migration Status
========================================

📋 Applied Migrations:

 id |             name              |          applied_at
----+-------------------------------+-------------------------------
  1 | 001_initial_schema.sql        | 2026-03-16 04:33:41.835468+00
  2 | 002_payment_subscriptions.sql | 2026-03-16 04:33:41.999552+00
  ...

📁 Migration Files:

  ✅ 001_initial_schema.sql
  ✅ 002_payment_subscriptions.sql
  ⏳ 007_add_user_preferences.sql (pending)

========================================
⚠️  You have 1 pending migration(s)
Run: ./scripts/deploy-migration.sh
```

---

### 5. Deploy to Production

```bash
# SSH to production server
ssh aidocumines@datasqan
cd ~/ecobserve

# Pull latest code
git pull origin test-development

# Deploy migrations
cd backend
./scripts/deploy-migration.sh

# Or using npm
npm run migrate:deploy
```

---

## 📚 Detailed Documentation

For comprehensive documentation, see [MIGRATIONS.md](./MIGRATIONS.md)

Topics covered:
- Migration workflow
- Best practices
- Troubleshooting
- Manual commands
- Rollback procedures

---

## 🔧 NPM Scripts

All scripts are also available as npm commands:

```bash
# Create a new migration
npm run migrate:create "description"

# Check migration status
npm run migrate:check

# Deploy migrations (production)
npm run migrate:deploy

# Run migrations (local)
npm run migrate

# Run migrations (development)
npm run migrate:dev
```

---

## ⚡ Examples

### Example 1: Add a New Table

```bash
# Create migration
./scripts/create-migration.sh "add_notifications_table"

# Edit src/migrations/XXX_add_notifications_table.sql
# Add your CREATE TABLE statement

# Test locally
npm run migrate:dev

# Commit and deploy
git add src/migrations/XXX_add_notifications_table.sql
git commit -m "Add notifications table"
git push origin test-development

# Deploy to production
ssh aidocumines@datasqan
cd ~/ecobserve/backend
./scripts/deploy-migration.sh
```

### Example 2: Add a Column to Existing Table

```bash
# Create migration
./scripts/create-migration.sh "add_email_verified_to_users"

# Edit the migration file
# Add: ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

# Test and deploy
npm run migrate:dev
git add . && git commit -m "Add email_verified column"
git push origin test-development
```

### Example 3: Create an Index

```bash
# Create migration
./scripts/create-migration.sh "add_index_users_email"

# Edit the migration file
# Add: CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

# Test and deploy
npm run migrate:dev
```

---

## 🛡️ Safety Features

All scripts include:
- ✅ **Automatic numbering** - No conflicts
- ✅ **Idempotent SQL** - Safe to run multiple times
- ✅ **Rollback documentation** - Easy to undo changes
- ✅ **Status checking** - Know what's applied
- ✅ **Error handling** - Clear error messages
- ✅ **Confirmation prompts** - Prevent accidents

---

## 🐛 Troubleshooting

### Script Permission Denied

```bash
chmod +x scripts/*.sh
```

### Migration Already Applied

The migration system tracks applied migrations. If you see "already exists" errors, the migration was partially applied. Mark it as complete:

```bash
docker exec -i ecobserve-db psql -U postgres -d ecobserve << 'EOF'
INSERT INTO migrations (name, applied_at) 
VALUES ('XXX_migration_name.sql', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;
EOF
```

### Backend Won't Start

Check logs:
```bash
docker-compose logs backend | tail -50
```

Common issues:
- SQL syntax error in migration
- Missing table/column reference
- Constraint violation

---

## 📞 Support

For issues or questions:
1. Check [MIGRATIONS.md](./MIGRATIONS.md) for detailed docs
2. Review migration logs: `docker-compose logs backend | grep migration`
3. Check database status: `npm run migrate:check`

---

**Happy Migrating! 🎉**

