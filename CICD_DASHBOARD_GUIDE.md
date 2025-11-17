# 📊 FoodFast CI/CD Monitoring Dashboard

Hệ thống giám sát CI/CD pipeline cho dự án FoodFast sử dụng Grafana + Prometheus + Pushgateway.

## 🎯 Tính năng

Dashboard CI/CD theo dõi:
- ✅ **Workflow Runs**: Tổng số lần chạy CI/CD workflows
- 📈 **Success/Failure Rate**: Tỷ lệ thành công/thất bại
- ⏱️ **Duration Tracking**: Thời gian chạy mỗi workflow
- 🔄 **Real-time Status**: Trạng thái hiện tại của từng workflow
- 👥 **Contributors Activity**: Hoạt động của từng member
- 🌿 **Branch Analytics**: Phân tích theo từng nhánh

## 🏗️ Kiến trúc

```
GitHub Actions Workflows
    ↓ (push metrics)
Prometheus Pushgateway (:9091)
    ↓ (scrape)
Prometheus (:9090)
    ↓ (query)
Grafana Dashboard (:3030)
```

## 📦 Components

### 1. GitHub Actions Workflow
**File**: `.github/workflows/export-cicd-metrics.yml`

Workflow này tự động chạy sau mỗi workflow khác hoàn thành và export metrics:
- Workflow name, branch, actor
- Success/failure count
- Duration
- Run number

### 2. Prometheus Pushgateway
**Port**: 9091

Nhận metrics từ GitHub Actions (vì GitHub Actions không thể scraped trực tiếp).

**Access Production**: <http://3.89.225.219:9091>

### 3. Prometheus
**Port**: 9090
**Config**: `monitoring/prometheus.yml`

Đã được cấu hình để scrape Pushgateway mỗi 10s.

### 4. Grafana Dashboard
**Port**: 3030
**File**: `monitoring/grafana/cicd-dashboard.json`

Dashboard hiển thị:
- Total workflow runs
- Success/failure statistics
- Duration trends
- Status table
- Branch/Actor analytics

## 🚀 Cài đặt & Sử dụng

### Bước 1: Cấu hình GitHub Secrets

Thêm secret vào GitHub repository:

```
PUSHGATEWAY_URL=http://3.89.225.219:9091
```

*(hoặc sử dụng URL Pushgateway của bạn)*

### Bước 2: Deploy Monitoring Stack

**Local Development:**
```bash
docker-compose up -d prometheus grafana pushgateway
```

**Production (EC2):**
```bash
# Deploy tự động qua GitHub Actions
git push origin main
```

Hoặc deploy thủ công:
```bash
# Deploy Pushgateway
docker run -d --name foodfast-pushgateway \
  --restart unless-stopped \
  --network foodfast-net \
  -p 9091:9091 \
  prom/pushgateway:latest
```

### Bước 3: Truy cập Dashboard

1. Mở Grafana Production: <http://3.89.225.219:3030>
2. Login:
   - Username: `admin`
   - Password: `admin123`
3. Chọn dashboard: **"FoodFast CI/CD Pipeline"**

> 💡 **Tip**: Dashboard này chạy trên production EC2 server, có thể truy cập từ bất kỳ đâu!

## 📊 Metrics Collected

| Metric Name | Type | Description |
|-------------|------|-------------|
| `github_workflow_run_total` | Counter | Tổng số workflow runs |
| `github_workflow_success_total` | Counter | Số lần thành công |
| `github_workflow_failure_total` | Counter | Số lần thất bại |
| `github_workflow_duration_seconds` | Gauge | Thời gian chạy (giây) |
| `github_workflow_status` | Gauge | Trạng thái (1=success, 0=fail, -1=unknown) |
| `github_workflow_run_number` | Gauge | Số thứ tự run |

### Labels

Mỗi metric có các labels:
- `workflow`: Tên workflow
- `branch`: Git branch
- `actor`: GitHub username
- `run_id`: ID của workflow run
- `conclusion`: success/failure/unknown

## 🔍 Dashboard Panels

### Overview Section
- **Total Workflow Runs**: Tổng số lần chạy tất cả workflows
- **Successful Runs**: Số lần thành công (màu xanh)
- **Failed Runs**: Số lần thất bại (màu đỏ)
- **Success Rate %**: Tỷ lệ thành công (gauge)
- **Average Duration**: Thời gian chạy trung bình

### Trends Section
- **Workflow Runs Over Time**: Biểu đồ timeline theo từng workflow
- **Success vs Failure Rate**: So sánh success/failure theo thời gian (stacked bars)
- **Workflow Duration by Type**: Thời gian chạy của từng loại workflow

### Analysis Section
- **Workflow Status Table**: Bảng trạng thái chi tiết từng workflow
- **Runs by Branch**: Pie chart phân tích theo nhánh
- **Runs by Actor**: Pie chart theo contributor
- **Recent Workflow Runs**: Bảng các lần chạy gần nhất

## 🎨 Dashboard Variables

Dashboard hỗ trợ filtering:
- **Workflow**: Filter theo tên workflow (CI Test, Docker Build, Deploy)
- **Branch**: Filter theo git branch (main, develop, kiet, etc.)

## 🔧 Troubleshooting

### Không thấy metrics trong dashboard

1. **Kiểm tra Pushgateway**:
   ```bash
   curl http://3.89.225.219:9091/metrics | grep github_workflow
   ```

2. **Kiểm tra Prometheus scraping**:
   - Mở <http://3.89.225.219:9090/targets>
   - Tìm job "pushgateway", status phải là UP

3. **Kiểm tra GitHub Actions logs**:
   - Xem tab "Actions" trong GitHub repo
   - Tìm workflow "Export CI/CD Metrics to Prometheus"
   - Kiểm tra log step "Push metrics to Pushgateway"

### Metrics bị cũ hoặc không update

Pushgateway giữ metrics cho đến khi:
- Có metrics mới được push (overwrite)
- Hoặc được xóa thủ công

**Xóa metrics cũ**:
```bash
# Xóa tất cả metrics
curl -X DELETE http://3.89.225.219:9091/metrics

# Xóa metrics của 1 job cụ thể
curl -X DELETE http://3.89.225.219:9091/metrics/job/github_actions/instance/ci_test
```

### Workflow không tự động export metrics

Kiểm tra:
1. File `.github/workflows/export-cicd-metrics.yml` có trong repo
2. Workflow được trigger sau workflows khác:
   - CI - Test and Lint
   - Docker Build and Push
   - Auto Deploy Foodfast to EC2
3. Secret `PUSHGATEWAY_URL` đã được setup đúng

## 📈 Best Practices

1. **Monitor Regularly**: Kiểm tra dashboard hàng ngày để phát hiện vấn đề sớm
2. **Set Alerts**: Cấu hình alerts cho:
   - Success rate < 80%
   - Average duration > 10 minutes
   - Nhiều failures liên tiếp
3. **Analyze Trends**: Xem xét trends để optimize CI/CD pipeline
4. **Clean Old Data**: Xóa metrics cũ trong Pushgateway định kỳ

## 🔗 Related Documentation

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Pushgateway Documentation](https://github.com/prometheus/pushgateway)
- [GitHub Actions Metrics](https://docs.github.com/en/rest/actions)

## 📝 Notes

- Metrics được push từ GitHub Actions sau mỗi workflow run
- Pushgateway giữ metrics persistently (không bị mất khi restart)
- Dashboard tự động refresh mỗi 30s
- Time range mặc định: Last 6 hours

## 🆘 Support

Nếu gặp vấn đề, kiểm tra:
1. Container logs: `docker logs foodfast_pushgateway`
2. Prometheus logs: `docker logs foodfast_prometheus`
3. Grafana logs: `docker logs foodfast_grafana`
4. GitHub Actions logs trong tab Actions

---

**Created by**: FoodFast Team  
**Last Updated**: November 2025
