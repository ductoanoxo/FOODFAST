# FOODFAST - Quick Start Script for Docker (Windows PowerShell)
# This script will build and run all services

Write-Host "FOODFAST - Docker Quick Start" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "[OK] Docker is running" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Check if docker-compose.yml exists
if (-Not (Test-Path "docker-compose.yml")) {
    Write-Host "[ERROR] docker-compose.yml not found!" -ForegroundColor Red
    Write-Host "Please run this script from the FOODFAST root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "Building and starting all containers..." -ForegroundColor Yellow
Write-Host "This may take 5-16 minutes on first run..." -ForegroundColor Yellow
Write-Host ""

# Build and run all services
docker-compose -f docker-compose.local.yml up -d --build

# Check if successful
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[SUCCESS] All containers started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access the applications:" -ForegroundColor Cyan
    Write-Host "  Client App:       http://localhost:3000" -ForegroundColor White
    Write-Host "  Restaurant App:   http://localhost:3001" -ForegroundColor White
    Write-Host "  Admin Dashboard:  http://localhost:3002" -ForegroundColor White
    Write-Host "  Drone Management: http://localhost:3003" -ForegroundColor White
    Write-Host "  Backend API:      http://localhost:5000" -ForegroundColor White
    Write-Host ""
    Write-Host "Useful commands:" -ForegroundColor Cyan
    Write-Host "  Check status: docker compose ps" -ForegroundColor Yellow
    Write-Host "  View logs:    docker compose logs -f" -ForegroundColor Yellow
    Write-Host "  Stop all:     docker compose down" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Happy coding!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[ERROR] Failed to start containers!" -ForegroundColor Red
    Write-Host "Check the error messages above." -ForegroundColor Yellow
    Write-Host "Try: docker compose logs" -ForegroundColor Yellow
    exit 1
}
