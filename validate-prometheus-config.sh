#!/bin/bash

# Script to validate Prometheus configuration files
# Usage: ./validate-prometheus-config.sh

set -e

echo "🔍 Validating Prometheus Configuration Files"
echo "=============================================="
echo ""

# Check if promtool is available
if ! command -v promtool &> /dev/null; then
    echo "⚠️  promtool not found. Using Docker to validate..."
    echo ""
    
    # Validate prometheus.yml
    echo "1️⃣  Validating prometheus.yml..."
    docker run --rm -v "$(pwd)/monitoring:/config" prom/prometheus:latest \
        promtool check config /config/prometheus.yml
    echo ""
    
    # Validate alerts.yml
    echo "2️⃣  Validating alerts.yml..."
    docker run --rm -v "$(pwd)/monitoring:/config" prom/prometheus:latest \
        promtool check rules /config/alerts.yml
    echo ""
    
    # Validate recording-rules.yml
    echo "3️⃣  Validating recording-rules.yml..."
    docker run --rm -v "$(pwd)/monitoring:/config" prom/prometheus:latest \
        promtool check rules /config/recording-rules.yml
    echo ""
else
    echo "✅ Using local promtool"
    echo ""
    
    # Validate prometheus.yml
    echo "1️⃣  Validating prometheus.yml..."
    promtool check config monitoring/prometheus.yml
    echo ""
    
    # Validate alerts.yml
    echo "2️⃣  Validating alerts.yml..."
    promtool check rules monitoring/alerts.yml
    echo ""
    
    # Validate recording-rules.yml
    echo "3️⃣  Validating recording-rules.yml..."
    promtool check rules monitoring/recording-rules.yml
    echo ""
fi

echo "=============================================="
echo "✅ All configuration files are valid!"
echo "=============================================="
