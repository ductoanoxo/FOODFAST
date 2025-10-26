# 🧪 FOODFAST - Quick Test Runner
# PowerShell script để chạy tests

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🧪 FOODFAST - Running Tests" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to server_app
Set-Location -Path "server_app" -ErrorAction Stop

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Run unit tests
Write-Host "======================================" -ForegroundColor Green
Write-Host "⚡ Running Unit Tests (Fast - No DB)" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
npm run test:unit
Write-Host ""

# Run integration tests
Write-Host "======================================" -ForegroundColor Blue
Write-Host "🗄️  Running Integration Tests (Need MongoDB)" -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue
Write-Host "⚠️  Make sure MongoDB is running on localhost:27017" -ForegroundColor Yellow
Write-Host ""

# Check if MongoDB is running (simple check)
$mongoRunning = $false
try {
    $connection = New-Object System.Net.Sockets.TcpClient("localhost", 27017)
    $connection.Close()
    $mongoRunning = $true
} catch {
    $mongoRunning = $false
}

if (-not $mongoRunning) {
    Write-Host "❌ MongoDB is not running!" -ForegroundColor Red
    Write-Host "   Please start MongoDB first:" -ForegroundColor Yellow
    Write-Host "   - Option 1: mongod" -ForegroundColor Yellow
    Write-Host "   - Option 2: docker run -d -p 27017:27017 mongo:7.0" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

npm run test:integration
Write-Host ""

Write-Host "======================================" -ForegroundColor Green
Write-Host "✅ All Tests Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Coverage report: server_app/coverage/lcov-report/index.html" -ForegroundColor Cyan
Write-Host ""
