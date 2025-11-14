#!/bin/bash

# Wait for CI workflow to complete and check branch data

echo "⏳ Waiting for CI workflow to complete and export metrics..."
echo "   This usually takes 3-5 minutes"
echo ""

PROM_URL="http://13.220.101.54:9090"
PUSH_URL="http://13.220.101.54:9091"

# Function to check metrics
check_metrics() {
  echo "🔍 Checking metrics at $(date +%H:%M:%S)..."
  
  # Check Pushgateway
  PUSH_COUNT=$(curl -s ${PUSH_URL}/metrics | grep -c "github_workflow_run_total{")
  echo "  Pushgateway: $PUSH_COUNT metrics found"
  
  if [ "$PUSH_COUNT" -gt 0 ]; then
    echo ""
    echo "📊 Branches found:"
    curl -s ${PUSH_URL}/metrics | grep "github_workflow_run_total{" | \
      sed -n 's/.*branch="\([^"]*\)".*/  - \1/p' | sort -u
    
    echo ""
    echo "🎯 Workflows found:"
    curl -s ${PUSH_URL}/metrics | grep "github_workflow_run_total{" | \
      sed -n 's/.*workflow="\([^"]*\)".*/  - \1/p' | sort -u
    
    echo ""
    echo "✅ Data ready! Check dashboard:"
    echo "   http://13.220.101.54:3030/d/foodfast-cicd"
    return 0
  else
    echo "  ⏳ No metrics yet, waiting..."
    return 1
  fi
}

# Check immediately
if check_metrics; then
  exit 0
fi

echo ""
echo "💡 Tips while waiting:"
echo "  - Check workflow status: https://github.com/ductoanoxo/FOODFAST/actions"
echo "  - Run this script again in a few minutes"
echo "  - Or wait and it will auto-check every 30 seconds"
echo ""

# Auto-check every 30 seconds for 5 minutes
for i in {1..10}; do
  echo "Attempt $i/10..."
  sleep 30
  if check_metrics; then
    exit 0
  fi
  echo ""
done

echo "⚠️  Metrics not found after 5 minutes"
echo "   Check workflow status on GitHub"
