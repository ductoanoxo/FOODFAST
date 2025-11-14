#!/bin/bash

# Script để test push metrics lên Pushgateway thủ công
# Usage: ./test-pushgateway.sh

PUSHGATEWAY_URL="http://13.220.101.54:9091"
WORKFLOW_NAME="Test Manual Push"
CONCLUSION="success"
DURATION=120
BRANCH="kiet"
RUN_NUMBER=999

echo "🧪 Testing Pushgateway connection..."

# Generate test metrics
cat > /tmp/test_metrics.txt <<EOF
# HELP github_workflow_run_total Total number of workflow runs
# TYPE github_workflow_run_total counter
github_workflow_run_total{workflow="$WORKFLOW_NAME",branch="$BRANCH",actor="manual_test"} 1

# HELP github_workflow_success_total Total number of successful workflow runs
# TYPE github_workflow_success_total counter
github_workflow_success_total{workflow="$WORKFLOW_NAME",branch="$BRANCH"} 1

# HELP github_workflow_failure_total Total number of failed workflow runs
# TYPE github_workflow_failure_total counter
github_workflow_failure_total{workflow="$WORKFLOW_NAME",branch="$BRANCH"} 0

# HELP github_workflow_duration_seconds Duration of workflow run in seconds
# TYPE github_workflow_duration_seconds gauge
github_workflow_duration_seconds{workflow="$WORKFLOW_NAME",branch="$BRANCH",conclusion="$CONCLUSION"} $DURATION

# HELP github_workflow_run_number Sequential run number of the workflow
# TYPE github_workflow_run_number gauge
github_workflow_run_number{workflow="$WORKFLOW_NAME",branch="$BRANCH"} $RUN_NUMBER

# HELP github_workflow_status Current status of workflow (1=success, 0=failure, -1=unknown)
# TYPE github_workflow_status gauge
github_workflow_status{workflow="$WORKFLOW_NAME",branch="$BRANCH",run_id="test_123"} 1
EOF

echo "📝 Generated metrics:"
cat /tmp/test_metrics.txt

# Sanitize job name
JOB_NAME=$(echo "$WORKFLOW_NAME" | tr ' ' '_' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9_]/_/g')

echo ""
echo "🚀 Pushing to: ${PUSHGATEWAY_URL}/metrics/job/github_actions/instance/${JOB_NAME}"

# Push metrics
HTTP_CODE=$(curl -w "%{http_code}" -o /tmp/response.txt --data-binary @/tmp/test_metrics.txt \
  "${PUSHGATEWAY_URL}/metrics/job/github_actions/instance/${JOB_NAME}")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "202" ]; then
  echo "✅ Metrics pushed successfully (HTTP $HTTP_CODE)"
  echo ""
  echo "🔍 Verifying metrics in Pushgateway:"
  curl -s "${PUSHGATEWAY_URL}/metrics" | grep "github_workflow" | head -10
else
  echo "❌ Failed to push metrics (HTTP $HTTP_CODE)"
  cat /tmp/response.txt
  exit 1
fi

echo ""
echo "✨ Test complete! Check Grafana dashboard at http://13.220.101.54:3030"
