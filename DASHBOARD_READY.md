# ✅ Grafana Dashboard - FIXED!

## Vấn đề đã fix:

1. ✅ **Metrics middleware** - Đã sửa để capture đúng API routes (`/api/*`)
2. ✅ **Server rebuilt** - Container đã được rebuild với code mới
3. ✅ **Traffic generated** - Đã tạo requests để có data
4. ✅ **Queries optimized** - Dashboard queries đã được tối ưu

## 🚀 Cách xem Dashboard ngay:

### Bước 1: Truy cập Grafana
```
URL: http://localhost:3030
Username: admin
Password: admin123
```

### Bước 2: Mở Dashboard
- Click **Home** > **Dashboards**
- Chọn **FoodFast - Application Overview**
- Dashboard sẽ auto-refresh mỗi 10 giây

### Bước 3: Tạo traffic (nếu cần)
```bash
# Chạy script để generate traffic liên tục
bash generate-traffic.sh

# Hoặc manual:
curl http://localhost:5000/api/health
curl http://localhost:5000/api/products
curl http://localhost:5000/api/categories
curl http://localhost:5000/api/restaurants
```

## 📊 Metrics đang hoạt động:

### ✅ Performance Metrics (Có data ngay)
- **Request Rate** - Số requests/giây
- **HTTP Requests by Endpoint** - Requests theo từng API route
- **P95 Response Time** - Thời gian response 95th percentile
- **Response Time by Endpoint** - Response time từng endpoint
- **CPU Usage** - CPU usage của Node.js process
- **Memory Usage** - Memory usage (RAM)

### ⏳ Business Metrics (Update mỗi 30s)
- **Active Orders** - Số orders đang active
- **Available Drones** - Số drones available
- **Total Users** - Tổng số users
- **Total Restaurants** - Tổng số restaurants

## 🔍 Quick Check:

### 1. Kiểm tra Metrics Endpoint
```bash
curl http://localhost:5000/metrics | grep http_requests_total
```
Phải thấy metrics với numbers > 0

### 2. Kiểm tra Prometheus
```
URL: http://localhost:9090
Query: rate(http_requests_total[1m])
```
Phải thấy graph có data

### 3. Kiểm tra Grafana Datasource
- Vào Grafana > Configuration > Data Sources
- Click Prometheus
- Click "Test" - Phải thấy "Data source is working"

## 💡 Tips:

1. **Tạo traffic thường xuyên** - Dashboard cần data để hiển thị graphs
2. **Đợi 1-2 phút** - Metrics cần thời gian để aggregate
3. **Sử dụng rate queries** - `rate(metric[1m])` tốt hơn raw values
4. **Check time range** - Đảm bảo time range phù hợp (Last 1 hour)

## 🎯 API Endpoints để test:

```bash
# Health check - Fast
curl http://localhost:5000/api/health

# Products - Medium (database query)
curl http://localhost:5000/api/products

# Categories - Medium
curl http://localhost:5000/api/categories

# Restaurants - Medium  
curl http://localhost:5000/api/restaurants

# Orders - Requires auth
curl http://localhost:5000/api/orders
```

## 📈 Dashboard Panels:

1. **Request Rate (Gauge)** - Real-time request rate
2. **HTTP Requests (Timeseries)** - Requests over time by endpoint
3. **P95 Response Time (Gauge)** - 95th percentile latency
4. **Response Time (Timeseries)** - Latency over time
5. **CPU Usage (Timeseries)** - Node.js CPU usage
6. **Memory Usage (Timeseries)** - Node.js memory
7. **Active Orders (Stat)** - Current active orders
8. **Available Drones (Stat)** - Drones ready for delivery
9. **Total Users (Stat)** - Registered users
10. **Total Restaurants (Stat)** - Registered restaurants

## 🚨 Troubleshooting:

### "No data" - Giải pháp:
```bash
# 1. Generate traffic
bash generate-traffic.sh

# 2. Wait 30 seconds

# 3. Refresh dashboard (or wait for auto-refresh)
```

### Server restart needed:
```bash
docker restart foodfast_server
```

### Full rebuild:
```bash
docker-compose up -d --build server_app
```

## ✨ Bây giờ bạn có thể:

✅ Xem real-time metrics trong Grafana
✅ Monitor API performance  
✅ Track system resources (CPU, Memory)
✅ View business metrics (orders, drones, users)
✅ Set up alerts (đã có alert rules trong alerts.yml)

**Grafana URL**: http://localhost:3030 (admin/admin123)
**Prometheus URL**: http://localhost:9090
**Metrics Endpoint**: http://localhost:5000/metrics

🎉 **Dashboard đã sẵn sàng sử dụng!**
