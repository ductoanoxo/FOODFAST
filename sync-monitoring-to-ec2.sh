#!/bin/bash

# Quick script to sync monitoring configs to EC2 and restart Prometheus
# Usage: ./sync-monitoring-to-ec2.sh

set -e

# Configuration
SERVER_HOST="${PROD_SERVER_HOST:-13.220.101.54}"
SERVER_USER="${PROD_SERVER_USER:-ubuntu}"
SSH_KEY="${SSH_KEY_PATH}"

echo "🚀 Syncing Monitoring Configs to EC2"
echo "====================================="
echo "Server: $SERVER_USER@$SERVER_HOST"
echo ""

# Check if SSH key is provided
SSH_OPTS=""
if [ -n "$SSH_KEY" ] && [ -f "$SSH_KEY" ]; then
    SSH_OPTS="-i $SSH_KEY"
    echo "Using SSH key: $SSH_KEY"
else
    echo "No SSH key specified, using default SSH config"
fi
echo ""

# Create directories on EC2
echo "1️⃣  Creating directories on EC2..."
ssh $SSH_OPTS $SERVER_USER@$SERVER_HOST "mkdir -p ~/prometheus-config ~/grafana-config/provisioning/datasources ~/grafana-config/provisioning/dashboards ~/grafana-config/dashboards"
echo "✅ Directories created"
echo ""

# Sync Prometheus configs
echo "2️⃣  Syncing Prometheus configurations..."
scp $SSH_OPTS monitoring/prometheus.yml $SERVER_USER@$SERVER_HOST:~/prometheus-config/
scp $SSH_OPTS monitoring/alerts.yml $SERVER_USER@$SERVER_HOST:~/prometheus-config/
scp $SSH_OPTS monitoring/recording-rules.yml $SERVER_USER@$SERVER_HOST:~/prometheus-config/
echo "✅ Prometheus configs synced"
echo ""

# Sync Grafana configs
echo "3️⃣  Syncing Grafana configurations..."
scp $SSH_OPTS monitoring/grafana/datasources.yml $SERVER_USER@$SERVER_HOST:~/grafana-config/provisioning/datasources/
scp $SSH_OPTS monitoring/grafana/dashboards.yml $SERVER_USER@$SERVER_HOST:~/grafana-config/provisioning/dashboards/
scp $SSH_OPTS monitoring/grafana/foodfast-dashboard.json $SERVER_USER@$SERVER_HOST:~/grafana-config/dashboards/
scp $SSH_OPTS monitoring/grafana/cicd-dashboard.json $SERVER_USER@$SERVER_HOST:~/grafana-config/dashboards/
echo "✅ Grafana configs synced"
echo ""

# Upload fix script
echo "4️⃣  Uploading fix script..."
scp $SSH_OPTS fix-prometheus-ec2.sh $SERVER_USER@$SERVER_HOST:~/fix-prometheus-ec2.sh
ssh $SSH_OPTS $SERVER_USER@$SERVER_HOST "chmod +x ~/fix-prometheus-ec2.sh"
echo "✅ Fix script uploaded"
echo ""

# Run fix script on EC2
echo "5️⃣  Running fix script on EC2..."
echo "-----------------------------------"
ssh $SSH_OPTS $SERVER_USER@$SERVER_HOST "~/fix-prometheus-ec2.sh"
echo ""

echo "====================================="
echo "✅ Monitoring configs synced and Prometheus restarted!"
echo "====================================="
echo ""
echo "🔗 Access points:"
echo "   Prometheus: http://$SERVER_HOST:9090"
echo "   Grafana: http://$SERVER_HOST:3030"
echo "   Pushgateway: http://$SERVER_HOST:9091"
echo ""
echo "💡 Verify with: ./verify-monitoring.sh"
