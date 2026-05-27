# Free Deployment Guide for Serenvi MLM Platform

## Architecture Overview

```
Frontend (Vercel Free)     →     Backend (Render Free)     →     Database (Supabase Free)
   React SPA                        NestJS API                    PostgreSQL
https://serenvi.app              api.render.com                  15GB storage
```

All three services have **free tiers** that work perfectly for this project.

---

## 1. Frontend Deployment (Vercel) - 5 minutes

### Step 1: Create Vercel Account
1. Go to https://vercel.com/signup
2. Sign up with GitHub account
3. Authorize GitHub access

### Step 2: Deploy from GitHub
1. Click "Add New" → "Project"
2. Select your GitHub repository (`serenviapp`)
3. Vercel auto-detects the `vercel.json` configuration
4. Set environment variables:
   ```
   REACT_APP_CLERK_PUBLISHABLE_KEY = [your-clerk-key]
   REACT_APP_API_URL = https://serenvi-backend.onrender.com
   ```
5. Click "Deploy"
6. Done! Your frontend is live at `https://serenvi.vercel.app`

**Free Tier Includes:**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Git integration

---

## 2. Backend Deployment (Render) - 10 minutes

### Step 1: Create Render Account
1. Go to https://render.com/register
2. Sign up with GitHub
3. Authorize GitHub access

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Select your GitHub repository
3. Configure:
   - **Name**: `serenvi-backend`
   - **Runtime**: `Docker`
   - **Root Directory**: `backend`
   - **Auto-Deploy**: Enable

### Step 3: Add Environment Variables
In Render Dashboard → Settings → Environment:

```
DATABASE_URL = postgresql://[user]:[password]@[host]:6543/[dbname]?pgbouncer=true&connection_limit=1
DIRECT_URL = postgresql://[user]:[password]@[host]:5432/[dbname]
CLERK_SECRET_KEY = [your-clerk-secret-key]
NODE_ENV = production
PORT = 3001
FRONTEND_URL = https://serenvi.vercel.app
JWT_SECRET = [random-32-char-string]
```

4. Click "Deploy"
5. Backend is live at `https://serenvi-backend.onrender.com`

**Free Tier Includes:**
- ✅ 0.5 CPU + 512 MB RAM (shared)
- ✅ Automatic HTTPS
- ✅ Auto-deploys on git push
- ⚠️ Sleeps after 15 min inactivity (~30s cold start)

**Note:** Free tier services spin down after 15 minutes of inactivity. They wake up on first request (30s delay). For production, upgrade to paid tier ($7/month).

---

## 3. Database Deployment (Supabase) - 5 minutes

### Step 1: Create Supabase Account
1. Go to https://supabase.com/dashboard
2. Sign up with GitHub
3. Authorize GitHub access

### Step 2: Create Project
1. Click "New Project"
2. Configure:
   - **Name**: `serenvi-prod`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to you (e.g., `ap-northeast-1` for Asia)
3. Wait 2-3 minutes for setup
4. Go to "Project Settings" → "Database"

### Step 3: Get Connection Strings
1. Under "Connection Pooling":
   - Copy **Transaction Pooler** (port 6543) → `DATABASE_URL`
   - Copy **Session Pooler** (port 5432) → `DIRECT_URL`

2. Format them as:
   ```
   DATABASE_URL=postgresql://[user]:[password]@[host]:6543/[dbname]?pgbouncer=true&connection_limit=1
   DIRECT_URL=postgresql://[user]:[password]@[host]:5432/[dbname]
   ```

⚠️ **Important**: URL-encode special characters in password:
- `#` → `%23`
- `$` → `%24`
- `&` → `%26`
- `@` → `%40`

**Free Tier Includes:**
- ✅ 500 MB database size
- ✅ Up to 50,000 row updates/month
- ✅ 5 GB bandwidth/month
- ✅ Real-time subscriptions
- ✅ Auto backups

---

## 4. Authentication (Clerk) - Free Tier

Your project already uses Clerk for authentication.

1. Go to https://clerk.com
2. Sign up with GitHub
3. Get keys:
   - **Publishable Key** → `REACT_APP_CLERK_PUBLISHABLE_KEY` (Vercel)
   - **Secret Key** → `CLERK_SECRET_KEY` (Render)

**Free Tier Includes:**
- ✅ Up to 10,000 Monthly Active Users (MAU)
- ✅ Unlimited sign-ins
- ✅ OAuth integrations (Google, GitHub, etc.)
- ✅ Email/password auth
- ✅ Multi-factor authentication

---

## Complete Deployment Checklist

- [ ] Create Supabase account & project
- [ ] Get database connection strings
- [ ] Create Render account & deploy backend
- [ ] Set Render environment variables
- [ ] Create Vercel account & deploy frontend
- [ ] Set Vercel environment variables
- [ ] Get Clerk keys (publishable + secret)
- [ ] Update `REACT_APP_API_URL` in Vercel
- [ ] Update `FRONTEND_URL` in Render
- [ ] Test API: `curl https://serenvi-backend.onrender.com/health`
- [ ] Test frontend at `https://serenvi.vercel.app`
- [ ] Sign in with Clerk

---

## Cost Breakdown (Monthly)

| Service | Free Tier | Notes |
|---------|-----------|-------|
| **Vercel** | Free | Unlimited deployments, 100GB bandwidth |
| **Render** | Free | Shared CPU/RAM, auto-sleeps after 15min |
| **Supabase** | Free | 500MB DB, limited row updates |
| **Clerk** | Free | 10,000 MAU |
| **Total** | **$0/month** | 🎉 Completely free! |

**Upgrade Path (Optional):**
- Render Web Service: $7/month → No auto-sleep
- Supabase Pro: $25/month → 8GB database
- Clerk Teams: $25+/month → Custom UI & branding

---

## Free Tier Limits & Considerations

### Render Free Tier
- **Spins down** after 15 minutes of inactivity
- First request after sleep: ~30 second delay
- Shared resources (0.5 CPU, 512MB RAM)
- Perfect for: Development, demos, low-traffic projects
- ❌ Not recommended for: Production with active users

### Supabase Free Tier
- 500 MB database storage
- 50,000 row write operations/month
- 5 GB bandwidth/month
- With ~700 products + user data, you'll stay well within limits

### Vercel Free Tier
- 100 GB bandwidth/month (plenty for SPA)
- 12 concurrent deployments
- No issues for production use

---

## Quick Start Script

Once you have all API keys:

```bash
# 1. Update Vercel environment
# Go to Vercel Dashboard → Settings → Environment Variables
# Add: REACT_APP_CLERK_PUBLISHABLE_KEY, REACT_APP_API_URL

# 2. Update Render environment
# Go to Render Dashboard → Environment → Add variables
# DATABASE_URL, DIRECT_URL, CLERK_SECRET_KEY, NODE_ENV, etc.

# 3. Push to GitHub
git add .
git commit -m "Ready for free deployment"
git push origin main

# 4. Trigger deployments
# - Vercel auto-deploys from push
# - Render auto-deploys from push
# - Check logs in respective dashboards

# 5. Verify
curl https://serenvi-backend.onrender.com/health
# Should return: {"ok":true}

# 6. Open frontend
# Visit: https://serenvi.vercel.app
```

---

## Troubleshooting

**Render: "Application exited early"**
- Check DATABASE_URL and DIRECT_URL are correct
- Verify all environment variables are set
- Check logs in Render dashboard

**Vercel: "API_URL not found"**
- Redeploy Vercel after setting `REACT_APP_API_URL`
- Build-time variables require new deployment

**Can't sign in**
- Check Clerk keys match between frontend/backend
- Verify FRONTEND_URL in Render matches Vercel domain
- Clear browser cache and cookies

**Database connection fails**
- Verify password is URL-encoded
- Check Supabase firewall (allow all if testing)
- Test directly: `psql [connection-string]`

---

## Next Steps (After Deployment)

1. **Custom Domain** (free)
   - Vercel: Add domain in project settings
   - Render: Add custom domain in web service settings

2. **SSL Certificate** (automatic)
   - All three services provide free HTTPS

3. **Email Verification** (optional)
   - Supabase: Set up email template
   - Clerk: Configure email verification

4. **Monitor Performance**
   - Render: Check CPU/memory usage (free tier)
   - Supabase: Monitor database usage
   - Vercel: Check build times and performance

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Clerk Docs**: https://clerk.com/docs
- **NestJS Docs**: https://docs.nestjs.com
- **React Docs**: https://react.dev
