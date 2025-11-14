#!/bin/bash

# Script để kiểm tra real metrics từ GitHub Actions
# Chạy sau khi CI workflow hoàn thành

PUSHGATEWAY_URL="http://13.220.101.54:9091"

echo "🔍 Checking for REAL GitHub Actions metrics..."
echo ""

# Check for real workflow metrics (not test data)
echo "📊 Real CI/CD Workflow Metrics:"
curl -s "${PUSHGATEWAY_URL}/metrics" | grep -E "github_workflow" | grep -v "Test Manual Push" | head -20

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Found real workflow metrics!"
  echo ""
  echo "🎯 Metrics by workflow:"
  curl -s "${PUSHGATEWAY_URL}/metrics" | grep "github_workflow_run_total" | grep -v "Test Manual Push"
  
  echo ""
  echo "📈 Check Grafana dashboard:"
  echo "   http://13.220.101.54:3030/d/cicd-metrics"
else
  echo ""
  echo "⏳ No real metrics yet. Workflow might still be running."
  echo ""
  echo "👉 Check workflow status:"
  echo "   https://github.com/ductoanoxo/FOODFAST/actions"
  echo ""
  echo "Wait for CI workflow to complete, then run this script again."
fi
