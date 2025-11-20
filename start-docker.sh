#!/bin/bash

# FOODFAST - Quick Start Script for Docker
# This script will build and run all services

echo "🚀 FOODFAST - Docker Quick Start"
echo "=================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found!"
    echo "Please run this script from the FOODFAST root directory."
    exit 1
fi

echo "📦 Building and starting all containers..."
echo "This may take 5-10 minutes on first run..."
echo ""

# Build and run all services
docker-compose -f docker-compose.local.yml up -d --build

# Check if successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All containers started successfully!"
    echo ""
    echo "🌐 Access the applications:"
    echo "   👥 Client App:       http://localhost:3000"
    echo "   🏪 Restaurant App:   http://localhost:3001"
    echo "   👨‍💼 Admin Dashboard:  http://localhost:3002"
    echo "   🚁 Drone Management: http://localhost:3003"
    echo "   🔧 Backend API:      http://localhost:5000"
    echo ""
    echo "📊 Check status: docker compose ps"
    echo "📋 View logs:    docker compose logs -f"
    echo "🛑 Stop all:     docker compose down"
    echo ""
    echo "🎉 Happy coding!"
else
    echo ""
    echo "❌ Failed to start containers!"
    echo "Check the error messages above."
    echo "Try: docker compose logs"
    exit 1
fi
