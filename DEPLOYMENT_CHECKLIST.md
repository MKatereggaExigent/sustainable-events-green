# Planner Tier Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. OpenAI API Setup
- [ ] Sign up at https://platform.openai.com
- [ ] Create API key
- [ ] Add to `backend/.env`:
  ```bash
  OPENAI_API_KEY=sk-your-actual-key-here
  OPENAI_API_ENDPOINT=https://api.openai.com/v1/chat/completions
  OPENAI_MODEL=gpt-4-turbo-preview
  ```
- [ ] Set up billing limits to avoid unexpected charges

### 2. Database Preparation
- [ ] Backup current database:
  ```bash
  docker exec ecobserve-db pg_dump -U postgres ecobserve > backup_$(date +%Y%m%d).sql
  ```

### 3. Code Review
- [ ] All TypeScript files compile without errors
- [ ] All services have proper error handling
- [ ] All endpoints have authentication middleware
- [ ] Subscription tier checks are in place

---

## 🚀 Deployment Steps

### Step 1: Run Migrations
```bash
# Migration 009: Create Planner tier tables
docker exec ecobserve-db psql -U postgres -d ecobserve < backend/src/migrations/009_planner_tier_features.sql

# Migration 010: Update subscription plans
docker exec ecobserve-db psql -U postgres -d ecobserve < backend/src/migrations/010_update_subscription_plans.sql
```

**Verify:**
```bash
docker exec ecobserve-db psql -U postgres -d ecobserve -c "\dt"
```
Should show: `certificates`, `tax_incentives`, `carbon_offsets`, `offset_purchases`, `suppliers`, `event_suppliers`, `industry_benchmarks`

### Step 2: Install Dependencies
```bash
cd backend
npm install
# Should install: pdfkit, @types/pdfkit, axios
```

### Step 3: Build Backend
```bash
docker-compose build backend
```

### Step 4: Build Frontend
```bash
docker-compose build frontend
```

### Step 5: Restart Services
```bash
docker-compose up -d backend frontend
```

### Step 6: Seed Initial Data
```bash
# Run the seed script
docker exec -it ecobserve-backend npx ts-node src/migrations/seed-planner-data.ts
```

**Expected output:**
```
🌱 Starting Planner tier data seeding...
📊 Seeding carbon offset projects...
✅ Carbon offset projects seeded
🏢 Seeding eco-friendly suppliers...
✅ Suppliers seeded
📈 Seeding industry benchmarks...
✅ Industry benchmarks seeded
🎉 Planner tier data seeding completed successfully!
```

### Step 7: Verify Deployment
```bash
# Check services are running
docker-compose ps

# Check backend health
curl https://ecobserve.com/api/health

# Check logs for errors
docker-compose logs backend --tail=50
docker-compose logs frontend --tail=50
```

---

## 🧪 Testing Checklist

### API Endpoint Tests

#### 1. AI Recommendations
```bash
curl -X POST https://ecobserve.com/api/planner/ai-recommendations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "inputs": {
      "venue": "Standard venue",
      "catering": "Mixed menu"
    },
    "carbonFootprint": 5000
  }'
```
**Expected:** 200 OK with recommendations array

#### 2. Certificate Generation
```bash
curl -X POST https://ecobserve.com/api/planner/certificate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "eventName": "Test Event",
    "sustainabilityScore": 85,
    "carbonSaved": 2500
  }'
```
**Expected:** 200 OK with certificate number

#### 3. Tax Incentives
```bash
curl -X POST https://ecobserve.com/api/planner/tax-incentives \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "carbonReductionKg": 2500,
    "investmentAmountZar": 50000
  }'
```
**Expected:** 200 OK with tax benefit breakdown

#### 4. Carbon Offsets
```bash
curl https://ecobserve.com/api/planner/carbon-offsets \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200 OK with list of offset projects

#### 5. Suppliers
```bash
curl "https://ecobserve.com/api/planner/suppliers/search?q=catering" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200 OK with supplier list

#### 6. Benchmarks
```bash
curl -X POST https://ecobserve.com/api/planner/benchmarks/compare \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "conference",
    "attendees": 150,
    "carbonPerAttendee": 38
  }'
```
**Expected:** 200 OK with comparison data

### Subscription Tier Tests
- [ ] Explorer users cannot access `/api/planner/*` endpoints (403 Forbidden)
- [ ] Planner users can access all endpoints
- [ ] Unauthenticated requests return 401

---

## 📊 Monitoring

### Key Metrics to Watch
1. **OpenAI API Usage:**
   - Monitor at https://platform.openai.com/usage
   - Set up billing alerts

2. **Database Performance:**
   ```bash
   docker exec ecobserve-db psql -U postgres -d ecobserve -c "
   SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
   ```

3. **API Response Times:**
   - Check backend logs for slow queries
   - Monitor AI recommendation response times (should be < 5s)

---

## 🔄 Rollback Plan

If issues occur:

```bash
# Stop services
docker-compose down

# Restore database backup
docker exec -i ecobserve-db psql -U postgres ecobserve < backup_YYYYMMDD.sql

# Revert code
git revert HEAD

# Rebuild and restart
docker-compose build
docker-compose up -d
```

---

## ✅ Post-Deployment

- [ ] Update pricing page is live
- [ ] All 6 Planner features are accessible
- [ ] OpenAI integration is working
- [ ] PDF certificates are generating correctly
- [ ] Tax calculations are accurate
- [ ] Carbon offset marketplace is populated
- [ ] Suppliers are searchable
- [ ] Benchmarks are comparing correctly
- [ ] Email notifications are working
- [ ] Analytics are tracking feature usage

---

## 📞 Support

If you encounter issues:
1. Check logs: `docker-compose logs backend --tail=100`
2. Verify environment variables: `docker exec ecobserve-backend env | grep OPENAI`
3. Test database connection: `docker exec ecobserve-db psql -U postgres -d ecobserve -c "SELECT COUNT(*) FROM carbon_offsets;"`

---

**Deployment Date:** _____________
**Deployed By:** _____________
**Status:** ✅ Complete / ⚠️ Issues / ❌ Rolled Back

