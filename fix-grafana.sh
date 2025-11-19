#!/bin/bash

echo "====================================="
echo "Fixing Grafana Redirect Loop Issue"
echo "====================================="

# Stop Grafana container
echo "Stopping Grafana container..."
docker-compose stop grafana

# Remove Grafana container
echo "Removing Grafana container..."
docker-compose rm -f grafana

# Pull latest changes (if needed)
echo "Pulling latest docker-compose configuration..."
git pull

# Recreate and start Grafana with new configuration
echo "Starting Grafana with new configuration..."
docker-compose up -d grafana

# Wait for Grafana to start
echo "Waiting for Grafana to start (30 seconds)..."
sleep 30

# Check Grafana status
echo ""
echo "Checking Grafana status..."
docker ps | grep grafana

echo ""
echo "====================================="
echo "Grafana Fix Complete!"
echo "====================================="
echo "Access Grafana at: http://100.25.98.10:3030"
echo "Username: admin"
echo "Password: admin123"
echo "====================================="
