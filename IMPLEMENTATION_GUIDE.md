# SERENVI Project - Complete Implementation Guide

## Overview

This is a comprehensive NestJS + React + PostgreSQL MLM platform with:
- **Backend**: NestJS (in `backend/` folder)
- **Frontend**: React 18 (in `frontend/` folder)
- **Database**: PostgreSQL with Prisma ORM
- **Architecture**: Fully separated frontend/backend

## Project Status

### ✅ COMPLETED

**Backend Infrastructure (80%)**
- Database schema (11 models, complete)
- Prisma integration
- Commission service (15-level distribution)
- Achievement service (9-rank system)
- Salary service (monthly 10% pool)
- Auth service (JWT + bcrypt)
- Sales service (transaction management)
- Wallet service (balance & withdrawals)
- Product service (catalog management)
- Distributor service (profile & team)
- Main app module
- Bootstrap (main.ts)
- DTOs and validation
- JWT strategy

**Frontend Setup (30%)**
- Project structure created
- API service layer (axios client with interceptors)
- TypeScript types defined
- Component folders created
- Page folders created

### ⚠️ REMAINING TASKS

**Backend Controllers & Routes (30%)**
- Auth controller
- Sales controller
- Wallet controller
- Products controller
- Distributors controller
- Admin controller

**Frontend Components (60%)**
- Dashboard component & page
- Achievements component & page
- Wallet widget & full page
- Sales/Shop component
- Team/Downline component
- Settings page
- Authentication pages (Login, Register)
- Admin pages

**Configuration & Deployment (10%)**
- Environment setup
- Docker configuration
- Database initialization
- Frontend build configuration

---

## How to Complete Backend (NestJS)

### 1. Create Auth Controller

**File**: `backend/src/auth/auth.controller.ts`

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from '../common/dtos';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.name, dto.phone, dto.sponsorId);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
```

**Update**: `backend/src/app.module.ts`
```typescript
import { AuthController } from './auth/auth.controller';

@Module({
  controllers: [AuthController],
  // ... rest
})
export class AppModule {}
```

### 2. Create Sales Controller

**File**: `backend/src/sales/sales.controller.ts`

```typescript
import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SalesService } from './sales.service';
import { CreateSaleDto } from '../common/dtos';

@Controller('sales')
@UseGuards(AuthGuard('jwt'))
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Post()
  createSale(@Body() dto: CreateSaleDto) {
    // Get sellerId from JWT token (implement custom approach)
    // For now, pass from frontend or implement decorator
  }

  @Get('history')
  history(@Query('skip') skip = 0, @Query('take') take = 20) {
    // Implement similar pattern
  }

  @Get('stats')
  stats() {
    // Implement
  }
}
```

### 3. Create Wallet Controller

**File**: `backend/src/wallet/wallet.controller.ts`

Similar pattern: inject WalletService, add JWT guard, implement endpoints for:
- `GET /wallet` → getWallet()
- `GET /wallet/transactions` → getTransactionHistory()
- `POST /wallet/withdraw` → requestWithdrawal()
- `POST /admin/withdraw/:id/approve` → approveWithdrawal() [admin]
- `POST /admin/withdraw/:id/reject` → rejectWithdrawal() [admin]

### 4. Create Products Controller

**File**: `backend/src/products/product.controller.ts`

Endpoints:
- `GET /products` → getProducts()
- `POST /products` → createProduct() [admin only]
- `GET /products/:id` → getProduct()
- `PUT /products/:id` → updateProduct() [admin only]

### 5. Create Distributors Controller

**File**: `backend/src/distributors/distributor.controller.ts`

Endpoints:
- `GET /distributors/:id` → getProfile()
- `PUT /distributors/:id` → updateProfile()
- `GET /distributors/:id/dashboard` → getDashboard()
- `GET /distributors/:id/team` → getTeamAnalytics()
- `GET /distributors/:id/achievements` → getAchievements()
- `GET /distributors/:id/upline` → getUpline()
- `GET /distributors/:id/downline` → getDownline()

### 6. Update App Module with All Controllers

```typescript
import { AuthController } from './auth/auth.controller';
import { SalesController } from './sales/sales.controller';
import { WalletController } from './wallet/wallet.controller';
import { ProductController } from './products/product.controller';
import { DistributorController } from './distributors/distributor.controller';

@Module({
  controllers: [
    AuthController,
    SalesController,
    WalletController,
    ProductController,
    DistributorController,
  ],
  // ... rest
})
export class AppModule {}
```

### 7. Create NestJS Auth Module

**File**: `backend/src/auth/auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
```

Do the same for Sales, Wallet, Products, Distributors modules.

### 8. Create Module Files

Create for each feature:
- `src/sales/sales.module.ts`
- `src/wallet/wallet.module.ts`
- `src/products/product.module.ts`
- `src/distributors/distributor.module.ts`
- `src/commission/commission.module.ts`
- `src/achievements/achievement.module.ts`
- `src/salary/salary.module.ts`

### 9. Add All Modules to AppModule

```typescript
import { SalesModule } from './sales/sales.module';
import { WalletModule } from './wallet/wallet.module';
// ... etc

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    DatabaseModule,
    PassportModule,
    JwtModule.register(),
    SalesModule,
    WalletModule,
    ProductModule,
    DistributorModule,
    CommissionModule,
    AchievementModule,
    SalaryModule,
  ],
  // ...
})
```

---

## How to Complete Frontend (React)

### 1. Create Custom Hooks

**File**: `frontend/src/hooks/useWallet.ts`

```typescript
import { useEffect, useState } from 'react';
import api from '../services/api';

export const useWallet = (refreshInterval = 30000) => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWallet = async () => {
      setLoading(true);
      try {
        const data = await api.getWallet();
        setWallet(data);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
    const interval = setInterval(fetchWallet, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { wallet, loading };
};
```

Do similar for: `useDashboard`, `useSales`, `useAchievements`, `useTeam`.

### 2. Create Dashboard Component

**File**: `frontend/src/components/Dashboard/Dashboard.tsx`

```typescript
import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';

export const Dashboard: React.FC = () => {
  const distributorId = localStorage.getItem('distributorId') || '';
  const { dashboard, loading } = useDashboard(distributorId);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stat Cards */}
        <StatCard label="Total Sales" value={`₹${dashboard?.totalSales}`} color="blue" />
        <StatCard label="Wallet Balance" value={`₹${dashboard?.walletBalance}`} color="green" />
        <StatCard label="Current Rank" value={dashboard?.rank} color="purple" />
        <StatCard label="Team Size" value={dashboard?.downlineCount} color="orange" />
        <StatCard label="Monthly Commission" value={`₹${dashboard?.monthlyCommission}`} color="indigo" />
        <StatCard label="Achievements" value={dashboard?.achievementsUnlocked} color="pink" />
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: any; color: string }> = ({
  label,
  value,
  color,
}) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
    pink: 'bg-pink-50 border-pink-200 text-pink-600',
  };

  return (
    <div className={`border rounded-lg p-6 ${colorClasses[color]}`}>
      <p className="text-sm font-medium opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
};
```

### 3. Create Wallet Component

**File**: `frontend/src/components/Wallet/Wallet.tsx`

Similar structure with:
- Wallet balance display
- Transaction history table
- Withdrawal form

### 4. Create Achievement Component

Show progress towards next milestone with progress bar and completed achievements list.

### 5. Create Shop/Sales Component

Display products in grid, handle purchase flow.

### 6. Create Pages

**Frontend pages** use components:
- `frontend/src/pages/Dashboard.tsx` → Uses Dashboard component
- `frontend/src/pages/Wallet.tsx` → Uses Wallet component
- `frontend/src/pages/Achievements.tsx` → Uses Achievement component
- `frontend/src/pages/Login.tsx` → Auth form
- `frontend/src/pages/Register.tsx` → Auth form with referral support
- `frontend/src/pages/Shop.tsx` → Product catalog
- `frontend/src/pages/Team.tsx` → Team/downline visualization

### 7. Create App Router

**File**: `frontend/src/App.tsx`

```typescript
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/Common/PrivateRoute';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
        {/* Add other routes */}
      </Routes>
    </BrowserRouter>
  );
};
```

### 8. Create Entry Point

**File**: `frontend/src/index.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 9. Create Public HTML

**File**: `frontend/public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <title>SERENVI - MLM Platform</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

### 10. Create Tailwind Config

**File**: `frontend/tailwind.config.js`

```javascript
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**File**: `frontend/src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Docker (recommended)
docker run -d \
  --name serenvi_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=serenvi_db \
  -p 5432:5432 \
  postgres:15
```

### 2. Update Backend .env

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/serenvi_db"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRATION="24h"
PORT=3000
NODE_ENV="development"
```

### 3. Run Migrations

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed  # If seed file created
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

---

## Installation & Running

### Backend

```bash
cd backend
npm install
npm run start:dev
# Runs on http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000 (configured for dev)
```

**Configure Frontend .env**:

```env
REACT_APP_API_URL=http://localhost:3000/api
```

---

## Deployment Guide

### Docker Compose Setup

Create `docker-compose.yml` in root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: serenvi_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/serenvi_db
      JWT_SECRET: your-secret
      NODE_ENV: production
    depends_on:
      - postgres

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:3000"
    environment:
      REACT_APP_API_URL: http://localhost:3000/api
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Build Dockerfiles

**backend/Dockerfile**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**frontend/Dockerfile**:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Deploy

```bash
docker-compose up -d
```

---

## Testing Checklist

### Backend
- [ ] Register user with sponsor
- [ ] Login and receive JWT token
- [ ] Create product
- [ ] Make a sale → commissions distribute to 15 levels
- [ ] Verify achievement detection triggers
- [ ] Request withdrawal
- [ ] Approve withdrawal → wallet deducted

### Frontend
- [ ] Register page works
- [ ] Login page works
- [ ] Dashboard displays stats
- [ ] can purchase product
- [ ] Wallet shows balance & transactions
- [ ] Can request withdrawal

---

## File Checklist

### Backend Controllers (Create These)
- [ ] `src/auth/auth.controller.ts`
- [ ] `src/auth/auth.module.ts`
- [ ] `src/sales/sales.controller.ts`
- [ ] `src/sales/sales.module.ts`
- [ ] `src/wallet/wallet.controller.ts`
- [ ] `src/wallet/wallet.module.ts`
- [ ] `src/products/product.controller.ts`
- [ ] `src/products/product.module.ts`
- [ ] `src/distributors/distributor.controller.ts`
- [ ] `src/distributors/distributor.module.ts`
- [ ] `src/commission/commission.module.ts`
- [ ] `src/achievements/achievement.module.ts`
- [ ] `src/salary/salary.module.ts`
- [ ] `src/admin/admin.controller.ts` (optional)
- [ ] `src/admin/admin.module.ts` (optional)

### Frontend Components (Create These)
- [ ] `src/components/Auth/LoginForm.tsx`
- [ ] `src/components/Auth/RegisterForm.tsx`
- [ ] `src/components/Dashboard/Dashboard.tsx`
- [ ] `src/components/Wallet/Wallet.tsx`
- [ ] `src/components/Achievements/Achievements.tsx`
- [ ] `src/components/Shop/Shop.tsx`
- [ ] `src/components/Team/Team.tsx`
- [ ] `src/components/Common/PrivateRoute.tsx`
- [ ] `src/components/Common/Layout.tsx`
- [ ] `src/pages/LoginPage.tsx`
- [ ] `src/pages/RegisterPage.tsx`
- [ ] `src/pages/DashboardPage.tsx`
- [ ] `src/pages/WalletPage.tsx`
- [ ] `src/pages/ShopPage.tsx`

### Frontend Config (Create These)
- [ ] `src/App.tsx`
- [ ] `src/index.tsx`
- [ ] `src/index.css`
- [ ] `tsconfig.json`
- [ ] `tailwind.config.js`
- [ ] `.env.example`

### Deployment Files (Create These)
- [ ] `docker-compose.yml`
- [ ] `backend/Dockerfile`
- [ ] `frontend/Dockerfile`
- [ ] `.dockerignore` (both folders)
- [ ] `README.md` (root level)
- [ ] `DEPLOYMENT.md` (root level)

---

## Next Steps

1. **Complete NestJS Controllers** (Estimated 3-4 hours)
   - Follow controller pattern for all 6 modules
   - Add modules to AppModule

2. **Create React Components** (Estimated 6-8 hours)
   - Implement dashboard, wallet, achievements
   - Create authentication forms
   - Build product shop & team view

3. **Test Flows End-to-End** (Estimated 4-5 hours)
   - Register → Login → Make sale → Check commissions
   - Verify 15-level distribution
   - Test achievement milestones
   - Test withdrawal flow

4. **Deploy to Production** (Estimated 2-3 hours)
   - Set up PostgreSQL on server
   - Build Docker images
   - Deploy via Docker Compose or Kubernetes

---

## Support Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [React 18 Documentation](https://react.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Generated**: March 2025  
**Status**: Implementation Guide - 40% Complete (Architecture Ready)
