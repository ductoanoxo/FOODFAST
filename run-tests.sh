#!/bin/bash

# 🧪 FOODFAST - Quick Test Runner
# Script này giúp chạy tests nhanh chóng

echo "======================================"
echo "🧪 FOODFAST - Running Tests"
echo "======================================"
echo ""

# Navigate to server_app
cd server_app || exit

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Run tests
echo "======================================"
echo "⚡ Running Unit Tests (Fast - No DB)"
echo "======================================"
npm run test:unit
echo ""

echo "======================================"
echo "🗄️  Running Integration Tests (Need MongoDB)"
echo "======================================"
echo "⚠️  Make sure MongoDB is running on localhost:27017"
echo ""

# Check if MongoDB is running
if ! nc -z localhost 27017 2>/dev/null; then
    echo "❌ MongoDB is not running!"
    echo "   Please start MongoDB first:"
    echo "   - Option 1: mongod"
    echo "   - Option 2: docker run -d -p 27017:27017 mongo:7.0"
    echo ""
    exit 1
fi

npm run test:integration
echo ""

echo "======================================"
echo "✅ All Tests Complete!"
echo "======================================"
echo ""
echo "📊 Coverage report: server_app/coverage/lcov-report/index.html"
echo ""
