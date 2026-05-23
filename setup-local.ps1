#!/usr/bin/env powershell

# SERENVI Local Development Setup Script
# This script sets up and runs the entire SERENVI platform locally

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "SERENVI Platform - Local Development Setup" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Node.js $(node -v) found" -ForegroundColor Green
Write-Host ""

# Setup Database
Write-Host "Step 1: Setting up PostgreSQL database..." -ForegroundColor Cyan
Write-Host "Checking if Docker is running..." -ForegroundColor Yellow

$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Docker is running" -ForegroundColor Green
    
    # Stop existing container if it exists
    Write-Host "Stopping existing database container (if any)..." -ForegroundColor Yellow
    docker stop serenvi_db 2>$null
    docker rm serenvi_db 2>$null
    
    # Start new database container
    Write-Host "Starting PostgreSQL container..." -ForegroundColor Yellow
    docker run -d --name serenvi_db `
      -e POSTGRES_PASSWORD=postgres `
      -e POSTGRES_DB=serenvi `
      -p 5432:5432 `
      postgres:15
    
    Write-Host "✓ PostgreSQL database started on localhost:5432" -ForegroundColor Green
    Write-Host "  Username: postgres" -ForegroundColor Yellow
    Write-Host "  Password: postgres" -ForegroundColor Yellow
    Write-Host "  Database: serenvi" -ForegroundColor Yellow
    Write-Host ""
    
    # Wait for database to be ready
    Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
} else {
    Write-Host "⚠ Docker is not running. Please start Docker Desktop." -ForegroundColor Yellow
    Write-Host "If you have PostgreSQL running locally, make sure DATABASE_URL in .env is correct." -ForegroundColor Yellow
    Write-Host ""
}

# Setup Backend
Write-Host "Step 2: Setting up Backend (NestJS)..." -ForegroundColor Cyan
$backendDir = ".\backend"

if (Test-Path $backendDir) {
    Push-Location $backendDir
    
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    if (-not (Test-Path "node_modules")) {
        npm install
    } else {
        Write-Host "✓ Dependencies already installed" -ForegroundColor Green
    }
    
    # Setup .env if it doesn't exist
    if (-not (Test-Path ".env")) {
        Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
        } else {
            Write-Host "Creating .env file with default configuration..." -ForegroundColor Yellow
            @"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/serenvi"
NODE_ENV=development
"@ | Out-File ".env" -Encoding UTF8
        }
    }
    
    # Run Prisma migrations
    Write-Host "Running Prisma migrations..." -ForegroundColor Yellow
    npx prisma migrate deploy 2>$null
    
    # Seed products
    Write-Host "Seeding products..." -ForegroundColor Yellow
    if (Test-Path "seed-products-new.js") {
        node seed-products-new.js
    }
    
    Write-Host "✓ Backend setup complete" -ForegroundColor Green
    Pop-Location
} else {
    Write-Host "Backend directory not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Setup Frontend
Write-Host "Step 3: Setting up Frontend (React)..." -ForegroundColor Cyan
$frontendDir = ".\frontend"

if (Test-Path $frontendDir) {
    Push-Location $frontendDir
    
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    if (-not (Test-Path "node_modules")) {
        npm install
    } else {
        Write-Host "✓ Dependencies already installed" -ForegroundColor Green
    }
    
    # Setup .env if it doesn't exist
    if (-not (Test-Path ".env.local")) {
        Write-Host "Creating .env.local file..." -ForegroundColor Yellow
        @"
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=development
"@ | Out-File ".env.local" -Encoding UTF8
    }
    
    Write-Host "✓ Frontend setup complete" -ForegroundColor Green
    Pop-Location
} else {
    Write-Host "Frontend directory not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Setup Complete! Ready to Start" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the application, run:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend:  cd backend && npm run start:dev" -ForegroundColor Cyan
Write-Host "Frontend: cd frontend && npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "The application will be available at:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor Green
Write-Host ""
