#!/usr/bin/env pwsh
# SERENVI Platform - Startup Script (Windows PowerShell)
# Run with: powershell -ExecutionPolicy Bypass -File .\startup.ps1

Write-Host "`n" -ForegroundColor Cyan
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   SERENVI Platform - Local Startup                ║" -ForegroundColor Cyan
Write-Host "║   Starting Services...                             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed" -ForegroundColor Red
    Write-Host "   Download: https://docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

$dockerVersion = docker --version
Write-Host "✓ Docker: $dockerVersion" -ForegroundColor Green

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    Write-Host "   Download: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

$nodeVersion = node --version
Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green

Write-Host "`n"

# Check if database is already running
$dbRunning = docker ps --filter "name=serenvi_db" --filter "status=running" --quiet
if ($dbRunning) {
    Write-Host "✓ Database container already running" -ForegroundColor Green
} else {
    Write-Host "Starting PostgreSQL database..." -ForegroundColor Yellow
    
    # Stop old container if exists
    docker stop serenvi_db 2>$null | Out-Null
    docker rm serenvi_db 2>$null | Out-Null
    
    # Start new container
    docker run -d --name serenvi_db `
        -e POSTGRES_PASSWORD=postgres `
        -e POSTGRES_DB=serenvi `
        -p 5432:5432 `
        postgres:15 | Out-Null
    
    Write-Host "✓ Database started (waiting 5 seconds for initialization...)" -ForegroundColor Green
    Start-Sleep -Seconds 5
}

Write-Host "`n"

# Ensure backend dependencies are installed
Write-Host "Checking backend dependencies..." -ForegroundColor Yellow
Push-Location backend
if (-not (Test-Path node_modules)) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install --silent | Out-Null
}
Write-Host "✓ Backend dependencies ready" -ForegroundColor Green
Pop-Location

Write-Host "`n"

# Ensure frontend dependencies are installed  
Write-Host "Checking frontend dependencies..." -ForegroundColor Yellow
Push-Location frontend
if (-not (Test-Path node_modules)) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install --silent | Out-Null
}
Write-Host "✓ Frontend dependencies ready" -ForegroundColor Green
Pop-Location

Write-Host "`n"

Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   Ready to Start!                                 ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n"
Write-Host "Starting services in new windows..." -ForegroundColor Cyan
Write-Host "`n"

# Start backend in new PowerShell window
Write-Host "Launching Backend (NestJS)..." -ForegroundColor Yellow
$backendScript = @'
    cd backend
    npm run start:dev
'@
Start-Process pwsh -ArgumentList "-NoExit", "-Command", $backendScript -WindowName "SERENVI Backend"

# Wait for backend to start
Start-Sleep -Seconds 3

# Start frontend in new PowerShell window
Write-Host "Launching Frontend (React)..." -ForegroundColor Yellow
$frontendScript = @'
    cd frontend
    npm start
'@
Start-Process pwsh -ArgumentList "-NoExit", "-Command", $frontendScript -WindowName "SERENVI Frontend"

# Wait a bit then open browser
Start-Sleep -Seconds 3

Write-Host "Opening shop in browser..." -ForegroundColor Yellow
Write-Host "`n"

# Try to open browser
try {
    Start-Process "http://localhost:3000"
} catch {
    Write-Host "Please open manually: http://localhost:3000" -ForegroundColor Yellow
}

Write-Host "`n"
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   Services Started Successfully!                  ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n"
Write-Host "Services Running:" -ForegroundColor Cyan
Write-Host "  📦 Database:   localhost:5432" -ForegroundColor Green
Write-Host "  🔌 Backend:    http://localhost:3001" -ForegroundColor Green  
Write-Host "  🛒 Frontend:   http://localhost:3000" -ForegroundColor Green
Write-Host "`n"

Write-Host "Database Browser:" -ForegroundColor Cyan
Write-Host "  Run in backend folder: npx prisma studio" -ForegroundColor Yellow
Write-Host "`n"

Write-Host "Stop Services:" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C in each terminal window" -ForegroundColor Yellow
Write-Host "`n"

Write-Host "Clean Up:" -ForegroundColor Cyan
Write-Host "  powershell -Command `"docker stop serenvi_db`"" -ForegroundColor Yellow
Write-Host "`n"

Read-Host "Press Enter to close this window"
