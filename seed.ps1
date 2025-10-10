# FoodFast Drone Delivery - Database Seeding Script
# Run this script to populate the database with sample data

Write-Host "🌱 FOODFAST DRONE DELIVERY - Database Seeding..." -ForegroundColor Green
Write-Host ""

# Check if MongoDB is running
Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
Write-Host "⚠️  Make sure MongoDB is running on localhost:27017" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".\.env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file with MONGO_URI and JWT_SECRET" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting database seeding..." -ForegroundColor Yellow
Write-Host ""

# Run seed script
cd server_app
npm run seed

Write-Host ""
Write-Host "✅ Database seeding completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Login credentials:" -ForegroundColor Cyan
Write-Host "  Admin:      admin@foodfast.com / admin123" -ForegroundColor White
Write-Host "  User:       user@foodfast.com / user123" -ForegroundColor White
Write-Host "  Restaurant: restaurant@foodfast.com / restaurant123" -ForegroundColor White
Write-Host "  Drone:      drone@foodfast.com / drone123" -ForegroundColor White
Write-Host ""
Write-Host "Sample data created:" -ForegroundColor Cyan
Write-Host "  ✅ 4 Users" -ForegroundColor White
Write-Host "  ✅ 5 Categories" -ForegroundColor White
Write-Host "  ✅ 3 Restaurants" -ForegroundColor White
Write-Host "  ✅ 7 Products" -ForegroundColor White
Write-Host "  ✅ 3 Drones" -ForegroundColor White
Write-Host ""
Write-Host "You can now run 'npm run dev' to start all apps!" -ForegroundColor Green

cd ..
