#!/bin/bash

# Test CI/CD Metrics for Grafana Dashboard
# This script helps verify that metrics are being collected properly

echo "🔍 Testing CI/CD Metrics Collection"
echo "===================================="
echo ""

# Configuration
PUSHGATEWAY_URL="${PUSHGATEWAY_URL:-http://13.220.101.54:9091}"

echo "📊 Checking Pushgateway at: $PUSHGATEWAY_URL"
echo ""

# Check if Pushgateway is accessible
echo "1️⃣  Testing Pushgateway connectivity..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PUSHGATEWAY_URL/metrics")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Pushgateway is accessible (HTTP $HTTP_CODE)"
else
    echo "❌ Pushgateway is not accessible (HTTP $HTTP_CODE)"
    echo "   Make sure Pushgateway is running and accessible"
    exit 1
fi

echo ""
echo "2️⃣  Checking available GitHub workflow metrics..."
METRICS=$(curl -s "$PUSHGATEWAY_URL/metrics" | grep "github_workflow_" | grep -v "^#")

if [ -z "$METRICS" ]; then
    echo "⚠️  No GitHub workflow metrics found!"
    echo "   This means no workflow has pushed metrics yet."
    echo ""
    echo "   To fix this:"
    echo "   1. Trigger a workflow run on GitHub Actions"
    echo "   2. Wait for the 'Export CI/CD Metrics' workflow to complete"
    echo "   3. Run this script again"
else
    echo "✅ Found GitHub workflow metrics:"
    echo ""
    echo "$METRICS" | head -20
    echo ""
    
    # Count metrics
    TOTAL_RUNS=$(echo "$METRICS" | grep "github_workflow_run_total" | wc -l)
    SUCCESS=$(echo "$METRICS" | grep "github_workflow_success_total" | wc -l)
    FAILURE=$(echo "$METRICS" | grep "github_workflow_failure_total" | wc -l)
    
    echo "📈 Metrics Summary:"
    echo "   - Total workflow metrics: $TOTAL_RUNS"
    echo "   - Success metrics: $SUCCESS"
    echo "   - Failure metrics: $FAILURE"
fi

echo ""
echo "3️⃣  Checking metric timestamps..."
TIMESTAMPED=$(curl -s "$PUSHGATEWAY_URL/metrics" | grep "github_workflow_" | grep -v "^#" | grep "[0-9]\{13\}$" | wc -l)

if [ "$TIMESTAMPED" -gt 0 ]; then
    echo "✅ Metrics have timestamps (found $TIMESTAMPED metrics)"
else
    echo "⚠️  Metrics don't have timestamps"
    echo "   This might affect time-series visualization in Grafana"
fi

echo ""
echo "4️⃣  Testing Prometheus query (if Prometheus is running)..."
PROMETHEUS_URL="${PROMETHEUS_URL:-http://localhost:9090}"
PROM_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$PROMETHEUS_URL/api/v1/query?query=up")

if [ "$PROM_HTTP" = "200" ]; then
    echo "✅ Prometheus is accessible"
    
    # Test a sample query
    RESULT=$(curl -s "$PROMETHEUS_URL/api/v1/query?query=github_workflow_run_total" | grep -o '"status":"[^"]*"')
    echo "   Query result: $RESULT"
else
    echo "⚠️  Prometheus not accessible at $PROMETHEUS_URL"
    echo "   Dashboard queries won't work without Prometheus"
fi

echo ""
echo "5️⃣  Checking last metric update time..."
LAST_UPDATE=$(curl -s "$PUSHGATEWAY_URL/metrics" | grep "push_time_seconds" | tail -1 | awk '{print $2}')

if [ ! -z "$LAST_UPDATE" ]; then
    CURRENT_TIME=$(date +%s)
    AGE=$((CURRENT_TIME - ${LAST_UPDATE%.*}))
    
    echo "✅ Last update: $(date -d @${LAST_UPDATE%.*} 2>/dev/null || date -r ${LAST_UPDATE%.*} 2>/dev/null)"
    echo "   Age: $AGE seconds ago"
    
    if [ "$AGE" -gt 3600 ]; then
        echo "   ⚠️  Metrics are more than 1 hour old - consider triggering a workflow"
    fi
else
    echo "⚠️  Cannot determine last update time"
fi

echo ""
echo "=================================="
echo "✅ Test Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Open Grafana dashboard: http://13.220.101.54:3000"
echo "2. Navigate to 'FoodFast CI/CD Pipeline' dashboard"
echo "3. Verify that panels show data"
echo ""
echo "💡 Tips:"
echo "- If no data: Trigger a GitHub Actions workflow"
echo "- If data is stale: Check workflow triggers in .github/workflows/export-cicd-metrics.yml"
echo "- If errors: Check Pushgateway logs"
