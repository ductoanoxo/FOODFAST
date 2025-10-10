# FoodFast Drone Delivery - Quick Run Script
# Run this script to start all 5 applications at once

Write-Host "🚁 FOODFAST DRONE DELIVERY - Starting All Apps..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed! Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if MongoDB is running
Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
Write-Host "⚠️  Make sure MongoDB is running on localhost:27017" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
$hasClientModules = Test-Path ".\client_app\node_modules"
$hasServerModules = Test-Path ".\server_app\node_modules"
$hasRestaurantModules = Test-Path ".\restaurant_app\node_modules"
$hasAdminModules = Test-Path ".\admin_app\node_modules"
$hasDroneModules = Test-Path ".\drone_manage\node_modules"

if (-not ($hasClientModules -and $hasServerModules -and $hasRestaurantModules -and $hasAdminModules -and $hasDroneModules)) {
    Write-Host "⚠️  Some dependencies are missing!" -ForegroundColor Yellow
    Write-Host "Would you like to install dependencies now? (Y/N)" -ForegroundColor Cyan
    $install = Read-Host
    
    if ($install -eq 'Y' -or $install -eq 'y') {
        Write-Host "Installing dependencies for all apps..." -ForegroundColor Yellow
        npm run install-all
        Write-Host "✅ Dependencies installed!" -ForegroundColor Green
    } else {
        Write-Host "Please run 'npm run install-all' first!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Starting applications..." -ForegroundColor Green
Write-Host ""
Write-Host "📱 Client App:      http://localhost:3000" -ForegroundColor Cyan
Write-Host "🍴 Restaurant App:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "👨‍💼 Admin App:       http://localhost:3002" -ForegroundColor Cyan
Write-Host "🚁 Drone Management: http://localhost:3003" -ForegroundColor Cyan
Write-Host "🖥️  API Server:      http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all applications" -ForegroundColor Yellow
Write-Host ""

# Start all apps using concurrently
npm run dev
