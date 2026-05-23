# Render Deployment Configuration

## Required Environment Variables on Render

All of these must be set in your Render service's **Environment** tab:

### Database Connection (Supabase)

**DATABASE_URL** (Transaction Pooler - for app runtime)
```
postgresql://postgres:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```
- **Host**: `aws-1-ap-northeast-1.pooler.supabase.com`
- **Port**: `6543`
- **Query params**: `?pgbouncer=true&connection_limit=1`
- **IMPORTANT**: URL-encode special characters in password:
  - `#` → `%23`
  - `$` → `%24`
  - `&` → `%26`
  - `@` → `%40`
  - `:` → `%3A`

**DIRECT_URL** (Session Pooler - for migrations)
```
postgresql://postgres:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
```
- **Host**: `aws-1-ap-northeast-1.pooler.supabase.com`
- **Port**: `5432` (not 6543)
- **No pgbouncer params**
- **IMPORTANT**: Same URL-encoding rules apply to password

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

### Error: "FATAL: (ENOTFOUND) tenant/user postgres.jmfddigrafkxlkooshug not found"
- **Cause**: DATABASE_URL or DIRECT_URL is malformed or environment variables not set
- **Fix**: 
  - Verify both DATABASE_URL and DIRECT_URL are set in Render
  - Ensure passwords are properly URL-encoded
  - Check that the connection strings use correct hosts and ports

### Error: "Connection pooler exhausted"
- **Cause**: Too many active connections
- **Fix**: Ensure DATABASE_URL uses pgbouncer params (`?pgbouncer=true&connection_limit=1`)

### Error: "permission denied" during migration
- **Cause**: Database user lacks permissions
- **Fix**: Verify Supabase project ref and that the connection uses the default postgres user

### Container exits after startup
- **Cause**: Migration failure or database connection issue during `prisma migrate deploy`
- **Fix**: Check Render logs → check database connectivity → verify environment variables

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
