# 📚 SCRIPTS REFERENCE - FOODFAST

> Danh sách tất cả scripts và cách sử dụng

---

## 🚀 DEPLOYMENT SCRIPTS

### `setup-all.ps1` - Setup toàn bộ (1 lệnh)
**Mô tả**: Script tự động setup từ đầu đến cuối: Build images → Deploy K8s → Setup Grafana

**Cách dùng**:
```powershell
# Setup đầy đủ (bao gồm monitoring)
.\setup-all.ps1

# Skip monitoring
.\setup-all.ps1 -SkipMonitoring
```

**Thời gian**: ~10-15 phút

---

### `k8s/setup-k8s.ps1` - Deploy ứng dụng lên K8s
**Mô tả**: Deploy FOODFAST lên Kubernetes (không bao gồm monitoring)

**Cách dùng**:
```powershell
.\k8s\setup-k8s.ps1
```

**Hỏi trong quá trình**:
- Deploy MongoDB locally? → Chọn `n` (nếu dùng Atlas)
- Deploy Ingress? → Chọn `n` (dùng NodePort)
- Deploy HPA? → Chọn `y` (auto-scaling)

**Thời gian**: ~5 phút

---

### `setup-grafana.ps1` - Cài Grafana & Prometheus
**Mô tả**: Cài đặt monitoring stack (Prometheus + Grafana)

**Cách dùng**:
```powershell
.\setup-grafana.ps1
```

**Kết quả**:
- Grafana: http://localhost:32000 (admin/admin123)
- Prometheus: http://localhost:32001

**Thời gian**: ~5 phút

---

### `build-images.ps1` - Build tất cả Docker images
**Mô tả**: Build 5 Docker images cho FOODFAST

**Cách dùng**:
```powershell
.\build-images.ps1
```

**Build**:
- Server (Backend API)
- Client (Frontend)
- Restaurant (Frontend)
- Admin (Frontend)
- Drone (Frontend)

**Thời gian**: ~10 phút

---

## 📊 MONITORING SCRIPTS

### `monitor-autoscale.ps1` - Monitor HPA real-time
**Mô tả**: Hiển thị HPA, pods, CPU/Memory real-time

**Cách dùng**:
```powershell
# Refresh mỗi 3 giây (mặc định)
.\monitor-autoscale.ps1

# Refresh mỗi 5 giây
.\monitor-autoscale.ps1 -Interval 5
```

**Hiển thị**:
- HPA status
- Pods running
- CPU/Memory usage
- Deployment replicas

---

### `test-autoscale.ps1` - Test auto-scaling
**Mô tả**: Tạo load để trigger HPA auto-scaling

**Cách dùng**:
```powershell
# Test server app (mặc định: 60s, 10 threads)
.\test-autoscale.ps1 -Target server

# Custom duration & threads
.\test-autoscale.ps1 -Target server -Duration 120 -Threads 30

# Test client app
.\test-autoscale.ps1 -Target client -Duration 60 -Threads 20
```

**Targets**: server, client, restaurant, admin, drone

**Thời gian**: Tùy parameter Duration

---

### `demo-autoscale.ps1` - Demo auto-scaling nhanh
**Mô tả**: Demo auto-scaling với output real-time mỗi 5s

**Cách dùng**:
```powershell
.\demo-autoscale.ps1
```

**Thời gian**: 60 giây

---

### `autoscale-guide.ps1` - Hướng dẫn test auto-scaling
**Mô tả**: Hiển thị hướng dẫn và status của HPA

**Cách dùng**:
```powershell
.\autoscale-guide.ps1
```

---

## 🔧 UTILITY SCRIPTS

### `diagnostic.ps1` - Thu thập thông tin hệ thống
**Mô tả**: Generate report đầy đủ về K8s, pods, services, logs

**Cách dùng**:
```powershell
.\diagnostic.ps1
```

**Output**: File `diagnostic-report-YYYYMMDD-HHmmss.txt`

**Bao gồm**:
- Cluster info
- Nodes status
- All pods & services
- HPA status
- Metrics Server
- Recent events
- Failed pod logs
- ConfigMap & Secrets

---

### `start-docker.ps1` - Khởi động Docker Compose
**Mô tả**: Chạy ứng dụng bằng Docker Compose (không dùng K8s)

**Cách dùng**:
```powershell
.\start-docker.ps1
```

**URLs**:
- Client: http://localhost:3000
- Server: http://localhost:5000

---

### `start.ps1` - Khởi động development mode
**Mô tả**: Chạy ứng dụng trong dev mode (không Docker)

**Cách dùng**:
```powershell
.\start.ps1
```

---

## 📖 DOCUMENTATION FILES

### `KUBERNETES_GRAFANA_GUIDE.md` - Hướng dẫn đầy đủ
**Mô tả**: Hướng dẫn chi tiết từ đầu đến cuối về K8s & Grafana

**Nội dung**:
- Chuẩn bị môi trường
- Cài đặt Kubernetes
- Build & Deploy
- Cài Grafana
- Cấu hình dashboards
- Troubleshooting

---

### `K8S_QUICKSTART.md` - Quick Start
**Mô tả**: Hướng dẫn nhanh 5 bước

**Nội dung**:
- Enable K8s
- Build images
- Deploy app
- Setup Grafana
- Access URLs

---

### `SCRIPTS_REFERENCE.md` - File này
**Mô tả**: Danh sách tất cả scripts và cách dùng

---

## 🎯 WORKFLOW THƯỜNG DÙNG

### 1. Setup lần đầu (từ đầu)
```powershell
# Cách 1: Tự động toàn bộ
.\setup-all.ps1

# Cách 2: Từng bước
.\build-images.ps1
.\k8s\setup-k8s.ps1
.\setup-grafana.ps1
```

---

### 2. Update code và redeploy
```powershell
# 1. Build lại images
docker build -t ductoanoxo/foodfast-server:latest ./server_app

# 2. Restart deployment
kubectl rollout restart deployment/server-app -n foodfast

# 3. Xem logs
kubectl logs -f deployment/server-app -n foodfast
```

---

### 3. Test auto-scaling
```powershell
# Terminal 1: Monitor
.\monitor-autoscale.ps1

# Terminal 2: Tạo load
.\test-autoscale.ps1 -Target server -Duration 120 -Threads 30

# Browser: Grafana
# http://localhost:32000
```

---

### 4. Troubleshooting
```powershell
# Kiểm tra tất cả
.\diagnostic.ps1

# Xem pods
kubectl get pods -n foodfast

# Xem logs pod cụ thể
kubectl logs <pod-name> -n foodfast

# Describe pod để xem events
kubectl describe pod <pod-name> -n foodfast

# Restart deployment
kubectl rollout restart deployment/<deployment-name> -n foodfast
```

---

### 5. Cleanup (xóa tất cả)
```powershell
# Xóa namespace foodfast
kubectl delete namespace foodfast

# Xóa monitoring
helm uninstall prometheus-stack -n monitoring
kubectl delete namespace monitoring

# Xóa metrics server
kubectl delete deployment metrics-server -n kube-system
```

---

## 🔍 KUBECTL COMMANDS THƯỜNG DÙNG

### Xem resources
```powershell
# Xem tất cả pods
kubectl get pods -n foodfast

# Xem pods real-time (watch)
kubectl get pods -n foodfast -w

# Xem chi tiết pod
kubectl describe pod <pod-name> -n foodfast

# Xem services
kubectl get svc -n foodfast

# Xem HPA
kubectl get hpa -n foodfast

# Xem HPA real-time
kubectl get hpa -n foodfast -w
```

---

### Logs
```powershell
# Xem logs deployment
kubectl logs deployment/server-app -n foodfast

# Xem logs real-time
kubectl logs -f deployment/server-app -n foodfast

# Xem logs pod cụ thể
kubectl logs <pod-name> -n foodfast

# Xem logs 100 dòng cuối
kubectl logs --tail=100 <pod-name> -n foodfast
```

---

### Restart & Update
```powershell
# Restart deployment
kubectl rollout restart deployment/server-app -n foodfast

# Xem rollout status
kubectl rollout status deployment/server-app -n foodfast

# Scale manual
kubectl scale deployment/server-app --replicas=5 -n foodfast
```

---

### Metrics
```powershell
# CPU/Memory nodes
kubectl top nodes

# CPU/Memory pods
kubectl top pods -n foodfast

# CPU/Memory pod cụ thể
kubectl top pod <pod-name> -n foodfast
```

---

### Port Forward
```powershell
# Forward port từ service
kubectl port-forward svc/server-svc 5000:5000 -n foodfast

# Forward port từ pod
kubectl port-forward <pod-name> 5000:5000 -n foodfast

# Forward Grafana nếu NodePort không hoạt động
kubectl port-forward -n monitoring svc/prometheus-stack-grafana 3000:80
```

---

## 📊 GRAFANA DASHBOARD IDS

Import các dashboard này vào Grafana:

| Dashboard | ID | Mô tả |
|-----------|-----|-------|
| **Kubernetes Cluster Monitoring** | 7249 | Overview toàn bộ cluster |
| **Kubernetes Pods** | 6417 | Chi tiết pods |
| **Node Exporter Full** | 1860 | Chi tiết nodes |
| **Kubernetes Deployment Statefulset** | 8588 | Deployments & StatefulSets |
| **Kubernetes API Server** | 12006 | API Server metrics |

**Cách import**:
1. Grafana → + → Import
2. Nhập Dashboard ID
3. Chọn Prometheus data source
4. Click Import

---

## 🚨 EMERGENCY COMMANDS

### Tất cả pods bị lỗi
```powershell
# Delete tất cả pods (sẽ tự tạo lại)
kubectl delete pods --all -n foodfast

# Restart tất cả deployments
kubectl rollout restart deployment -n foodfast
```

---

### HPA không hoạt động
```powershell
# Delete và recreate HPA
kubectl delete hpa --all -n foodfast
kubectl apply -f k8s/hpa.yaml
```

---

### Metrics Server lỗi
```powershell
# Reinstall Metrics Server
kubectl delete deployment metrics-server -n kube-system
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
```

---

### Grafana không truy cập được
```powershell
# Port forward Grafana
kubectl port-forward -n monitoring svc/prometheus-stack-grafana 3000:80

# Truy cập: http://localhost:3000
```

---

**Last Updated**: November 18, 2025  
**Version**: 1.0.0
