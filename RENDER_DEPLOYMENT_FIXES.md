# Render Deployment Fixes Applied

## Issues Found & Fixed

### 1. ❌ **Missing DATABASE_URL in Render Environment**
- **Problem**: Container startup logs showed `DATABASE_URL` resolved to empty string
- **Fix**: Updated documentation to require manual setup in Render dashboard
- **Action**: Set `DATABASE_URL` in Render Environment tab

### 2. ❌ **Incorrect Prisma Schema Configuration**
- **Problem**: `DIRECT_URL` was commented out; migrations need session pooler
- **Fix**: Uncommented `directUrl = env("DIRECT_URL")` in schema
- **File**: `backend/prisma/schema.prisma`

### 3. ❌ **Non-resilient Start Script**
- **Problem**: App crashed if migrations failed (no DATABASE_URL)
- **Fix**: Updated `start:prod` to gracefully skip migrations if DATABASE_URL not set
- **File**: `backend/package.json`

### 4. ❌ **Incorrect render.yaml Configuration**
- **Problem**: Was trying to provision Render database instead of using Supabase
- **Fix**: Removed database provisioning, added manual env variable placeholders
- **File**: `backend/render.yaml`
- **Changes**:
  - Removed `databases` section (using Supabase instead)
  - Changed `buildCommand` to use `npm ci --ignore-scripts && npm rebuild bcrypt`
  - Changed `startCommand` to just `npm run start:prod` (migrations handled in script)
  - Added `DIRECT_URL` placeholder

## What You Need To Do (Critical!)

### In Render Dashboard:
1. Go to **serenvi-backend** service
2. Click **Environment** tab
3. Add these variables (get values from Supabase + Clerk dashboards):

| Variable | Example Value |
|----------|---------------|
| `DATABASE_URL` | `postgresql://postgres:PASSWORD%23%24@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | `postgresql://postgres:PASSWORD%23%24@aws-1-ap-northeast-1.supabase.co:5432/postgres` |
| `CLERK_SECRET_KEY` | `sk_test_...` or `sk_live_...` |
| `FRONTEND_URL` | `https://www.serenvi.app,https://serenvi.app` |
| `RAZORPAY_KEY_ID` | From Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | From Razorpay dashboard |

4. Click **Save**
5. Click **Deploy Latest Commit**

## How to Get Connection Strings

### From Supabase:
1. Go to Supabase Dashboard → Project `jmfddigrafkxlkooshug`
2. Click **Settings** → **Database** → **Connection Pooler** (or **Session Pooler**)
3. Copy the connection string
4. Replace `[YOUR-PASSWORD]` with actual password
5. **URL-encode** special characters in password

See [RENDER_ENV_SETUP.md](./RENDER_ENV_SETUP.md) for full details on URL encoding.

## Testing After Deployment

```bash
# Check if backend is running
curl https://serenvibackend.onrender.com/health

# Should return:
# {"ok":true}

# Check if products endpoint works
curl https://serenvibackend.onrender.com/products | head -20
```

## Deployment Logs Location
In Render dashboard → **serenvi-backend** → **Logs** tab

## Common Errors & Solutions

| Error | Solution |
|-------|----------|
| "DATABASE_URL resolved to an empty string" | Set DATABASE_URL in Render Environment |
| "DIRECT_URL resolved to an empty string" | Set DIRECT_URL in Render Environment |
| "Prisma schema validation failed" | Both DATABASE_URL and DIRECT_URL must be set |
| "SSL connection error" | Use `?sslmode=require` in connection string |

## Files Modified
- `backend/prisma/schema.prisma` - Added directUrl configuration
- `backend/package.json` - Updated start:prod script
- `backend/render.yaml` - Fixed configuration for Supabase
- `RENDER_ENV_SETUP.md` - Created comprehensive setup guide
- `RENDER_DEPLOYMENT_FIXES.md` - This file
