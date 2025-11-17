#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 CI/CD Real-time Monitoring Test Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Configuration
PUSHGATEWAY_URL="http://50.19.133.198:9091"
PROMETHEUS_URL="http://50.19.133.198:9090"
GRAFANA_URL="http://50.19.133.198:3030"
REPO_OWNER="ductoanoxo"
REPO_NAME="FOODFAST"

# Step 1: Trigger workflow
echo -e "${YELLOW}📝 Step 1: Triggering GitHub Actions workflow...${NC}"
echo ""

TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
echo "Test CI/CD monitoring at $TIMESTAMP" >> test-cicd.txt

git add test-cicd.txt
git commit -m "test: CI/CD monitoring at $TIMESTAMP"

echo -e "${YELLOW}Pushing to GitHub...${NC}"
git push origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
else
    echo -e "${RED}❌ Failed to push to GitHub${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 2: Monitor workflow status
echo -e "${YELLOW}⏳ Step 2: Monitoring workflow status...${NC}"
echo ""
echo -e "   ${BLUE}GitHub Actions:${NC}"
echo -e "   https://github.com/$REPO_OWNER/$REPO_NAME/actions"
echo ""
echo -e "${YELLOW}   Please wait for the following workflows to complete:${NC}"
echo -e "   1️⃣  CI - Test and Lint"
echo -e "   2️⃣  Docker Build and Push (if CI passes)"
echo -e "   3️⃣  Export CI/CD Metrics"
echo ""
echo -e "${YELLOW}   ⏱️  Estimated time: 3-5 minutes${NC}"
echo ""

# Wait for user confirmation
read -p "Press Enter when all workflows have completed..."
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 3: Check Pushgateway
echo -e "${YELLOW}🔍 Step 3: Checking Pushgateway metrics...${NC}"
echo ""

echo -e "${BLUE}Querying Pushgateway at $PUSHGATEWAY_URL/metrics${NC}"
PUSHGATEWAY_RESPONSE=$(curl -s "$PUSHGATEWAY_URL/metrics" | grep -E "github_workflow_(run_total|success_total|failure_total|duration_seconds|status)")

if [ -n "$PUSHGATEWAY_RESPONSE" ]; then
    echo -e "${GREEN}✅ Pushgateway has CI/CD metrics:${NC}"
    echo ""
    echo "$PUSHGATEWAY_RESPONSE" | head -20
    echo ""
    
    # Count metrics
    RUN_TOTAL=$(echo "$PUSHGATEWAY_RESPONSE" | grep "github_workflow_run_total" | wc -l)
    SUCCESS_TOTAL=$(echo "$PUSHGATEWAY_RESPONSE" | grep "github_workflow_success_total" | wc -l)
    FAILURE_TOTAL=$(echo "$PUSHGATEWAY_RESPONSE" | grep "github_workflow_failure_total" | wc -l)
    
    echo -e "${GREEN}📊 Metrics found:${NC}"
    echo -e "   - github_workflow_run_total: $RUN_TOTAL entries"
    echo -e "   - github_workflow_success_total: $SUCCESS_TOTAL entries"
    echo -e "   - github_workflow_failure_total: $FAILURE_TOTAL entries"
else
    echo -e "${RED}❌ No CI/CD metrics found on Pushgateway${NC}"
    echo -e "${YELLOW}   This might mean:${NC}"
    echo -e "   - Export workflow hasn't run yet"
    echo -e "   - Export workflow failed"
    echo -e "   - Pushgateway URL is incorrect"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 4: Check Prometheus
echo -e "${YELLOW}🔍 Step 4: Checking Prometheus...${NC}"
echo ""

echo -e "${BLUE}Querying Prometheus at $PROMETHEUS_URL${NC}"

# Check if Prometheus can scrape Pushgateway
PROM_TARGETS=$(curl -s "$PROMETHEUS_URL/api/v1/targets" | grep -o '"health":"[^"]*"' | grep pushgateway)

if [ -n "$PROM_TARGETS" ]; then
    echo -e "${GREEN}✅ Prometheus is connected to Pushgateway${NC}"
else
    echo -e "${RED}❌ Prometheus may not be scraping Pushgateway${NC}"
fi

# Query metrics from Prometheus
PROM_METRICS=$(curl -s -G "$PROMETHEUS_URL/api/v1/query" \
  --data-urlencode 'query=github_workflow_run_total' | \
  grep -o '"status":"[^"]*"')

if [[ "$PROM_METRICS" == *"success"* ]]; then
    echo -e "${GREEN}✅ Prometheus has CI/CD metrics${NC}"
    
    # Get actual values
    curl -s -G "$PROMETHEUS_URL/api/v1/query" \
      --data-urlencode 'query=github_workflow_run_total' | \
      python3 -m json.tool 2>/dev/null | grep -A2 "metric\|value" | head -20
else
    echo -e "${RED}❌ No CI/CD metrics in Prometheus${NC}"
    echo -e "${YELLOW}   Wait a few seconds for Prometheus to scrape Pushgateway${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 5: Check Grafana Dashboard
echo -e "${YELLOW}📊 Step 5: Check Grafana Dashboard${NC}"
echo ""

echo -e "${GREEN}Open the following URL in your browser:${NC}"
echo -e "${BLUE}$GRAFANA_URL/d/foodfast-cicd${NC}"
echo ""

echo -e "${YELLOW}Expected to see:${NC}"
echo -e "   📊 Tổng số Runs: Increased by +1 (or more)"
echo -e "   ✅ Thành công: Increased if workflow passed"
echo -e "   ❌ Thất bại: Increased if workflow failed"
echo -e "   ⏱️  Thời gian TB: Updated average duration"
echo -e "   📋 Workflow Runs table: New entry with your workflow"
echo -e "   📈 Charts: Updated with latest data"
echo ""

echo -e "${BLUE}Dashboard auto-refreshes every 30 seconds${NC}"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Summary
echo -e "${GREEN}✅ Test Complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Summary of URLs:${NC}"
echo -e "   🐙 GitHub Actions: https://github.com/$REPO_OWNER/$REPO_NAME/actions"
echo -e "   📮 Pushgateway:    $PUSHGATEWAY_URL"
echo -e "   🔥 Prometheus:     $PROMETHEUS_URL"
echo -e "   📊 Grafana:        $GRAFANA_URL/d/foodfast-cicd"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Final check
echo -e "${YELLOW}🔍 Quick Health Check:${NC}"
echo ""

# Check services
echo -n "   Pushgateway:  "
curl -s -o /dev/null -w "%{http_code}" "$PUSHGATEWAY_URL" | grep -q "200" && echo -e "${GREEN}✅ UP${NC}" || echo -e "${RED}❌ DOWN${NC}"

echo -n "   Prometheus:   "
curl -s -o /dev/null -w "%{http_code}" "$PROMETHEUS_URL" | grep -q "200" && echo -e "${GREEN}✅ UP${NC}" || echo -e "${RED}❌ DOWN${NC}"

echo -n "   Grafana:      "
curl -s -o /dev/null -w "%{http_code}" "$GRAFANA_URL" | grep -q "302\|200" && echo -e "${GREEN}✅ UP${NC}" || echo -e "${RED}❌ DOWN${NC}"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}🎉 CI/CD Monitoring System is ready!${NC}"
echo -e "${YELLOW}   Open Grafana dashboard to see real-time updates${NC}"
echo ""
