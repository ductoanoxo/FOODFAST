#!/bin/bash

# Demo script: Xem dashboard có biết phân biệt nhiều branches không

echo "📊 Checking Dashboard Branch Support..."
echo ""

PROM_URL="http://13.220.101.54:9090"

echo "🌿 Current Branches in Metrics:"
curl -s "${PROM_URL}/api/v1/query?query=sum(github_workflow_run_total)+by+(branch)" | \
  grep -o '"branch":"[^"]*"' | sort -u
echo ""

echo "📈 Workflow Runs by Branch:"
curl -s "${PROM_URL}/api/v1/query?query=sum(github_workflow_run_total)+by+(branch)" | \
  grep -o '"branch":"[^"]*"},"value":\[[^,]*,[^]]*\]' | \
  sed 's/"branch":"\([^"]*\)"},"value":\[[^,]*,"\?\([^]"]*\)"\?\]/Branch: \1 -> \2 runs/'
echo ""

echo "🔍 Detailed Breakdown:"
echo ""
curl -s "${PROM_URL}/api/v1/query?query=github_workflow_run_total" | \
  grep -o '"workflow":"[^"]*",".*"branch":"[^"]*"' | \
  sed 's/"workflow":"\([^"]*\)","[^"]*"branch":"\([^"]*\)"/  - \1 on branch \2/' | \
  sort
echo ""

echo "✅ Dashboard Variables Support:"
echo "  - Workflow filter: ✓ (label_values(github_workflow_run_total, workflow))"
echo "  - Branch filter: ✓ (label_values(github_workflow_run_total, branch))"
echo ""

echo "📊 Dashboard có thể:"
echo "  ✅ Filter theo workflow cụ thể"
echo "  ✅ Filter theo branch cụ thể"
echo "  ✅ Hiển thị pie chart theo branch"
echo "  ✅ Xem metrics từ nhiều branches cùng lúc"
echo ""

echo "🔗 Test trong Grafana:"
echo "  1. Vào: http://13.220.101.54:3030/d/foodfast-cicd"
echo "  2. Phía trên dashboard có dropdown 'Workflow' và 'Branch'"
echo "  3. Chọn branch 'kiet' hoặc 'main' hoặc 'All'"
echo "  4. Dashboard sẽ filter data theo branch đã chọn"
