# Render Environment Variables Setup

## Overview
The Serenvi backend is deployed on Render and uses **Supabase PostgreSQL** (not Render's database). All database connection variables must be manually configured in Render's dashboard.

## Required Environment Variables

### 1. **DATABASE_URL** (Transaction Pooler - for app runtime)
- **Source**: Supabase project `jmfddigrafkxlkooshug`
- **Connection Type**: Transaction Pooler
- **Host**: `aws-1-ap-northeast-1.pooler.supabase.com`
- **Port**: `6543`
- **Format**: 
  ```
  postgresql://postgres:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
  ```
- **⚠️ IMPORTANT**: URL-encode special characters in password:
  - `#` → `%23`
  - `$` → `%24`
  - `&` → `%26`
  - `@` → `%40`
  - `:` → `%3A`
  - `/` → `%2F`
  - `?` → `%3F`
  - `%` → `%25`

### 2. **DIRECT_URL** (Session Pooler - for migrations only)
- **Source**: Supabase project `jmfddigrafkxlkooshug`
- **Connection Type**: Session Pooler
- **Host**: `aws-1-ap-northeast-1.supabase.co`
- **Port**: `5432`
- **Format**:
  ```
  postgresql://postgres:[PASSWORD]@aws-1-ap-northeast-1.supabase.co:5432/postgres
  ```
- **⚠️ IMPORTANT**: Same URL encoding as DATABASE_URL

### 3. **CLERK_SECRET_KEY**
- Get from Clerk Dashboard → API Keys → Secret Key
- Format: `sk_test_...` (test) or `sk_live_...` (production)

### 4. **FRONTEND_URL**
- Value: `https://www.serenvi.app,https://serenvi.app`
- **NO SPACES**, **NO TRAILING SLASHES**

### 5. **RAZORPAY_KEY_ID** & **RAZORPAY_KEY_SECRET**
- Get from Razorpay Dashboard → Settings → API Keys

## Setup Instructions

### Step 1: Go to Render Dashboard
1. Navigate to your Render service: `serenvi-backend`
2. Click on **Environment** tab

### Step 2: Add/Update Environment Variables
Click **Add Environment Variable** and enter each:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | Transaction pooler URL from Supabase | Must be URL-encoded |
| `DIRECT_URL` | Session pooler URL from Supabase | Must be URL-encoded |
| `CLERK_SECRET_KEY` | From Clerk dashboard | Required for auth |
| `FRONTEND_URL` | `https://www.serenvi.app,https://serenvi.app` | For CORS |
| `RAZORPAY_KEY_ID` | From Razorpay | For payments |
| `RAZORPAY_KEY_SECRET` | From Razorpay | For payments |

### Step 3: Deploy
After setting all variables, click **Deploy Latest Commit** to restart the service.

## Troubleshooting

### Error: "DATABASE_URL resolved to an empty string"
- Database URL is not set in Render environment
- Follow Setup Instructions above

### Error: "Prisma schema validation"
- Ensure both `DATABASE_URL` and `DIRECT_URL` are set
- Check for proper URL encoding of special characters

### Migrations not running
- Ensure `DIRECT_URL` points to session pooler (port 5432)
- This allows migrations to bypass connection pooler restrictions

## Supabase Connection Details Reference

**Project Ref**: `jmfddigrafkxlkooshug`  
**Region**: Tokyo (`ap-northeast-1`)  
**Provider**: AWS

### URLs
- **Transaction Pooler** (runtime): `aws-1-ap-northeast-1.pooler.supabase.com:6543`
- **Session Pooler** (migrations): `aws-1-ap-northeast-1.supabase.co:5432`

## Notes
- Do NOT use `npm install` - use `npm ci --ignore-scripts`
- Dockerfile handles bcrypt rebuild with `npm rebuild bcrypt`
- Migrations run automatically on startup via `start:prod` script
- If `DATABASE_URL` is not set, migrations are skipped (graceful fallback)
