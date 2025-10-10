#!/usr/bin/env pwsh
# FOODFAST DRONE DELIVERY - Setup Script
# Chạy script này sau khi clone project lần đầu

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FOODFAST DRONE DELIVERY - SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Check if .env exists
Write-Host "Checking .env file..." -ForegroundColor Yellow
if (-Not (Test-Path ".env")) {
    Write-Host "WARNING: .env file not found!" -ForegroundColor Red
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    
    $envContent = @"
# MongoDB Connection (IMPORTANT: Update this with your MongoDB Atlas URI)
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/FOODFASTDRONEDELIVERY?retryWrites=true&w=majority&appName=KTPM

# JWT Secret (Change this to a secure random string)
JWT_SECRET=foodfast_drone_delivery_jwt_secret_key_2024

# Server Port
PORT=5000

# Environment
NODE_ENV=development

# CORS Origins
CLIENT_URL=http://localhost:3000
RESTAURANT_URL=http://localhost:3001
ADMIN_URL=http://localhost:3002
DRONE_URL=http://localhost:3003
"@
    
    Set-Content -Path ".env" -Value $envContent
    Write-Host "✓ .env file created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Please update the following in .env file:" -ForegroundColor Yellow
    Write-Host "  1. MONGO_URI - Your MongoDB Atlas connection string" -ForegroundColor Yellow
    Write-Host "  2. JWT_SECRET - A secure random string" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to continue after updating .env..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Write-Host ""
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
    Write-Host ""
}

# Install root dependencies
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing root dependencies..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install root dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Root dependencies installed" -ForegroundColor Green
Write-Host ""

# Install client_app dependencies
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing Client App dependencies..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Set-Location client_app
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install client_app dependencies!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "✓ Client App dependencies installed" -ForegroundColor Green
Write-Host ""

# Install restaurant_app dependencies
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing Restaurant App dependencies..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Set-Location restaurant_app
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install restaurant_app dependencies!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "✓ Restaurant App dependencies installed" -ForegroundColor Green
Write-Host ""

# Install admin_app dependencies
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing Admin App dependencies..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Set-Location admin_app
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install admin_app dependencies!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "✓ Admin App dependencies installed" -ForegroundColor Green
Write-Host ""

# Install drone_app dependencies
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing Drone App dependencies..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Set-Location drone_app
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install drone_app dependencies!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "✓ Drone App dependencies installed" -ForegroundColor Green
Write-Host ""

# Install server_app dependencies
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing Server App dependencies..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Set-Location server_app
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install server_app dependencies!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "✓ Server App dependencies installed" -ForegroundColor Green
Write-Host ""

# Success message
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ SETUP COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "  1. Make sure .env file has correct MongoDB URI" -ForegroundColor Yellow
Write-Host "  2. Seed database:" -ForegroundColor Yellow
Write-Host "     .\seed.ps1" -ForegroundColor White
Write-Host "  3. Start all applications:" -ForegroundColor Yellow
Write-Host "     .\start.ps1" -ForegroundColor White
Write-Host ""
Write-Host "APPLICATIONS WILL RUN ON:" -ForegroundColor Cyan
Write-Host "  - Client App:      http://localhost:3000" -ForegroundColor White
Write-Host "  - Restaurant App:  http://localhost:3001" -ForegroundColor White
Write-Host "  - Admin App:       http://localhost:3002" -ForegroundColor White
Write-Host "  - Drone App:       http://localhost:3003" -ForegroundColor White
Write-Host "  - Server API:      http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
