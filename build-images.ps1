# ========================================
# BUILD DOCKER IMAGES - FOODFAST
# Không cần build-arg, dùng .env files
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔨 BUILDING DOCKER IMAGES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Client App
Write-Host "1️⃣ Building Client App..." -ForegroundColor Yellow
docker build -t ductoanoxo/foodfast-client:latest ./client_app
Write-Host "✅ Client built" -ForegroundColor Green
Write-Host ""

# Restaurant App
Write-Host "2️⃣ Building Restaurant App..." -ForegroundColor Yellow
docker build -t ductoanoxo/foodfast-restaurant:latest ./restaurant_app
Write-Host "✅ Restaurant built" -ForegroundColor Green
Write-Host ""

# Admin App
Write-Host "3️⃣ Building Admin App..." -ForegroundColor Yellow
docker build -t ductoanoxo/foodfast-admin:latest ./admin_app
Write-Host "✅ Admin built" -ForegroundColor Green
Write-Host ""

# Drone App
Write-Host "4️⃣ Building Drone App..." -ForegroundColor Yellow
docker build -t ductoanoxo/foodfast-drone:latest ./drone_manage
Write-Host "✅ Drone built" -ForegroundColor Green
Write-Host ""

# Server App
Write-Host "5️⃣ Building Server App..." -ForegroundColor Yellow
docker build -t ductoanoxo/foodfast-server:latest ./server_app
Write-Host "✅ Server built" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ ALL IMAGES BUILT!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Show images
Write-Host "📦 Docker Images:" -ForegroundColor Yellow
docker images | Select-String "ductoanoxo/foodfast"
Write-Host ""

Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. kubectl delete pods -n foodfast --all --force" -ForegroundColor Cyan
Write-Host "   2. Wait for pods to restart" -ForegroundColor Cyan
Write-Host "   3. Open http://localhost:30000" -ForegroundColor Cyan
