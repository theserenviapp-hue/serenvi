# 🚀 Eloxa - Get Started in 5 Minutes

## Step 1: Start the Development Server
```bash
npm run dev
```
Server will start at: **http://localhost:3000**

## Step 2: Test the Application
1. Open your browser to http://localhost:3000
2. Click "Sign Up" to create an account
3. Log in with your credentials
4. Explore the dashboard

## Step 3: View Database (Optional)
```bash
npx prisma studio
```
This opens a GUI to view and edit database records at http://localhost:5555

## Step 4: Create Test Data (Optional)
In Prisma Studio:
1. Go to "Product" table
2. Click "+ Create" button
3. Add a test product:
   - name: "Test Course"
   - description: "A test product"
   - price: 299
   - fileUrl: "https://example.com/file.pdf"
   - isActive: true

## Step 5: Test Product Purchase
1. Go to Dashboard → Shop
2. Click "Purchase" on your test product
3. View balance and bonuses in Dashboard

---

## ✨ What You Can Do Right Now

### As a User
- ✅ Register with Member ID & referral code
- ✅ View dashboard stats
- ✅ Browse and purchase products
- ✅ View wallet balance
- ✅ Request withdrawals
- ✅ See your earned bonuses

### As an Admin
- ✅ Create new products
- ✅ View all members
- ✅ Distribute bonuses manually
- ✅ View withdrawal requests
- ✅ See financial stats

---

## 📖 Documentation Files

Read these in this order:

1. **QUICK_START.md** ← Start here (5 min read)
2. **DELIVERY_SUMMARY.md** ← What you got (10 min read)
3. **SETUP_GUIDE.md** ← Full setup details (15 min read)

---

## 🔧 Essential Commands

```bash
# Start development
npm run dev

# View/edit database
npx prisma studio

# Create migrations
npx prisma migrate dev --name add_feature

# Format code
npm run lint

# Build for production
npm run build

# Run production version
npm run start
```

---

## 🎯 Main Folders to Know

| Folder | Purpose |
|--------|---------|
| `app/` | All pages and API routes |
| `components/` | Reusable React components |
| `lib/` | Utilities, Prisma, bonus logic |
| `prisma/` | Database schema |

---

## 💰 Test the Bonus System

1. **Register 2 users**
   - User A with no referral
   - User B with referral code = User A's Member ID

2. **Create a product**
   - Use Prisma Studio: Product → Create

3. **User B buys the product**
   - Dashboard → Shop → Purchase

4. **Check bonuses**
   - User A → Dashboard → Bonuses (Step Up earned)
   - User B → Dashboard → Wallet (balance updated)

5. **Admin triggers daily bonus**
   - http://localhost:3000/admin/bonuses
   - Click "Distribute Now" for Fast Track

---

## 🌐 Quick URLs

```
Home              http://localhost:3000
Register          http://localhost:3000/register
Login             http://localhost:3000/login
Dashboard         http://localhost:3000/overview
Shop              http://localhost:3000/shop
Wallet            http://localhost:3000/wallet
Bonuses           http://localhost:3000/bonuses/fast-track
Admin              http://localhost:3000/admin/products
Database UI       http://localhost:5555 (npx prisma studio)
```

---

## ⚠️ Common Issues & Fixes

**Problem**: "Database URL is not set"
- **Fix**: Create `.env.local` file (copy from `.env.example`)

**Problem**: "Port 3000 is already in use"
- **Fix**: Run on different port: `npm run dev -- -p 3001`

**Problem**: Database tables don't exist
- **Fix**: Run migrations: `npx prisma migrate dev`

**Problem**: Can't view Prisma Studio
- **Fix**: Make sure PostgreSQL is running and DATABASE_URL is correct

---

## 🎓 Learn the Code

### Key Files to Review

**1. Database Schema**
```
prisma/schema.prisma
```
Shows all database tables and relationships

**2. Bonus Logic**
```
lib/bonus-engine/fast-track.ts    ← 40% daily distribution
lib/bonus-engine/step-up.ts       ← instant per-purchase
lib/bonus-engine/talent-dividend.ts ← 30% monthly
```

**3. API Endpoints**
```
app/api/auth/login/route.ts
app/api/products/purchase/route.ts
app/api/bonuses/distribute/route.ts
```

**4. Pages**
```
app/(dashboard)/overview/page.tsx    ← Main dashboard
app/admin/products/page.tsx          ← Admin area
```

---

## 🚀 Next: Production Setup

When ready to go live:

1. **Set up real PostgreSQL** (Supabase recommended)
   ```
   Update DATABASE_URL in .env.local
   ```

2. **Add Payment Processing** (Razorpay)
   ```
   Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
   ```

3. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

4. **Enable Supabase Auth** (in production)
   ```
   Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

See `SETUP_GUIDE.md` for detailed instructions.

---

## 🎁 You Have Everything

The platform is **100% functional** and ready for:
- ✅ Local testing
- ✅ Feature development
- ✅ Bug fixes
- ✅ Performance optimization
- ✅ Production deployment

---

## 💬 Questions?

1. Read the docs (QUICK_START.md → SETUP_GUIDE.md)
2. Check error messages in terminal
3. Use Prisma Studio to verify database state
4. Review API responses in browser DevTools

---

## 🎉 You're All Set!

```bash
npm run dev
```

Go to **http://localhost:3000** and start building! 🚀

---

**Time to finish**: 5 minutes  
**Time to understand**: 1 hour  
**Time to customize**: As you need!

Enjoy! 🎊
