# 📊 Grafana CI/CD Dashboard - Real-time Monitoring Guide

## 🎯 Tổng quan

Dashboard CI/CD đã được cập nhật để hiển thị **dữ liệu real-time** từ GitHub Actions workflows. Dashboard tự động cập nhật mỗi 30 giây và hiển thị các metrics mới nhất.

## ✅ Những gì đã được cập nhật

### 1. **Workflow Export Metrics** (.github/workflows/export-cicd-metrics.yml)
- ✅ Thêm **timestamp** cho mỗi metric
- ✅ Thêm metric `github_workflow_last_run_time` để track thời gian workflow cuối cùng
- ✅ Thêm `run_id` vào các metrics để phân biệt các lần chạy khác nhau
- ✅ Push metrics với format đúng cho Prometheus time-series

### 2. **Grafana Dashboard** (monitoring/grafana/cicd-dashboard.json)
- ✅ Cập nhật tất cả queries sử dụng `increase()` và `rate()` functions
- ✅ Thêm panel "Time Since Last Workflow Run" để biết workflow cuối chạy bao lâu rồi
- ✅ Tất cả metrics giờ hiển thị data trong **24 giờ gần nhất**
- ✅ Success rate tính dựa trên 24h gần nhất
- ✅ Auto-refresh mỗi 30 giây

### 3. **Test Script** (test-cicd-metrics.sh)
- ✅ Script kiểm tra metrics có được push đúng không
- ✅ Verify Pushgateway và Prometheus connectivity
- ✅ Check metric timestamps
- ✅ Hiển thị thời gian metrics cuối cùng được update

## 📊 Dashboard Panels

### **Top Metrics (Row 1)**
1. **Total Workflow Runs (24h)** - Tổng số lần workflow chạy trong 24h
2. **✅ Successful Runs (24h)** - Số lần chạy thành công trong 24h
3. **❌ Failed Runs (24h)** - Số lần chạy thất bại trong 24h
4. **Success Rate % (24h)** - Tỷ lệ thành công tính theo %
5. **⏱️ Average Duration** - Thời gian trung bình của workflow

### **Last Update Indicator (Row 2)**
6. **⏰ Time Since Last Workflow Run** - Hiển thị thời gian từ lần chạy cuối
   - 🟢 Green: < 1 giờ (fresh data)
   - 🟡 Yellow: 1-2 giờ (getting old)
   - 🔴 Red: > 2 giờ (stale data)

### **Charts (Row 3-4)**
7. **Workflow Runs Rate (5m)** - Rate của workflow runs (tính theo 5 phút)
8. **Success vs Failure (Hourly)** - So sánh success/failure theo giờ
9. **Workflow Duration by Type** - Thời gian chạy của từng loại workflow

### **Breakdown Charts (Row 5)**
10. **Workflow Status Table** - Bảng status chi tiết của từng workflow
11. **Runs by Branch (24h)** - Phân bố runs theo branch
12. **Runs by Actor (24h)** - Phân bố runs theo người trigger

### **Recent Activity (Row 6)**
13. **Recent Workflow Runs** - Danh sách các workflow runs gần đây

## 🚀 Cách sử dụng

### **Bước 1: Kiểm tra metrics có được push đúng chưa**

```bash
# Windows (Git Bash)
bash test-cicd-metrics.sh

# Linux/Mac
./test-cicd-metrics.sh
```

Script sẽ kiểm tra:
- ✅ Pushgateway có accessible không
- ✅ Có metrics nào đã được push chưa
- ✅ Metrics có timestamp không
- ✅ Thời gian update cuối cùng

### **Bước 2: Trigger một workflow để test**

Có 2 cách:
1. **Tự động**: Push code lên GitHub → Workflow sẽ tự chạy
2. **Thủ công**: Vào GitHub Actions → Chọn workflow → Click "Run workflow"

### **Bước 3: Mở Grafana Dashboard**

```
URL: http://13.220.101.54:3000
Dashboard: FoodFast CI/CD Pipeline
```

1. Login vào Grafana
2. Vào Dashboards → Browse
3. Tìm "FoodFast CI/CD Pipeline"
4. Dashboard sẽ tự động refresh mỗi 30 giây

## 🔍 Monitoring Checklist

### **Kiểm tra hàng ngày:**
- [ ] Dashboard có hiển thị data không?
- [ ] "Time Since Last Run" có < 24h không?
- [ ] Success rate có > 80% không?
- [ ] Có workflow nào fail liên tục không?

### **Khi có workflow fail:**
1. Xem panel "Workflow Status Table" để biết workflow nào fail
2. Check panel "Recent Workflow Runs" để xem run number
3. Vào GitHub Actions với run number đó để xem log chi tiết
4. Fix issue và trigger lại workflow

### **Khi dashboard không hiển thị data:**

**Vấn đề 1: Không có metrics nào**
```bash
# Check Pushgateway
curl http://13.220.101.54:9091/metrics | grep github_workflow
```
- Nếu không có output → Workflow chưa push metrics
- Fix: Trigger một workflow trên GitHub

**Vấn đề 2: Metrics có nhưng dashboard không hiển thị**
```bash
# Check Prometheus có scrape được metrics không
curl http://localhost:9090/api/v1/query?query=github_workflow_run_total
```
- Nếu không có data → Prometheus chưa scrape
- Fix: Check Prometheus config và restart Prometheus

**Vấn đề 3: Data bị stale (cũ)**
- Xem "Time Since Last Run" panel
- Nếu > 2 giờ → Trigger workflow mới
- Workflow sẽ tự động push metrics mới

## 📈 Query Examples

Dashboard sử dụng các queries sau (có thể dùng để custom):

### Total runs trong 24h:
```promql
sum(increase(github_workflow_run_total[24h]))
```

### Success rate:
```promql
(sum(increase(github_workflow_success_total[24h])) / (sum(increase(github_workflow_success_total[24h])) + sum(increase(github_workflow_failure_total[24h])))) * 100
```

### Workflow rate (5 phút):
```promql
increase(github_workflow_run_total[5m])
```

### Time since last run:
```promql
time() - (github_workflow_last_run_time / 1000)
```

### Runs by branch:
```promql
sum(increase(github_workflow_run_total[24h])) by (branch)
```

## 🎨 Dashboard Variables

Dashboard có 2 variables để filter:

1. **$workflow** - Chọn workflow cụ thể
   - All (mặc định)
   - CI - Test and Lint
   - Docker Build and Push
   - Auto Deploy Foodfast to EC2

2. **$branch** - Chọn branch cụ thể
   - All (mặc định)
   - main
   - kiet
   - DUCTOAN
   - deploy

## ⚙️ Cấu hình nâng cao

### **Thay đổi refresh interval:**

Trong dashboard JSON, tìm:
```json
"refresh": "30s"
```
Có thể đổi thành: "10s", "1m", "5m", etc.

### **Thay đổi time range:**

Trong dashboard JSON, tìm:
```json
"time": {
  "from": "now-6h",
  "to": "now"
}
```

### **Thêm alerting:**

Có thể thêm alerts cho:
- Success rate < 80%
- Workflow duration > 10 phút
- No data trong 2 giờ

## 🐛 Troubleshooting

### Dashboard shows "No data"
1. Check Pushgateway: `curl http://13.220.101.54:9091/metrics`
2. Check Prometheus targets: http://localhost:9090/targets
3. Run test script: `bash test-cicd-metrics.sh`
4. Trigger a workflow on GitHub

### Metrics are not updating
1. Check workflow trigger conditions in `.github/workflows/export-cicd-metrics.yml`
2. Verify PUSHGATEWAY_URL secret in GitHub
3. Check workflow logs in GitHub Actions

### Dashboard queries returning empty
1. Verify metric names in Pushgateway
2. Check Prometheus scrape config in `monitoring/prometheus.yml`
3. Verify datasource connection in Grafana

## 📝 Notes

- Dashboard auto-refreshes every **30 seconds**
- Data retention: Depends on Prometheus config (default: 15 days)
- Metrics persist in Pushgateway until overwritten
- All times are in **browser timezone**

## 🔗 Links

- **Grafana**: http://13.220.101.54:3000
- **Prometheus**: http://localhost:9090
- **Pushgateway**: http://13.220.101.54:9091
- **GitHub Actions**: https://github.com/ductoanoxo/FOODFAST/actions

## ✨ Best Practices

1. **Monitor regularly** - Check dashboard daily
2. **Act on failures** - Don't ignore failed workflows
3. **Track trends** - Watch for patterns in failure rates
4. **Keep fresh** - Trigger workflows regularly to keep data fresh
5. **Document changes** - Update dashboard when adding new workflows

---

**Dashboard Version**: 2.0  
**Last Updated**: 2025-01-15  
**Maintained by**: DevOps Team
