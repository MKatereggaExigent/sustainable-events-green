# Database Migration Scripts

This directory contains automated scripts for managing database migrations in the EcobServe project.

## 📋 Available Scripts

### 1. `create-migration.sh` - Create New Migration
Creates a new migration file with a template and automatic numbering.

**Usage:**
```bash
./scripts/create-migration.sh "migration_description"
```

**Example:**
```bash
./scripts/create-migration.sh "add_user_preferences"
```

**Output:**
- Creates: `src/migrations/XXX_add_user_preferences.sql`
- Auto-increments migration number (001, 002, 003, etc.)
- Includes template with UP and rollback sections

---

### 2. `deploy-migration.sh` - Deploy Migrations to Production
Deploys all pending migrations to the production environment.

**Usage:**
```bash
./scripts/deploy-migration.sh
```

**What it does:**
1. ✅ Builds the backend TypeScript code
2. ✅ Rebuilds the Docker image with new migrations
3. ✅ Stops the backend container
4. ✅ Starts the backend (migrations run automatically)
5. ✅ Shows migration logs and status

---

## 🔄 Migration Workflow

### Local Development

1. **Create a new migration:**
   ```bash
   cd backend
   ./scripts/create-migration.sh "add_new_feature"
   ```

2. **Edit the migration file:**
   ```bash
   # File created at: src/migrations/XXX_add_new_feature.sql
   # Add your SQL schema changes
   ```

3. **Test locally:**
   ```bash
   npm run migrate
   ```

4. **Verify migration:**
   ```bash
   npm run db:check
   # Or manually:
   psql -U postgres -d ecobserve -c "SELECT * FROM migrations;"
   ```

---

### Production Deployment

1. **Commit your migration:**
   ```bash
   git add src/migrations/XXX_add_new_feature.sql
   git commit -m "Add migration: add_new_feature"
   git push origin test-development
   ```

2. **SSH to production server:**
   ```bash
   ssh aidocumines@datasqan
   cd ~/ecobserve
   ```

3. **Pull latest code:**
   ```bash
   git pull origin test-development
   ```

4. **Deploy migration:**
   ```bash
   cd backend
   ./scripts/deploy-migration.sh
   ```

5. **Verify deployment:**
   ```bash
   docker exec ecobserve-db psql -U postgres -d ecobserve -c "SELECT * FROM migrations ORDER BY id;"
   docker-compose logs backend | grep -i migration
   ```

---

## 🛠️ Manual Migration Commands

### Check Migration Status
```bash
docker exec ecobserve-db psql -U postgres -d ecobserve -c "SELECT * FROM migrations ORDER BY id;"
```

### Manually Mark Migration as Complete
```bash
docker exec -i ecobserve-db psql -U postgres -d ecobserve << 'EOF'
INSERT INTO migrations (name, applied_at) 
VALUES ('XXX_migration_name.sql', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;
EOF
```

### View Migration Logs
```bash
docker-compose logs backend | grep -i migration
```

### Rollback (Manual - Not Automated)
```bash
# Migrations don't auto-rollback
# Use the rollback section in the migration file as reference
# Execute rollback SQL manually if needed
docker exec -i ecobserve-db psql -U postgres -d ecobserve < rollback.sql
```

---

## 📝 Migration File Template

When you create a migration, it includes this template:

```sql
-- Migration: migration_description
-- Created: 2026-03-21
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
```

---

## ⚠️ Best Practices

1. **Always use `IF NOT EXISTS`** for CREATE statements
2. **Always use `IF EXISTS`** for DROP statements
3. **Test migrations locally first**
4. **Include rollback SQL for documentation**
5. **Use descriptive migration names**
6. **One logical change per migration**
7. **Never edit applied migrations** - create a new one instead

---

## 🐛 Troubleshooting

### Migration Already Exists Error
```
error: relation "table_name" already exists
```

**Solution:** Mark the migration as complete manually:
```bash
docker exec -i ecobserve-db psql -U postgres -d ecobserve << 'EOF'
INSERT INTO migrations (name, applied_at) 
VALUES ('XXX_migration_name.sql', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;
EOF
```

### Backend Crash Loop
Check logs:
```bash
docker-compose logs backend | tail -50
```

Common causes:
- Migration syntax error
- Missing table/column
- Constraint violation

### Permission Denied on Scripts
Make scripts executable:
```bash
chmod +x scripts/*.sh
```

---

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Migration Best Practices](https://www.postgresql.org/docs/current/ddl-alter.html)
- [Docker Compose Reference](https://docs.docker.com/compose/)

