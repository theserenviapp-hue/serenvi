# DEPLOYMENT FIX - Database Connection Issues

## Problem Diagnosis

The deployment error:
```
PrismaClientInitializationError: Error querying the database: FATAL: (ENOTFOUND) tenant/user postgres.jmfddigrafkxlkooshug
```

### Root Causes Identified & Fixed

1. **Outdated prisma.config.ts in root** ✅ REMOVED
   - Was using deprecated Prisma API
   - Could interfere with proper schema resolution

2. **Duplicate render.yaml** ✅ REMOVED
   - Old file in `backend/render.yaml` removed
   - New corrected version in root `render.yaml`

3. **Incorrect build/start commands** ✅ FIXED
   - Updated to properly navigate backend directory
   - Added `--skip-generate` flag to avoid re-generation during migration

4. **Database configuration** ✅ FIXED
   - Changed database name from `serenvi` to `serenvi_prod`
   - Changed user from `serenvi_user` to `serenvi_prod_user`
   - Properly using Render's `fromDatabase` property

## Changes Made

### Files Deleted
- ❌ `prisma.config.ts` (root) - Outdated and unnecessary
- ❌ `backend/render.yaml` - Replaced with root version

### Files Updated
- ✅ `render.yaml` (root) - Complete rewrite with proper configuration

### Key Improvements in render.yaml

```yaml
buildCommand: cd backend && npm install && npx prisma generate && npm run build
startCommand: |
  cd backend
  echo "DATABASE_URL=$DATABASE_URL" > .env.production.local
  echo "NODE_ENV=production" >> .env.production.local
  npx prisma migrate deploy --skip-generate
  npm run start:prod
```

**Why this works:**
- Creates `.env.production.local` with injected DATABASE_URL from Render
- Skips Prisma generation during migrations to avoid redundant operations
- Properly navigates to backend directory for all commands
- Ensures NODE_ENV is set to production

## Deployment Checklist

Before redeploying to Render:

### ✅ Pre-Deployment Steps

1. **Verify Render Environment Variables**
   - Go to Render Dashboard → Your Service
   - Check "Environment" tab
   - Ensure no hardcoded DATABASE_URL variable (let fromDatabase handle it)
   - Required variables:
     - `JWT_SECRET` (should be auto-generated)
     - `FRONTEND_URL` (update to your domain)
     - `NODE_ENV` = production
     - Optional: SMTP, RAZORPAY keys

2. **Check Prisma Schema**
   ```bash
   cd backend
   cat prisma/schema.prisma | head -20
   ```
   Should show PostgreSQL datasource with DATABASE_URL env var

3. **Verify Build Scripts**
   ```bash
   cd backend
   npm run build
   npm run start:prod  # Test locally
   ```

4. **Confirm .env is Gitignored**
   ```bash
   grep "\.env" .gitignore backend/.gitignore
   ```

### 🚀 Deployment Steps on Render

1. **Option A: Redeploy Existing Service**
   - Render Dashboard → Service → Manual Deploy
   - Click "Deploy latest commit"
   - Wait 3-5 minutes for build
   - Check logs in "Logs" tab

2. **Option B: Delete and Recreate (If Issues Persist)**
   - Delete old service
   - Delete old database
   - Push code to GitHub
   - Create new service from GitHub
   - Render will auto-detect render.yaml
   - Create new database during setup

### 📊 Troubleshooting Deployment

If you still see database connection errors:

1. **Check Build Logs**
   - Look for npm install errors
   - Check prisma generate output
   - Verify build completes successfully

2. **Check Start Logs**
   - Look for connection string issues
   - Verify DATABASE_URL is being set correctly
   - Check Prisma migration output

3. **Verify Database**
   - Render Dashboard → Databases
   - Ensure database is running
   - Check connection string format in database details

4. **Manual Database Connection Test**
   - Copy DATABASE_URL from Render dashboard
   - Run locally: `psql "your-database-url"`
   - Should connect successfully if URL is correct

## Production Environment Variables Reference

These should be set in Render dashboard:

```
NODE_ENV=production
JWT_SECRET=(auto-generated - 32+ chars)
JWT_EXPIRATION=7d
FRONTEND_URL=https://yourdomain.com
PORT=3001
LOG_LEVEL=info
ENABLE_HELMET=true
ENABLE_CORS=true
ENABLE_RATE_LIMITING=true

# Optional Services
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret
```

## Next Steps if Still Having Issues

1. **Clear Render Cache**
   - Go to Service Settings → Deployment Settings
   - Set "Auto-deploy" to Manual
   - Delete service and database
   - Redeploy from scratch

2. **Check for Environment Variable Conflicts**
   - Look in Render dashboard for any hardcoded DATABASE_URL
   - Remove all manual DATABASE_URL settings
   - Let fromDatabase property handle it

3. **Verify Package.json Scripts**
   - Ensure `npm run build` and `npm run start:prod` exist
   - Test locally: `cd backend && npm run build && npm run start:prod`

4. **Database Migrations**
   - If migrations fail, manually connect and check schema
   - Run: `npx prisma migrate deploy` locally with correct DATABASE_URL
   - Compare with production database structure

---

**Last Updated:** 2026-05-22
**Status:** ✅ Issues Fixed - Ready for Deployment
