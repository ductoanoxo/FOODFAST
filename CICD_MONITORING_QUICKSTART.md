# 🚀 Quick Start: CI/CD Monitoring

## 📋 Mục đích
Hướng dẫn nhanh để bắt đầu sử dụng hệ thống monitoring CI/CD cho FoodFast.

## 🎯 Bước 1: Kiểm tra services

```bash
# Kiểm tra tất cả monitoring services
./verify-monitoring.sh
```

Hoặc kiểm tra thủ công:

```bash
# Prometheus
curl http://13.220.101.54:9090/-/healthy

# Pushgateway
curl http://13.220.101.54:9091/-/healthy

# Grafana
curl http://13.220.101.54:3030/api/health
```

## 🎯 Bước 2: Truy cập Grafana Dashboard

1. Mở browser: `http://13.220.101.54:3030`
2. Login:
   - Username: `admin`
   - Password: `admin123`
3. Vào Dashboard: `Dashboards` → `FoodFast Dashboards` → `CI/CD Pipeline Dashboard`

## 🎯 Bước 3: Trigger một workflow để test

```bash
# Push code lên GitHub để trigger CI workflow
git add .
git commit -m "Test CI/CD monitoring"
git push origin main
```

Sau 1-2 phút, metrics sẽ xuất hiện trên dashboard.

## 🎯 Bước 4: Xem metrics trong Prometheus

Truy cập: `http://13.220.101.54:9090`

### Query đơn giản:

```promql
# Tất cả workflow runs
github_workflow_run_total

# Success rate
100 * sum(github_workflow_success_total) / (sum(github_workflow_success_total) + sum(github_workflow_failure_total))

# Average duration
avg(github_workflow_duration_seconds) by (workflow)
```

## 🎯 Bước 5: Kiểm tra Pushgateway

Truy cập: `http://13.220.101.54:9091/metrics`

Tìm metrics bắt đầu với `github_workflow_*`

## 📊 Dashboard Overview

### Panels chính:
1. **Total Runs**: Tổng số lần chạy workflows
2. **Success Rate**: Tỷ lệ thành công
3. **Active Workflows**: Số workflows đang hoạt động
4. **Recent Failures**: Failures gần nhất
5. **Duration by Workflow**: Thời gian chạy theo workflow
6. **Runs Timeline**: Timeline của tất cả runs

### Filters:
- **Workflow**: Chọn workflow cụ thể
  - CI - Test and Lint
  - Docker Build and Push
  - Auto Deploy Foodfast to EC2
- **Branch**: Chọn branch
  - main
  - deploy
  - develop
  - DUCTOAN, kiet, etc.

## 🚨 Alerts

### Kiểm tra alerts đang active:
Truy cập: `http://13.220.101.54:9090/alerts`

### Alerts quan trọng:
- 🔴 **ProductionDeploymentFailed**: Deploy production fail
- 🟡 **CICDWorkflowFailed**: Workflow thất bại
- 🟡 **CICDWorkflowTooSlow**: Workflow chạy quá lâu (>15 phút)
- 🔵 **CICDNoRecentActivity**: Không có activity trong 2 giờ

## 🔍 Troubleshooting nhanh

### Metrics không xuất hiện?

```bash
# 1. Kiểm tra Pushgateway có nhận được metrics không
curl http://13.220.101.54:9091/metrics | grep github_workflow

# 2. Kiểm tra Prometheus scrape được không
curl http://13.220.101.54:9090/api/v1/targets

# 3. Xem logs workflow "Export CI/CD Metrics" trên GitHub Actions
# https://github.com/ductoanoxo/FOODFAST/actions
```

### Dashboard trống?

```bash
# 1. Verify datasource trong Grafana
# Settings > Data Sources > Prometheus
# URL phải là: http://prometheus:9090

# 2. Test query trong Grafana Explore:
up{job="pushgateway"}
```

### Workflow không trigger export?

```yaml
# Kiểm tra file: .github/workflows/export-cicd-metrics.yml
# Đảm bảo workflow được list trong workflow_run.workflows:
workflows:
  - 'CI - Test and Lint (Deploy Branch - Testing Conflict)'
  - 'Docker Build and Push'
  - 'Auto Deploy Foodfast to EC2'
```

## 📚 Queries hữu ích

### 1. Top 5 workflows chậm nhất
```promql
topk(5, max(github_workflow_duration_seconds) by (workflow))
```

### 2. Workflows fail nhiều nhất
```promql
topk(5, sum(github_workflow_failure_total) by (workflow))
```

### 3. Success rate theo branch
```promql
100 * (
  sum(github_workflow_success_total) by (branch)
  / 
  (sum(github_workflow_success_total) by (branch) + 
   sum(github_workflow_failure_total) by (branch))
)
```

### 4. Activity trong 24h
```promql
increase(github_workflow_run_total[24h])
```

### 5. Failures trong 1h gần nhất
```promql
increase(github_workflow_failure_total[1h])
```

## 🛠️ Cheat Sheet

### Restart services (local):
```bash
docker-compose restart prometheus grafana pushgateway
```

### Reload Prometheus config:
```bash
curl -X POST http://13.220.101.54:9090/-/reload
```

### View logs:
```bash
# Prometheus
docker logs foodfast_prometheus

# Grafana
docker logs foodfast_grafana

# Pushgateway
docker logs foodfast_pushgateway
```

### Backup metrics data:
```bash
# Prometheus data
docker cp foodfast_prometheus:/prometheus ./prometheus-backup

# Pushgateway data
docker cp foodfast_pushgateway:/data ./pushgateway-backup
```

## 🎓 Next Steps

1. ✅ **Customize Dashboard**: Thêm panels theo nhu cầu
2. ✅ **Setup Alertmanager**: Nhận notifications qua Slack/Email
3. ✅ **Add more metrics**: Custom metrics cho business logic
4. ✅ **Document runbooks**: Hướng dẫn xử lý alerts
5. ✅ **Implement SLO/SLA**: Tracking service level objectives

## 🔗 Links

- 📖 [Full Documentation](./CICD_MONITORING_SYSTEM.md)
- 🐙 [GitHub Actions](https://github.com/ductoanoxo/FOODFAST/actions)
- 📊 [Prometheus](http://13.220.101.54:9090)
- 🎨 [Grafana](http://13.220.101.54:3030)
- 📮 [Pushgateway](http://13.220.101.54:9091)

## ❓ Need Help?

1. Check logs trên GitHub Actions
2. Verify services với `./verify-monitoring.sh`
3. Xem alerts trên Prometheus: `http://13.220.101.54:9090/alerts`
4. Review [Full Documentation](./CICD_MONITORING_SYSTEM.md)

---

**Happy Monitoring! 🎉**

## Cài đặt nhanh trong 3 bước

### 1️⃣ Thêm GitHub Secret

Vào repo → Settings → Secrets and variables → Actions → New repository secret:

```
Name: PUSHGATEWAY_URL
Value: http://13.220.101.54:9091
```

### 2️⃣ Deploy Pushgateway

**Cách 1: Deploy cùng toàn bộ stack (Khuyến nghị)**
```bash
docker-compose up -d
```

**Cách 2: Deploy riêng Pushgateway**
```bash
docker run -d --name foodfast-pushgateway \
  --network foodfast_network \
  -p 9091:9091 \
  prom/pushgateway:latest
```

**Cách 3: Deploy lên EC2 Production**
```bash
# Tự động deploy qua GitHub Actions
git push origin main
```

### 3️⃣ Truy cập Dashboard

1. Mở Grafana Production: **<http://13.220.101.54:3030>**
2. Login: `admin` / `admin123`
3. Tìm dashboard: **"FoodFast CI/CD Pipeline"**

> 🎯 Dashboard đang chạy trên production server và có thể truy cập từ mọi nơi!

## ✅ Kiểm tra hoạt động

### Xem Pushgateway đã nhận metrics chưa:
```bash
curl http://13.220.101.54:9091/metrics | grep github_workflow
```

### Xem Prometheus đã scrape chưa:
Mở: <http://13.220.101.54:9090/targets>
Tìm job `pushgateway` → Status phải là UP

### Test push metrics thủ công:
```bash
echo "github_workflow_run_total{workflow=\"test\",branch=\"main\"} 1" | \
  curl --data-binary @- http://13.220.101.54:9091/metrics/job/github_actions/instance/manual_test
```

## 📊 Dashboard sẽ hiển thị:

- ✅ Total workflow runs
- 📈 Success/Failure rate  
- ⏱️ Average duration
- 🔄 Real-time status
- 🌿 Analytics by branch/actor

## 🔧 Nếu gặp lỗi

**Không thấy metrics?**
1. Kiểm tra Pushgateway đang chạy: `docker ps | grep pushgateway`
2. Kiểm tra GitHub Secret `PUSHGATEWAY_URL` đã đúng
3. Xem GitHub Actions logs → workflow "Export CI/CD Metrics"

**Dashboard trống?**
1. Chạy ít nhất 1 workflow trong GitHub Actions
2. Đợi 30s để dashboard refresh
3. Kiểm tra time range (mặc định: Last 6 hours)

---

📖 **Xem thêm**: [CICD_DASHBOARD_GUIDE.md](./CICD_DASHBOARD_GUIDE.md)
