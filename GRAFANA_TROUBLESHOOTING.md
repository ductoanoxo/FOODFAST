# 🔧 Fix "No Data" trong Grafana Dashboard

## Vấn đề đã được fix

Dashboard đang hiển thị "No data" vì:
1. ✅ Server container chưa được rebuild với code metrics mới
2. ✅ Queries trong dashboard chưa tối ưu cho metrics có sẵn
3. ✅ Cần generate requests để có data

## Đã thực hiện

### 1. Rebuild Server Container
```bash
docker-compose up -d --build server_app
```

### 2. Verify Metrics Endpoint
```bash
curl http://localhost:5000/metrics
```

### 3. Generate Test Traffic
```bash
# Tạo một số requests để có data
for i in {1..20}; do 
  curl -s http://localhost:5000/ > /dev/null
  curl -s http://localhost:5000/api/health > /dev/null
done
```

### 4. Restart Grafana
```bash
docker restart foodfast_grafana
```

## Kiểm tra Dashboard

1. Truy cập Grafana: http://localhost:3030
2. Login: admin / admin123
3. Vào Dashboard: Home > Dashboards > FoodFast - Application Overview
4. Chờ 10-15 giây để metrics được scrape và hiển thị

## Metrics hiện đang hoạt động:

### ✅ Performance Metrics (Có data ngay)
- Request Rate (req/s)
- HTTP Requests by Endpoint
- P95 Response Time
- Response Time by Endpoint
- CPU Usage
- Memory Usage

### ⏳ Business Metrics (Cần chờ 30s để update)
- Active Orders
- Available Drones
- Total Users
- Total Restaurants

## Troubleshooting

### Nếu vẫn thấy "No data"

1. **Kiểm tra Prometheus targets**:
   ```bash
   curl http://localhost:9090/targets
   ```
   Tất cả targets phải có health="up"

2. **Kiểm tra metrics endpoint**:
   ```bash
   curl http://localhost:5000/metrics | grep http_requests_total
   ```
   Phải thấy metrics với các values

3. **Test Prometheus query**:
   ```bash
   curl 'http://localhost:9090/api/v1/query?query=up'
   ```
   Phải thấy result với value=1

4. **Generate more traffic**:
   ```bash
   # Tạo traffic liên tục
   while true; do 
     curl -s http://localhost:5000/ > /dev/null
     sleep 1
   done
   ```

5. **Check Grafana datasource**:
   - Vào Grafana > Configuration > Data Sources
   - Click vào Prometheus
   - Click "Test" button
   - Phải thấy "Data source is working"

### Nếu business metrics vẫn là 0

Business metrics (orders, drones, users, restaurants) sẽ hiển thị 0 nếu database chưa có data. Để có data thực:

1. Seed database:
   ```bash
   cd server_app
   npm run seed
   ```

2. Hoặc tạo data thông qua các apps:
   - Client: http://localhost:3000
   - Restaurant: http://localhost:3001
   - Admin: http://localhost:3002
   - Drone: http://localhost:3003

## Test Queries trong Grafana

Nếu muốn test queries trực tiếp trong Grafana:

1. Vào Dashboard
2. Click vào panel title > Edit
3. Thử các queries này:

```promql
# Request rate
sum(rate(http_requests_total[1m]))

# Memory usage
nodejs_process_resident_memory_bytes

# CPU usage  
rate(nodejs_process_cpu_seconds_total[1m])

# HTTP requests by route
sum by (route) (rate(http_requests_total[1m]))

# P95 response time
histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[1m])))
```

## Các URL quan trọng

- **Grafana Dashboard**: http://localhost:3030/d/foodfast-app-overview
- **Prometheus UI**: http://localhost:9090
- **Prometheus Targets**: http://localhost:9090/targets
- **Metrics Endpoint**: http://localhost:5000/metrics
- **Server API**: http://localhost:5000

## Lưu ý

- Dashboard tự động refresh mỗi 10 giây
- Prometheus scrape metrics mỗi 10 giây (server_app) và 15 giây (system metrics)
- Business metrics update mỗi 30 giây
- Cần ít nhất 1 phút data để các rate() queries hoạt động tốt
