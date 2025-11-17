#!/bin/bash

# Script để verify tất cả queries trong dashboard có data
echo "🔍 Verifying CI/CD Dashboard Metrics..."
echo ""

PROM_URL="http://3.89.225.219:9090"

# Test từng query trong dashboard
echo "1️⃣  Total Workflow Runs:"
curl -s "${PROM_URL}/api/v1/query?query=sum(github_workflow_run_total)" | grep -o '"result":\[.*\]' | head -1
echo ""

echo "2️⃣  Successful Runs:"
curl -s "${PROM_URL}/api/v1/query?query=sum(github_workflow_success_total)" | grep -o '"result":\[.*\]' | head -1
echo ""

echo "3️⃣  Failed Runs:"
curl -s "${PROM_URL}/api/v1/query?query=sum(github_workflow_failure_total)" | grep -o '"result":\[.*\]' | head -1
echo ""

echo "4️⃣  Success Rate %:"
curl -s "${PROM_URL}/api/v1/query?query=(sum(github_workflow_success_total)/(sum(github_workflow_success_total)%2Bsum(github_workflow_failure_total)))*100" | grep -o '"result":\[.*\]' | head -1
echo ""

echo "5️⃣  Average Duration:"
curl -s "${PROM_URL}/api/v1/query?query=avg(github_workflow_duration_seconds)" | grep -o '"result":\[.*\]' | head -1
echo ""

echo "6️⃣  Workflow Runs by Type:"
curl -s "${PROM_URL}/api/v1/query?query=github_workflow_run_total" | grep -o '"workflow":"[^"]*"' | sort -u
echo ""

echo "7️⃣  Workflow Status:"
curl -s "${PROM_URL}/api/v1/query?query=github_workflow_status" | grep -o '"workflow":"[^"]*"' | sort -u
echo ""

echo "8️⃣  Runs by Branch:"
curl -s "${PROM_URL}/api/v1/query?query=sum(github_workflow_run_total)+by+(branch)" | grep -o '"branch":"[^"]*"' | sort -u
echo ""

echo "9️⃣  Runs by Actor:"
curl -s "${PROM_URL}/api/v1/query?query=sum(github_workflow_run_total)+by+(actor)" | grep -o '"actor":"[^"]*"' | sort -u
echo ""

echo "✅ Verification complete!"
echo ""
echo "📊 View dashboard at: http://3.89.225.219:3030/d/foodfast-cicd"
echo "🔐 Login: admin / admin123"
