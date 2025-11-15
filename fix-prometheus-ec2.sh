#!/bin/bash

# Script to fix Prometheus on EC2
# Usage: Run this script on EC2 server

set -e

echo "🔧 Fixing Prometheus Configuration on EC2"
echo "=========================================="
echo ""

# Stop Prometheus container
echo "1️⃣  Stopping Prometheus container..."
sudo docker stop foodfast-prometheus 2>/dev/null || true
sudo docker rm foodfast-prometheus 2>/dev/null || true
echo "✅ Stopped"
echo ""

# Check if recording-rules.yml exists
echo "2️⃣  Checking configuration files..."
if [ ! -f ~/prometheus-config/prometheus.yml ]; then
    echo "❌ prometheus.yml not found!"
    exit 1
fi

if [ ! -f ~/prometheus-config/alerts.yml ]; then
    echo "❌ alerts.yml not found!"
    exit 1
fi

if [ ! -f ~/prometheus-config/recording-rules.yml ]; then
    echo "⚠️  recording-rules.yml not found. This file is required."
    echo "Please ensure the file is uploaded to ~/prometheus-config/"
    exit 1
fi

echo "✅ All config files present"
echo ""

# Validate configuration using Docker
echo "3️⃣  Validating Prometheus configuration..."
sudo docker run --rm \
    -v ~/prometheus-config:/config \
    prom/prometheus:latest \
    promtool check config /config/prometheus.yml

echo ""
echo "4️⃣  Validating alert rules..."
sudo docker run --rm \
    -v ~/prometheus-config:/config \
    prom/prometheus:latest \
    promtool check rules /config/alerts.yml

echo ""
echo "5️⃣  Validating recording rules..."
sudo docker run --rm \
    -v ~/prometheus-config:/config \
    prom/prometheus:latest \
    promtool check rules /config/recording-rules.yml

echo ""
echo "✅ All validations passed!"
echo ""

# Create prometheus data directory if not exists
echo "6️⃣  Checking data directory..."
sudo docker volume create prometheus_data 2>/dev/null || true
echo "✅ Data directory ready"
echo ""

# Start Prometheus with correct configuration
echo "7️⃣  Starting Prometheus container..."
sudo docker run -d \
    --name foodfast-prometheus \
    --restart unless-stopped \
    --network foodfast-net \
    --network-alias prometheus \
    -p 9090:9090 \
    -v ~/prometheus-config:/etc/prometheus \
    -v prometheus_data:/prometheus \
    prom/prometheus:latest \
    --config.file=/etc/prometheus/prometheus.yml \
    --storage.tsdb.path=/prometheus \
    --storage.tsdb.retention.time=30d \
    --storage.tsdb.retention.size=10GB \
    --web.console.libraries=/usr/share/prometheus/console_libraries \
    --web.console.templates=/usr/share/prometheus/consoles \
    --web.enable-lifecycle

echo "✅ Prometheus started"
echo ""

# Wait for Prometheus to start
echo "8️⃣  Waiting for Prometheus to be ready..."
sleep 5

# Check if Prometheus is running
if sudo docker ps | grep -q foodfast-prometheus; then
    echo "✅ Prometheus is running!"
    echo ""
    
    # Check health
    echo "9️⃣  Checking Prometheus health..."
    sleep 3
    if curl -sf http://localhost:9090/-/healthy > /dev/null; then
        echo "✅ Prometheus is healthy!"
    else
        echo "⚠️  Prometheus is running but not healthy yet. Check logs:"
        echo "    sudo docker logs foodfast-prometheus"
    fi
else
    echo "❌ Prometheus failed to start!"
    echo "Check logs with: sudo docker logs foodfast-prometheus"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Prometheus fix completed!"
echo "=========================================="
echo ""
echo "🔗 Access Prometheus: http://localhost:9090"
echo "📊 View targets: http://localhost:9090/targets"
echo "📋 View rules: http://localhost:9090/rules"
echo ""
echo "💡 Tip: Check logs with: sudo docker logs -f foodfast-prometheus"
