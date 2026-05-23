# 🚀 Eloxa MLM Platform

The ultimate AI-powered MLM fintech platform built with Next.js, TypeScript, Prisma, and Tailwind CSS.

## 📋 Table of Contents

- [Stack Overview](#stack-overview)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Database Setup](#database-setup)
- [Features](#features)
- [API Routes](#api-routes)
- [Bonus Engine](#bonus-engine)
- [Deployment](#deployment)

## 🏗️ Stack Overview

- **Frontend**: Next.js 14 (App Router) + React + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Prisma ORM
- **Database**: PostgreSQL (Supabase or self-hosted)
- **Authentication**: Supabase Auth (with fallback to local JWT)
- **Payments**: Razorpay (UPI, bank transfers)
- **File Storage**: Cloudflare R2
- **Bonus Jobs**: Inngest (optional, cron-based for now)
- **Deployment**: Vercel + Supabase

## 📁 Project Structure

```
eloxa/
├── app/
│   ├── (auth)/                    # Auth routes
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/               # User dashboard
│   │   ├── overview/page.tsx
│   │   ├── shop/page.tsx
│   │   ├── wallet/page.tsx
│   │   ├── team/page.tsx
│   │   ├── bonuses/
│   │   │   └── fast-track/page.tsx
│   │   └── settings/page.tsx
│   ├── admin/                     # Admin panel
│   │   ├── members/page.tsx
│   │   ├── products/page.tsx
│   │   ├── bonuses/page.tsx
│   │   ├── withdrawals/page.tsx
│   │   └── financials/page.tsx
│   ├── api/                       # API routes
│   │   ├── auth/
│   │   ├── members/
│   │   ├── products/
│   │   ├── wallet/
│   │   ├── bonuses/
│   │   └── withdrawals/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── dashboard/                 # Dashboard components
│   │   ├── StatCard.tsx
│   │   └── BonusTable.tsx
│   ├── admin/
│   ├── ui/                        # Reusable UI components
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   └── Navigation.tsx
├── lib/
│   ├── prisma.ts                  # Prisma client
│   ├── supabase.ts                # Supabase client
│   ├── razorpay.ts                # Razorpay config
│   ├── types.ts                   # TypeScript types
│   └── bonus-engine/              # Bonus logic
│       ├── fast-track.ts
│       ├── step-up.ts
│       └── talent-dividend.ts
├── prisma/
│   └── schema.prisma              # Database schema
└── middleware.ts                  # Auth middleware
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (or Supabase account)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your database URL and API keys:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/eloxa"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
RAZORPAY_KEY_ID="your-key-id"
RAZORPAY_KEY_SECRET="your-key-secret"
```

### 3. Set Up Database

```bash
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Generate Prisma client

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 💾 Database Setup

### Using Supabase (Recommended for Production)

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy the connection string
3. Add to `.env.local`:

```env
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

### Using Local PostgreSQL

1. Install PostgreSQL
2. Create a database:

```bash
createdb eloxa
```

3. Add to `.env.local`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/eloxa"
```

### Apply Migrations

```bash
npx prisma migrate dev
```

### View Database (GUI)

```bash
npx prisma studio
```

## ✨ Features

### User Dashboard

- **Overview**: View earnings, referrals, current rank
- **Shop**: Browse and purchase products
- **Wallet**: View balances, deposit, withdraw
- **Team**: See referrals and downline structure
- **Bonuses**: Track all bonus earnings by type
- **Settings**: Manage account preferences

### Admin Panel

- **Products**: Create and manage products
- **Members**: View all members and their data
- **Bonuses**: Manually trigger bonus distributions
- **Withdrawals**: Approve/reject withdrawal requests
- **Financials**: View platform earnings and metrics

### Bonus System

**Fast Track** (Daily):
- 40% of daily sales pool
- Requires 3+ direct referrals
- Multiplier = 3 + (directReferrals - 3)

**Step Up** (Instant):
- Triggered on product purchase
- Distributed across 25 levels
- Decreasing percentages (25%, 5%, 2.5%, 1%)

**Talent Dividend** (Monthly):
- 30% of team sales pool
- Distributed based on proportion

## 📡 API Routes

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products

- `GET /api/products` - Get all products
- `POST /api/products` - Create product (admin)
- `POST /api/products/purchase` - Purchase product

### Wallet

- `GET /api/wallet` - Get wallet balance
- `POST /api/wallet` - Top up or transfer funds

### Bonuses

- `GET /api/bonuses` - Get user bonuses
- `POST /api/bonuses/distribute` - Trigger distribution (admin)

### Withdrawals

- `GET /api/withdrawals` - Get withdrawal history
- `POST /api/withdrawals` - Request withdrawal

### Members

- `GET /api/members/me` - Get current user profile

## 🎯 Bonus Engine

The bonus engine is located in `lib/bonus-engine/` and handles automatic distribution:

### Running Bonuses Manually

```typescript
// Fast Track
import { distributeFastTrackBonus } from '@/lib/bonus-engine/fast-track';
await distributeFastTrackBonus();

// Step Up (automatic on purchase)
import { distributeStepUpBonus } from '@/lib/bonus-engine/step-up';
await distributeStepUpBonus(userId, productPrice);

// Talent Dividend
import { distributeTalentDividend } from '@/lib/bonus-engine/talent-dividend';
await distributeTalentDividend();
```

### Setting Up Cron Jobs with Inngest (Production)

```typescript
// Install Inngest
npm install inngest

// Create inngest/fast-track-cron.ts
import { inngest } from './client';
import { distributeFastTrackBonus } from '@/lib/bonus-engine/fast-track';

export const fastTrackCron = inngest.createFunction(
  { id: 'fast-track-cron' },
  { cron: 'TZ=Asia/Kolkata 0 0 * * *' }, // Daily at midnight IST
  async () => {
    await distributeFastTrackBonus();
  }
);
```

## 🌐 Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

1. Connect GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy

### Environment Variables in Vercel

```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

## 🔐 Security Notes

- Always use environment variables for secrets
- Enable row-level security (RLS) in Supabase
- Use HTTPS in production
- Validate all API inputs with Zod
- Implement rate limiting on API routes
- Use secure cookies with `httpOnly` flag

## 📚 Next Steps

1. **Connect Supabase Auth**: Replace local JWT with Supabase authentication
2. **Integrate Razorpay**: Complete payment flow
3. **Add Cloudflare R2**: Upload product files
4. **Deploy Inngest**: Set up production cron jobs
5. **Add Analytics**: Track user behavior
6. **Implement Testing**: Add Jest + React Testing Library

## 🤝 Contributing

This is a full-stack template. Customize it for your needs:

- Modify bonus logic in `lib/bonus-engine/`
- Add new features in appropriate `app/` folders
- Create components in `components/`
- Extend API routes in `app/api/`

## 📞 Support

For issues or questions, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

**Built with ❤️ for AI-assisted development**
