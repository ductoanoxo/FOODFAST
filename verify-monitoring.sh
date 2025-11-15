#!/bin/bash

# Script để verify hệ thống CI/CD monitoring
# Usage: ./verify-monitoring.sh

set -e

echo "============================================"
echo "🔍 FoodFast CI/CD Monitoring Verification"
echo "============================================"
echo ""

# Configuration
PROMETHEUS_URL="${PROMETHEUS_URL:-http://13.220.101.54:9090}"
PUSHGATEWAY_URL="${PUSHGATEWAY_URL:-http://13.220.101.54:9091}"
GRAFANA_URL="${GRAFANA_URL:-http://13.220.101.54:3030}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_service() {
    local name=$1
    local url=$2
    
    echo -n "Checking $name... "
    if curl -sf "$url" > /dev/null; then
        echo -e "${GREEN}✓ UP${NC}"
        return 0
    else
        echo -e "${RED}✗ DOWN${NC}"
        return 1
    fi
}

check_prometheus_target() {
    local target=$1
    echo -n "  Checking Prometheus target: $target... "
    
    response=$(curl -s "$PROMETHEUS_URL/api/v1/targets")
    if echo "$response" | grep -q "\"job\":\"$target\".*\"health\":\"up\""; then
        echo -e "${GREEN}✓ UP${NC}"
        return 0
    else
        echo -e "${RED}✗ DOWN${NC}"
        return 1
    fi
}

check_metric_exists() {
    local metric=$1
    echo -n "  Checking metric: $metric... "
    
    response=$(curl -s "$PROMETHEUS_URL/api/v1/query?query=$metric")
    if echo "$response" | grep -q '"status":"success"'; then
        count=$(echo "$response" | grep -o '"result":\[' | wc -l)
        if [ "$count" -gt 0 ]; then
            echo -e "${GREEN}✓ EXISTS${NC}"
            return 0
        fi
    fi
    echo -e "${YELLOW}⚠ NOT FOUND${NC}"
    return 1
}

# Start verification
echo "1️⃣  Checking services..."
echo "-------------------------------------------"
check_service "Prometheus" "$PROMETHEUS_URL/-/healthy"
check_service "Pushgateway" "$PUSHGATEWAY_URL/-/healthy"
check_service "Grafana" "$GRAFANA_URL/api/health"
echo ""

echo "2️⃣  Checking Prometheus targets..."
echo "-------------------------------------------"
check_prometheus_target "prometheus"
check_prometheus_target "pushgateway"
check_prometheus_target "node_exporter"
check_prometheus_target "cadvisor"
check_prometheus_target "server_app"
echo ""

echo "3️⃣  Checking CI/CD metrics..."
echo "-------------------------------------------"
check_metric_exists "github_workflow_run_total"
check_metric_exists "github_workflow_success_total"
check_metric_exists "github_workflow_failure_total"
check_metric_exists "github_workflow_duration_seconds"
check_metric_exists "github_workflow_status"
check_metric_exists "github_workflow_last_run_timestamp"
echo ""

echo "4️⃣  Checking recording rules..."
echo "-------------------------------------------"
check_metric_exists "github:workflow:run_total:sum"
check_metric_exists "github:workflow:success_rate:percent"
check_metric_exists "github:workflow:duration_seconds:avg1h"
check_metric_exists "github:branch:success_rate:percent"
echo ""

echo "5️⃣  Checking alert rules..."
echo "-------------------------------------------"
echo -n "  Loading alert rules... "
response=$(curl -s "$PROMETHEUS_URL/api/v1/rules?type=alert")
if echo "$response" | grep -q '"status":"success"'; then
    alert_count=$(echo "$response" | grep -o '"name":"' | wc -l)
    echo -e "${GREEN}✓ LOADED ($alert_count alerts)${NC}"
    
    # List some important alerts
    echo "  Important alerts:"
    echo "$response" | grep -o '"name":"[^"]*"' | sed 's/"name":"//;s/"$//' | grep -E "CICD|Production|Deploy" | head -5 | sed 's/^/    - /'
else
    echo -e "${RED}✗ FAILED${NC}"
fi
echo ""

echo "6️⃣  Checking Pushgateway metrics..."
echo "-------------------------------------------"
echo -n "  Fetching metrics from Pushgateway... "
pushgateway_metrics=$(curl -s "$PUSHGATEWAY_URL/metrics")
github_metrics=$(echo "$pushgateway_metrics" | grep -c "^github_workflow" || true)
echo -e "${GREEN}✓ FOUND ($github_metrics metrics)${NC}"

if [ "$github_metrics" -gt 0 ]; then
    echo "  Recent workflow metrics:"
    echo "$pushgateway_metrics" | grep "^github_workflow" | head -10 | sed 's/^/    /'
fi
echo ""

echo "7️⃣  Checking Grafana datasources..."
echo "-------------------------------------------"
echo -n "  Checking Prometheus datasource... "
response=$(curl -s "$GRAFANA_URL/api/datasources" -u admin:admin123)
if echo "$response" | grep -q '"type":"prometheus"'; then
    echo -e "${GREEN}✓ CONFIGURED${NC}"
else
    echo -e "${RED}✗ NOT FOUND${NC}"
fi
echo ""

echo "8️⃣  Sample queries..."
echo "-------------------------------------------"

# Total workflow runs
echo -n "  Total workflow runs: "
response=$(curl -s "$PROMETHEUS_URL/api/v1/query?query=sum(github_workflow_run_total)")
value=$(echo "$response" | grep -o '"value":\[[^]]*\]' | grep -o '[0-9.]*' | tail -1)
if [ -n "$value" ]; then
    echo -e "${GREEN}$value${NC}"
else
    echo -e "${YELLOW}N/A${NC}"
fi

# Success rate
echo -n "  Overall success rate: "
response=$(curl -s "$PROMETHEUS_URL/api/v1/query?query=100%20*%20sum(github_workflow_success_total)%20/%20(sum(github_workflow_success_total)%20%2B%20sum(github_workflow_failure_total))")
value=$(echo "$response" | grep -o '"value":\[[^]]*\]' | grep -o '[0-9.]*' | tail -1)
if [ -n "$value" ]; then
    echo -e "${GREEN}${value}%${NC}"
else
    echo -e "${YELLOW}N/A${NC}"
fi

# Last run
echo -n "  Last workflow run: "
response=$(curl -s "$PROMETHEUS_URL/api/v1/query?query=max(github_workflow_last_run_timestamp)")
timestamp=$(echo "$response" | grep -o '"value":\[[^]]*\]' | grep -o '[0-9]*' | tail -1)
if [ -n "$timestamp" ] && [ "$timestamp" != "0" ]; then
    time_ago=$(($(date +%s) - timestamp))
    minutes=$((time_ago / 60))
    echo -e "${GREEN}${minutes} minutes ago${NC}"
else
    echo -e "${YELLOW}N/A${NC}"
fi

echo ""
echo "============================================"
echo "✅ Verification complete!"
echo "============================================"
echo ""
echo "📊 Access points:"
echo "  - Prometheus: $PROMETHEUS_URL"
echo "  - Pushgateway: $PUSHGATEWAY_URL"
echo "  - Grafana: $GRAFANA_URL"
echo ""
echo "🔗 Useful links:"
echo "  - Prometheus Targets: $PROMETHEUS_URL/targets"
echo "  - Prometheus Rules: $PROMETHEUS_URL/rules"
echo "  - Prometheus Alerts: $PROMETHEUS_URL/alerts"
echo "  - Pushgateway Metrics: $PUSHGATEWAY_URL/metrics"
echo "  - Grafana Dashboards: $GRAFANA_URL/dashboards"
echo ""
