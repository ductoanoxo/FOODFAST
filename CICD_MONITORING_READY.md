# 🚀 CI/CD Real-time Monitoring - READY TO USE

## ⚡ Quick Start (3 bước)

### 1. Push code để test
```bash
bash test-cicd-monitoring.sh
```

### 2. Đợi workflows chạy xong (~3-5 phút)
- Vào GitHub Actions: https://github.com/ductoanoxo/FOODFAST/actions
- Đợi "Export CI/CD Metrics" workflow hoàn thành

### 3. Xem Dashboard
- Mở: http://13.220.101.54:3030/d/foodfast-cicd
- Login: `admin` / `admin123`
- Dashboard tự động refresh mỗi 30 giây

## 🎯 Những gì bạn sẽ thấy

### Real-time Metrics
- 📊 **Tổng số Runs**: Tổng số lần workflows chạy
- ✅ **Thành công**: Số lần pass
- ❌ **Thất bại**: Số lần fail
- 📈 **Tỷ lệ thành công**: Success rate %
- ⏱️ **Thời gian TB**: Average duration

### Chi tiết Workflows
- 👤 **Ai** push code (Actor)
- 🔧 **Workflow nào** chạy
- 🌿 **Branch** nào
- 🔢 **Run ID**
- ✅/❌ **Status** (Success/Failed)
- ⏱️ **Duration** (giây)

### Phân tích
- 📊 Biểu đồ hoạt động theo thời gian
- 👥 Top Contributors
- 🔧 Top Workflows
- 🌿 Active Branches
- ❌ Tỷ lệ thất bại theo workflow

## 🔄 Luồng hoạt động

```
GitHub Push
    ↓
CI/CD Workflows chạy (test, build, deploy)
    ↓
Export Metrics Workflow triggers tự động
    ↓
Push metrics → Pushgateway (http://13.220.101.54:9091)
    ↓
Prometheus scrape mỗi 10s (http://13.220.101.54:9090)
    ↓
Grafana hiển thị real-time (http://13.220.101.54:3030)
    ↓
Dashboard auto-refresh mỗi 30s
```

## 📋 Các workflows được theo dõi

1. ✅ **CI - Test and Lint** - Testing & Linting
2. ✅ **Docker Build and Push** - Build Docker images  
3. ✅ **Auto Deploy Foodfast to EC2** - Deploy production
4. ✅ **Export CI/CD Metrics** - Export metrics (auto-triggered)

## 🎨 Dashboard Features

### Filter Options
- 🔧 **Workflow**: Lọc theo workflow name
- 🌿 **Branch**: Lọc theo branch
- 👤 **User**: Lọc theo user

### Time Range
- Last 5m, 15m, 1h, 6h, 12h, 24h, 7d
- Hoặc custom range

### Auto Refresh
- 10s, 30s, 1m, 5m, 15m, 30m
- Mặc định: 30s

## 🧪 Test Script

File: `test-cicd-monitoring.sh`

**Chạy ngay:**
```bash
chmod +x test-cicd-monitoring.sh
./test-cicd-monitoring.sh
```

Script sẽ:
1. ✅ Trigger workflow bằng cách push test commit
2. ⏳ Hướng dẫn bạn theo dõi workflow
3. 🔍 Kiểm tra Pushgateway có metrics
4. 🔍 Kiểm tra Prometheus scrape được metrics
5. 📊 Hướng dẫn xem Dashboard
6. ✅ Health check tất cả services

## 📚 Documentation

- 📖 **Chi tiết đầy đủ**: `CICD_REALTIME_MONITORING.md`
- ✅ **Checklist kiểm tra**: `CICD_MONITORING_CHECKLIST.md`
- 🧪 **Test script**: `test-cicd-monitoring.sh`

## 🔗 Quick Links

| Service | URL | Credentials |
|---------|-----|-------------|
| GitHub Actions | https://github.com/ductoanoxo/FOODFAST/actions | - |
| Pushgateway | http://13.220.101.54:9091 | - |
| Prometheus | http://13.220.101.54:9090 | - |
| Grafana | http://13.220.101.54:3030 | admin/admin123 |
| Dashboard | http://13.220.101.54:3030/d/foodfast-cicd | admin/admin123 |

## 🎯 Success Indicators

Hệ thống hoạt động đúng khi:

✅ Mỗi lần push code → workflows tự động chạy  
✅ Sau khi workflow hoàn thành → metrics xuất hiện trong vòng 30s  
✅ Dashboard hiển thị metrics real-time  
✅ Dashboard tự động refresh  
✅ Có thể filter theo workflow/branch/user  
✅ Biểu đồ hiển thị trends theo thời gian  

## 💡 Use Cases

### 1. Theo dõi CI/CD Pipeline
- Xem realtime ai đang deploy
- Monitor success/failure rates
- Track build times
- Identify bottlenecks

### 2. Team Collaboration
- Ai đang active nhất?
- Workflows nào được dùng nhiều nhất?
- Branches nào đang hot?

### 3. Performance Monitoring
- Workflow nào chậm nhất?
- Thời gian build tăng hay giảm?
- Trends theo thời gian

### 4. Quality Metrics
- Tỷ lệ success/failure
- Workflows nào hay fail?
- Identify problem areas

## 🚨 Troubleshooting Quick Fixes

### Dashboard không có data?
```bash
# 1. Check Pushgateway
curl http://13.220.101.54:9091/metrics | grep github_workflow

# 2. Check Prometheus
curl http://13.220.101.54:9090/api/v1/targets | grep pushgateway

# 3. Restart Grafana
docker restart foodfast-grafana
```

### Workflow export failed?
```bash
# Check logs in GitHub Actions
# → "Export CI/CD Metrics to Prometheus" workflow
# → Step "Push metrics to Pushgateway"
```

### Metrics cũ?
```bash
# Dashboard → Refresh icon (top right)
# Hoặc Ctrl+Shift+R
```

## ⚙️ Configuration

### GitHub Secrets (đã setup)
- `PUSHGATEWAY_URL` = http://13.220.101.54:9091
- `PROMETHEUS_URL` = http://13.220.101.54:9090
- `GRAFANA_URL` = http://13.220.101.54:3030

### Metrics Format
```prometheus
# Total runs (counter)
github_workflow_run_total{workflow="...", branch="...", actor="..."}

# Success count (counter)
github_workflow_success_total{workflow="...", branch="...", actor="..."}

# Failure count (counter)
github_workflow_failure_total{workflow="...", branch="...", actor="..."}

# Duration (gauge - seconds)
github_workflow_duration_seconds{workflow="...", actor="...", status="..."}

# Status (gauge - 1=success, 0=failure)
github_workflow_status{workflow="...", actor="...", status="..."}
```

## 📊 Sample Queries

```promql
# Tổng số runs
sum(github_workflow_run_total)

# Tỷ lệ thành công
(sum(github_workflow_success_total) / 
 (sum(github_workflow_success_total) + sum(github_workflow_failure_total))) * 100

# Thời gian TB
avg(github_workflow_duration_seconds)

# Runs theo workflow
sum(github_workflow_run_total) by (workflow)

# Activity rate (last 5 min)
rate(github_workflow_run_total[5m]) * 300
```

## 🎉 Kết luận

Hệ thống CI/CD monitoring đã **HOÀN TOÀN SẴN SÀNG** để sử dụng!

### ✅ Đã cấu hình:
- GitHub Actions workflows
- Metrics export workflow
- Pushgateway
- Prometheus
- Grafana
- Dashboard với 14 panels
- Auto-refresh 30s
- Filter variables

### 🚀 Bắt đầu ngay:
```bash
./test-cicd-monitoring.sh
```

Sau đó mở: http://13.220.101.54:3030/d/foodfast-cicd

---

**Status**: ✅ Production Ready  
**Auto-refresh**: 30s  
**Real-time**: Yes  
**Tested**: Yes  
**Date**: 2025-01-15
