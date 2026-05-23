# SERENVI Platform - Local Hosting & Setup Guide

This guide will help you add the products and run the SERENVI platform locally on your machine.

## Prerequisites

- **Node.js 16+** (Download from https://nodejs.org/)
- **Docker Desktop** (Download from https://docker.com/products/docker-desktop)
- **Git** (Optional, already have the code)

## System Requirements

- RAM: 4GB minimum (8GB recommended)
- Storage: 5GB free space
- OS: Windows 10+, macOS 10.12+, or Linux

---

## Quick Start (3 Steps)

### Step 1: Start the Database

```powershell
# Open PowerShell and run:
docker run -d --name serenvi_db `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=serenvi `
  -p 5432:5432 `
  postgres:15
```

Wait 3-5 seconds for the database to start.

### Step 2: Build & Seed Products

```powershell
# Navigate to the project root and run setup
cd backend
npm install
npx prisma db push
node seed-products-new.js
```

### Step 3: Start Backend & Frontend

**Terminal 1 - Backend:**
```powershell
cd backend
npm run start:dev
# Backend will run on http://localhost:3001
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm install
npm start
# Frontend will run on http://localhost:3000
```

---

## Detailed Setup Instructions

### 1. Database Setup

#### Using Docker (Recommended)

```powershell
# Start PostgreSQL container
docker run -d --name serenvi_db `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=serenvi `
  -p 5432:5432 `
  postgres:15

# Check if container is running
docker ps

# View logs
docker logs serenvi_db
```

**Connection Details:**
- Host: `localhost`
- Port: `5432`
- Username: `postgres`
- Password: `postgres`
- Database: `serenvi`

#### Stopping/Removing Database
```powershell
# Stop the container
docker stop serenvi_db

# Remove the container (reset data)
docker rm serenvi_db
```

### 2. Backend Setup

```powershell
cd backend
```

#### Install Dependencies
```powershell
npm install
```

#### Database Migrations & Seeding

```powershell
# Push schema to database
npx prisma db push

# View Prisma Studio (optional, to inspect database)
npx prisma studio

# Seed products
node seed-products-new.js
```

#### Start Backend Server
```powershell
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm start
```

The backend API will be available at: **http://localhost:3001**

### 3. Frontend Setup

```powershell
cd frontend
```

#### Install Dependencies
```powershell
npm install
```

#### Create Environment File
```powershell
# Create .env.local file
@"
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=development
"@ | Out-File ".env.local" -Encoding UTF8
```

#### Start Frontend Server
```powershell
npm start
```

The frontend will open at: **http://localhost:3000**

---

## Verify Installation

### Check Backend is Running
```
curl http://localhost:3001/health
```

### Check Products are Loaded
```
curl http://localhost:3001/products
```

### Check Frontend is Running
Open browser and visit: `http://localhost:3000`

---

## Common Issues & Solutions

### Issue: "Port 5432 already in use"
```powershell
# Find and stop the existing container
docker ps
docker stop serenvi_db
docker rm serenvi_db

# Then restart with the command above
```

### Issue: "Cannot connect to database"
1. Check database is running: `docker ps`
2. Check .env file has correct DATABASE_URL
3. Verify database is ready: `docker logs serenvi_db`

### Issue: "npm install fails"
```powershell
# Clear npm cache
npm cache clean --force

# Remove node_modules and try again
Remove-Item -Recurse -Force node_modules
npm install
```

### Issue: "Port 3000 or 3001 in use"
```powershell
# Find process using the port
Get-Process | Where-Object {$_.Handles -match "3000"} | Stop-Process -Force

# Or change the port
$env:PORT=3002
npm start
```

---

## File Structure

```
serenvi/
├── backend/                  # NestJS API Server
│   ├── src/                  # Source code
│   ├── prisma/               # Database schema
│   ├── seed-products-new.js  # Product seeding script
│   └── package.json
│
├── frontend/                 # React Frontend
│   ├── public/               # Static files
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   └── App.jsx
│   └── package.json
│
├── prisma/                   # Shared Prisma schema
│   └── schema.prisma
│
└── .env                      # Environment variables (database URL)
```

---

## Database Schema

### Products Table
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price FLOAT NOT NULL,
  fileUrl TEXT NOT NULL,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Product Count
All 42+ products have been seeded into the database and are ready for sale.

---

## Environment Variables

### Root .env (Database Connection)
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/serenvi"
```

### Backend .env (Optional)
```
BACKEND_URL=http://localhost:3001
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

### Frontend .env.local
```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=development
```

---

## Testing the Shop

1. Open **http://localhost:3000** in your browser
2. Browse the product catalog
3. Add products to cart
4. Complete checkout
5. View your orders

---

## Performance Tips

- Use `npm run build` to create optimized production builds
- Enable browser DevTools to monitor network requests
- Use `npx prisma studio` to monitor database changes
- Check logs in `.env` or terminal for errors

---

## Next Steps

1. Customize product images by updating `fileUrl` in database
2. Add payment gateway integration (Razorpay configured)
3. Set up user authentication
4. Configure email notifications
5. Deploy to production (Render.yaml provided)

---

## Getting Help

Check these files for detailed information:
- [QUICK_START.md](./QUICK_START.md) - Quick reference
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Architecture details
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Production deployment

---

## Troubleshooting

### Backend won't start
```powershell
# Check Node.js version
node -v  # Should be v16 or higher

# Check if port is available
netstat -ano | findstr :3001

# Reinstall dependencies
npm ci
npm run start:dev
```

### Products not showing
```powershell
# Re-seed products
cd backend
node seed-products-new.js

# Check database
npx prisma studio
```

### Frontend blank page
```powershell
# Clear cache and reinstall
npm cache clean --force
Remove-Item -Recurse -Force node_modules
npm install
npm start
```

---

## Contact & Support

For issues or questions:
1. Check existing documentation
2. Review error logs in terminal
3. Verify environment variables
4. Ensure all services are running (Database, Backend, Frontend)

---

**Last Updated:** April 2026  
**Version:** 1.0.0  
**Status:** Ready for Local Development ✓
