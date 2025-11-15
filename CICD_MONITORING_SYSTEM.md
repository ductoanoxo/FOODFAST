# 📊 Hệ thống Monitoring CI/CD với Grafana + Prometheus

## 🎯 Tổng quan

Hệ thống monitoring CI/CD của FoodFast sử dụng stack:
- **GitHub Actions**: Chạy các workflows CI/CD
- **Pushgateway**: Nhận metrics từ GitHub Actions
- **Prometheus**: Thu thập và lưu trữ metrics
- **Grafana**: Hiển thị dashboards và alerts

## 🔄 Luồng dữ liệu

```
┌─────────────────┐
│ GitHub Actions  │
│   Workflows     │
└────────┬────────┘
         │ Export metrics
         v
┌─────────────────┐
│  Pushgateway    │
│    :9091        │
└────────┬────────┘
         │ Scrape every 5s
         v
┌─────────────────┐
│   Prometheus    │
│    :9090        │
└────────┬────────┘
         │ Query
         v
┌─────────────────┐
│    Grafana      │
│    :3030        │
└─────────────────┘
```

## 📋 Workflows được theo dõi

### 1. **CI - Test and Lint**
- Chạy unit tests và integration tests
- Linting code
- Security scanning
- **Metrics**: Duration, success rate, failures

### 2. **Docker Build and Push**
- Build multi-architecture images
- Push lên GitHub Container Registry
- **Metrics**: Build time, success rate, image size

### 3. **Auto Deploy to EC2**
- Deploy production lên AWS EC2
- Sync monitoring configs
- Health checks
- **Metrics**: Deployment time, success rate, downtime

### 4. **Export CI/CD Metrics**
- Thu thập metrics từ các workflows khác
- Push lên Pushgateway
- **Tự động chạy sau mỗi workflow completion**

## 📊 Metrics được thu thập

### Counter Metrics (Tăng dần)
```promql
# Tổng số lần chạy workflow
github_workflow_run_total{workflow="...", branch="...", actor="..."}

# Tổng số lần thành công
github_workflow_success_total{workflow="...", branch="..."}

# Tổng số lần thất bại
github_workflow_failure_total{workflow="...", branch="..."}
```

### Gauge Metrics (Giá trị tức thời)
```promql
# Thời gian chạy workflow (seconds)
github_workflow_duration_seconds{workflow="...", branch="...", conclusion="..."}

# Số thứ tự của run
github_workflow_run_number{workflow="...", branch="..."}

# Trạng thái workflow (1=success, 0=failure, -1=unknown)
github_workflow_status{workflow="...", branch="...", run_id="...", conclusion="..."}

# Timestamp của lần chạy cuối
github_workflow_last_run_timestamp{workflow="...", branch="...", conclusion="..."}

# Success rate (0.0 to 1.0)
github_workflow_success_rate{workflow="...", branch="..."}
```

## 📈 Recording Rules

Prometheus tính toán trước các metrics phức tạp để tối ưu performance:

### Aggregations
```promql
# Tổng số runs theo workflow và branch
github:workflow:run_total:sum

# Success rate (%)
github:workflow:success_rate:percent

# Average duration trong 1h
github:workflow:duration_seconds:avg1h

# Workflow frequency (runs/hour)
github:workflow:run_frequency:rate1h
```

### Alert Data
```promql
# Failures trong 5 phút
github:workflow:failures:5m

# Consecutive failures
github:workflow:consecutive_failures

# Long running workflows (>10 min)
github:workflow:long_running:count
```

## 🚨 Alerts được cấu hình

### Critical Alerts
1. **ProductionDeploymentFailed**: Deploy production thất bại
2. **CICDConsecutiveFailures**: Nhiều hơn 2 failures liên tiếp

### Warning Alerts
1. **CICDWorkflowFailed**: Workflow thất bại
2. **CICDWorkflowTooSlow**: Workflow chạy > 15 phút
3. **CICDLowSuccessRate**: Success rate < 80%
4. **DockerBuildFailed**: Docker build thất bại
5. **TestWorkflowFailed**: Test workflow thất bại

### Info Alerts
1. **CICDNoRecentActivity**: Không có activity trong 2 giờ
2. **CICDHighFrequency**: Workflow chạy quá thường xuyên (>10 lần/giờ)

## 📊 Grafana Dashboard

Dashboard URL: `http://13.220.101.54:3030/d/cicd-dashboard`

### Panels chính:
1. **Overview**: Tổng quan về tất cả workflows
2. **Workflow Runs**: Số lượng runs theo thời gian
3. **Success Rate**: Tỷ lệ thành công theo workflow
4. **Duration**: Thời gian chạy workflows
5. **Failures**: Các workflows thất bại
6. **Branch Activity**: Hoạt động theo branch
7. **Recent Runs**: Danh sách runs gần nhất

### Filters:
- **Workflow**: Lọc theo tên workflow
- **Branch**: Lọc theo branch (main, deploy, develop, etc.)
- **Time Range**: Mặc định 6 hours, có thể thay đổi

## 🔍 Queries hữu ích

### 1. Success rate của tất cả workflows
```promql
100 * (
  sum(github_workflow_success_total) by (workflow)
  / 
  (sum(github_workflow_success_total) by (workflow) + 
   sum(github_workflow_failure_total) by (workflow))
)
```

### 2. Average duration theo workflow
```promql
avg(github_workflow_duration_seconds) by (workflow)
```

### 3. Workflow nào fail nhiều nhất
```promql
topk(5, sum(github_workflow_failure_total) by (workflow))
```

### 4. Workflow chạy chậm nhất
```promql
topk(5, max(github_workflow_duration_seconds) by (workflow))
```

### 5. Activity theo branch
```promql
sum(rate(github_workflow_run_total[1h])) by (branch) * 3600
```

### 6. Failures trong 24h gần nhất
```promql
increase(github_workflow_failure_total[24h])
```

## 🛠️ Cấu hình

### Prometheus Configuration
File: `monitoring/prometheus.yml`
- **Scrape interval**: 5s cho pushgateway (real-time)
- **Retention**: 30 days
- **Storage**: 10GB limit

### Pushgateway Configuration
- **Port**: 9091
- **Persistence**: Enabled (save to disk every 5 minutes)
- **Volume**: `pushgateway_data`

### Grafana Configuration
- **Port**: 3030
- **Admin**: admin / admin123
- **Auto-provisioning**: Datasources và dashboards
- **Refresh**: 30s

## 🔧 Troubleshooting

### 1. Metrics không xuất hiện

**Kiểm tra Pushgateway:**
```bash
curl http://13.220.101.54:9091/metrics | grep github_workflow
```

**Kiểm tra Prometheus targets:**
```bash
# Truy cập: http://13.220.101.54:9090/targets
# Pushgateway phải có status UP
```

### 2. Dashboard trống

**Verify datasource:**
```bash
# Trong Grafana: Configuration > Data Sources > Prometheus
# URL phải là: http://prometheus:9090
```

**Test query:**
```promql
up{job="pushgateway"}
```

### 3. Workflow không trigger export metrics

**Kiểm tra workflow:**
```yaml
# File: .github/workflows/export-cicd-metrics.yml
# Đảm bảo workflows được list trong `workflow_run.workflows`
```

**Check logs:**
```bash
# Vào GitHub Actions và xem logs của workflow "Export CI/CD Metrics"
```

### 4. Alerts không hoạt động

**Kiểm tra Prometheus rules:**
```bash
# Truy cập: http://13.220.101.54:9090/rules
# Tất cả rules phải load thành công
```

**Reload configuration:**
```bash
curl -X POST http://13.220.101.54:9090/-/reload
```

## 📦 Deployment

### Local Development
```bash
# Start tất cả services
docker-compose up -d

# Chỉ start monitoring stack
docker-compose up -d prometheus grafana pushgateway
```

### Production (EC2)
```bash
# Deploy qua GitHub Actions
git push origin main

# Hoặc manual deploy
ssh ubuntu@13.220.101.54
cd ~/
# Monitoring configs đã được sync từ deploy workflow
```

## 🔄 Cập nhật hệ thống

### 1. Thêm metrics mới
Edit `.github/workflows/export-cicd-metrics.yml`:
```yaml
# Thêm metrics vào phần Generate Prometheus metrics
cat > metrics.txt <<EOF
# HELP new_metric_name Description
# TYPE new_metric_name gauge
new_metric_name{label="value"} 123
EOF
```

### 2. Thêm alert mới
Edit `monitoring/alerts.yml`:
```yaml
- alert: NewAlert
  expr: metric_name > threshold
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Alert summary"
```

### 3. Thêm recording rule mới
Edit `monitoring/recording-rules.yml`:
```yaml
- record: new:metric:name
  expr: sum(metric) by (label)
```

### 4. Deploy changes
```bash
# Commit và push
git add .
git commit -m "Update monitoring config"
git push origin main

# Hoặc reload Prometheus manually
curl -X POST http://13.220.101.54:9090/-/reload
```

## 📚 Resources

- **Prometheus Query**: http://13.220.101.54:9090
- **Pushgateway UI**: http://13.220.101.54:9091
- **Grafana Dashboard**: http://13.220.101.54:3030
- **GitHub Actions**: https://github.com/ductoanoxo/FOODFAST/actions

## 🎓 Best Practices

### 1. Metrics naming
- Sử dụng snake_case: `github_workflow_duration_seconds`
- Thêm unit vào tên: `_seconds`, `_total`, `_bytes`
- Counters nên kết thúc bằng `_total`

### 2. Labels
- Giữ cardinality thấp (tránh timestamp, run_id trong counter labels)
- Sử dụng labels có ý nghĩa: `workflow`, `branch`, `conclusion`
- Tránh high-cardinality labels như commit SHA trong counter

### 3. Recording rules
- Tính toán trước các queries phức tạp
- Sử dụng cho dashboard performance
- Đặt tên rõ ràng: `github:workflow:success_rate:percent`

### 4. Alerts
- Severity levels: critical > warning > info
- Thêm runbook_url để hướng dẫn xử lý
- Test alerts trước khi deploy

## 🚀 Roadmap

- [ ] Thêm Alertmanager để gửi notifications (Slack, Email)
- [ ] Implement custom exporters cho business metrics
- [ ] Dashboard cho performance testing
- [ ] Integration với AWS CloudWatch
- [ ] Automated capacity planning
- [ ] SLO/SLA tracking

---

**Maintained by**: DevOps Team  
**Last updated**: 2025-11-15  
**Version**: 2.0
