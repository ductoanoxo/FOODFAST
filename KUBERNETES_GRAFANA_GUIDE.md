# 🚀 HƯỚNG DẪN KUBERNETES & GRAFANA - FOODFAST

> **Hướng dẫn đầy đủ**: Từ setup Kubernetes → Deploy ứng dụng → Cài Grafana → Monitor real-time

---

## 📋 MỤC LỤC

1. [Chuẩn bị môi trường](#1-chuẩn-bị-môi-trường)
2. [Cài đặt & Kích hoạt Kubernetes](#2-cài-đặt--kích-hoạt-kubernetes)
3. [Build Docker Images](#3-build-docker-images)
4. [Deploy ứng dụng lên Kubernetes](#4-deploy-ứng-dụng-lên-kubernetes)
5. [Cài đặt Monitoring Stack (Prometheus + Grafana)](#5-cài-đặt-monitoring-stack-prometheus--grafana)
6. [Truy cập Grafana Dashboard](#6-truy-cập-grafana-dashboard)
7. [Cấu hình Dashboard cho FOODFAST](#7-cấu-hình-dashboard-cho-foodfast)
8. [Auto-Scaling & Monitoring](#8-auto-scaling--monitoring)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. CHUẨN BỊ MÔI TRƯỜNG

### ✅ Yêu cầu hệ thống

- **OS**: Windows 10/11 Pro/Enterprise (hỗ trợ Hyper-V)
- **RAM**: Tối thiểu 8GB (khuyến nghị 16GB)
- **Disk**: 20GB trống
- **Docker Desktop**: Version 4.0 trở lên

### 📦 Cài đặt Docker Desktop

1. Tải Docker Desktop: https://www.docker.com/products/docker-desktop
2. Cài đặt và khởi động lại máy nếu cần
3. Mở Docker Desktop và chờ khởi động hoàn tất

---

## 2. CÀI ĐẶT & KÍCH HOẠT KUBERNETES

### Bước 1: Bật Kubernetes trong Docker Desktop

1. Mở **Docker Desktop**
2. Click vào **Settings** (⚙️ góc trên bên phải)
3. Chọn tab **Kubernetes**
4. ✅ Tick vào **Enable Kubernetes**
5. ✅ Tick vào **Show system containers (advanced)**
6. Click **Apply & Restart**
7. Đợi 2-5 phút cho Kubernetes khởi động (icon K8s chuyển sang màu xanh)

![Kubernetes Status](https://i.imgur.com/example-k8s.png)

### Bước 2: Kiểm tra Kubernetes

```powershell
# Kiểm tra kubectl
kubectl version --client

# Kiểm tra cluster
kubectl cluster-info

# Kiểm tra nodes
kubectl get nodes
```

**Expected Output:**
```
NAME             STATUS   ROLES           AGE   VERSION
docker-desktop   Ready    control-plane   1h    v1.28.2
```

---

## 3. BUILD DOCKER IMAGES

### Bước 1: Di chuyển vào thư mục dự án

```powershell
cd D:\TESTFOOD\FOODFAST
```

### Bước 2: Build tất cả images

**Cách 1: Build tự động bằng script**

```powershell
.\build-images.ps1
```

**Cách 2: Build thủ công từng image**

```powershell
# Build Server (Backend API)
docker build -t ductoanoxo/foodfast-server:latest ./server_app

# Build Client App (Frontend)
docker build --build-arg VITE_API_URL=http://localhost:30050/api --build-arg VITE_SOCKET_URL=http://localhost:30050 -t ductoanoxo/foodfast-client:latest ./client_app

# Build Restaurant App
docker build --build-arg VITE_API_URL=http://localhost:30050/api --build-arg VITE_SOCKET_URL=http://localhost:30050 -t ductoanoxo/foodfast-restaurant:latest ./restaurant_app

# Build Admin App
docker build --build-arg VITE_API_URL=http://localhost:30050/api --build-arg VITE_SOCKET_URL=http://localhost:30050 -t ductoanoxo/foodfast-admin:latest ./admin_app

# Build Drone Management App
docker build --build-arg VITE_API_URL=http://localhost:30050/api --build-arg VITE_SOCKET_URL=http://localhost:30050 -t ductoanoxo/foodfast-drone:latest ./drone_manage
```

### Bước 3: Kiểm tra images đã build

```powershell
docker images | Select-String "foodfast"
```

**Expected Output:**
```
ductoanoxo/foodfast-server        latest    abc123def    5 minutes ago   1.2GB
ductoanoxo/foodfast-client        latest    def456ghi    3 minutes ago   150MB
ductoanoxo/foodfast-restaurant    latest    ghi789jkl    2 minutes ago   145MB
ductoanoxo/foodfast-admin         latest    jkl012mno    1 minute ago    140MB
ductoanoxo/foodfast-drone         latest    mno345pqr    30 seconds ago  138MB
```

---

## 4. DEPLOY ỨNG DỤNG LÊN KUBERNETES

### Bước 1: Chuẩn bị Secret (MongoDB URI)

```powershell
# Edit file secret.yaml
notepad k8s\secret.yaml
```

Cập nhật `MONGO_URI` với connection string thực tế:
```yaml
MONGO_URI: bW9uZ29kYitzcnY6Ly9...  # Base64 encoded
```

Encode MongoDB URI:
```powershell
# Encode MongoDB URI sang Base64
$mongoUri = "mongodb+srv://username:password@cluster.mongodb.net/foodfast"
$bytes = [System.Text.Encoding]::UTF8.GetBytes($mongoUri)
[Convert]::ToBase64String($bytes)
```

### Bước 2: Deploy toàn bộ bằng script tự động

```powershell
.\k8s\setup-k8s.ps1
```

Script sẽ hỏi:
- ❓ **Deploy MongoDB locally?** → Chọn `n` (nếu dùng MongoDB Atlas)
- ❓ **Deploy Ingress Controller?** → Chọn `n` (dùng NodePort đơn giản hơn)
- ❓ **Deploy HPA?** → Chọn `y` (cho auto-scaling)

### Bước 3: Hoặc deploy thủ công từng bước

```powershell
# 1. Tạo namespace
kubectl apply -f k8s/namespace.yaml

# 2. Tạo Secret (credentials)
kubectl apply -f k8s/secret.yaml

# 3. Tạo ConfigMap (cấu hình)
kubectl apply -f k8s/configmap.yaml

# 4. Deploy Server (Backend API)
kubectl apply -f k8s/server-deployment.yaml

# 5. Deploy Client Apps (Frontend)
kubectl apply -f k8s/client-apps-deployment.yaml

# 6. Deploy HPA (Auto-Scaling)
kubectl apply -f k8s/hpa.yaml
```

### Bước 4: Kiểm tra deployment

```powershell
# Xem tất cả pods
kubectl get pods -n foodfast

# Xem services
kubectl get svc -n foodfast

# Xem HPA (Auto-Scaling)
kubectl get hpa -n foodfast
```

**Expected Output:**
```
NAME                             READY   STATUS    RESTARTS   AGE
server-app-6d49fd6df9-5s8jv      1/1     Running   0          2m
server-app-6d49fd6df9-n8wnd      1/1     Running   0          2m
client-app-85bd5c54c-5qcnn       1/1     Running   0          2m
client-app-85bd5c54c-c9bsr       1/1     Running   0          2m
restaurant-app-8fb7bc65f-lpjjg   1/1     Running   0          2m
admin-app-75d5fb9bc9-xn5pf       1/1     Running   0          2m
drone-app-9585d5cbb-d4tfk        1/1     Running   0          2m
```

### Bước 5: Truy cập ứng dụng

| Ứng dụng | URL | Port |
|----------|-----|------|
| **Client** | http://localhost:30000 | 30000 |
| **Restaurant** | http://localhost:30001 | 30001 |
| **Admin** | http://localhost:30002 | 30002 |
| **Drone** | http://localhost:30003 | 30003 |
| **API Server** | http://localhost:30050/api | 30050 |

---

## 5. CÀI ĐẶT MONITORING STACK (PROMETHEUS + GRAFANA)

### Bước 1: Cài đặt Metrics Server (bắt buộc)

```powershell
# Cài Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Patch cho Docker Desktop (bỏ qua TLS)
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'

# Đợi 30 giây
Start-Sleep -Seconds 30

# Kiểm tra
kubectl top nodes
kubectl top pods -n foodfast
```

### Bước 2: Cài đặt Prometheus & Grafana bằng Helm

#### 2.1. Cài đặt Helm (nếu chưa có)

```powershell
# Download Helm
choco install kubernetes-helm

# Hoặc download từ: https://github.com/helm/helm/releases
```

#### 2.2. Add Prometheus Community Helm Repo

```powershell
# Add repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

# Update repo
helm repo update

# Kiểm tra
helm search repo prometheus-community
```

#### 2.3. Tạo namespace cho monitoring

```powershell
kubectl create namespace monitoring
```

#### 2.4. Cài đặt kube-prometheus-stack (bao gồm Prometheus + Grafana)

```powershell
helm install prometheus-stack prometheus-community/kube-prometheus-stack `
  --namespace monitoring `
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false `
  --set grafana.adminPassword=admin123 `
  --set grafana.service.type=NodePort `
  --set grafana.service.nodePort=32000 `
  --set prometheus.service.type=NodePort `
  --set prometheus.service.nodePort=32001 `
  --set prometheus-node-exporter.enabled=false
```

**Giải thích các tham số:**
- `grafana.adminPassword=admin123`: Password cho Grafana (user: admin)
- `grafana.service.type=NodePort`: Expose Grafana qua NodePort
- `grafana.service.nodePort=32000`: Port để truy cập Grafana
- `prometheus.service.nodePort=32001`: Port để truy cập Prometheus UI
- `prometheus-node-exporter.enabled=false`: **Tắt node-exporter (fix lỗi trên Docker Desktop Windows)**

### Bước 3: Kiểm tra Monitoring Stack

```powershell
# Xem pods monitoring
kubectl get pods -n monitoring

# Xem services monitoring
kubectl get svc -n monitoring
```

**Expected Output:**
```
NAME                                             READY   STATUS    RESTARTS   AGE
prometheus-stack-kube-prom-operator-...          1/1     Running   0          2m
prometheus-stack-kube-state-metrics-...          1/1     Running   0          2m
prometheus-stack-prometheus-node-exporter-...    1/1     Running   0          2m
prometheus-stack-grafana-...                     3/3     Running   0          2m
alertmanager-prometheus-stack-kube-prom-...      2/2     Running   0          2m
prometheus-prometheus-stack-kube-prom-...        2/2     Running   0          2m
```

### Bước 4: Tạo ServiceMonitor cho FOODFAST

Tạo file `k8s/servicemonitor.yaml`:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: foodfast-monitor
  namespace: monitoring
  labels:
    app: foodfast
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
      path: /metrics
```

Apply ServiceMonitor:

```powershell
kubectl apply -f k8s/servicemonitor.yaml
```

---

## 6. TRUY CẬP GRAFANA DASHBOARD

### Bước 1: Truy cập Grafana

Mở trình duyệt và truy cập:

**URL**: http://localhost:32000

**Login credentials:**
- **Username**: `admin`
- **Password**: `admin123`

### Bước 2: Thêm Prometheus Data Source (nếu chưa có)

1. Click vào **Configuration** (⚙️) → **Data Sources**
2. Click **Add data source**
3. Chọn **Prometheus**
4. Nhập URL: `http://prometheus-stack-kube-prom-prometheus.monitoring.svc.cluster.local:9090`
5. Click **Save & Test**

![Grafana Data Source](https://i.imgur.com/example-datasource.png)

### Bước 3: Import Dashboard mặc định

1. Click vào **+** → **Import**
2. Nhập Dashboard ID từ Grafana.com:
   - **Kubernetes Cluster Monitoring**: `7249`
   - **Kubernetes Pods**: `6417`
   - **Node Exporter Full**: `1860`
3. Chọn **Prometheus** data source
4. Click **Import**

---

## 7. CẤU HÌNH DASHBOARD CHO FOODFAST

### 🎯 Cách tạo Dashboard mới

1. Mở Grafana: http://localhost:32000
2. Click **+ (Create)** → **Dashboard**
3. Click **Add visualization**
4. Chọn **Prometheus** data source
5. Nhập PromQL query vào **Metrics browser**

---

### 📊 Dashboard 1: FOODFAST Overview

#### Panel 1: Running Pods Count
**Visualization Type**: Stat  
**PromQL Query**:
```promql
count(kube_pod_info{namespace="foodfast"})
```
**Description**: Tổng số pods đang chạy trong namespace foodfast

---

#### Panel 2: Pod Status by Phase
**Visualization Type**: Pie Chart  
**PromQL Query**:
```promql
sum by (phase) (kube_pod_status_phase{namespace="foodfast"})
```
**Description**: Phân bố trạng thái pods (Running, Pending, Failed)

**Legend**: `{{phase}}`

---

#### Panel 3: CPU Usage by Pod
**Visualization Type**: Time series (Graph)  
**PromQL Query**:
```promql
sum(rate(container_cpu_usage_seconds_total{namespace="foodfast", container!="", container!="POD"}[5m])) by (pod)
```
**Description**: CPU usage theo từng pod (cores/second)

**Legend**: `{{pod}}`  
**Unit**: `cores`

---

#### Panel 4: Memory Usage by Pod
**Visualization Type**: Time series (Graph)  
**PromQL Query**:
```promql
sum(container_memory_working_set_bytes{namespace="foodfast", container!="", container!="POD"}) by (pod)
```
**Description**: Memory usage theo từng pod (bytes)

**Legend**: `{{pod}}`  
**Unit**: `bytes`

---

#### Panel 5: Memory Usage (%)
**Visualization Type**: Gauge  
**PromQL Query**:
```promql
sum(container_memory_working_set_bytes{namespace="foodfast", container!="POD", container!=""}) / 
sum(container_spec_memory_limit_bytes{namespace="foodfast", container!="POD", container!=""}) * 100
```
**Description**: Tỷ lệ % memory đang dùng so với limit

**Unit**: `percent (0-100)`  
**Thresholds**: Green (0-70), Yellow (70-85), Red (85-100)

---

#### Panel 6: CPU Usage (%)
**Visualization Type**: Gauge  
**PromQL Query**:
```promql
sum(rate(container_cpu_usage_seconds_total{namespace="foodfast", container!="POD", container!=""}[5m])) /
sum(container_spec_cpu_quota{namespace="foodfast", container!="POD", container!=""}/container_spec_cpu_period{namespace="foodfast", container!="POD", container!=""}) * 100
```
**Description**: Tỷ lệ % CPU đang dùng so với limit

**Unit**: `percent (0-100)`  
**Thresholds**: Green (0-60), Yellow (60-80), Red (80-100)

---

#### Panel 7: Network Receive Rate
**Visualization Type**: Time series (Graph)  
**PromQL Query**:
```promql
sum(rate(container_network_receive_bytes_total{namespace="foodfast"}[5m])) by (pod)
```
**Description**: Tốc độ nhận dữ liệu qua network (bytes/second)

**Legend**: `{{pod}}`  
**Unit**: `Bps` (bytes per second)

---

#### Panel 8: Network Transmit Rate
**Visualization Type**: Time series (Graph)  
**PromQL Query**:
```promql
sum(rate(container_network_transmit_bytes_total{namespace="foodfast"}[5m])) by (pod)
```
**Description**: Tốc độ gửi dữ liệu qua network (bytes/second)

**Legend**: `{{pod}}`  
**Unit**: `Bps` (bytes per second)

---

#### Panel 9: Pod Restarts (Last 24h)
**Visualization Type**: Stat  
**PromQL Query**:
```promql
sum(increase(kube_pod_container_status_restarts_total{namespace="foodfast"}[24h])) by (pod)
```
**Description**: Số lần pods restart trong 24h qua

**Legend**: `{{pod}}`  
**Color**: Red if > 0

---

#### Panel 10: Container Ready Status
**Visualization Type**: Table  
**PromQL Query**:
```promql
kube_pod_container_status_ready{namespace="foodfast"}
```
**Description**: Trạng thái ready của từng container (1 = ready, 0 = not ready)

**Columns**: `pod`, `container`, `Value`

---

### 📈 Dashboard 2: HPA Auto-Scaling Monitoring

#### Panel 1: Current vs Desired Replicas
**Visualization Type**: Time series (Graph)  
**PromQL Queries**:
```promql
# Current replicas
kube_horizontalpodautoscaler_status_current_replicas{namespace="foodfast"}

# Desired replicas
kube_horizontalpodautoscaler_status_desired_replicas{namespace="foodfast"}
```
**Description**: So sánh số replicas hiện tại vs mong muốn

**Legend**: `Current: {{horizontalpodautoscaler}}` và `Desired: {{horizontalpodautoscaler}}`

---

#### Panel 2: HPA Target CPU vs Current
**Visualization Type**: Time series (Graph)  
**PromQL Queries**:
```promql
# Current CPU utilization (%)
100 * sum(rate(container_cpu_usage_seconds_total{namespace="foodfast", pod=~"server-app.*", container!="POD"}[5m])) /
sum(container_spec_cpu_quota{namespace="foodfast", pod=~"server-app.*", container!="POD"}/container_spec_cpu_period{namespace="foodfast", pod=~"server-app.*", container!="POD"})

# Target (constant)
30
```
**Description**: So sánh CPU hiện tại với target 30%

**Legend**: `Current CPU %` và `Target 30%`  
**Unit**: `percent (0-100)`

---

#### Panel 3: HPA Target Memory vs Current
**Visualization Type**: Time series (Graph)  
**PromQL Queries**:
```promql
# Current Memory utilization (%)
100 * sum(container_memory_working_set_bytes{namespace="foodfast", pod=~"server-app.*", container!="POD"}) /
sum(container_spec_memory_limit_bytes{namespace="foodfast", pod=~"server-app.*", container!="POD"})

# Target (constant)
40
```
**Description**: So sánh Memory hiện tại với target 40%

**Legend**: `Current Memory %` và `Target 40%`  
**Unit**: `percent (0-100)`

---

#### Panel 4: Replicas Count by Deployment
**Visualization Type**: Stat (multi-stat)  
**PromQL Query**:
```promql
kube_deployment_status_replicas{namespace="foodfast"}
```
**Description**: Số replicas của từng deployment

**Legend**: `{{deployment}}`

---

#### Panel 5: Available vs Unavailable Replicas
**Visualization Type**: Time series (Stacked)  
**PromQL Queries**:
```promql
# Available
kube_deployment_status_replicas_available{namespace="foodfast"}

# Unavailable
kube_deployment_status_replicas_unavailable{namespace="foodfast"}
```
**Description**: Phân biệt replicas available vs unavailable

**Legend**: `Available: {{deployment}}` và `Unavailable: {{deployment}}`

---

### 🔧 Dashboard 3: Resource Requests & Limits

#### Panel 1: CPU Requests vs Limits
**Visualization Type**: Bar gauge  
**PromQL Queries**:
```promql
# CPU Requests
sum(kube_pod_container_resource_requests{namespace="foodfast", resource="cpu", unit="core"}) by (pod)

# CPU Limits
sum(kube_pod_container_resource_limits{namespace="foodfast", resource="cpu", unit="core"}) by (pod)
```
**Description**: So sánh CPU requests vs limits

---

#### Panel 2: Memory Requests vs Limits
**Visualization Type**: Bar gauge  
**PromQL Queries**:
```promql
# Memory Requests
sum(kube_pod_container_resource_requests{namespace="foodfast", resource="memory", unit="byte"}) by (pod)

# Memory Limits
sum(kube_pod_container_resource_limits{namespace="foodfast", resource="memory", unit="byte"}) by (pod)
```
**Description**: So sánh Memory requests vs limits

**Unit**: `bytes`

---

### 💾 Lưu Dashboard

1. Click **Save dashboard** (💾 icon ở góc phải)
2. Đặt tên: `FOODFAST - Production Monitoring`
3. Thêm tags: `foodfast`, `kubernetes`, `production`
4. Click **Save**

---

### 🎨 Tùy chỉnh Dashboard

#### Thêm Variables (để filter động)

1. Click **Dashboard settings** (⚙️)
2. Vào tab **Variables**
3. Click **Add variable**

**Variable 1: Namespace**
- Name: `namespace`
- Type: `Query`
- Query: `label_values(kube_pod_info, namespace)`
- Regex: `foodfast`

**Variable 2: Pod**
- Name: `pod`
- Type: `Query`
- Query: `label_values(kube_pod_info{namespace="$namespace"}, pod)`

Sau đó sửa các PromQL queries thành:
```promql
sum(rate(container_cpu_usage_seconds_total{namespace="$namespace", pod="$pod"}[5m]))
```

---

### 🔄 Auto-Refresh

1. Click vào **Time range** dropdown (góc phải)
2. Chọn **Last 5 minutes**
3. Bật **Auto-refresh**: Chọn `5s` hoặc `10s`

Grafana sẽ tự động refresh data mỗi 5-10 giây!

---

## 8. AUTO-SCALING & MONITORING

### Test Auto-Scaling và xem trên Grafana

#### Terminal 1: Monitor HPA

```powershell
kubectl get hpa -n foodfast -w
```

#### Terminal 2: Tạo Load

```powershell
# Chạy script test auto-scaling
.\test-autoscale.ps1 -Target server -Duration 120 -Threads 30
```

#### Browser: Xem Grafana Real-time

1. Mở http://localhost:32000
2. Vào dashboard **FOODFAST - Production Monitoring**
3. Set time range: **Last 5 minutes** + **Auto-refresh: 5s**
4. Quan sát:
   - CPU Usage tăng lên
   - HPA tăng số replicas
   - Load balancing giữa các pods

![Grafana Auto-Scaling](https://i.imgur.com/example-autoscale.png)

---

### 🧪 Test Nhanh: Verify Data Flow

Chạy script kiểm tra toàn diện:

```powershell
# Test 1: Kiểm tra Prometheus targets
Write-Host "=== TEST 1: Prometheus Targets ===" -ForegroundColor Cyan
kubectl port-forward -n monitoring svc/prometheus-stack-kube-prom-prometheus 9091:9090 &
Start-Sleep -Seconds 5
Start-Process "http://localhost:9091/targets"

# Test 2: Kiểm tra metrics có tồn tại
Write-Host "`n=== TEST 2: Available Metrics ===" -ForegroundColor Cyan
$query = "up{namespace='foodfast'}"
$prometheusUrl = "http://localhost:9091/api/v1/query?query=$query"
Invoke-RestMethod -Uri $prometheusUrl | ConvertTo-Json -Depth 5

# Test 3: Kiểm tra ServiceMonitor
Write-Host "`n=== TEST 3: ServiceMonitor ===" -ForegroundColor Cyan
kubectl get servicemonitor -n monitoring
kubectl describe servicemonitor foodfast-monitor -n monitoring 2>$null

# Test 4: Kiểm tra pods trong namespace foodfast
Write-Host "`n=== TEST 4: FOODFAST Pods ===" -ForegroundColor Cyan
kubectl get pods -n foodfast

# Stop port-forward
Stop-Process -Name kubectl -ErrorAction SilentlyContinue
```

**Expected Results:**
- ✅ Test 1: Browser mở http://localhost:9091/targets, tất cả targets **UP**
- ✅ Test 2: JSON response có `"status":"success"` và data array
- ✅ Test 3: ServiceMonitor `foodfast-monitor` tồn tại
- ✅ Test 4: Tất cả pods **Running**

---

## 9. TROUBLESHOOTING

### ❌ Lỗi: Dashboard hiển thị "No data"

**Triệu chứng:**
- Tất cả panels trong Grafana đều hiển thị "No data"
- Dashboard không có dữ liệu mặc dù pods đang chạy

**Nguyên nhân:**
1. Prometheus chưa scrape được metrics
2. PromQL query sai hoặc metrics không tồn tại
3. ServiceMonitor chưa được tạo hoặc sai cấu hình
4. Time range không phù hợp

**Giải pháp:**

#### Bước 1: Kiểm tra Prometheus có scrape được targets không

```powershell
# Port forward Prometheus UI
kubectl port-forward -n monitoring svc/prometheus-stack-kube-prom-prometheus 9090:9090
```

Mở http://localhost:9090/targets và kiểm tra:
- ✅ Tất cả targets phải **UP** (màu xanh)
- ❌ Nếu có targets **DOWN** (màu đỏ) → Xem error message

#### Bước 2: Kiểm tra metrics có tồn tại không

Vào http://localhost:9090/graph và test query:

```promql
# Test query cơ bản
up

# Test metrics của namespace foodfast
kube_pod_info{namespace="foodfast"}

# Test container metrics
container_cpu_usage_seconds_total{namespace="foodfast"}
```

Nếu **không có kết quả** → Prometheus chưa scrape được metrics.

#### Bước 3: Kiểm tra ServiceMonitor

```powershell
# Xem ServiceMonitor
kubectl get servicemonitor -n monitoring

# Describe chi tiết
kubectl describe servicemonitor foodfast-monitor -n monitoring
```

**Nếu ServiceMonitor không tồn tại**, tạo lại:

```powershell
kubectl apply -f k8s/servicemonitor.yaml
```

Nội dung `k8s/servicemonitor.yaml`:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: foodfast-monitor
  namespace: monitoring
  labels:
    release: prometheus-stack
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

**CHÚ Ý**: Phải có label `release: prometheus-stack` để Prometheus nhận diện!

#### Bước 4: Kiểm tra Time Range trong Grafana

1. Mở dashboard
2. Click **Time range** (góc phải)
3. Đổi thành **Last 15 minutes** hoặc **Last 1 hour**
4. Click **Refresh**

#### Bước 5: Sử dụng PromQL queries đã test

Thay vì dùng queries phức tạp, bắt đầu với queries đơn giản:

**Query đơn giản nhất (luôn có data):**
```promql
up{namespace="foodfast"}
```

**Query hiển thị số pods:**
```promql
count(kube_pod_info{namespace="foodfast"})
```

**Query CPU usage (đã test):**
```promql
sum(rate(container_cpu_usage_seconds_total{namespace="foodfast", container!="POD"}[5m])) by (pod)
```

#### Bước 6: Restart Prometheus (nếu vẫn không có data)

```powershell
# Restart Prometheus pod
kubectl rollout restart statefulset prometheus-prometheus-stack-kube-prom-prometheus -n monitoring

# Đợi pod khởi động lại
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=prometheus -n monitoring --timeout=120s
```

#### Bước 7: Xóa cache Grafana

1. Trong Grafana, nhấn **Ctrl + Shift + R** (hard refresh)
2. Hoặc logout → login lại
3. Hoặc xóa browser cache

---

### ❌ Lỗi: Metrics Server không hoạt động

**Triệu chứng:**
```
kubectl top pods -n foodfast
error: Metrics API not available
```

**Giải pháp:**
```powershell
# Patch Metrics Server
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'

# Đợi pod restart
kubectl rollout status deployment metrics-server -n kube-system
```

---

### ❌ Lỗi: Grafana không truy cập được

**Triệu chứng:**
```
http://localhost:32000 → Connection refused
```

**Giải pháp:**
```powershell
# Kiểm tra Grafana service
kubectl get svc -n monitoring | Select-String grafana

# Port forward nếu NodePort không hoạt động
kubectl port-forward -n monitoring svc/prometheus-stack-grafana 3000:80
```

Truy cập: http://localhost:3000

---

### ❌ Lỗi: HPA hiển thị `<unknown>`

**Triệu chứng:**
```
NAME             TARGETS                         
server-app-hpa   cpu: <unknown>/30%
```

**Giải pháp:**
```powershell
# 1. Kiểm tra Metrics Server
kubectl get pods -n kube-system | Select-String metrics

# 2. Kiểm tra pods có resources.requests
kubectl describe pod <pod-name> -n foodfast | Select-String -Pattern "requests|limits" -Context 2

# 3. Restart HPA
kubectl delete hpa server-app-hpa -n foodfast
kubectl apply -f k8s/hpa.yaml
```

---

### ❌ Lỗi: Pods không kết nối được MongoDB

**Triệu chứng:**
```
kubectl logs <pod-name> -n foodfast
Error: connect ECONNREFUSED mongodb://...
```

**Giải pháp:**
```powershell
# 1. Kiểm tra Secret
kubectl get secret foodfast-secret -n foodfast -o yaml

# 2. Decode MONGO_URI để kiểm tra
$encoded = "bW9uZ29kYitzcnY6Ly8..."
[System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($encoded))

# 3. Test connection từ pod
kubectl exec -it <pod-name> -n foodfast -- sh
curl http://mongodb-service:27017
```

---

### ❌ Lỗi: Frontend không kết nối API

**Triệu chứng:**
```
Browser Console: ERR_CONNECTION_REFUSED http://localhost:5000/api/...
```

**Giải pháp:**
```powershell
# 1. Kiểm tra images có URL đúng không
docker run --rm ductoanoxo/foodfast-client:latest sh -c "grep -o 'localhost:30050/api' /usr/share/nginx/html/assets/*.js | head -1"

# 2. Rebuild images với URL đúng
docker build --build-arg VITE_API_URL=http://localhost:30050/api -t ductoanoxo/foodfast-client:latest ./client_app

# 3. Restart pods
kubectl rollout restart deployment/client-app -n foodfast
```

---

## 📊 TỔNG KẾT QUY TRÌNH

```
┌─────────────────────────────────────────────────────────────┐
│  1. Cài Docker Desktop + Enable Kubernetes                  │
│     docker version && kubectl version                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  2. Build Docker Images                                     │
│     .\build-images.ps1                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  3. Deploy lên Kubernetes                                   │
│     .\k8s\setup-k8s.ps1                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  4. Cài Metrics Server                                      │
│     kubectl apply -f metrics-server.yaml                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  5. Cài Prometheus + Grafana                                │
│     helm install prometheus-stack ...                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  6. Truy cập Grafana                                        │
│     http://localhost:32000                                  │
│     Username: admin / Password: admin123                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  7. Import Dashboard + Monitor                              │
│     Dashboard ID: 7249, 6417, 1860                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 CHECKLIST

### Trước khi deploy:

- [ ] Docker Desktop đã cài và running
- [ ] Kubernetes đã enable trong Docker Desktop (icon xanh)
- [ ] kubectl hoạt động: `kubectl version`
- [ ] Đã cập nhật MongoDB URI trong `k8s/secret.yaml`
- [ ] Đã build tất cả Docker images

### Sau khi deploy:

- [ ] Tất cả pods đang RUNNING: `kubectl get pods -n foodfast`
- [ ] Services đã expose: `kubectl get svc -n foodfast`
- [ ] HPA đang hoạt động: `kubectl get hpa -n foodfast`
- [ ] Metrics Server hoạt động: `kubectl top pods -n foodfast`
- [ ] Truy cập được ứng dụng: http://localhost:30000
- [ ] API hoạt động: http://localhost:30050/api/health

### Monitoring setup:

- [ ] Prometheus đã cài: `kubectl get pods -n monitoring`
- [ ] Grafana truy cập được: http://localhost:32000
- [ ] Data source Prometheus đã add
- [ ] Dashboard đã import
- [ ] Metrics hiển thị real-time

---

## 🔗 LINKS THAM KHẢO

- **Kubernetes Documentation**: https://kubernetes.io/docs/
- **Grafana Documentation**: https://grafana.com/docs/
- **Prometheus Documentation**: https://prometheus.io/docs/
- **Helm Charts**: https://artifacthub.io/
- **Grafana Dashboards**: https://grafana.com/grafana/dashboards/

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, chạy script diagnostic:

```powershell
# Tạo report đầy đủ
kubectl get all -n foodfast > foodfast-report.txt
kubectl get all -n monitoring >> foodfast-report.txt
kubectl describe pods -n foodfast >> foodfast-report.txt
kubectl logs -n foodfast --all-containers --tail=100 >> foodfast-report.txt
```

---

**Tác giả**: FOODFAST Team  
**Ngày cập nhật**: November 18, 2025  
**Version**: 1.0.0

