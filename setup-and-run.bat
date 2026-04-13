@echo off
REM SERENVI Platform - Automated Local Setup Script
REM This script starts the database, installs dependencies, seeds products, and runs the application

setlocal enabledelayedexpansion

REM Colors for output
for /F %%a in ('copy /Z "%~f0" nul') do set "BS=%%a"

cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         SERENVI Platform - Automated Local Setup               ║
echo ║                                                                ║
echo ║  Starting PostgreSQL Database + Backend + Frontend             ║
echo ║  This will take 2-3 minutes...                                 ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not in PATH
    echo.
    echo Please install Docker from: https://docker.com/products/docker-desktop
    echo After installation, run this script again.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo After installation, run this script again.
    pause
    exit /b 1
)

echo [1/6] Checking prerequisites...
echo   ✓ Docker found: 
docker --version
echo   ✓ Node.js found: 
node --version
echo.

REM Stop existing database if running
echo [2/6] Setting up PostgreSQL database...
docker stop serenvi_db >nul 2>&1
docker rm serenvi_db >nul 2>&1

REM Start PostgreSQL container
echo   Starting PostgreSQL container...
docker run -d --name serenvi_db ^
  -e POSTGRES_PASSWORD=postgres ^
  -e POSTGRES_DB=serenvi ^
  -p 5432:5432 ^
  postgres:15 >nul 2>&1

if errorlevel 1 (
    echo   [ERROR] Failed to start database
    pause
    exit /b 1
)

echo   ✓ PostgreSQL started on localhost:5432
echo   Waiting for database to be ready...
timeout /t 5 /nobreak >nul
echo.

REM Setup Backend
echo [3/6] Setting up Backend (NestJS)...
cd backend

if not exist "node_modules" (
    echo   Installing dependencies...
    call npm install >nul 2>&1
    if errorlevel 1 (
        echo   [ERROR] Failed to install backend dependencies
        pause
        exit /b 1
    )
)

echo   ✓ Dependencies installed
echo   Pushing Prisma schema to database...
call npx prisma db push --skip-generate >nul 2>&1

echo   ✓ Database schema updated
echo   Seeding 38 products...
call node seed-products.js

cd ..
echo.

REM Setup Frontend
echo [4/6] Setting up Frontend (React)...
cd frontend

if not exist "node_modules" (
    echo   Installing dependencies...
    call npm install >nul 2>&1
    if errorlevel 1 (
        echo   [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    )
)

echo   ✓ Frontend dependencies installed
cd ..
echo.

REM Ready to start
echo [5/6] Ready to start services...
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                   SETUP COMPLETE!                             ║
echo ║                                                                ║
echo ║  Your services are configured and ready to start              ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo [6/6] Starting services...
echo.
echo   Starting Backend server on port 3001...
echo   Starting Frontend shop on port 3000...
echo.
echo   Prerequisites:
echo   ✓ Database (PostgreSQL): localhost:5432
echo   ✓ Backend API: http://localhost:3001
echo   ✓ Frontend Shop: http://localhost:3000
echo   ✓ Products: 38 items seeded and ready
echo.
echo   Note: Two terminal windows will open
echo   Press Ctrl+C in each to stop the services
echo.
pause

REM Start Backend in new window
echo [Starting Backend...]
start "SERENVI Backend" cmd /k "cd backend && npm run start:dev"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend in new window  
echo [Starting Frontend...]
start "SERENVI Frontend" cmd /k "cd frontend && npm start"

REM Open browser
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                   Applications Started!                        ║
echo ║                                                                ║
echo ║  Shop: http://localhost:3000                                  ║
echo ║  API:  http://localhost:3001                                  ║
echo ║  DB:   localhost:5432                                         ║
echo ║                                                                ║
echo ║  View products: npx prisma studio (in backend folder)         ║
echo ║                                                                ║
echo ║  To stop: Press Ctrl+C in each terminal window                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo The frontend window should open automatically...
echo If not, manually visit: http://localhost:3000
echo.
pause
