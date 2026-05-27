# Render Deployment Fix - Connection String Issues

## Problem
Prisma is failing to connect to Supabase with:
```
Error: Schema engine error:
FATAL: (ENOTFOUND) tenant/user postgres.lycsmrzcbtmaglcbozek not found
```

## Root Cause
The Supabase connection string format needs `postgres.` prefix included in both URLs, and the DIRECT_URL must explicitly include the database name.

## Solution

### Correct Connection Strings Format

**For your Supabase project:**
- Project ID: `lycsmrzcbtmaglcbozek`
- Region: `ap-northeast-1`
- Password: `7?H%$Fn-YmudnBj` → URL-encoded: `7%3FH%25%24Fn-YmudnBj`

### DATABASE_URL (Transaction Pooler - port 6543)
```
postgresql://postgres.lycsmrzcbtmaglcbozek:7%3FH%25%24Fn-YmudnBj@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### DIRECT_URL (Session Pooler - port 5432)
```
postgresql://postgres.lycsmrzcbtmaglcbozek:7%3FH%25%24Fn-YmudnBj@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
```

⚠️ **Key differences from before:**
- `postgres.lycsmrzcbtmaglcbozek` (with the dot)
- Both URLs must end with `/postgres` database name
- Transaction pooler = port 6543 (for app runtime)
- Session pooler = port 5432 (for migrations only)

---

## How to Verify Locally

Test the connection strings:
```bash
# Test transaction pooler
psql "postgresql://postgres.lycsmrzcbtmaglcbozek:7%3FH%25%24Fn-YmudnBj@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Test session pooler
psql "postgresql://postgres.lycsmrzcbtmaglcbozek:7%3FH%25%24Fn-YmudnBj@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

---

## What to Do

1. Go to **Render Dashboard** → Your Backend Service → **Settings** → **Environment**

2. **Update these variables exactly:**

```
DATABASE_URL=postgresql://postgres.lycsmrzcbtmaglcbozek:7%3FH%25%24Fn-YmudnBj@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

DIRECT_URL=postgresql://postgres.lycsmrzcbtmaglcbozek:7%3FH%25%24Fn-YmudnBj@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
```

3. **Click "Deploy" to redeploy**

4. Check logs - should now successfully run migrations

---

## If Still Fails

- ✅ Verify password is exactly: `7?H%$Fn-YmudnBj` (with question mark and special chars)
- ✅ Verify URL encoding: `7%3FH%25%24Fn-YmudnBj`
- ✅ Verify project ID: `lycsmrzcbtmaglcbozek`
- ✅ Verify region: `ap-northeast-1`
- ✅ Check both URLs have `/postgres` at the end

If error still says "user not found", the Supabase project may not be ready. Wait 5 minutes after creation before deploying.
