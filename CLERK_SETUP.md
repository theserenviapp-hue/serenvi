# Clerk Configuration Guide

## What is Clerk?

Clerk is the authentication provider for SERENVI. It handles user registration, login, and JWT token management. The backend verifies these tokens to authorize requests.

## Getting Your Clerk Keys

### Step 1: Create Clerk Account
1. Go to [clerk.com](https://clerk.com)
2. Click "Sign In" → "Create Account"
3. Fill in details and verify email
4. Create your first application

### Step 2: Get Your Keys

Once you create an application in Clerk:

1. Go to **Developers** → **API Keys**
2. You'll see two keys:
   - **Publishable Key**: `pk_test_...` (frontend)
   - **Secret Key**: `sk_test_...` (backend)

### Step 3: Get Development Keys

For local development:
- Clerk creates a **Development** instance by default
- Use the `pk_test_...` and `sk_test_...` keys

For production:
- Create a **Production** instance in Clerk
- Use the `pk_live_...` and `sk_live_...` keys

## Configuration Files

### Frontend (.env)

```env
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsubmV3dGVzdC5jb20k
```

**Where it's used:**
- `ClerkProvider` initialization in `frontend/src/App.tsx`
- Enables Clerk UI components (SignIn, SignUp, etc.)

### Backend (.env)

```env
CLERK_SECRET_KEY=sk_test_test123test456test789test012test123test456test789
```

**Where it's used:**
- JWT token verification in `backend/src/common/clerk.guard.ts`
- User provisioning when first token is received

## Environment Setup

### Local Development

1. **Frontend** (`frontend/.env`)
   ```env
   REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_<your-key>
   REACT_APP_API_URL=http://localhost:3001
   ```

2. **Backend** (`backend/.env`)
   ```env
   CLERK_SECRET_KEY=sk_test_<your-key>
   DATABASE_URL=postgresql://...
   ```

### Vercel (Production Frontend)

Settings → Environment Variables

```
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_live_<your-production-key>
REACT_APP_API_URL=https://serenvibackend.onrender.com
```

### Render (Production Backend)

Dashboard → Environment → Environment Variables

```
CLERK_SECRET_KEY=sk_live_<your-production-key>
DATABASE_URL=postgresql://...
FRONTEND_URL=https://www.serenvi.app,https://serenvi.app
```

## Important Notes

### 🔒 Security
- **Publishable keys are PUBLIC** - safe to commit to repo or add to .env
- **Secret keys are PRIVATE** - never commit, only set in secure env vars
- Each key pair must match:
  - `pk_test_` with `sk_test_`
  - `pk_live_` with `sk_live_`

### 🔄 Token Flow

1. User logs in via Clerk UI
2. Clerk creates JWT token
3. Frontend stores token in Clerk session
4. Frontend calls backend with `Authorization: Bearer <token>`
5. Backend `ClerkGuard` verifies token with Clerk
6. User is provisioned in database on first request

### 📝 User Mapping

- **Clerk User ID**: `user_xxx...` (Clerk's internal ID)
- **Backend User ID**: `cuid` (internal UUID)
- **Distributor ID**: `cuid` (internal UUID for MLM identity)

When user logs in, backend:
1. Verifies Clerk JWT
2. Looks up User by `clerkUserId`
3. Auto-creates User + Distributor if missing
4. Returns backend `distributorId` via `/me` endpoint

## Troubleshooting Clerk Issues

### "Invalid or expired token"

**Cause**: Secret key doesn't match the token
- Make sure `CLERK_SECRET_KEY` is for the same Clerk instance as the token
- Development tokens only work with development secret keys

### "Unauthorized"

**Cause**: No Authorization header or wrong format
- Frontend must send: `Authorization: Bearer <token>`
- Token must come from same Clerk instance

### "User not found"

**Cause**: Clerk ID in token doesn't match any user in database
- This is expected on first login - backend auto-provisions user
- Check `/me` endpoint is accessible

### "CORS errors"

**Cause**: Frontend domain not in Clerk CORS settings
- Go to Clerk → Developers → Settings
- Add your frontend URL to allowed origins

## Testing

### Local Testing

1. Start backend: `npm run start:dev`
2. Start frontend: `npm start`
3. Go to `http://localhost:3000`
4. Should redirect to Clerk login
5. Sign in or create account
6. Should redirect to dashboard

### Production Testing

1. Go to `https://www.serenvi.app`
2. Should work with live Clerk keys
3. Admin should see admin panel

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk API Reference](https://clerk.com/docs/reference/backend-api)
- [Clerk React SDK](https://clerk.com/docs/sdk/react)
- [JWT Verification](https://clerk.com/docs/backend-requests/verifying-tokens)
