# Frontend Deployment to Vercel

## Current Status
- **Frontend**: Configured for Vercel, ready to deploy
- **Backend**: Deployed on Railway
- **Auth**: Clerk (hosted)
- **Database**: Supabase PostgreSQL
- **Issue**: Products not showing on Vercel frontend

## Frontend Deployment Steps

### 1. Connect GitHub Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Select **Import Git Repository**
4. Paste: `https://github.com/theserenvicompany-sudo/serenviapp`
5. Click **Import**

### 2. Configure Build Settings

Vercel should auto-detect:
- **Framework Preset**: Other (CRA)
- **Build Command**: `cd frontend && npm install --legacy-peer-deps && CI=false npm run build`
- **Output Directory**: `frontend/build`
- **Install Command**: Leave empty or `npm install --legacy-peer-deps`

(These are in `vercel.json` root config)

### 3. Set Environment Variables in Vercel

In Vercel Dashboard → **Settings** → **Environment Variables**, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `REACT_APP_CLERK_PUBLISHABLE_KEY` | `pk_test_...` or `pk_live_...` | Get from Clerk Dashboard |
| `REACT_APP_API_URL` | Your Railway backend URL | See below |

#### Finding Your Railway Backend URL

1. Go to [railway.app](https://railway.app)
2. Select your serenvi-backend project
3. Copy the **Public URL** (format: `https://serenvi-backend-production.up.railway.app` or similar)
4. Set `REACT_APP_API_URL` to this URL

### 4. Custom Domain (Optional)

To use `serenvi.app` instead of Vercel's default domain:

1. In Vercel Project Settings → **Domains**
2. Add domain: `serenvi.app` and `www.serenvi.app`
3. Update your domain registrar's DNS to point to Vercel

### 5. Deploy

1. Vercel auto-deploys when you push to `main` branch
2. Or manually: **Dashboard** → **Deploy**

---

## Debugging: Why Products Aren't Showing

### Root Cause
The `REACT_APP_API_URL` environment variable is not set correctly on Vercel, so the frontend can't reach your Railway backend.

### Quick Fixes

#### A. Check Vercel Environment Variables
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Verify `REACT_APP_API_URL` is set to your Railway backend URL
3. Click **Save**
4. **Redeploy** the project for changes to take effect

#### B. Verify Backend API URL
1. Get your Railway backend URL from Railway Dashboard
2. Test it manually: Visit `https://[your-railway-url]/products` in browser
3. You should see JSON with products array

#### C. Check CORS Configuration
Your backend CORS must allow the frontend domain:

1. Go to Railway → serenvi-backend → **Variables**
2. Check `FRONTEND_URL` variable contains your Vercel domain:
   ```
   https://www.serenvi.app,https://serenvi.app
   ```
3. Update if needed and redeploy backend

#### D. Verify Products Exist in Database
1. Connect to your Supabase database
2. Check if the `Product` table has records
3. If empty, seed products from `backend/data/` CSV files

### Complete Deployment Checklist

- [ ] Frontend connected to GitHub on Vercel
- [ ] `REACT_APP_CLERK_PUBLISHABLE_KEY` set in Vercel
- [ ] `REACT_APP_API_URL` set in Vercel (points to Railway backend)
- [ ] Vercel project redeployed after env var changes
- [ ] Backend `FRONTEND_URL` includes Vercel domain
- [ ] Backend is running on Railway (check logs)
- [ ] Database has products seeded
- [ ] Test `/products` endpoint directly in browser
- [ ] Check browser console for API errors (F12 → Network tab)

---

## Domain Configuration

### Current Setup
- **Frontend**: Vercel (`serenvi.app` with custom domain)
- **Backend**: Railway (`serenvi-backend-production.up.railway.app`)
- **Auth**: Clerk
- **Database**: Supabase

### Domains to Update in Clerk

If using custom domain, update Clerk dashboard:
1. Go to **Clerk Dashboard** → **Settings** → **Domains**
2. Add your Vercel domain: `https://www.serenvi.app`
3. Update Authorized Origins if needed

---

## Troubleshooting API Calls

### If products still don't show:

1. **Open browser console** (F12)
2. Check **Network** tab for `/products` API calls
3. Look for error responses
4. Common issues:
   - **404**: Backend URL wrong in `REACT_APP_API_URL`
   - **CORS Error**: Backend `FRONTEND_URL` not updated
   - **Empty products**: Database not seeded or wrong connection
   - **401**: Clerk key wrong or not configured

### Test API Directly

```bash
# From your computer terminal
curl https://[your-railway-backend-url]/products

# Should return JSON like:
# [{"id":"...", "name":"...", "price":...}, ...]
```

---

## Re-deploying Frontend

After any changes:
```bash
cd frontend
git add -A
git commit -m "frontend: [description]"
git push origin main
# Vercel auto-deploys within 1-2 minutes
```

Or manually in Vercel Dashboard:
1. **Select Project** → **Deployments**
2. Click **... (three dots)** on latest deployment
3. Select **Redeploy**
