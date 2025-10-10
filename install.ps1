# FoodFast Drone Delivery - Installation Script
# Run this script to install all dependencies

Write-Host "📦 FOODFAST DRONE DELIVERY - Installing Dependencies..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Installing dependencies for all 5 applications..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Cyan
Write-Host ""

# Install for each app
$apps = @("client_app", "restaurant_app", "admin_app", "drone_manage", "server_app")
$total = $apps.Length
$current = 0

foreach ($app in $apps) {
    $current++
    Write-Host "[$current/$total] Installing $app..." -ForegroundColor Cyan
    
    if (Test-Path ".\$app") {
        cd $app
        npm install --silent
        cd ..
        Write-Host "✅ $app dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $app directory not found" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "✅ All dependencies installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Copy .env file and configure MongoDB connection" -ForegroundColor White
Write-Host "  2. Run '.\seed.ps1' to populate database" -ForegroundColor White
Write-Host "  3. Run '.\start.ps1' to start all applications" -ForegroundColor White
Write-Host ""
Write-Host "Or simply run: npm run seed && npm run dev" -ForegroundColor Green
