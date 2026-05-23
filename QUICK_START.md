# ⚡ Eloxa Quick Start Cheat Sheet

## 🚀 Start Coding Right Now

```bash
# Development server is already running!
npm run dev
# Opens at http://localhost:3000
```

---

## 📋 Essential Commands

```bash
# View database UI
npx prisma studio

# Create database migration
npx prisma migrate dev --name migration_name

# Format code
npm run lint

# Build production
npm run build
```

---

## 🧪 Test Account Setup

**No database needed for quick demo:**

1. App loads at **http://localhost:3000**
2. Click "Sign Up" → Register
3. Click "Sign In" → Login
4. Explore Dashboard → Shop → Products

---

## 📁 Key Files to Edit

```
lib/bonus-engine/
  ├── fast-track.ts         ← Bonus logic (40% daily)
  ├── step-up.ts            ← Per-purchase bonus
  └── talent-dividend.ts    ← Monthly team bonus

app/api/                     ← API endpoints
app/(dashboard)/             ← User pages
app/admin/                   ← Admin pages
components/                  ← React components
prisma/schema.prisma        ← Database schema
```

---

## 🔑 Environment Variables

Create `.env.local`:

```env
# Minimum for local development
DATABASE_URL="postgresql://user:pass@localhost:5432/eloxa"

# Optional but recommended
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
RAZORPAY_KEY_ID="rzp_test_xxxxx"
RAZORPAY_KEY_SECRET="your-secret"
```

---

## 💡 Most Used Code Patterns

### Create API Endpoint
```typescript
// app/api/myroute/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const data = await prisma.user.findMany();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error message' },
      { status: 500 }
    );
  }
}
```

### Create React Page
```typescript
// app/(dashboard)/mypage/page.tsx
'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function MyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Page Title</h1>
      <Card title="Card Title">
        <Button>Click me</Button>
      </Card>
    </div>
  );
}
```

### Distribute Bonus (in API route)
```typescript
import { distributeFastTrackBonus } from '@/lib/bonus-engine/fast-track';
import { distributeStepUpBonus } from '@/lib/bonus-engine/step-up';

// Daily
await distributeFastTrackBonus();

// Per purchase
await distributeStepUpBonus(userId, price);
```

---

## 🌐 Page URLs (Once Running)

```
Home                    http://localhost:3000/
Register                http://localhost:3000/register
Login                   http://localhost:3000/login

Dashboard
├─ Overview             http://localhost:3000/overview
├─ Shop                 http://localhost:3000/shop
├─ Wallet               http://localhost:3000/wallet
├─ Team                 http://localhost:3000/team
└─ Bonuses              http://localhost:3000/bonuses/fast-track

Admin
├─ Products             http://localhost:3000/admin/products
├─ Members              http://localhost:3000/admin/members
├─ Bonuses              http://localhost:3000/admin/bonuses
├─ Withdrawals          http://localhost:3000/admin/withdrawals
└─ Financials           http://localhost:3000/admin/financials
```

---

## 📊 Database Tables (Prisma)

```typescript
User              // Members
Wallet            // User balances
Product           // Products for sale
UserProduct       // Purchases
Bonus             // Bonus records
Withdrawal        // Withdrawal requests
```

View/edit in Prisma Studio:
```bash
npx prisma studio
```

---

## 👥 User Flow

```
Register (with referral code)
    ↓
Create account & auto-create wallet
    ↓
Login
    ↓
Dashboard (see earnings, rank, referrals)
    ↓
Shop (buy products)
    ↓
Earn bonuses automatically
    ↓
Withdraw to bank account
```

---

## 💰 Bonus System At a Glance

| Bonus | Trigger | Rate | Distribution |
|-------|---------|------|--------------|
| **Fast Track** | Daily | 40% of sales | Multiplier based |
| **Step Up** | Each purchase | 25/5/2.5/1% | 25 levels deep |
| **Talent Dividend** | Monthly | 30% of team sales | Proportional |

**Trigger distributions:**
```bash
# Admin panel button
http://localhost:3000/admin/bonuses

# Or API endpoint
POST /api/bonuses/distribute
{ "bonusType": "FAST_TRACK" }
```

---

## 🔌 API Quick Reference

```bash
# Register
POST /api/auth/register
{ "memberId", "email", "phone", "name", "password", "referralCode" }

# Login
POST /api/auth/login
{ "email", "password" }

# Get Products
GET /api/products

# Buy Product
POST /api/products/purchase
{ "userId", "productId", "paymentMethod" }

# Get Wallet
GET /api/wallet?userId=X

# Withdraw
POST /api/withdrawals
{ "userId", "amount", "bankDetails" }

# Get Bonuses
GET /api/bonuses?userId=X

# User Profile
GET /api/members/me?userId=X
```

---

## ⚙️ Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js config |
| `tsconfig.json` | TypeScript config |
| `tailwind.config.ts` | Tailwind CSS config |
| `postcss.config.mjs` | PostCSS config |
| `prisma/schema.prisma` | Database schema |
| `.env.local` | Environment variables |
| `middleware.ts` | Auth middleware |

---

## 🚀 Next Big Steps

1. **Set up PostgreSQL** → `.env.local` DATABASE_URL
2. **Run migrations** → `npx prisma migrate dev`
3. **Test locally** → Register user, buy product, check bonuses
4. **Add Supabase Auth** → Update `app/api/auth/`
5. **Deploy to Vercel** → `vercel`

---

## 💬 Common Questions

**Q: How do I test purchases without real payments?**
A: Use payment method "ADMIN_FREE" in admin panel

**Q: How do I trigger bonuses?**
A: Admin panel → http://localhost:3000/admin/bonuses

**Q: How do I add more products?**
A: Admin panel → http://localhost:3000/admin/products

**Q: How do I see the database?**
A: Run `npx prisma studio`

**Q: How do I reset everything?**
A: Delete `.env.local`, remove DB, restart

---

## 🎯 What's Ready

✅ Full-stack MLM platform  
✅ User authentication flow  
✅ Product shop with purchases  
✅ Wallet management  
✅ Bonus engine (3 types)  
✅ Referral system  
✅ Withdrawal system  
✅ Admin dashboard  
✅ Responsive UI  
✅ TypeScript throughout  

---

## 🔒 Production Checklist

- [ ] Set DATABASE_URL to production database
- [ ] Enable HTTPS
- [ ] Set up Supabase Auth
- [ ] Configure Razorpay (live keys)
- [ ] Add Cloudflare R2 for files
- [ ] Set up Inngest cron jobs
- [ ] Enable database backups
- [ ] Add monitoring/logging
- [ ] Security audit (input validation, RLS)
- [ ] Deploy to Vercel
- [ ] Configure custom domain

---

**Go build! 🚀**

```bash
npm run dev
```

---

Last Updated: March 5, 2026
