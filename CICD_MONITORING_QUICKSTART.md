# 🚀 Quick Start: CI/CD Monitoring

## Cài đặt nhanh trong 3 bước

### 1️⃣ Thêm GitHub Secret

Vào repo → Settings → Secrets and variables → Actions → New repository secret:

```
Name: PUSHGATEWAY_URL
Value: http://3.89.225.219:9091
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

1. Mở Grafana Production: **<http://3.89.225.219:3030>**
2. Login: `admin` / `admin123`
3. Tìm dashboard: **"FoodFast CI/CD Pipeline"**

> 🎯 Dashboard đang chạy trên production server và có thể truy cập từ mọi nơi!

## ✅ Kiểm tra hoạt động

### Xem Pushgateway đã nhận metrics chưa:
```bash
curl http://3.89.225.219:9091/metrics | grep github_workflow
```

### Xem Prometheus đã scrape chưa:
Mở: <http://3.89.225.219:9090/targets>
Tìm job `pushgateway` → Status phải là UP

### Test push metrics thủ công:
```bash
echo "github_workflow_run_total{workflow=\"test\",branch=\"main\"} 1" | \
  curl --data-binary @- http://3.89.225.219:9091/metrics/job/github_actions/instance/manual_test
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
