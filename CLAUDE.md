# Serenvi MLM Platform — Project Context

**Current architecture as of 2026-04-16.** Follow this, NOT older docs like
`DEPLOYMENT.md`, `SETUP_GUIDE.md`, `IMPLEMENTATION_GUIDE.md` (stale).

---

## Overall topology

```
Browser ──HTTPS──> Vercel (React SPA, frontend/)
   │                    │
   │                    └── api calls ──> Render (NestJS, backend/)
   │                                          │
   │                                          └── Prisma ──> Supabase Postgres
   │
   └── Clerk (hosted auth) — frontend + backend both verify same JWT
```

Three hosted services:
1. **Vercel** — React SPA deployed from root `vercel.json` which builds
   `frontend/` (CRA). Domain: `https://www.serenvi.app` (plus
   `https://serenvi.app` without www).
2. **Render** — NestJS backend from `backend/Dockerfile`. URL:
   `https://serenvibackend.onrender.com`. Free tier; sleeps after 15min
   idle, ~30s cold start. Health check: `GET /health`.
3. **Supabase** — PostgreSQL. Project ref `jmfddigrafkxlkooshug`.
   Region `aws-1-ap-northeast-1`.

Auth provider: **Clerk** (hosted). Frontend uses `@clerk/clerk-react`,
backend uses `@clerk/backend` for JWT verification.

---

## Frontend (deployed)

**Path**: `frontend/`
**Stack**: React 18, TypeScript 5, react-router-dom v6, axios, Tailwind v3,
CRA (react-scripts 5), `@clerk/clerk-react` v latest.

**Entry**: `frontend/src/index.tsx` wraps `<App>` in `<ClerkProvider>`
using `REACT_APP_CLERK_PUBLISHABLE_KEY`.

**Routing** (`frontend/src/App.tsx`):
- `<SignedIn>` → Dashboard, Shop, Cart, Checkout, Wallet, Team, Achievements,
  History, Settings, UserProfile, Admin, ProductDetail.
- `<SignedOut>` → Login (Clerk SignIn), Register (Clerk SignUp).
- Two boot components inside `<SignedIn>`:
  - `TokenSync` — wires Clerk `getToken()` into axios request interceptor
    (via `setTokenGetter` in `services/api.ts`).
  - `MeBoot` — calls `useMe()` hook which hits `GET /me` once after
    sign-in and caches backend `distributorId` in `localStorage`.

**API client** (`frontend/src/services/api.ts`):
- Base URL from `REACT_APP_API_URL` env var, fallback `http://localhost:3001`.
- Axios request interceptor injects `Authorization: Bearer <clerkToken>`.
- 401s NOT auto-redirected — Clerk `<SignedOut>` handles sign-out UI.

**Identity resolution**:
- Clerk provides `user.id` like `user_2abc…`.
- Backend `/me` returns internal `distributorId` (cuid) plus profile.
- Frontend pages that read `localStorage.getItem('distributorId')` get the
  backend cuid, not the Clerk id.

**Deployment root config**: `vercel.json` (repo root) runs
`cd frontend && npm install --legacy-peer-deps && CI=false npm run build`,
outputs `frontend/build`. SPA rewrites all paths to `index.html`.
**There is no Next.js app anymore** — root `app/`, `lib/`, `prisma/`,
root `middleware.ts`, and root `package.json` were deleted.

**Vercel env vars (bake at build time)**:
- `REACT_APP_CLERK_PUBLISHABLE_KEY` = `pk_test_…` (or `pk_live_…`)
- `REACT_APP_API_URL` = `https://serenvibackend.onrender.com`

---

## Backend (deployed)

**Path**: `backend/`
**Stack**: NestJS 10, TypeScript, Prisma 5.22 (schema `prisma/schema.prisma`),
Express, Passport, `@clerk/backend`, bcrypt, bullmq (unused), helmet,
express-rate-limit, class-validator, razorpay.

**Entry**: `backend/src/main.ts`. Listens on `process.env.PORT || 3001`,
bound to `0.0.0.0` (required for Render). `trust proxy=1` for Render LB.
CORS origin from `FRONTEND_URL` env (comma-separated, no spaces).

**Auth**:
- `backend/src/common/clerk.guard.ts` — the ONLY auth guard in use.
- Verifies Clerk JWT via `verifyToken()` from `@clerk/backend`.
- On every protected request, looks up local `User` by `clerkUserId`.
- **Auto-provisions** `User` + `Distributor` row if missing (first Clerk
  request auto-creates account).
- Populates `req.user = { userId, distributorId, email, isAdmin }` so all
  existing controllers/services keep working unchanged.
- `CommonModule` (`backend/src/common/common.module.ts`) is `@Global()`
  and exports `ClerkGuard`.
- Legacy `JwtStrategy` + `/auth/login`, `/auth/register`, password-reset
  routes still exist but are NOT used by the frontend.

**Endpoint surface** (all `ClerkGuard`-protected except noted):
- `GET /` and `/health` — public, JSON `{ok:true}` for Render health check.
- `GET /me` — returns `{ userId, distributorId, name, email, phone, rank,
  referralCode, walletBalance, isAdmin, … }`. Auto-provisions on first hit.
- `GET /products`, `/products/:id` — public list + detail.
- `POST/PUT/DELETE /products/*` — admin only (`ClerkGuard + AdminGuard`).
- `/distributors/:id/*` (dashboard, team, downline, upline, etc.) — `:id` is
  the backend cuid returned by `/me`, NOT the Clerk id.
- `/wallet/*` (details, history, transactions, deposit, transfer, withdraw).
- `/cart/*` (list, count, add, update, `:productId` delete, clear).
- `/sales`, `/sales/history`, `/sales/stats`.
- `/achievements/progress`, `/achievements/claim/:rankName`,
  `/achievements/milestones`, `/achievements/next-milestone`.
- `/payments/create-order`, `/payments/verify` (Razorpay).
- `/admin/*` (stats, users, orders).

**Database** (Prisma schema at `backend/prisma/schema.prisma`):
- `User` — id, email, password (empty for Clerk users), `clerkUserId`
  (unique + indexed), isAdmin, resetToken/Expiry. 1:1 with Distributor.
- `Distributor` — MLM profile with sponsorId (self-ref), referralCode
  (unique cuid), rank, totalSales, walletBalance, etc.
- `MLMTreeNode` — materialized path for fast ancestor/descendant queries
  (15 levels).
- `Product` — name, description, price (Decimal), category, type
  (`PHYSICAL` / `DIGITAL`), imageUrl, stockQuantity, gender, sizes, isActive.
- `Sale`, `Commission`, `Achievement`, `LeadershipSalary`,
  `WalletTransaction`, `WalletTransfer`, `WithdrawalRequest`, `Deposit`,
  `CartItem`.
- 12 migrations. Latest is `20260415120000_add_clerk_user_id` which adds
  `clerkUserId` to User.
- `prisma migrate deploy` runs on Render every boot via `start:prod`.

**Deployment** (`backend/Dockerfile`):
- `node:18-alpine` with openssl, python3, make, g++ (for bcrypt).
- `npm ci --ignore-scripts` (skips broken `@clerk/shared` postinstall).
- Explicit `npm rebuild bcrypt` because `--ignore-scripts` skipped it.
- `npx prisma generate` + `nest build`.
- CMD `npm run start:prod` runs `prisma migrate deploy && node dist/main`.
- Exposes port 3001.

**Render env vars (required)**:
- `DATABASE_URL` — Supabase **transaction pooler** URI
  (`aws-1-ap-northeast-1.pooler.supabase.com:6543` with
  `?pgbouncer=true&connection_limit=1`). Password must be URL-encoded
  (`#` → `%23`, `$` → `%24`, `&` → `%26`).
- `DIRECT_URL` — Supabase **session pooler** URI (same host, port 5432,
  no pgbouncer params). Required because migrations can't run through
  pgbouncer. Schema uses `directUrl = env("DIRECT_URL")`.
- `CLERK_SECRET_KEY` — `sk_test_…` or `sk_live_…` from Clerk dashboard.
- `FRONTEND_URL` — `https://www.serenvi.app,https://serenvi.app`
  (comma-separated, NO spaces, NO trailing slashes).
- `JWT_SECRET` — random 32+ chars (still referenced by dormant legacy code).
- `NODE_ENV` — `production`.
- `PORT` — `3001` (Render injects its own but we pin this).
- `SMTP_EMAIL`, `SMTP_PASSWORD` — optional; only used by legacy
  password-reset flow.
- Explicitly DO NOT set: `REDIS_URL` (no source code uses it).

---

## Database (Supabase)

- Project ref: `jmfddigrafkxlkooshug`
- Region: `ap-northeast-1` (Tokyo)
- Two connection modes used:
  - Transaction pooler: port `6543`, `?pgbouncer=true&connection_limit=1`.
    Used for app runtime (DATABASE_URL).
  - Session pooler: port `5432`, no params. Used for migrations
    (DIRECT_URL) and one-off scripts like product imports.
- 706 products seeded from two CSVs:
  `backend/data/ajio_products.csv` (Men's, 277 rows → 193 unique inserts)
  and `backend/data/ajio_with_gender.csv` (Women's + mixed, 603 rows →
  513 new inserts).

---

## Important patterns and rules

1. **Never re-introduce root Next.js scaffold.** Deployments target
   `frontend/` CRA build only.
2. **No custom JWT auth.** Clerk is the sole source of identity on both
   frontend and backend. Don't add new `AuthGuard('jwt')` usages;
   always `@UseGuards(ClerkGuard)`.
3. **Distributor identity**: every endpoint that takes `:distributorId` in
   the URL must receive the backend cuid, which the frontend reads from
   `localStorage.getItem('distributorId')` after `/me` runs. Never pass
   Clerk's `user.id` as `distributorId`.
4. **URL-encode Postgres passwords** when setting `DATABASE_URL` /
   `DIRECT_URL`. `#` `$` `&` `@` `:` `/` `?` `%` all need encoding.
5. **CORS**: if adding new deployed frontend domain, update Render env
   `FRONTEND_URL` (comma-separated) or CORS will silently block.
6. **CRA env vars are build-time**: after changing `REACT_APP_*` in Vercel,
   trigger a redeploy — old bundle keeps old values.
7. **Dockerfile must use `--ignore-scripts`** on `npm ci` then
   explicitly `npm rebuild bcrypt`. Changing this will break Render
   builds (see commit `9295476`).

## Common commands

```
# Local backend dev (requires .env with DATABASE_URL pointed at Supabase
# session pooler, or local Postgres)
cd backend && npm run start:dev

# Local frontend dev (needs REACT_APP_CLERK_PUBLISHABLE_KEY + REACT_APP_API_URL in frontend/.env)
cd frontend && npm start

# Import more products from a CSV (drop into backend/data/ first)
cd backend && DATABASE_URL="<session-pooler-url>" npx ts-node scripts/import-ajio-products.ts <filename.csv>

# Verify backend
curl https://serenvibackend.onrender.com/health
curl https://serenvibackend.onrender.com/products | head
```

## Out-of-scope / known dormant

- `backend/src/auth/` — legacy email/password auth. Endpoints exist but
  frontend never calls them. Safe to leave untouched; do not re-enable.
- `frontend/` has `Lottie` animations imported by legacy `Login.tsx` /
  `Register.tsx` patterns — new Clerk-based Login/Register don't use them.
- Rate limiter in `main.ts` targets `/api/*` but routes aren't prefixed
  with `/api` — pre-existing no-op, leave alone.
- Redis / BullMQ — listed in deps, no source code uses them. Don't
  provision Redis unless adding new queue logic.

## Where to find things

- Render dashboard: the backend service owner's Render account.
- Vercel dashboard: frontend project.
- Supabase dashboard: project `jmfddigrafkxlkooshug`.
- Clerk dashboard: get publishable + secret key for each env.
- GitHub repo: `theserenvicompany-sudo/serenviapp` branch `main`.
