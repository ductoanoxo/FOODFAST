# 🔧 Quick Fix: Prometheus Restarting Issue

## ❌ Vấn đề
Prometheus container đang **Restarting (2)** - bị crash liên tục do lỗi configuration.

## 🔍 Nguyên nhân
1. File `recording-rules.yml` chưa được sync lên EC2
2. Syntax error trong recording rules (đã fix)
3. Prometheus không tìm thấy file recording-rules.yml được khai báo trong prometheus.yml

## ✅ Giải pháp

### Option 1: Tự động (Recommended)

Từ máy local (Windows):

```bash
# Commit và push code đã fix
git add .
git commit -m "Fix Prometheus recording rules syntax"
git push origin main

# Chờ GitHub Actions deploy xong (~3-5 phút)
# Hoặc trigger manual deploy tại:
# https://github.com/ductoanoxo/FOODFAST/actions/workflows/deploy-production.yml
```

### Option 2: Manual sync (Nhanh hơn)

Từ máy local:

```bash
# Set environment variables (nếu cần)
export SSH_KEY_PATH="C:/Users/ADMIN/Downloads/CNPM_AWS_SGU.pem"

# Sync configs và restart Prometheus
./sync-monitoring-to-ec2.sh
```

### Option 3: Trực tiếp trên EC2

SSH vào EC2 và chạy:

```bash
# 1. Kiểm tra logs để xác nhận lỗi
sudo docker logs foodfast-prometheus

# 2. Stop container
sudo docker stop foodfast-prometheus
sudo docker rm foodfast-prometheus

# 3. Kiểm tra file recording-rules.yml có tồn tại không
ls -la ~/prometheus-config/

# Nếu KHÔNG có recording-rules.yml, tạm thời comment dòng này trong prometheus.yml:
# nano ~/prometheus-config/prometheus.yml
# Comment dòng: - '/etc/prometheus/recording-rules.yml'

# 4. Restart Prometheus
sudo docker run -d \
    --name foodfast-prometheus \
    --restart unless-stopped \
    --network foodfast-net \
    --network-alias prometheus \
    -p 9090:9090 \
    -v ~/prometheus-config:/etc/prometheus \
    -v prometheus_data:/prometheus \
    prom/prometheus:latest \
    --config.file=/etc/prometheus/prometheus.yml \
    --storage.tsdb.path=/prometheus \
    --storage.tsdb.retention.time=30d \
    --storage.tsdb.retention.size=10GB \
    --web.console.libraries=/usr/share/prometheus/console_libraries \
    --web.console.templates=/usr/share/prometheus/consoles \
    --web.enable-lifecycle

# 5. Kiểm tra status
sudo docker ps | grep prometheus
sudo docker logs foodfast-prometheus
```

## 🔍 Debug Commands

```bash
# Xem logs real-time
sudo docker logs -f foodfast-prometheus

# Kiểm tra config files
ls -la ~/prometheus-config/
cat ~/prometheus-config/prometheus.yml

# Validate config trong container
sudo docker run --rm \
    -v ~/prometheus-config:/config \
    prom/prometheus:latest \
    promtool check config /config/prometheus.yml

# Validate recording rules
sudo docker run --rm \
    -v ~/prometheus-config:/config \
    prom/prometheus:latest \
    promtool check rules /config/recording-rules.yml

# Check network
sudo docker network inspect foodfast-net

# Check if port is listening
sudo netstat -tlnp | grep 9090
```

## ✅ Verify Fix

Sau khi fix, kiểm tra:

```bash
# 1. Container running stable
sudo docker ps | grep prometheus
# Phải thấy: Up X seconds (không còn Restarting)

# 2. Prometheus healthy
curl http://localhost:9090/-/healthy
# Response: Prometheus Server is Healthy.

# 3. Check targets
curl http://localhost:9090/api/v1/targets

# 4. Check rules loaded
curl http://localhost:9090/api/v1/rules

# 5. Access web UI
# http://13.220.101.54:9090
```

## 📋 Checklist

- [ ] Prometheus container running stable (không Restarting)
- [ ] Health endpoint returns OK
- [ ] All targets UP trong `/targets`
- [ ] Recording rules loaded trong `/rules`
- [ ] Grafana có thể query được Prometheus
- [ ] CI/CD metrics xuất hiện trong Pushgateway

## 🚨 Common Errors

### Error: "recording-rules.yml: no such file or directory"
```bash
# Fix: Upload file lên EC2
scp monitoring/recording-rules.yml ubuntu@13.220.101.54:~/prometheus-config/
```

### Error: "bad_data: invalid expression"
```bash
# Fix: Validate rules syntax locally
docker run --rm -v $(pwd)/monitoring:/config prom/prometheus:latest \
    promtool check rules /config/recording-rules.yml
```

### Error: "permission denied"
```bash
# Fix: Check file permissions
sudo chmod 644 ~/prometheus-config/*.yml
```

## 📚 Related Files

- **Fixed file**: `monitoring/recording-rules.yml` (line 73)
- **Config**: `monitoring/prometheus.yml`
- **Deploy workflow**: `.github/workflows/deploy-production.yml`
- **Fix script**: `fix-prometheus-ec2.sh`
- **Sync script**: `sync-monitoring-to-ec2.sh`

## 🔗 Links

- Prometheus logs: `sudo docker logs foodfast-prometheus`
- Prometheus UI: http://13.220.101.54:9090
- Prometheus targets: http://13.220.101.54:9090/targets
- Prometheus rules: http://13.220.101.54:9090/rules
- GitHub Actions: https://github.com/ductoanoxo/FOODFAST/actions

---

**Need more help?** Check full documentation: [CICD_MONITORING_SYSTEM.md](./CICD_MONITORING_SYSTEM.md)
