# Render Deployment Configuration

## Required Environment Variables on Render

### Core Environment Variables (Required)

**DATABASE_URL** (Connection String)
```
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

For **Supabase** (pgbouncer connection pooler):
```
postgresql://postgres:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

For **Railway** (direct PostgreSQL):
- Railway provides `DATABASE_URL` automatically in the environment

### Optional Environment Variables

**DIRECT_URL** (Only needed for Supabase with pgbouncer)
- If using Supabase on Render, set this to use the session pooler for migrations:
```
postgresql://postgres:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
```
- Railway users: **Do NOT set this** — migrations will use `DATABASE_URL` automatically
- **IMPORTANT**: URL-encode special characters in password:
  - `#` → `%23`, `$` → `%24`, `&` → `%26`, `@` → `%40`, `:` → `%3A`

### Authentication

**CLERK_SECRET_KEY**
- Get from Clerk Dashboard → API Keys → Secret Key
- Format: `sk_test_...` (test environment) or `sk_live_...` (production)

### Frontend Configuration

**FRONTEND_URL**
```
https://www.serenvi.app,https://serenvi.app
```
- **Format**: Comma-separated (NO spaces), no trailing slashes
- Used for CORS origin validation
- Update if adding new frontend domains

### Application Configuration

**NODE_ENV**
```
production
```

**PORT**
```
3001
```

**JWT_SECRET** (optional for legacy code)
```
[32+ random characters]
```

**SMTP_EMAIL** (optional)
```
[sender email for password reset]
```

**SMTP_PASSWORD** (optional)
```
[SMTP password]
```

## Deployment Flow

1. **Build Phase** (in Dockerfile):
   - `npm ci --ignore-scripts` (installs deps, skips broken postinstall)
   - `npm rebuild bcrypt` (explicitly rebuild bcrypt)
   - `npx prisma generate` (generates Prisma client types)
   - `npm run build` (compiles NestJS)

2. **Runtime Phase** (`start:prod` script):
   - `prisma migrate deploy` (runs pending migrations using DIRECT_URL)
   - `node dist/main` (starts the NestJS server)

## Troubleshooting

### Error: "Environment variable not found: DIRECT_URL"
- **Cause**: Prisma schema was configured to require DIRECT_URL, but Railway doesn't need it
- **Fix**: This has been fixed in the latest commit. DIRECT_URL is now optional.

### Error: "FATAL: (ENOTFOUND) tenant/user postgres.jmfddigrafkxlkooshug not found"
- **Cause**: DATABASE_URL is malformed or not set
- **Fix**: 
  - For Railway: Let Railway auto-provide DATABASE_URL
  - For Supabase: Ensure DATABASE_URL uses correct host and port
  - Verify password is properly URL-encoded if it contains special characters

## Supabase Project Details

- **Project Ref**: `jmfddigrafkxlkooshug`
- **Region**: `ap-northeast-1` (Tokyo)
- **Database**: PostgreSQL
- **Two connection modes**:
  - **Transaction Pooler** (port 6543): For app queries (runtime)
  - **Session Pooler** (port 5432): For migrations (must use this for `DIRECT_URL`)

## Re-deploying

After updating environment variables:
1. Go to Render dashboard
2. Select the backend service
3. Click **Clear Build Cache** (optional, for fresh rebuild)
4. Click **Deploy** to trigger a new build

The deployment will automatically run migrations and start the server.
