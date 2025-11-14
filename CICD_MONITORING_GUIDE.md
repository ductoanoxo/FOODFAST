# CI/CD Monitoring với Prometheus + Grafana

## 📋 Tổng quan

Hệ thống CI/CD Monitoring sử dụng Prometheus Pushgateway để thu thập metrics từ GitHub Actions workflows và hiển thị trên Grafana dashboard.

## 🏗️ Kiến trúc

```
GitHub Actions Workflows
    ↓
    ↓ Push metrics
    ↓
Prometheus Pushgateway (port 9091)
    ↓
    ↓ Scrape metrics
    ↓
Prometheus (port 9090)
    ↓
    ↓ Query metrics
    ↓
Grafana Dashboard (port 3030)
```

## 📊 Metrics được thu thập

### 1. CI Test Metrics
- `ci_test_duration_seconds` - Thời gian chạy test
- `ci_test_status` - Trạng thái test (1=success, 0=failure)
- `ci_test_timestamp_seconds` - Timestamp hoàn thành test

**Labels:**
- `app` - Tên application (server_app, client_app, admin_app, restaurant_app, drone_manage)
- `branch` - Tên nhánh Git
- `workflow` - Tên workflow

### 2. Docker Build Metrics
- `docker_build_duration_seconds` - Thời gian build Docker image
- `docker_build_status` - Trạng thái build (1=success, 0=failure)
- `docker_build_timestamp_seconds` - Timestamp hoàn thành build

**Labels:**
- `service` - Tên service được build
- `branch` - Tên nhánh Git
- `workflow` - Tên workflow

### 3. Deployment Metrics
- `deployment_duration_seconds` - Thời gian deploy
- `deployment_status` - Trạng thái deployment (1=success, 0=failure)
- `deployment_timestamp_seconds` - Timestamp hoàn thành deployment
- `deployment_count_total` - Tổng số lần deploy (counter)

**Labels:**
- `environment` - Môi trường (production)
- `branch` - Tên nhánh Git (main)
- `workflow` - Tên workflow

## 🚀 Cách sử dụng

### Bước 1: Cấu hình Secret trong GitHub

Thêm secret `PUSHGATEWAY_URL` trong GitHub repository settings:

```
Repository Settings → Secrets and variables → Actions → New repository secret

Name: PUSHGATEWAY_URL
Value: http://98.90.205.114:9091
```

> **Lưu ý:** Nếu không cấu hình, sẽ sử dụng giá trị mặc định `http://98.90.205.114:9091`

### Bước 2: Deploy Monitoring Stack

```bash
# Sử dụng Docker Compose (local)
docker-compose up -d

# Hoặc deploy lên production (tự động qua GitHub Actions)
git push origin main
```

### Bước 3: Truy cập Dashboards

**Grafana:**
- URL: http://98.90.205.114:3030
- Username: `admin`
- Password: `admin123`

**Prometheus:**
- URL: http://98.90.205.114:9090

**Pushgateway:**
- URL: http://98.90.205.114:9091

## 📈 Grafana Dashboard

Dashboard **"CI/CD Pipeline Monitoring"** bao gồm các panel:

### Status Panels (Hàng đầu)
1. **Server Tests Status** - Trạng thái test server (Success/Failed)
2. **Docker Build Status** - Trạng thái build Docker images
3. **Deployment Status** - Trạng thái deployment
4. **Total Deployments** - Tổng số lần deploy

### Duration Panels
5. **CI Test Duration** - Thời gian chạy test theo từng app
6. **Docker Build Duration** - Thời gian build theo từng service
7. **Deployment Duration** - Thời gian deploy

### Analytics Panels
8. **CI Test Success Rate** - Tỷ lệ test thành công/thất bại
9. **All CI Tests Status** - Bảng chi tiết trạng thái tất cả tests

## 🔧 Cấu hình nâng cao

### Tùy chỉnh Prometheus scrape interval

Chỉnh sửa `monitoring/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'pushgateway'
    honor_labels: true
    static_configs:
      - targets: ['pushgateway:9091']
    scrape_interval: 15s  # Thay đổi giá trị này
```

### Tạo custom metrics

Thêm metrics mới trong workflow:

```yaml
- name: Push Custom Metrics
  run: |
    cat <<EOF | curl --data-binary @- "${PUSHGATEWAY_URL}/metrics/job/custom_job/instance/${GITHUB_RUN_ID}"
    # HELP custom_metric_name Description of your metric
    # TYPE custom_metric_name gauge
    custom_metric_name{label1="value1",label2="value2"} 100
    EOF
```

## 📝 Workflow Integration

### 1. CI Test Workflow (`.github/workflows/ci-test.yml`)

Tự động push metrics khi:
- Test server hoàn thành
- Test frontend apps hoàn thành

### 2. Docker Build Workflow (`.github/workflows/docker-build-push.yml`)

Tự động push metrics khi:
- Build Docker image hoàn thành cho mỗi service

### 3. Deploy Workflow (`.github/workflows/deploy-production.yml`)

Tự động push metrics khi:
- Deployment lên production hoàn thành

## 🔍 Truy vấn Metrics

### Prometheus Queries

```promql
# Xem tất cả CI test status
ci_test_status

# Xem duration trung bình của server tests
avg(ci_test_duration_seconds{app="server_app"})

# Đếm số lần build thành công trong 24h
count_over_time(docker_build_status{docker_build_status="1"}[24h])

# Tổng số deployment trong 7 ngày
increase(deployment_count_total[7d])

# Deployment failures trong 24h
count(deployment_status{deployment_status="0"}) by (environment)
```

## 🚨 Alerting (Tùy chọn)

Thêm alert rules trong `monitoring/alerts.yml`:

```yaml
groups:
  - name: cicd_alerts
    interval: 30s
    rules:
      - alert: CITestsFailed
        expr: ci_test_status == 0
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "CI tests failed for {{ $labels.app }}"
          description: "Branch {{ $labels.branch }} has failing tests"

      - alert: DeploymentFailed
        expr: deployment_status == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Deployment to {{ $labels.environment }} failed"
          description: "Deployment failed. Check GitHub Actions logs"
```

## 📊 Data Retention

Pushgateway lưu metrics với cấu hình:
- Persistence file: `/pushgateway/pushgateway.data`
- Persistence interval: 5 phút

Prometheus lưu metrics:
- Retention: 15 ngày (mặc định)
- Storage path: `/prometheus`

## 🔗 Liên kết hữu ích

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Pushgateway Guide](https://prometheus.io/docs/practices/pushing/)
- [Grafana Dashboard Guide](https://grafana.com/docs/grafana/latest/dashboards/)
- [PromQL Cheat Sheet](https://promlabs.com/promql-cheat-sheet/)

## ❓ Troubleshooting

### Metrics không xuất hiện trong Prometheus

1. Kiểm tra Pushgateway có nhận được metrics:
```bash
curl http://98.90.205.114:9091/metrics
```

2. Kiểm tra Prometheus targets:
- Truy cập http://98.90.205.114:9090/targets
- Đảm bảo `pushgateway` target đang UP

3. Kiểm tra logs:
```bash
docker logs foodfast-pushgateway
docker logs foodfast-prometheus
```

### GitHub Actions không push được metrics

1. Kiểm tra secret `PUSHGATEWAY_URL` đã được cấu hình
2. Kiểm tra network access từ GitHub Actions runner đến Pushgateway
3. Kiểm tra workflow logs để xem có lỗi curl không

### Dashboard không hiển thị data

1. Kiểm tra Prometheus datasource trong Grafana:
- Settings → Data Sources → Prometheus
- Nhấn "Test" để verify connection

2. Kiểm tra time range của dashboard
3. Chạy query trực tiếp trong Grafana Explore

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra logs của các container
2. Verify network connectivity
3. Check GitHub Actions workflow logs
4. Review Prometheus/Grafana configuration

## 🎯 Best Practices

1. **Label consistency** - Đảm bảo labels nhất quán giữa các metrics
2. **Metric naming** - Follow Prometheus naming conventions
3. **Data retention** - Cấu hình retention phù hợp với nhu cầu
4. **Dashboard organization** - Nhóm các panel liên quan lại với nhau
5. **Alert thresholds** - Đặt ngưỡng cảnh báo hợp lý

---

**Version:** 1.0  
**Last Updated:** 2025-01-14  
**Maintainer:** DevOps Team
