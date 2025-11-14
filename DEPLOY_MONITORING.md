# 🚀 Deploy Monitoring to EC2 - Production Guide

## ✅ Đã làm gì (Local)
- ✅ Prometheus + Grafana + Node Exporter + cAdvisor
- ✅ Metrics endpoint `/metrics` 
- ✅ Dashboard với business metrics
- ✅ Alert rules

## 🔧 Deploy lên EC2 (13.220.101.54)

### Bước 1: Push code lên GitHub

```bash
git add .
git commit -m "Add Prometheus + Grafana monitoring"
git push origin kiet
```

### Bước 2: SSH vào EC2

```bash
ssh -i "C:\Users\ADMIN\Downloads\CNPM_AWS_SGU.pem" ubuntu@13.220.101.54
```

### Bước 3: Pull code mới trên EC2

```bash
cd /path/to/FOODFAST
git pull origin kiet
```

### Bước 4: Stop containers cũ và start mới

```bash
# Stop tất cả containers hiện tại
docker-compose down

# Start với monitoring
docker-compose up -d --build
```

### Bước 5: Kiểm tra services

```bash
# Check containers
docker ps

# Check metrics endpoint
curl http://localhost:5000/metrics

# Check Prometheus targets
curl http://localhost:9090/targets
```

## 🔐 BẢO MẬT (QUAN TRỌNG!)

### ⚠️ Vấn đề hiện tại:
- Grafana exposed công khai trên port 3030
- Prometheus exposed công khai trên port 9090
- Password mặc định: admin/admin123

### ✅ Giải pháp bảo mật:

#### Option 1: Chỉ allow IP của bạn (Nhanh nhất)

Mở AWS Console > EC2 > Security Groups > Chỉnh sửa Inbound Rules:

```
Type: Custom TCP
Port: 3030
Source: <YOUR_IP>/32
Description: Grafana access

Type: Custom TCP  
Port: 9090
Source: <YOUR_IP>/32
Description: Prometheus access
```

#### Option 2: SSH Tunnel (An toàn nhất)

Không mở port công khai, chỉ truy cập qua SSH tunnel:

```bash
# Từ máy local, tạo SSH tunnel
ssh -i "C:\Users\ADMIN\Downloads\CNPM_AWS_SGU.pem" -L 3030:localhost:3030 -L 9090:localhost:9090 ubuntu@13.220.101.54

# Sau đó truy cập qua localhost:
# Grafana: http://localhost:3030
# Prometheus: http://localhost:9090
```

#### Option 3: Nginx Reverse Proxy + Basic Auth (Production)

Tạo file `monitoring/nginx.conf`:

```nginx
server {
    listen 80;
    server_name monitoring.yourdomain.com;
    
    location / {
        proxy_pass http://grafana:3000;
        auth_basic "Restricted Access";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }
}
```

### 🔒 Đổi mật khẩu Grafana

Trong `docker-compose.yml`, đổi:

```yaml
grafana:
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=<YOUR_STRONG_PASSWORD>
```

Sau đó:
```bash
docker-compose up -d grafana
```

## 📊 Truy cập Dashboard trên EC2

### URLs khi deploy:

**Nếu mở ports công khai (không khuyến nghị):**
- Grafana: `http://13.220.101.54:3030`
- Prometheus: `http://13.220.101.54:9090`
- Metrics: `http://13.220.101.54:5000/metrics`

**Nếu dùng SSH tunnel (khuyến nghị):**
```bash
# Tạo tunnel trước
ssh -i "C:\Users\ADMIN\Downloads\CNPM_AWS_SGU.pem" -L 3030:localhost:3030 ubuntu@13.220.101.54

# Sau đó truy cập qua localhost
http://localhost:3030
```

## 🎯 Các bước sau deploy

### 1. Kiểm tra metrics có data

```bash
# SSH vào EC2
curl http://localhost:5000/metrics | grep "http_requests_total"
curl http://localhost:5000/metrics | grep "active_orders_count"
```

### 2. Kiểm tra Prometheus scraping

Truy cập Prometheus UI > Status > Targets
- Tất cả targets phải "UP"

### 3. Mở Grafana Dashboard

Login: admin / <YOUR_PASSWORD>
- Vào Dashboards > FoodFast - Application Overview
- Check các panels có data

### 4. Test alerts (Optional)

Tạo traffic để trigger alerts:

```bash
# Trên EC2
for i in {1..100}; do 
  curl -s http://localhost:5000/api/health > /dev/null
done
```

## 📱 Setup Alerts với Slack/Email

### Thêm Alertmanager

Tạo file `monitoring/alertmanager.yml`:

```yaml
global:
  resolve_timeout: 5m

route:
  receiver: 'slack-notifications'
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h

receivers:
  - name: 'slack-notifications'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
        channel: '#alerts'
        title: '🚨 FoodFast Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}\n{{ .Annotations.description }}{{ end }}'
```

Thêm vào `docker-compose.yml`:

```yaml
  alertmanager:
    image: prom/alertmanager:latest
    container_name: foodfast_alertmanager
    restart: always
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager.yml:/etc/alertmanager/alertmanager.yml
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
    networks:
      - foodfast_network
```

Update Prometheus để connect với Alertmanager (đã có trong `monitoring/prometheus.yml`).

## 🔄 Auto-restart on failure

Containers đã được cấu hình `restart: always` nên sẽ tự động restart nếu crash.

## 💾 Backup & Retention

### Grafana dashboards backup

```bash
# Backup dashboards
docker exec foodfast_grafana grafana-cli admin export-dashboard > backup-$(date +%Y%m%d).json
```

### Prometheus data retention

Mặc định Prometheus giữ data 15 ngày. Để thay đổi:

```yaml
prometheus:
  command:
    - '--storage.tsdb.retention.time=30d'  # Giữ 30 ngày
```

## 📈 Monitoring the Monitoring

### Check Prometheus disk usage

```bash
docker exec foodfast_prometheus du -sh /prometheus
```

### Check Grafana logs

```bash
docker logs foodfast_grafana --tail 50
```

### Check metrics endpoint performance

```bash
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5000/metrics
```

## 🚨 Troubleshooting trên EC2

### Metrics không có data

```bash
# 1. Check server logs
docker logs foodfast_server

# 2. Check metrics endpoint
curl http://localhost:5000/metrics | head -50

# 3. Check Prometheus targets
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets'
```

### Grafana không connect Prometheus

```bash
# Restart Grafana
docker restart foodfast_grafana

# Check network
docker exec foodfast_grafana ping prometheus
```

### Container keep restarting

```bash
# Check logs
docker logs <container_name>

# Check resources
docker stats
```

## ✅ Checklist sau khi deploy

- [ ] Push code lên GitHub
- [ ] Pull code trên EC2
- [ ] Build & start containers
- [ ] Check tất cả containers running
- [ ] Đổi Grafana password
- [ ] Setup Security Group / SSH tunnel
- [ ] Test metrics endpoint
- [ ] Test Prometheus targets (all UP)
- [ ] Test Grafana dashboard (có data)
- [ ] Setup Alertmanager + Slack/Email
- [ ] Test alerts
- [ ] Document URLs và credentials

## 🎯 Production URLs (sau khi deploy)

```
Application:
- Client:      http://13.220.101.54:3000
- Restaurant:  http://13.220.101.54:3001  
- Admin:       http://13.220.101.54:3002
- Drone:       http://13.220.101.54:3003
- API:         http://13.220.101.54:5000

Monitoring (via SSH tunnel):
- Grafana:     http://localhost:3030
- Prometheus:  http://localhost:9090
- Metrics:     http://13.220.101.54:5000/metrics
```

## 💡 Tips

1. **Dùng SSH tunnel** - An toàn nhất, không cần mở port công khai
2. **Đổi password ngay** - admin/admin123 quá dễ đoán
3. **Backup dashboards** - Export ra file JSON định kỳ
4. **Monitor disk space** - Prometheus data tăng theo thời gian
5. **Setup alerts sớm** - Biết ngay khi có vấn đề

Sau khi deploy xong, dashboard sẽ hoạt động y hệt local, chỉ khác là data từ production server! 🎉
