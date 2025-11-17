# 🚀 CI/CD Real-time Monitoring Guide

## 📊 Tổng quan hệ thống

Hệ thống theo dõi CI/CD của bạn đã được cấu hình đầy đủ với:

1. **GitHub Actions Workflows** → Export metrics sau mỗi lần chạy
2. **Pushgateway** → Nhận và lưu trữ metrics từ workflows
3. **Prometheus** → Scrape metrics từ Pushgateway mỗi 10s
4. **Grafana Dashboard** → Hiển thị real-time metrics với auto-refresh 30s

## 🔄 Luồng dữ liệu

```
GitHub Actions Workflow
         ↓
    Workflow completed
         ↓
export-cicd-metrics.yml triggers
         ↓
Push metrics → Pushgateway:9091
         ↓
Prometheus scrapes ← Every 10s
         ↓
Grafana queries ← Auto refresh 30s
         ↓
Dashboard hiển thị real-time
```

## ⚙️ Cấu hình hiện tại

### 1. Workflows được theo dõi

- ✅ `CI - Test and Lint` - Test & Lint
- ✅ `Docker Build and Push` - Build Docker images
- ✅ `Auto Deploy Foodfast to EC2` - Deploy production

### 2. Metrics được export

Sau mỗi lần workflow chạy xong, các metrics sau sẽ được push:

```prometheus
# Tổng số lần chạy (counter)
github_workflow_run_total{workflow="...", branch="...", actor="..."}

# Số lần thành công (counter)
github_workflow_success_total{workflow="...", branch="...", actor="..."}

# Số lần thất bại (counter) 
github_workflow_failure_total{workflow="...", branch="...", actor="..."}

# Thời gian chạy (gauge - seconds)
github_workflow_duration_seconds{workflow="...", branch="...", actor="...", status="..."}

# Trạng thái (gauge - 1=success, 0=failure)
github_workflow_status{workflow="...", branch="...", actor="...", status="..."}
```

### 3. Grafana Dashboard

**URL**: http://3.89.225.219:3030/d/foodfast-cicd

**Features**:
- 📊 Tổng số runs, success, failure
- 📈 Tỷ lệ thành công (gauge)
- ⏱️ Thời gian trung bình
- 📋 Bảng chi tiết workflows (ai chạy, workflow nào, status, duration)
- 📊 Biểu đồ hoạt động theo thời gian
- 👥 Top Contributors
- 🔧 Top Workflows
- 🌿 Active Branches

**Auto-refresh**: 30 giây

## 🧪 Cách test hệ thống

### Bước 1: Push code để trigger workflow

```bash
# Tạo một commit nhỏ
echo "test cicd monitoring" >> test-cicd.txt
git add test-cicd.txt
git commit -m "test: trigger CI/CD monitoring"
git push origin main
```

### Bước 2: Theo dõi workflow trên GitHub

1. Vào https://github.com/ductoanoxo/FOODFAST/actions
2. Xem workflow "CI - Test and Lint" đang chạy
3. Sau khi workflow hoàn thành, workflow "export-cicd-metrics.yml" sẽ tự động chạy

### Bước 3: Kiểm tra metrics trên Pushgateway

```bash
# Xem tất cả metrics trên Pushgateway
curl http://3.89.225.219:9091/metrics | grep github_workflow

# Hoặc mở browser:
# http://3.89.225.219:9091
```

Bạn sẽ thấy:
```
github_workflow_run_total{workflow="CI - Test and Lint",...} 1
github_workflow_success_total{workflow="CI - Test and Lint",...} 1
github_workflow_duration_seconds{workflow="CI - Test and Lint",...} 234
```

### Bước 4: Kiểm tra Prometheus

```bash
# Query Prometheus
curl -G http://3.89.225.219:9090/api/v1/query \
  --data-urlencode 'query=github_workflow_run_total'

# Hoặc mở Prometheus UI:
# http://3.89.225.219:9090/graph
# Query: github_workflow_run_total
```

### Bước 5: Xem Dashboard Grafana

1. Mở http://3.89.225.219:3030
2. Login: `admin` / `admin123`
3. Vào Dashboard: "GitHub Actions CI/CD Monitor"
4. Trong vòng **30 giây**, bạn sẽ thấy metrics mới xuất hiện:
   - 📊 Tổng số Runs tăng lên
   - ✅ Thành công tăng (nếu workflow pass)
   - 📋 Workflow mới xuất hiện trong bảng chi tiết
   - 📊 Biểu đồ cập nhật

## 🔍 Troubleshooting

### Metrics không xuất hiện trên Dashboard?

**1. Kiểm tra workflow export-cicd-metrics có chạy không:**

```bash
# Vào GitHub Actions
# https://github.com/ductoanoxo/FOODFAST/actions
# Tìm workflow "Export CI/CD Metrics to Prometheus"
```

**2. Kiểm tra Pushgateway có nhận metrics không:**

```bash
curl http://3.89.225.219:9091/metrics | grep -A5 "github_workflow_run_total"
```

Nếu không có → Workflow export-cicd-metrics failed hoặc PUSHGATEWAY_URL sai

**3. Kiểm tra Prometheus scrape Pushgateway:**

```bash
# Vào Prometheus UI
# http://3.89.225.219:9090/targets
# Tìm job "pushgateway" → Status phải UP
```

**4. Kiểm tra Grafana datasource:**

- Vào Grafana → Configuration → Data Sources → Prometheus
- URL phải là: http://prometheus:9090 (trong Docker network)
- Click "Test" → phải thấy "Data source is working"

**5. Debug queries trên Grafana:**

- Vào Dashboard → Panel → Edit
- Xem Query: `sum(github_workflow_run_total)`
- Click "Query inspector" → Xem response từ Prometheus

### Workflow export-cicd-metrics failed?

Xem logs:
```bash
# Vào GitHub Actions → workflow "Export CI/CD Metrics"
# Click vào run bị failed → Xem logs step "Push metrics to Pushgateway"
```

Common issues:
- PUSHGATEWAY_URL không reach được (firewall/security group)
- Metrics format sai (đã fix trong commit mới nhất)

## 📈 Metrics Details

### Counter Metrics

**Counter** tăng dần theo thời gian (không bao giờ giảm):

- `github_workflow_run_total` - Tổng số lần workflow chạy
- `github_workflow_success_total` - Tổng số lần thành công
- `github_workflow_failure_total` - Tổng số lần thất bại

**Sử dụng với `rate()`** để xem tốc độ:
```promql
# Số workflow runs trong 5 phút gần nhất
rate(github_workflow_run_total[5m]) * 300
```

### Gauge Metrics

**Gauge** có thể tăng/giảm:

- `github_workflow_duration_seconds` - Thời gian chạy (seconds)
- `github_workflow_status` - Trạng thái (1=success, 0=failure)

**Sử dụng với `avg()`, `max()`, `min()`**:
```promql
# Thời gian trung bình
avg(github_workflow_duration_seconds)

# Thời gian chạy theo workflow
avg(github_workflow_duration_seconds) by (workflow)
```

## 🎯 Dashboard Panels Explained

### Panel 1: Tổng số Runs
```promql
sum(github_workflow_run_total)
```
Tổng số lần tất cả workflows đã chạy

### Panel 2: Thành công
```promql
sum(github_workflow_success_total)
```
Tổng số lần workflows chạy thành công

### Panel 3: Thất bại
```promql
sum(github_workflow_failure_total)
```
Tổng số lần workflows chạy thất bại

### Panel 4: Tỷ lệ thành công (%)
```promql
(sum(github_workflow_success_total) / 
 (sum(github_workflow_success_total) + sum(github_workflow_failure_total))) * 100
```

### Panel 5: Thời gian TB
```promql
avg(github_workflow_duration_seconds)
```

### Panel 6: Workflow Runs - Chi tiết
Sử dụng 2 queries và merge:
- Query A: `github_workflow_status` (instant)
- Query B: `github_workflow_duration_seconds` (instant)

Transform → Organize fields → Rename columns

### Panel 7: Hoạt động theo thời gian
```promql
sum(rate(github_workflow_success_total[5m])) * 300  # Success
sum(rate(github_workflow_failure_total[5m])) * 300  # Failed
```

### Panel 8: Top Contributors
```promql
sum(github_workflow_run_total) by (actor)
```

## 🔐 Security Notes

1. **Pushgateway URL** được lưu trong GitHub Secrets:
   - `PUSHGATEWAY_URL` = http://3.89.225.219:9091

2. **Grafana credentials**:
   - Default: admin/admin123
   - Nên đổi password trong production

3. **Prometheus & Pushgateway** exposed trên public IP:
   - Cân nhắc add authentication
   - Hoặc restrict IP access via security group

## 📚 Reference Links

- **GitHub Repository**: https://github.com/ductoanoxo/FOODFAST
- **GitHub Actions**: https://github.com/ductoanoxo/FOODFAST/actions
- **Prometheus**: http://3.89.225.219:9090
- **Pushgateway**: http://3.89.225.219:9091
- **Grafana**: http://3.89.225.219:3030
- **Dashboard**: http://3.89.225.219:3030/d/foodfast-cicd

## 🎉 Quick Test Script

Tạo file `test-cicd-monitoring.sh`:

```bash
#!/bin/bash

echo "🧪 Testing CI/CD Monitoring System..."

# 1. Trigger workflow
echo "1️⃣ Triggering workflow..."
echo "test cicd monitoring $(date)" >> test-cicd.txt
git add test-cicd.txt
git commit -m "test: CI/CD monitoring at $(date +%H:%M:%S)"
git push origin main

echo "✅ Workflow triggered!"
echo ""

# 2. Wait for workflow to complete
echo "2️⃣ Waiting for workflow to complete (check GitHub Actions)..."
echo "   https://github.com/ductoanoxo/FOODFAST/actions"
echo ""
echo "⏳ Please wait about 3-5 minutes for workflow to complete..."
echo ""

# 3. Check Pushgateway
echo "3️⃣ After workflow completes, check Pushgateway metrics:"
echo "   curl http://3.89.225.219:9091/metrics | grep github_workflow_run_total"
echo ""

# 4. Check Grafana
echo "4️⃣ Then check Grafana Dashboard:"
echo "   http://3.89.225.219:3030/d/foodfast-cicd"
echo ""
echo "   Dashboard will auto-refresh in 30 seconds"
echo ""

echo "🎉 Test initiated! Follow the steps above to verify."
```

Chạy test:
```bash
chmod +x test-cicd-monitoring.sh
./test-cicd-monitoring.sh
```

## 🔄 Auto Refresh Settings

Dashboard tự động refresh mỗi 30 giây. Có thể thay đổi:

1. Vào Dashboard
2. Click biểu tượng ⚙️ (Settings) góc phải trên
3. Tìm "Auto refresh"
4. Chọn interval: 10s, 30s, 1m, 5m...

## 💡 Tips

1. **Xem realtime**: Để thấy thay đổi ngay lập tức, giảm refresh interval xuống 10s
2. **Filter data**: Sử dụng variables ở đầu dashboard (Workflow, Branch, User)
3. **Time range**: Thay đổi time range (Last 5m, 15m, 1h, 6h...) để xem historical data
4. **Alerting**: Có thể setup alerts trong Grafana khi failure rate > threshold

---

**Created**: 2025-01-15  
**Status**: ✅ Production Ready  
**Auto-refresh**: 30s  
**Monitoring**: Real-time
