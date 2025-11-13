# Grafana + Prometheus Monitoring Guide

## 🎯 Tổng quan

Hệ thống monitoring cho FoodFast Drone Delivery bao gồm:
- **Prometheus**: Thu thập và lưu trữ metrics
- **Grafana**: Hiển thị và visualization metrics
- **Node Exporter**: Thu thập system metrics (CPU, Memory, Disk)
- **cAdvisor**: Thu thập container metrics

## 📦 Services đã được thêm

### 1. Prometheus (Port 9090)
- Thu thập metrics từ server_app, node-exporter, và cAdvisor
- Lưu trữ time-series data
- Đánh giá alerts rules

### 2. Grafana (Port 3030)
- Visualization dashboard
- Default login: `admin` / `admin123`
- Auto-provisioned datasource và dashboard

### 3. Node Exporter (Port 9100)
- System metrics: CPU, Memory, Disk, Network

### 4. cAdvisor (Port 8080)
- Container resource usage
- Docker metrics

## 🚀 Cách sử dụng

### Bước 1: Cài đặt dependencies
```bash
cd server_app
npm install
```

### Bước 2: Khởi động hệ thống
```bash
# Từ thư mục gốc của project
docker-compose up -d
```

### Bước 3: Truy cập các services

#### Prometheus:
```
http://localhost:9090
```

#### Grafana:
```
http://localhost:3030
Username: admin
Password: admin123
```

#### Metrics Endpoint:
```
http://localhost:5000/metrics
```

## 📊 Metrics được thu thập

### Application Metrics
- `http_requests_total` - Tổng số HTTP requests
- `http_request_duration_seconds` - Thời gian xử lý requests
- `active_orders_count` - Số lượng orders đang active
- `available_drones_count` - Số lượng drones available
- `delivering_drones_count` - Số lượng drones đang giao hàng
- `total_users_count` - Tổng số users
- `total_restaurants_count` - Tổng số restaurants
- `orders_status_total` - Số lượng orders theo status
- `payment_duration_seconds` - Thời gian xử lý payment
- `mongodb_connections_current` - MongoDB connections

### System Metrics (Node Exporter)
- CPU usage
- Memory usage
- Disk I/O
- Network traffic

### Container Metrics (cAdvisor)
- Container CPU usage
- Container memory usage
- Container network I/O

## 🔔 Alerts được cấu hình

1. **ServiceDown** - Service không hoạt động > 1 phút
2. **HighAPILatency** - Response time > 1 giây
3. **HighErrorRate** - Error rate > 5%
4. **HighCPUUsage** - CPU usage > 80%
5. **HighMemoryUsage** - Memory usage > 1GB
6. **LowAvailableDrones** - Số drones available < 5
7. **LowDiskSpace** - Disk space < 10%

## 📈 Dashboard Overview

Dashboard `FoodFast - Application Overview` bao gồm:

### Performance Metrics
- Request Rate (requests/second)
- HTTP Requests by Endpoint
- P95 Response Time
- Response Time by Endpoint

### System Resources
- CPU Usage
- Memory Usage

### Business Metrics
- Active Orders
- Available Drones
- Total Users
- Total Restaurants

## 🔧 Cấu hình nâng cao

### Thêm custom metrics
Edit file `server_app/config/metrics.js` để thêm metrics mới:

```javascript
const myCustomMetric = new promClient.Gauge({
  name: 'my_custom_metric',
  help: 'Description of my metric',
  registers: [register],
});
```

### Thêm alert rules
Edit file `monitoring/alerts.yml` để thêm alert rules mới.

### Tạo dashboard mới
1. Truy cập Grafana (http://localhost:3030)
2. Login với admin/admin123
3. Click "+" -> "Dashboard"
4. Thêm panels và queries

## 🐛 Troubleshooting

### Prometheus không thu thập được metrics
```bash
# Check logs
docker logs foodfast_prometheus

# Verify targets
http://localhost:9090/targets
```

### Grafana không hiển thị data
```bash
# Check datasource connection
docker logs foodfast_grafana

# Verify Prometheus datasource
http://localhost:3030/datasources
```

### Server metrics không có data
```bash
# Check server logs
docker logs foodfast_server

# Verify metrics endpoint
curl http://localhost:5000/metrics
```

## 📝 File Structure

```
monitoring/
├── prometheus.yml          # Prometheus configuration
├── alerts.yml             # Alert rules
└── grafana/
    ├── datasources.yml    # Grafana datasources
    ├── dashboards.yml     # Dashboard provisioning
    └── foodfast-dashboard.json  # Pre-built dashboard

server_app/
└── config/
    └── metrics.js         # Metrics configuration
```

## 🔄 Cập nhật và Maintenance

### Backup Grafana dashboards
```bash
docker exec foodfast_grafana grafana-cli admin export-dashboard > backup.json
```

### Xem Prometheus storage usage
```bash
docker exec foodfast_prometheus du -sh /prometheus
```

### Clean up old metrics data
```bash
# Stop Prometheus
docker stop foodfast_prometheus

# Remove old data
docker volume rm foodfast_prometheus_data

# Start Prometheus
docker start foodfast_prometheus
```

## 🌐 Production Considerations

1. **Security**:
   - Đổi mật khẩu Grafana mặc định
   - Sử dụng HTTPS cho Grafana và Prometheus
   - Giới hạn access bằng firewall

2. **Performance**:
   - Điều chỉnh `scrape_interval` phù hợp
   - Set retention time cho Prometheus data
   - Sử dụng alertmanager cho production alerts

3. **High Availability**:
   - Sử dụng Prometheus federation
   - Setup Grafana với multiple instances
   - Backup metrics data định kỳ

## 📚 Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Node Exporter Metrics](https://github.com/prometheus/node_exporter)
- [cAdvisor Documentation](https://github.com/google/cadvisor)

## ✅ Checklist

- [x] Prometheus đã được cấu hình
- [x] Grafana đã được cấu hình với datasource
- [x] Dashboard mặc định đã được tạo
- [x] Alert rules đã được định nghĩa
- [x] Server metrics endpoint đã hoạt động
- [x] System metrics đang được thu thập
- [x] Container metrics đang được thu thập
