# SERENVI Platform - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you run the SERENVI e-commerce platform locally with all the products from your spreadsheet.

---

## Prerequisites Check

### 1. Install Node.js (if you haven't)
- Download from: https://nodejs.org/ (Get v18+ LTS)
- Verify: Open PowerShell and run `node -v`

### 2. Install Docker (if you haven't)  
- Download from: https://docker.com/products/docker-desktop
- Install and start Docker Desktop
- Verify: Open PowerShell and run `docker --version`

---

## Quick Start Steps

### Step 1️⃣: Start PostgreSQL Database (2 minutes)

Open **PowerShell** as Administrator and run:

```powershell
docker run -d --name serenvi_db `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=serenvi `
  -p 5432:5432 `
  postgres:15
```

Wait 3-5 seconds for the database to start. Verify it's running:
```powershell
docker ps
```

You should see `serenvi_db` running.

---

### Step 2️⃣: Setup & Seed Products (3 minutes)

Navigate to your project directory:
```powershell
cd "C:\Users\Aryaman Mandal\OneDrive\Desktop\serenvi"
```

Then run:
```powershell
cd backend
npm install
```

Update the database schema:
```powershell
npx prisma db push
```

Seed your 38 products:
```powershell
node seed-products.js
```

You should see output like:
```
✓ Added: RED TAPE Men Lace-Up Walking Shoes
✓ Added: ZIVAWA Men Casual Shirts
... (36 more products)
✅ Successfully seeded 38 products!
```

---

### Step 3️⃣: Start the Backend & Frontend

**Open Terminal 1 - Backend Server:**
```powershell
cd backend
npm run start:dev
```

Wait for:
```
[Nest] 12345 - 04/10/2026, 10:30:45 AM     LOG [NestFactory] Nest application successfully started
```

**Open Terminal 2 (separate window) - Frontend:**
```powershell
cd frontend
npm install
npm start
```

The frontend will automatically open at: **http://localhost:3000**

---

## What's Now Running

- **Database**: PostgreSQL on `localhost:5432`
- **Backend API**: http://localhost:3001
- **Frontend Shop**: http://localhost:3000
- **38 Products**: All seeded and ready to browse!

---

## Test It Out

1. Open: **http://localhost:3000**
2. Browse the product catalog
3. Add products to cart
4. View your orders
5. Check database with: `npx prisma studio` (while backend is running)

---

## Database Connection Details

```
Host:     localhost
Port:     5432
Username: postgres
Password: postgres
Database: serenvi
```

---

## Common Issues & Fixes

### Issue: "Docker command not found"
- Docker is not installed or not in PATH
- Solution: Install Docker Desktop from https://docker.com/products/docker-desktop
- Restart PowerShell after installation

### Issue: "Port 5432 already in use"  
```powershell
docker stop serenvi_db
docker rm serenvi_db
# Then run the docker run command again
```

### Issue: "Cannot connect to database"
```powershell
# Check if container is running
docker ps

# Check logs
docker logs serenvi_db

# Restart if needed
docker restart serenvi_db
```

### Issue: "npm install fails"
```powershell
npm cache clean --force
rm -r node_modules package-lock.json
npm install
```

### Issue: "Port 3000 or 3001 in use"
```powershell
# Kill process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## Stop Everything When Done

```powershell
# Stop database
docker stop serenvi_db

# Optional: Remove database container (clears data)
docker rm serenvi_db
```

---

## Next Steps

After things are running:

1. **Customize Products**: Edit prices, descriptions, images in the database
2. **Change Images**: Update `imageUrl` field in products
3. **Add More Products**: Edit `backend/seed-products.js` and re-run
4. **Setup Payments**: Configure Razorpay API keys in `.env`
5. **Deploy**: Use the provided Docker Compose for production

---

## Project Structure

```
serenvi/
├── backend/                   # NestJS API
│   ├── src/                   # Source code
│   ├── prisma/                # Database schema
│   ├── seed-products.js       # Product seeding ✓ Updated
│   └── .env                   # Database connection ✓ Updated
│
├── frontend/                  # React Shop
│   ├── src/
│   ├── public/
│   └── .env.local            # API configuration
│
├── LOCAL_SETUP.md            # Detailed guide
└── .env                       # Root database URL ✓ Updated
```

---

## Product Categories included:
- 👟 Footwear (13 products)
- 👕 Clothing (22 products)  
- 🌾 Ethnic Wear (1 product)
- ✅ **Total: 38 Products Ready to Sell**

---

## Need More Help?

1. Check [./LOCAL_SETUP.md](./LOCAL_SETUP.md) for detailed instructions
2. Review [./QUICK_START.md](./QUICK_START.md) for command reference
3. Check Docker logs: `docker logs serenvi_db`
4. Check backend logs: Look at Terminal 1 output
5. View database: Run `npx prisma studio` in `backend/` directory

---

**You're all set! 🎉 The SERENVI platform is ready for local development.**

Your shop is running at: **http://localhost:3000**
