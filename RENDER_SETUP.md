# Render Deployment Setup (Fixed)

## Overview
The Serenvi backend is deployed as a Docker service on Render. The frontend is deployed on Vercel. Database is Supabase PostgreSQL.

## Backend Deployment on Render

### Prerequisites
- GitHub repository with backend code at `backend/` directory
- Render account with Docker support
- Supabase PostgreSQL database

### Step 1: Create a Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository branch (main)
5. Configure the service:
   - **Name**: `serenvi-backend`
   - **Runtime**: `Docker`
   - **Root Directory**: `backend`
   - **Auto-Deploy**: Enable
   - **Plan**: Free tier or paid (as needed)

### Step 2: Set Environment Variables in Render

Add the following environment variables in the Render dashboard (Settings → Environment):

```
DATABASE_URL="postgresql://[user]:[password]@[host]:6543/[dbname]?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://[user]:[password]@[host]:5432/[dbname]"
CLERK_SECRET_KEY=[your-clerk-secret-key]
NODE_ENV=production
PORT=3001
FRONTEND_URL="https://www.serenvi.app,https://serenvi.app"
JWT_SECRET=[random-32-char-string]
```

### Getting Supabase Connection Strings

1. Go to Supabase Dashboard
2. Navigate to "Project Settings" → "Database"
3. Under "Connection pooling", copy the connection string for:
   - **Transaction Pooler** (port 6543) → `DATABASE_URL` with `?pgbouncer=true&connection_limit=1`
   - **Session Pooler** (port 5432) → `DIRECT_URL` (for migrations)

### Important Notes

- **URL Encoding**: If your Supabase password contains special characters (`#`, `$`, `&`, `@`, `:`, `/`, `?`, `%`), they must be URL-encoded:
  - `#` → `%23`
  - `$` → `%24`
  - `&` → `%26`
  - `@` → `%40`
  - `:` → `%3A`
  - `/` → `%2F`
  - `?` → `%3F`
  - `%` → `%25`

- **DATABASE_URL**: Uses Supabase transaction pooler (port 6543) for application runtime
- **DIRECT_URL**: Uses Supabase session pooler (port 5432) for Prisma migrations
- **FRONTEND_URL**: Comma-separated, no spaces, no trailing slashes

### Step 3: Verify Deployment

1. The Docker build should start automatically after push
2. Check the "Events" tab for build/deploy logs
3. Verify health check: `GET https://serenvi-backend.onrender.com/health`
4. Check logs for errors during startup

### Troubleshooting

**"Application exited early while running your code"**
- Check environment variables are set correctly
- Verify DATABASE_URL and DIRECT_URL are URL-encoded properly
- Check Render logs for specific error messages
- Ensure Prisma migrations don't have issues

**"Cannot find module 'prisma'"**
- The Dockerfile now keeps all dependencies (including prisma CLI)
- Rebuild/redeploy will fix this

**Port binding issues**
- Render automatically assigns a port, but we listen on `0.0.0.0:3001`
- Set `PORT=3001` in environment variables

## Frontend Deployment on Vercel

The frontend is deployed automatically from the root `vercel.json` configuration.

### Vercel Environment Variables

Set these in Vercel project settings:

```
REACT_APP_CLERK_PUBLISHABLE_KEY=[your-clerk-publishable-key]
REACT_APP_API_URL=https://serenvi-backend.onrender.com
```

After changing these, trigger a new deployment on Vercel.

## Local Development

```bash
# Backend
cd backend
DATABASE_URL="postgresql://localhost:5432/serenvi_db" npm run start:dev

# Frontend
cd frontend
REACT_APP_CLERK_PUBLISHABLE_KEY=[your-key] \
REACT_APP_API_URL=http://localhost:3001 \
npm start
```

## Deployment Architecture

```
Browser
├─ Vercel (React SPA) → frontend/
│  └─ API calls to backend
└─ Clerk (OAuth) for authentication

Render (NestJS Backend)
├─ Docker deployment from backend/
└─ Supabase PostgreSQL
```
