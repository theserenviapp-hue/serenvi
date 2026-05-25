# Quick Setup - Deploy Fixes

## Summary of Fixes

✅ **Fixed "Distributor ID not found" error** - Now using Clerk JWT authentication  
✅ **Fixed "Admin panel not showing"** - Admin flag properly read from Clerk, panel enabled  
✅ **Fixed backend auth guards** - All controllers now use `ClerkGuard`  

## What Changed

### Frontend Changes
- Switched from token-based auth to Clerk JWT auth
- Added components: `TokenSync.tsx`, `MeBoot.tsx`
- Updated API client to support Clerk tokens
- Fixed admin panel visibility logic
- Enabled admin panel in `.env`

### Backend Changes
- All protected endpoints now use `ClerkGuard` instead of deprecated `AuthGuard('jwt')`
- Updated 8 controllers (admin, products, cart, achievements, wallet, distributors, payment, sales)

## Prerequisites

1. **Clerk Account Setup**
   - Go to [clerk.com](https://clerk.com)
   - Create an application or use existing one
   - Get publishable key (starts with `pk_`) and secret key (starts with `sk_`)

2. **Environment Variables**
   - Frontend: `REACT_APP_CLERK_PUBLISHABLE_KEY`
   - Backend: `CLERK_SECRET_KEY`

## Local Testing

### 1. Update Environment Variables

```bash
# frontend/.env
REACT_APP_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENABLE_ADMIN_PANEL=true

# backend/.env  
CLERK_SECRET_KEY=<your-clerk-secret-key>
DATABASE_URL=postgresql://user:password@localhost:5432/serenvi
```

### 2. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 3. Verify Database Setup

```bash
# Check if products exist in database
cd backend
npm run ts-node -- verify-setup.ts

# If no products, seed them:
# Make sure DATABASE_URL points to session pooler (port 5432)
npm run ts-node -- scripts/import-ajio-products.ts data/ajio_products.csv
```

### 4. Start Services

```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm start
```

### 5. Test Login

1. Open `http://localhost:3000`
2. Should redirect to Clerk login
3. Create test account or sign in
4. Should see "Distributor ID not found" message if `/me` endpoint fails
5. Check browser console for errors

### 6. Test Admin Panel

1. Get your Clerk user ID from Clerk dashboard
2. Make the user admin in database:
   ```bash
   cd backend
   npm run ts-node -- make-admin.js <your-clerk-user-id>
   ```
3. Log in again
4. Admin menu item should appear in sidebar

## Production Deployment

### 1. Vercel (Frontend)

```bash
# Set environment variables in Vercel dashboard
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_live_...
REACT_APP_API_URL=https://serenvibackend.onrender.com

# Deploy
git push origin main
```

### 2. Render (Backend)

```bash
# Set environment variables in Render dashboard
CLERK_SECRET_KEY=sk_live_...
DATABASE_URL=postgresql://...@...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://...@...supabase.com:5432/postgres
FRONTEND_URL=https://www.serenvi.app,https://serenvi.app

# Render should auto-deploy on git push
git push origin main
```

## Troubleshooting

### "Distributor ID not found" Error

**Cause**: `/me` endpoint failing or ClerkGuard not working

**Solutions**:
1. Check browser console for errors
2. Verify `CLERK_SECRET_KEY` is set correctly in backend
3. Check backend logs: `curl https://serenvibackend.onrender.com/health`
4. Verify Clerk publishable key matches secret key project

### Products Not Showing

**Cause**: No products in database

**Solution**:
```bash
# Seed products
cd backend
DATABASE_URL="<session-pooler-url>" npx ts-node scripts/import-ajio-products.ts data/ajio_products.csv
```

### Admin Panel Not Showing

**Cause**: User not marked as admin

**Solution**:
1. Get Clerk user ID from Clerk dashboard
2. Run: `npm run ts-node -- make-admin.js <clerk-user-id>`
3. Log out and back in
4. Admin menu should appear

### CORS Errors

**Cause**: Frontend URL not in `FRONTEND_URL` env var on backend

**Solution**:
1. Check Render environment variables
2. Ensure `FRONTEND_URL` includes both `https://www.serenvi.app` and `https://serenvi.app`
3. Restart Render service

## Verification Checklist

- [ ] Frontend builds without errors
- [ ] Backend builds without errors
- [ ] Can log in with Clerk
- [ ] Products display on shop page
- [ ] Can add products to cart
- [ ] Admin user sees admin menu item
- [ ] Admin can access admin panel
- [ ] Logout works

## Files Modified

See [FIXES_APPLIED.md](FIXES_APPLIED.md) for complete list of changes.

## Questions?

Check logs:
- Frontend: Browser DevTools Console
- Backend: Render logs or local terminal
- Database: Supabase dashboard

Run verification:
```bash
cd backend
npm run ts-node -- verify-setup.ts
```
