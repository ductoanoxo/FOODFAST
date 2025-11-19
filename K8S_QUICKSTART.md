# 🚀 QUICK START - KUBERNETES & GRAFANA

> Hướng dẫn nhanh deploy FOODFAST lên Kubernetes và monitor bằng Grafana

---

## ⚡ SETUP NHANH (5 BƯỚC)

### 1️⃣ Enable Kubernetes
```
Docker Desktop → Settings → Kubernetes → ✅ Enable Kubernetes → Apply & Restart
```

### 2️⃣ Build Images
```powershell
.\build-images.ps1
```

### 3️⃣ Deploy App
```powershell
.\k8s\setup-k8s.ps1
```

### 4️⃣ Setup Grafana
```powershell
.\setup-grafana.ps1
```

### 5️⃣ Truy cập
```
🌐 Client:     http://localhost:30000
🌐 Restaurant: http://localhost:30001
🌐 Admin:      http://localhost:30002
🌐 Drone:      http://localhost:30003
🌐 API:        http://localhost:30050/api
📊 Grafana:    http://localhost:32000 (admin/admin123)
```

---

## 📊 MONITOR AUTO-SCALING

### Terminal 1: Tạo Load
```powershell
.\test-autoscale.ps1 -Target server -Duration 120 -Threads 30
```

### Terminal 2: Monitor
```powershell
.\monitor-autoscale.ps1
```

### Browser: Grafana
```
http://localhost:32000
→ Import Dashboard ID: 7249, 6417, 1860
→ Set Auto-refresh: 5s
```

---

## 🔧 TROUBLESHOOTING

### Kiểm tra tất cả
```powershell
.\diagnostic.ps1
```

### Xem logs
```powershell
kubectl logs -f deployment/server-app -n foodfast
```

### Restart pods
```powershell
kubectl rollout restart deployment/server-app -n foodfast
```

---

## 📖 HƯỚNG DẪN ĐẦY ĐỦ

👉 Xem file: **KUBERNETES_GRAFANA_GUIDE.md**

---

## 🎯 CHECKLIST

- [ ] Docker Desktop running + K8s enabled (icon xanh)
- [ ] Images đã build: `docker images | Select-String foodfast`
- [ ] Pods running: `kubectl get pods -n foodfast`
- [ ] Metrics OK: `kubectl top pods -n foodfast`
- [ ] Grafana truy cập được: http://localhost:32000
- [ ] HPA hoạt động: `kubectl get hpa -n foodfast`

---

**Made with ❤️ by FOODFAST Team**
