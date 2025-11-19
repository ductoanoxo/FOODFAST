# 🔧 FIX: Grafana Dashboard "No Data"

## Vấn đề
Dashboard Grafana hiển thị "No data" ở tất cả panels mặc dù pods đang chạy.

---

## ✅ Giải pháp nhanh (5 bước)

### Bước 1: Verify Prometheus đang scrape metrics

```powershell
# Port forward Prometheus
kubectl port-forward -n monitoring svc/prometheus-stack-kube-prom-prometheus 9090:9090
```

Mở **http://localhost:9090/targets** → Tất cả targets phải **UP** (màu xanh)

---

### Bước 2: Test query đơn giản trong Prometheus

Vào **http://localhost:9090/graph** và test queries:

```promql
# Test 1: Pods có đang chạy?
kube_pod_info{namespace="foodfast"}

# Test 2: Container metrics có không?
container_cpu_usage_seconds_total{namespace="foodfast"}

# Test 3: Đếm số pods
count(kube_pod_info{namespace="foodfast"})
```

**Nếu có kết quả** → Prometheus hoạt động OK, vấn đề ở Grafana  
**Nếu KHÔNG có kết quả** → Prometheus chưa scrape được → Làm Bước 3

---

### Bước 3: Tạo/Fix ServiceMonitor

```powershell
# Kiểm tra ServiceMonitor có tồn tại không
kubectl get servicemonitor -n monitoring | Select-String foodfast
```

**Nếu KHÔNG có**, tạo file `k8s/servicemonitor.yaml`:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: foodfast-monitor
  namespace: monitoring
  labels:
    release: prometheus-stack  # ← QUAN TRỌNG!
spec:
  selector:
    matchLabels:
      app: server-app
  namespaceSelector:
    matchNames:
      - foodfast
  endpoints:
    - port: http
      interval: 30s
```

Apply:
```powershell
kubectl apply -f k8s/servicemonitor.yaml
```

**CHÚ Ý**: Label `release: prometheus-stack` là BẮT BUỘC!

---

### Bước 4: Sử dụng PromQL queries ĐÃ TEST

Thay vì dùng queries phức tạp, copy các queries này vào Grafana:

#### 📊 Panel: Số Pods đang chạy
```promql
count(kube_pod_info{namespace="foodfast"})
```
**Visualization**: Stat  
**Unit**: `short`

---

#### 📊 Panel: CPU Usage by Pod
```promql
sum(rate(container_cpu_usage_seconds_total{namespace="foodfast", container!="POD", container!=""}[5m])) by (pod)
```
**Visualization**: Time series  
**Legend**: `{{pod}}`  
**Unit**: `cores`

---

#### 📊 Panel: Memory Usage by Pod
```promql
sum(container_memory_working_set_bytes{namespace="foodfast", container!="POD", container!=""}) by (pod)
```
**Visualization**: Time series  
**Legend**: `{{pod}}`  
**Unit**: `bytes`

---

#### 📊 Panel: Pod Status
```promql
sum by (phase) (kube_pod_status_phase{namespace="foodfast"})
```
**Visualization**: Pie chart  
**Legend**: `{{phase}}`

---

#### 📊 Panel: HPA Current Replicas
```promql
kube_horizontalpodautoscaler_status_current_replicas{namespace="foodfast"}
```
**Visualization**: Time series  
**Legend**: `{{horizontalpodautoscaler}}`

---

#### 📊 Panel: Network Receive
```promql
sum(rate(container_network_receive_bytes_total{namespace="foodfast"}[5m])) by (pod)
```
**Visualization**: Time series  
**Legend**: `{{pod}}`  
**Unit**: `Bps`

---

### Bước 5: Đổi Time Range trong Grafana

1. Click **Time range** (góc phải)
2. Chọn **Last 15 minutes** hoặc **Last 1 hour**
3. Bật **Auto-refresh**: `5s`
4. Click **Refresh** (🔄)

---

## 🚀 Script tự động kiểm tra

Tạo file `check-grafana-data.ps1`:

```powershell
Write-Host "=== KIỂM TRA GRAFANA DATA ===" -ForegroundColor Cyan
Write-Host ""

# 1. Kiểm tra Prometheus pods
Write-Host "[1/5] Checking Prometheus pods..." -ForegroundColor Yellow
$promPods = kubectl get pods -n monitoring -l app.kubernetes.io/name=prometheus -o json | ConvertFrom-Json
if ($promPods.items.Count -gt 0) {
    Write-Host "✅ Prometheus pods: RUNNING" -ForegroundColor Green
} else {
    Write-Host "❌ Prometheus pods: NOT FOUND" -ForegroundColor Red
}

# 2. Kiểm tra ServiceMonitor
Write-Host "`n[2/5] Checking ServiceMonitor..." -ForegroundColor Yellow
$sm = kubectl get servicemonitor foodfast-monitor -n monitoring 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ServiceMonitor: EXISTS" -ForegroundColor Green
} else {
    Write-Host "❌ ServiceMonitor: NOT FOUND" -ForegroundColor Red
    Write-Host "   → Run: kubectl apply -f k8s/servicemonitor.yaml" -ForegroundColor Cyan
}

# 3. Kiểm tra FOODFAST pods
Write-Host "`n[3/5] Checking FOODFAST pods..." -ForegroundColor Yellow
$foodfastPods = kubectl get pods -n foodfast -o json | ConvertFrom-Json
$runningCount = ($foodfastPods.items | Where-Object { $_.status.phase -eq "Running" }).Count
Write-Host "✅ FOODFAST pods running: $runningCount" -ForegroundColor Green

# 4. Port forward và test Prometheus API
Write-Host "`n[4/5] Testing Prometheus API..." -ForegroundColor Yellow
$job = Start-Job -ScriptBlock {
    kubectl port-forward -n monitoring svc/prometheus-stack-kube-prom-prometheus 9092:9090
}
Start-Sleep -Seconds 5

try {
    $query = [System.Web.HttpUtility]::UrlEncode("up{namespace='foodfast'}")
    $response = Invoke-RestMethod -Uri "http://localhost:9092/api/v1/query?query=$query" -TimeoutSec 5
    
    if ($response.status -eq "success" -and $response.data.result.Count -gt 0) {
        Write-Host "✅ Prometheus API: WORKING (found $($response.data.result.Count) metrics)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Prometheus API: NO DATA" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Prometheus API: ERROR - $_" -ForegroundColor Red
}

Stop-Job $job
Remove-Job $job

# 5. Recommendations
Write-Host "`n[5/5] Recommendations:" -ForegroundColor Yellow
Write-Host "   1. Open Grafana: http://localhost:32000" -ForegroundColor Cyan
Write-Host "   2. Login: admin / admin123" -ForegroundColor Cyan
Write-Host "   3. Create new dashboard with queries from GRAFANA_NO_DATA_FIX.md" -ForegroundColor Cyan
Write-Host "   4. Set Time Range: Last 15 minutes" -ForegroundColor Cyan
Write-Host "   5. Enable Auto-refresh: 5s" -ForegroundColor Cyan
Write-Host ""
```

Chạy:
```powershell
.\check-grafana-data.ps1
```

---

## 📋 Checklist

- [ ] Prometheus pods đang Running
- [ ] ServiceMonitor `foodfast-monitor` tồn tại và có label `release: prometheus-stack`
- [ ] FOODFAST pods đang Running
- [ ] Prometheus scrape targets đều UP (http://localhost:9090/targets)
- [ ] Test query `kube_pod_info{namespace="foodfast"}` có kết quả
- [ ] Grafana Time Range = Last 15 minutes
- [ ] Grafana Auto-refresh = 5s
- [ ] Dashboard dùng PromQL queries từ file này

---

## 🆘 Vẫn không có data?

### Option 1: Restart Prometheus

```powershell
kubectl rollout restart statefulset prometheus-prometheus-stack-kube-prom-prometheus -n monitoring
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=prometheus -n monitoring --timeout=120s
```

### Option 2: Xóa và cài lại Prometheus

```powershell
# Xóa
helm uninstall prometheus-stack -n monitoring

# Cài lại
.\setup-grafana.ps1
```

### Option 3: Kiểm tra logs

```powershell
# Prometheus logs
kubectl logs -n monitoring -l app.kubernetes.io/name=prometheus --tail=50

# Prometheus Operator logs
kubectl logs -n monitoring -l app.kubernetes.io/name=prometheus-operator --tail=50
```

Tìm errors liên quan đến "scrape" hoặc "target"

---

## 💡 Tips

1. **Luôn bắt đầu với query đơn giản**: `up`, `kube_pod_info`
2. **Kiểm tra Time Range**: Đảm bảo có data trong khoảng thời gian đang chọn
3. **Test trong Prometheus trước**: http://localhost:9090/graph
4. **ServiceMonitor PHẢI có label đúng**: `release: prometheus-stack`
5. **Container name phải filter**: `container!="POD"` để loại bỏ pause containers

---

## 📚 Xem thêm

- **KUBERNETES_GRAFANA_GUIDE.md**: Hướng dẫn chi tiết từ đầu đến cuối
- **Section 7**: Có 10+ PromQL queries đã test
- **Section 9**: Troubleshooting đầy đủ
