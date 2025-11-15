# 🚀 FoodFast CI/CD Real-time Monitoring Guide

## 📊 Tổng quan

Hệ thống giám sát CI/CD real-time của FoodFast sử dụng **Grafana + Prometheus + Pushgateway** để theo dõi liên tục các thông tin từ GitHub Actions workflows.

## 🏗️ Kiến trúc hệ thống

```
GitHub Actions (Workflows)
         ↓
    [Export Metrics]
         ↓
Prometheus Pushgateway (:9091)
         ↓
    Prometheus (:9090)
         ↓
     Grafana (:3030)
         ↓
  📊 Dashboard Real-time
```

## ✅ Các thành phần đã được cấu hình

### 1. **GitHub Actions Exporter**
- **File**: `.github/workflows/export-cicd-metrics.yml`
- **Trigger**: Tự động chạy sau khi các workflow chính hoàn thành:
  - CI - Test and Lint
  - Docker Build and Push
  - Auto Deploy to EC2
- **Metrics được thu thập**:
  - ✅ `github_workflow_run_total` - Tổng số lần chạy
  - ✅ `github_workflow_success_total` - Số lần thành công
  - ❌ `github_workflow_failure_total` - Số lần thất bại
  - ⏱️ `github_workflow_duration_seconds` - Thời gian chạy
  - 🔢 `github_workflow_run_number` - Số thứ tự run
  - 📊 `github_workflow_status` - Trạng thái (1=success, 0=fail, -1=unknown)

### 2. **Prometheus Pushgateway**
- **Port**: `9091`
- **URL**: `http://13.220.101.54:9091` hoặc `http://localhost:9091`
- **Chức năng**: Nhận và lưu trữ metrics từ GitHub Actions
- **Persistence**: Lưu data vào `/data/pushgateway.data` mỗi 5 phút

### 3. **Prometheus**
- **Port**: `9090`
- **URL**: `http://13.220.101.54:9090` hoặc `http://localhost:9090`
- **Scrape interval**: 10 giây (cho pushgateway job)
- **Retention**: 30 ngày hoặc 10GB

### 4. **Grafana Dashboard**
- **Port**: `3030`
- **URL**: `http://13.220.101.54:3030` hoặc `http://localhost:3030`
- **Login**: 
  - Username: `admin`
  - Password: `admin123`
- **Dashboard**: FoodFast CI/CD Pipeline - Enhanced
- **Auto-refresh**: 30 giây

## 🎯 Các chỉ số theo dõi trên Dashboard

### 📈 Overview Metrics (Top Row)
1. **Total Workflow Runs** - Tổng số lần chạy workflow
2. **Successful Runs** ✅ - Số lần thành công
3. **Failed Runs** ❌ - Số lần thất bại
4. **Success Rate %** - Tỷ lệ thành công (có màu: xanh >95%, vàng 80-95%, đỏ <80%)
5. **Average Duration** ⏱️ - Thời gian trung bình

### 📊 Visualization Panels
- **Workflow Runs Over Time** - Biểu đồ line chart theo thời gian
- **Success vs Failure Rate** - Bar chart so sánh thành công/thất bại
- **Workflow Duration by Type** - Thời gian chạy theo loại workflow
- **Workflow Status Table** - Bảng trạng thái chi tiết
- **Runs by Branch** - Pie chart phân bố theo branch
- **Runs by Actor** - Pie chart theo người thực hiện
- **Workflow Runs by Type** - Bar chart theo loại workflow
- **Average Duration by Workflow** - Thời gian TB theo workflow
- **Workflow Execution Rate** - Tần suất chạy theo giờ
- **Failure Rate by Workflow** - Tỷ lệ fail theo workflow
- **Latest Workflow Duration** - Thời gian chạy gần nhất

### 🔍 Filters & Variables
Dashboard có 3 filters động:
- **🔧 Workflow** - Lọc theo tên workflow
- **🌿 Branch** - Lọc theo branch
- **👤 Actor** - Lọc theo người thực hiện

## 🚀 Hướng dẫn sử dụng

### 1. Khởi động Monitoring Stack

```bash
# Start toàn bộ services
docker-compose up -d

# Hoặc chỉ start monitoring services
docker-compose up -d prometheus grafana pushgateway
```

### 2. Kiểm tra các services đã chạy

```bash
# Check container status
docker-compose ps

# Xem logs
docker-compose logs -f grafana
docker-compose logs -f prometheus
docker-compose logs -f pushgateway
```

### 3. Truy cập Grafana Dashboard

1. Mở browser: `http://localhost:3030`
2. Login với `admin` / `admin123`
3. Vào **Dashboards** → **FoodFast CI/CD Pipeline - Enhanced**
4. Dashboard sẽ tự động refresh mỗi 30 giây

### 4. Xem raw metrics

**Pushgateway metrics:**
```bash
curl http://localhost:9091/metrics | grep github_workflow
```

**Prometheus queries:**
- Mở `http://localhost:9090`
- Thử các query:
  ```promql
  # Tổng workflow runs
  sum(github_workflow_run_total)
  
  # Success rate
  sum(github_workflow_success_total) / sum(github_workflow_run_total) * 100
  
  # Average duration
  avg(github_workflow_duration_seconds)
  
  # Runs by branch
  sum(github_workflow_run_total) by (branch)
  
  # Latest status
  github_workflow_status
  ```

### 5. Trigger GitHub Actions để test

```bash
# Push code để trigger workflow
git add .
git commit -m "test: trigger CI/CD monitoring"
git push origin main

# Hoặc trigger manually từ GitHub UI
# Actions → Export CI/CD Metrics → Run workflow
```

## 📊 Workflow tự động

Mỗi khi workflow chạy xong:
1. ✅ **Workflow hoàn thành** (success/failure)
2. 📤 **Export metrics workflow tự động trigger**
3. 📊 **Metrics được push lên Pushgateway**
4. 🔄 **Prometheus scrape metrics mỗi 10s**
5. 📈 **Grafana dashboard tự động cập nhật mỗi 30s**

## 🔧 Troubleshooting

### ❌ Dashboard không hiển thị data

**Kiểm tra Pushgateway có metrics không:**
```bash
curl http://localhost:9091/metrics | grep github_workflow
```

Nếu không có metrics, check GitHub Actions logs:
- Vào GitHub → Actions → Export CI/CD Metrics
- Xem step "Push metrics to Pushgateway"

**Kiểm tra Prometheus đang scrape Pushgateway:**
```bash
# Vào Prometheus UI
http://localhost:9090/targets

# Tìm job "pushgateway" - phải là UP
```

### ⚠️ Metrics không update real-time

**Kiểm tra GitHub Actions workflow:**
```bash
# Xem file workflow
cat .github/workflows/export-cicd-metrics.yml

# Verify workflow_run trigger đúng
```

**Check Pushgateway URL trong GitHub Secrets:**
- Vào GitHub → Settings → Secrets → Actions
- Verify `PUSHGATEWAY_URL` = `http://13.220.101.54:9091`

### 🔄 Reset metrics counters

**⚠️ Lưu ý**: Counters trong Prometheus không nên reset, nhưng nếu cần:

```bash
# Stop pushgateway
docker-compose stop pushgateway

# Xóa persistence file
docker-compose exec pushgateway rm /data/pushgateway.data

# Restart
docker-compose up -d pushgateway
```

## 📱 Mobile/Remote Access

Để truy cập từ xa:

1. **Setup reverse proxy (nginx)** hoặc
2. **Expose ports qua firewall**:
   ```bash
   # Mở ports (nếu dùng cloud)
   - 3030 (Grafana)
   - 9090 (Prometheus)
   - 9091 (Pushgateway)
   ```

3. **Truy cập**:
   - Grafana: `http://YOUR_SERVER_IP:3030`
   - Prometheus: `http://YOUR_SERVER_IP:9090`
   - Pushgateway: `http://YOUR_SERVER_IP:9091`

## 🎨 Customize Dashboard

### Thêm panel mới

1. Vào Grafana Dashboard
2. Click **Add Panel** (góc trên)
3. Chọn **Add an empty panel**
4. Thêm query Prometheus:
   ```promql
   # Example: Failure rate percentage
   (sum(github_workflow_failure_total) / sum(github_workflow_run_total)) * 100
   ```
5. Chọn visualization type (Graph, Stat, Gauge, Table, etc.)
6. Click **Apply**

### Thêm Alert

1. Vào panel setting (click panel title → Edit)
2. Tab **Alert**
3. Thêm condition, ví dụ:
   ```
   WHEN avg() OF query(A, 5m) IS ABOVE 50
   ```
4. Setup notification channel (Email, Slack, Discord, etc.)

## 📊 Best Practices

### ✅ Do's
- ✅ Monitor dashboard thường xuyên để phát hiện issues sớm
- ✅ Set alerts cho failure rate > 20%
- ✅ Theo dõi duration để optimize workflows
- ✅ Review metrics hàng tuần để cải thiện CI/CD pipeline

### ❌ Don'ts
- ❌ Không xóa Pushgateway data khi đang có workflows chạy
- ❌ Không thay đổi metric names trong workflow (sẽ break dashboard)
- ❌ Không expose Pushgateway ra internet không có authentication

## 🔗 Quick Links

- 📊 **Grafana Dashboard**: http://localhost:3030
- 🔍 **Prometheus**: http://localhost:9090
- 📤 **Pushgateway**: http://localhost:9091
- 🔧 **GitHub Actions**: https://github.com/ductoanoxo/FOODFAST/actions
- 📖 **Prometheus Docs**: https://prometheus.io/docs/
- 📚 **Grafana Docs**: https://grafana.com/docs/

## 🎓 Advanced Usage

### Custom Metrics trong GitHub Actions

Bạn có thể thêm custom metrics trong workflow:

```yaml
- name: Push custom metrics
  run: |
    cat > custom.txt <<EOF
    # Custom metric example
    my_custom_metric{label="value"} 123
    EOF
    
    curl --data-binary @custom.txt \
      ${PUSHGATEWAY_URL}/metrics/job/custom_job
```

### Recording Rules trong Prometheus

Thêm vào `monitoring/recording-rules.yml`:

```yaml
groups:
  - name: cicd_rules
    interval: 30s
    rules:
      - record: job:github_workflow_success_rate:5m
        expr: |
          sum(rate(github_workflow_success_total[5m])) 
          / 
          sum(rate(github_workflow_run_total[5m]))
```

## 🆘 Support

Nếu gặp vấn đề:
1. Check logs: `docker-compose logs -f [service_name]`
2. Verify services đang chạy: `docker-compose ps`
3. Test connectivity: `curl http://localhost:9091/metrics`
4. Review GitHub Actions logs
5. Check Prometheus targets: `http://localhost:9090/targets`

---

**Dashboard Version**: 2.0 Enhanced  
**Last Updated**: November 2025  
**Created by**: FoodFast DevOps Team 🚀
