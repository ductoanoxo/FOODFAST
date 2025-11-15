#!/bin/bash

# Test Full Pipeline Dashboard Data
# Kiểm tra xem dashboard có đủ dữ liệu hiển thị không

echo "🧪 Testing CI/CD Full Pipeline Dashboard..."
echo "=========================================="

PUSHGATEWAY_URL="http://13.220.101.54:9091"
PROMETHEUS_URL="http://13.220.101.54:9090"
GRAFANA_URL="http://13.220.101.54:3030"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check Pushgateway
echo ""
echo "📊 Test 1: Checking Pushgateway..."
if curl -s "${PUSHGATEWAY_URL}/metrics" > /dev/null; then
    echo -e "${GREEN}✅ Pushgateway is running${NC}"
    
    # Count metrics
    CI_METRICS=$(curl -s "${PUSHGATEWAY_URL}/metrics" | grep -c "workflow.*CI")
    BUILD_METRICS=$(curl -s "${PUSHGATEWAY_URL}/metrics" | grep -c "workflow.*Build")
    DEPLOY_METRICS=$(curl -s "${PUSHGATEWAY_URL}/metrics" | grep -c "workflow.*Deploy")
    
    echo "   - CI Test metrics: ${CI_METRICS}"
    echo "   - Build metrics: ${BUILD_METRICS}"
    echo "   - Deploy metrics: ${DEPLOY_METRICS}"
    
    if [ $CI_METRICS -gt 0 ] && [ $BUILD_METRICS -gt 0 ] && [ $DEPLOY_METRICS -gt 0 ]; then
        echo -e "${GREEN}   ✅ All 3 pipeline stages have metrics${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Some pipeline stages missing metrics${NC}"
    fi
else
    echo -e "${RED}❌ Pushgateway is not accessible${NC}"
fi

# Test 2: Check Prometheus
echo ""
echo "📊 Test 2: Checking Prometheus..."
if curl -s "${PROMETHEUS_URL}/-/healthy" > /dev/null; then
    echo -e "${GREEN}✅ Prometheus is running${NC}"
    
    # Query pipeline success rate
    SUCCESS_RATE=$(curl -s "${PROMETHEUS_URL}/api/v1/query?query=(sum(github_workflow_run_success_total)%20/%20sum(github_workflow_run_count_total))%20*%20100" | grep -o '"result":\[{"metric":{},"value":\[[^]]*\]}' || echo "")
    
    if [ -n "$SUCCESS_RATE" ]; then
        echo -e "${GREEN}   ✅ Pipeline success rate query works${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Pipeline success rate not available yet${NC}"
    fi
else
    echo -e "${RED}❌ Prometheus is not accessible${NC}"
fi

# Test 3: Check Grafana
echo ""
echo "📊 Test 3: Checking Grafana..."
if curl -s "${GRAFANA_URL}/api/health" > /dev/null; then
    echo -e "${GREEN}✅ Grafana is running${NC}"
    
    # Check dashboard exists
    DASHBOARD_CHECK=$(curl -s -u admin:admin123 "${GRAFANA_URL}/api/search?query=Full%20Pipeline" | grep -c "cicd-full-pipeline" || echo "0")
    
    if [ "$DASHBOARD_CHECK" -gt 0 ]; then
        echo -e "${GREEN}   ✅ Full Pipeline dashboard exists${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Full Pipeline dashboard not found${NC}"
        echo "   📝 Import with: curl -X POST ${GRAFANA_URL}/api/dashboards/db -H 'Content-Type: application/json' -u admin:admin123 -d @monitoring/grafana/cicd-full-pipeline-dashboard.json"
    fi
else
    echo -e "${RED}❌ Grafana is not accessible${NC}"
fi

# Test 4: Check for required metrics
echo ""
echo "📊 Test 4: Checking Required Metrics..."

REQUIRED_METRICS=(
    "github_workflow_run_count_total"
    "github_workflow_run_success_total"
    "github_workflow_run_failure_total"
    "github_workflow_run_duration_seconds"
    "github_workflow_run_status"
    "github_workflow_run_timestamp_seconds"
)

METRICS_FOUND=0
for metric in "${REQUIRED_METRICS[@]}"; do
    if curl -s "${PUSHGATEWAY_URL}/metrics" | grep -q "^# TYPE ${metric}"; then
        echo -e "${GREEN}   ✅ ${metric}${NC}"
        ((METRICS_FOUND++))
    else
        echo -e "${RED}   ❌ ${metric} not found${NC}"
    fi
done

echo ""
if [ $METRICS_FOUND -eq ${#REQUIRED_METRICS[@]} ]; then
    echo -e "${GREEN}✅ All required metrics available (${METRICS_FOUND}/${#REQUIRED_METRICS[@]})${NC}"
else
    echo -e "${YELLOW}⚠️  Only ${METRICS_FOUND}/${#REQUIRED_METRICS[@]} metrics available${NC}"
fi

# Test 5: Check label values for filters
echo ""
echo "📊 Test 5: Checking Filter Variables..."

# Check workflows
WORKFLOWS=$(curl -s "${PUSHGATEWAY_URL}/metrics" | grep "workflow=" | sed -n 's/.*workflow="\([^"]*\)".*/\1/p' | sort -u)
WORKFLOW_COUNT=$(echo "$WORKFLOWS" | wc -l)

if [ $WORKFLOW_COUNT -gt 0 ]; then
    echo -e "${GREEN}   ✅ Workflow filter: ${WORKFLOW_COUNT} workflows found${NC}"
    echo "$WORKFLOWS" | while read -r wf; do
        echo "      - $wf"
    done
else
    echo -e "${RED}   ❌ No workflows found${NC}"
fi

# Check branches
BRANCHES=$(curl -s "${PUSHGATEWAY_URL}/metrics" | grep "branch=" | sed -n 's/.*branch="\([^"]*\)".*/\1/p' | sort -u)
BRANCH_COUNT=$(echo "$BRANCHES" | wc -l)

if [ $BRANCH_COUNT -gt 0 ]; then
    echo -e "${GREEN}   ✅ Branch filter: ${BRANCH_COUNT} branches found${NC}"
    echo "$BRANCHES" | while read -r br; do
        echo "      - $br"
    done
else
    echo -e "${RED}   ❌ No branches found${NC}"
fi

# Check actors
ACTORS=$(curl -s "${PUSHGATEWAY_URL}/metrics" | grep "actor=" | sed -n 's/.*actor="\([^"]*\)".*/\1/p' | sort -u)
ACTOR_COUNT=$(echo "$ACTORS" | wc -l)

if [ $ACTOR_COUNT -gt 0 ]; then
    echo -e "${GREEN}   ✅ Actor filter: ${ACTOR_COUNT} actors found${NC}"
    echo "$ACTORS" | while read -r ac; do
        echo "      - $ac"
    done
else
    echo -e "${RED}   ❌ No actors found${NC}"
fi

# Test 6: Verify stage-specific metrics
echo ""
echo "📊 Test 6: Checking Pipeline Stages..."

CI_STAGE=$(curl -s "${PUSHGATEWAY_URL}/metrics" | grep -i "workflow.*CI.*Test" | head -1)
BUILD_STAGE=$(curl -s "${PUSHGATEWAY_URL}/metrics" | grep -i "workflow.*Build" | head -1)
DEPLOY_STAGE=$(curl -s "${PUSHGATEWAY_URL}/metrics" | grep -i "workflow.*Deploy" | head -1)

if [ -n "$CI_STAGE" ]; then
    echo -e "${GREEN}   ✅ Stage 1: CI - Test & Lint${NC}"
else
    echo -e "${RED}   ❌ Stage 1: CI - Test & Lint (no data)${NC}"
fi

if [ -n "$BUILD_STAGE" ]; then
    echo -e "${GREEN}   ✅ Stage 2: Docker Build & Push${NC}"
else
    echo -e "${RED}   ❌ Stage 2: Docker Build & Push (no data)${NC}"
fi

if [ -n "$DEPLOY_STAGE" ]; then
    echo -e "${GREEN}   ✅ Stage 3: Deploy to EC2${NC}"
else
    echo -e "${RED}   ❌ Stage 3: Deploy to EC2 (no data)${NC}"
fi

# Summary
echo ""
echo "=========================================="
echo "📊 Test Summary"
echo "=========================================="

if [ $METRICS_FOUND -eq ${#REQUIRED_METRICS[@]} ] && [ -n "$CI_STAGE" ] && [ -n "$BUILD_STAGE" ] && [ -n "$DEPLOY_STAGE" ]; then
    echo -e "${GREEN}✅ Dashboard is ready to use!${NC}"
    echo ""
    echo "🎯 Access your dashboard:"
    echo "   URL: ${GRAFANA_URL}/d/cicd-full-pipeline/foodfast-cicd-full-pipeline"
    echo "   Login: admin / admin123"
    echo ""
    echo "📈 What you can see:"
    echo "   - Full Pipeline Success Rate"
    echo "   - Time to Production"
    echo "   - Stage-by-stage status (CI → Build → Deploy)"
    echo "   - Deployment frequency & trends"
    echo "   - Failed stage detection"
    echo "   - Team activity & contributions"
else
    echo -e "${YELLOW}⚠️  Dashboard needs more data${NC}"
    echo ""
    echo "💡 To generate metrics:"
    echo "   1. Push code to GitHub:"
    echo "      git commit --allow-empty -m 'test: trigger ci/cd'"
    echo "      git push origin main"
    echo ""
    echo "   2. Or manually push test data:"
    echo "      bash test-realtime-cicd.sh"
    echo ""
    echo "   3. Wait 1-2 minutes, then refresh dashboard"
fi

echo ""
echo "📚 Documentation:"
echo "   - Full guide: CICD_FULL_PIPELINE_DASHBOARD.md"
echo "   - Quick start: CICD_MONITORING_QUICKSTART.md"
echo ""
