# Complete Deployment Checklist for Render + Vercel + Supabase

## ✅ Prerequisites (Do These First)

### 1. Create Supabase Project
- [ ] Go to https://supabase.com/dashboard
- [ ] Create new project: `serenvi-prod`
- [ ] **Copy and save your database password** (shows only once!)
- [ ] Choose region: `ap-northeast-1` (Tokyo)
- [ ] Wait 2-3 minutes for database to be ready

### 2. Get Supabase Connection Strings
- [ ] Go to Settings → Database → Connection Pooling
- [ ] Copy Transaction Pooler (port 6543) → `DATABASE_URL`
- [ ] Copy Session Pooler (port 5432) → `DIRECT_URL`
- [ ] URL-encode special characters in password

**Example with password `7?H%$Fn-YmudnBj`:**
```
DATABASE_URL=postgresql://postgres.lycsmrzcbtmaglcbozek:7%3FH%25%24Fn-YmudnBj@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

DIRECT_URL=postgresql://postgres.lycsmrzcbtmaglcbozek:7%3FH%25%24Fn-YmudnBj@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
```

### 3. Get Clerk Keys
- [ ] Go to https://clerk.com/dashboard
- [ ] Create application or use existing
- [ ] Copy:
  - **Publishable Key** (pk_test_...) → `REACT_APP_CLERK_PUBLISHABLE_KEY`
  - **Secret Key** (sk_test_...) → `CLERK_SECRET_KEY`

---

## 🚀 Backend Deployment on Render

### Step 1: Create Render Account
- [ ] Go to https://render.com/register
- [ ] Sign up with GitHub (theserenviapp-hue/serenvi repository)

### Step 2: Create Web Service
- [ ] Click "New +" → "Web Service"
- [ ] **IMPORTANT: Select the correct repository:**
  - Repository: `theserenviapp-hue/serenvi` (NOT theserenvicompany-sudo)
  - Branch: `main`
- [ ] Configure service:
  - **Name**: `serenvi-backend`
  - **Runtime**: `Docker`
  - **Root Directory**: `backend` ⚠️ Important!
  - **Auto-Deploy**: Enable
  - **Plan**: Free tier (or Starter $7/mo for no sleep)

### Step 3: Set Environment Variables
- [ ] Go to Service Settings → Environment
- [ ] Add ALL of these variables (copy exactly):

```
DATABASE_URL=postgresql://postgres.lycsmrzcbtmaglcbozek:7%3FH%25%24Fn-YmudnBj@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

DIRECT_URL=postgresql://postgres.lycsmrzcbtmaglcbozek:7%3FH%25%24Fn-YmudnBj@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres

CLERK_SECRET_KEY=sk_test_[YOUR_CLERK_SECRET]

NODE_ENV=production

PORT=3001

FRONTEND_URL=https://serenvi.vercel.app

JWT_SECRET=aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV
```

### Step 4: Deploy
- [ ] Click "Deploy"
- [ ] Wait for build + deploy (5-10 minutes)
- [ ] Check logs for errors
- [ ] Verify: `curl https://serenvi-backend.onrender.com/health`
- [ ] Should return: `{"ok":true}`

---

## 🎨 Frontend Deployment on Vercel

### Step 1: Create Vercel Account
- [ ] Go to https://vercel.com/signup
- [ ] Sign up with GitHub
- [ ] Authorize access

### Step 2: Import Project
- [ ] Click "Add New" → "Project"
- [ ] Select `theserenviapp-hue/serenvi` repository
- [ ] Vercel auto-detects `vercel.json` configuration ✅
- [ ] Framework preset: **None** (CRA handles build)

### Step 3: Set Environment Variables
- [ ] Go to Project Settings → Environment Variables
- [ ] Add these:

```
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_[YOUR_CLERK_PUBLISHABLE_KEY]

REACT_APP_API_URL=https://serenvi-backend.onrender.com
```

### Step 4: Deploy
- [ ] Click "Deploy"
- [ ] Wait for build (3-5 minutes)
- [ ] Should be live at: `https://serenvi.vercel.app`

---

## 🔗 Verify Everything Works

### 1. Test Backend Health
```bash
curl https://serenvi-backend.onrender.com/health
# Expected: {"ok":true}
```

### 2. Test API
```bash
curl https://serenvi-backend.onrender.com/products
# Expected: JSON array of products
```

### 3. Test Frontend
- [ ] Visit: https://serenvi.vercel.app
- [ ] Page should load (may show 30s loading if backend just woke up)
- [ ] Click "Sign In"
- [ ] Should redirect to Clerk login

### 4. Test Sign In
- [ ] Sign in with email or GitHub via Clerk
- [ ] Should redirect back to dashboard
- [ ] Check browser console for errors

---

## ⚠️ Troubleshooting

### Render: Deployment Fails
**Symptoms:** "Application exited early" or Docker build error

**Solutions:**
1. Check environment variables are set (all 7 required)
2. Verify DATABASE_URL and DIRECT_URL are correct
3. Check logs in Render → Service → Logs tab
4. Make sure `backend` is set as Root Directory
5. Try clearing Docker cache: Settings → "Clear build cache" → Redeploy

### Render: "Tenant/user not found"
**Solution:** Supabase project may not be ready. Wait 5 minutes after creation.

### Vercel: Can't connect to API
**Symptoms:** Frontend loads but API calls fail

**Solutions:**
1. Verify `REACT_APP_API_URL` is set to backend URL
2. Redeploy Vercel after setting env var (needed for build-time variables)
3. Check backend logs for CORS errors

### Can't Sign In
**Symptoms:** Clerk login page shows but sign-in fails

**Solutions:**
1. Verify Clerk keys match between Vercel and Render
2. Check Render env var `FRONTEND_URL` matches Vercel domain
3. Clear browser cache and cookies
4. Check browser console for JavaScript errors

### Database Connection Fails
**Symptoms:** Backend logs show "Connection refused"

**Solutions:**
1. Verify DATABASE_URL is URL-encoded (?, %, $, & must be encoded)
2. Verify DIRECT_URL is correct
3. Test locally: `psql [connection-string]`
4. Check Supabase firewall: Security → Firewall Rules → allow all for testing

---

## 📊 Monitoring

### Backend Performance
- [ ] Render Dashboard → Service → Metrics
- [ ] Check CPU and memory usage
- [ ] Check response times and error rates

### Database Usage
- [ ] Supabase Dashboard → Database → Database Usage
- [ ] Monitor storage and row operations
- [ ] Free tier: 500MB storage, 50,000 write ops/month

### Frontend Performance
- [ ] Vercel Dashboard → Project → Deployments → Analytics
- [ ] Check build time and performance
- [ ] Check bundle size

---

## 💰 Monthly Costs

| Service | Plan | Cost | Notes |
|---------|------|------|-------|
| **Vercel** | Free | $0 | 100GB bandwidth/mo |
| **Render** | Free | $0 | Sleeps after 15min |
| **Render** | Starter | $7/mo | No sleep, always running |
| **Supabase** | Free | $0 | 500MB DB, 50K ops/mo |
| **Clerk** | Free | $0 | 10,000 MAU |
| **Total (Free)** | - | **$0/mo** | Good for demos |
| **Total (Production)** | - | **$7/mo** | Render always running |

---

## 🎯 Next Steps After Deployment

1. **Custom Domain**
   - Vercel: Settings → Domains → Add domain
   - Render: Settings → Custom Domain → Add domain

2. **Monitor Logs**
   - Check daily for errors in production
   - Set up alerts if available

3. **Scale Up (If Needed)**
   - Render Starter plan: $7/mo (no sleep)
   - Supabase Pro: $25/mo (8GB storage)
   - Vercel Pro: $20/mo (more features)

4. **SSL/HTTPS** ✅
   - Automatic on all services

5. **Backups**
   - Supabase: Automatic daily backups on free tier ✅

---

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Clerk Docs**: https://clerk.com/docs
- **NestJS Docs**: https://docs.nestjs.com
- **React Docs**: https://react.dev
