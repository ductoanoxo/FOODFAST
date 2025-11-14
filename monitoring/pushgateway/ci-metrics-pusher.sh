#!/bin/bash

# CI/CD Metrics Pusher Script
# Đẩy metrics từ GitHub Actions workflows lên Prometheus Pushgateway

set -e

# Configuration
PUSHGATEWAY_URL="${PUSHGATEWAY_URL:-http://localhost:9091}"
JOB_NAME="${CI_JOB_NAME:-github-actions}"
INSTANCE="${GITHUB_RUN_ID:-local}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Hàm push metric lên Pushgateway
push_metric() {
    local metric_name=$1
    local metric_value=$2
    local metric_type=${3:-gauge}
    local help_text=${4:-"CI/CD metric"}
    
    log_info "Pushing metric: ${metric_name}=${metric_value}"
    
    cat <<EOF | curl --data-binary @- "${PUSHGATEWAY_URL}/metrics/job/${JOB_NAME}/instance/${INSTANCE}"
# HELP ${metric_name} ${help_text}
# TYPE ${metric_name} ${metric_type}
${metric_name} ${metric_value}
EOF
    
    if [ $? -eq 0 ]; then
        log_info "✅ Metric pushed successfully"
    else
        log_error "❌ Failed to push metric"
        return 1
    fi
}

# Hàm push nhiều metrics cùng lúc
push_metrics_batch() {
    local metrics_data="$1"
    
    log_info "Pushing batch metrics..."
    
    echo "${metrics_data}" | curl --data-binary @- "${PUSHGATEWAY_URL}/metrics/job/${JOB_NAME}/instance/${INSTANCE}"
    
    if [ $? -eq 0 ]; then
        log_info "✅ Batch metrics pushed successfully"
    else
        log_error "❌ Failed to push batch metrics"
        return 1
    fi
}

# Export functions để sử dụng trong GitHub Actions
export -f push_metric
export -f push_metrics_batch
export -f log_info
export -f log_warn
export -f log_error

log_info "CI/CD Metrics Pusher initialized"
log_info "Pushgateway URL: ${PUSHGATEWAY_URL}"
log_info "Job Name: ${JOB_NAME}"
log_info "Instance: ${INSTANCE}"
