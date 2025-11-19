**Kubernetes & Grafana — FOODFAST (Tóm tắt)**

- **Mục tiêu:** Giám sát hiệu năng và hành vi autoscaling của `server-app` và các service liên quan trong cluster FOODFAST.

**1. Kiến trúc ngắn gọn**
- Ứng dụng được triển khai trên Kubernetes (Deployment, Service, HPA).
- Monitoring stack: `kube-prometheus-stack` (Prometheus + Grafana + Alertmanager).
- Grafana dùng để hiển thị dashboards, Prometheus là data source.

**2. Tại sao dùng Kubernetes + Grafana**
- **Tự động scale**: HPA (HorizontalPodAutoscaler) tự động điều chỉnh số pod dựa trên CPU/Memory.
- **Quan sát thời gian thực**: Grafana cho phép hiển thị metric, cảnh báo, và phân tích xu hướng.
- **Truy vết vấn đề**: Kết hợp `kubectl`, `kubectl top`, Prometheus queries để debug.

**2.1. Cách Grafana hoạt động (Luồng dữ liệu)**

```
┌─────────────┐      ┌──────────────┐      ┌────────────┐      ┌──────────┐
│ Kubernetes  │──────▶│  Prometheus  │──────▶│  Grafana   │──────▶│ Browser  │
│   Pods      │ scrape│  (Metrics DB)│ query │ (Dashboard)│ render│  (User)  │
└─────────────┘      └──────────────┘      └────────────┘      └──────────┘
     ▲                      ▲
     │                      │
     │                      └── cAdvisor (CPU/Memory metrics)
     └───────────────────────── kube-state-metrics (Pod/HPA status)
```

**Bước 1: Thu thập metrics (Prometheus scrapes)**
- **cAdvisor** (built-in Kubelet): Expose CPU, Memory, Network metrics của mỗi container
  - Endpoint: `http://kubelet:10250/metrics/cadvisor`
  - Metrics: `container_cpu_usage_seconds_total`, `container_memory_working_set_bytes`
- **kube-state-metrics**: Expose trạng thái Kubernetes objects (Pods, Deployments, HPA)
  - Metrics: `kube_pod_info`, `kube_horizontalpodautoscaler_status_*`
- **Prometheus** scrape các endpoints này mỗi 15-30s (tùy config)
  - Lưu vào time-series database (TSDB)

**Bước 2: Query metrics (PromQL)**
- Grafana gửi PromQL queries đến Prometheus API
- Ví dụ query CPU:
  ```promql
  avg(rate(container_cpu_usage_seconds_total{...}[5m]) * 1000) / 250 * 100
  ```
- Prometheus thực thi query và trả về kết quả dạng JSON:
  ```json
  {
    "data": {
      "result": [
        {"metric": {...}, "value": [timestamp, "2.5"]}
      ]
    }
  }
  ```

**Bước 3: Hiển thị (Grafana Panel)**
- Grafana nhận kết quả từ Prometheus
- Render thành visualization (Gauge, Graph, Stat, Table...)
- Áp dụng thresholds (màu sắc theo ngưỡng)
- Auto-refresh theo interval (5s, 10s, 30s...)

**Bước 4: Alerting (tùy chọn)**
- Grafana đánh giá alert rules
- Nếu metric vượt ngưỡng → gửi notification (email, Slack, webhook...)

**3. Các lệnh hữu ích**
- Kiểm tra HPA: `kubectl get hpa -n foodfast`
- Xem HPA chi tiết: `kubectl describe hpa server-app-hpa -n foodfast`
- Xem pods/CPU: `kubectl top pods -n foodfast -l app=server-app`
- Xem pods: `kubectl get pods -n foodfast -l app=server-app`
- Kiểm tra Prometheus (local): http://localhost:32001 (Prometheus UI)
- Grafana (local): http://localhost:32000 (admin/admin123)

**3.1. Hướng dẫn tạo Dashboard Grafana từ đầu**

**Cách 1: Import Dashboard JSON có sẵn** (Nhanh nhất)
```bash
# 1. Mở Grafana: http://localhost:32000
# 2. Login: admin / admin123
# 3. Vào menu "+" → "Import"
# 4. Chọn "Upload JSON file" → chọn k8s/grafana-dashboard-foodfast.json
# 5. Chọn Data Source: Prometheus
# 6. Click "Import"
```

**Cách 2: Tạo Panel thủ công** (Để hiểu rõ hơn)

**Bước 1: Tạo Dashboard mới**
- Vào Grafana → Menu "+" → "Dashboard"
- Click "Add new panel"

**Bước 2: Cấu hình Query**
- **Data source**: Chọn "Prometheus"
- **Query mode**: Chuyển từ "Builder" sang "Code" (quan trọng!)
- **Paste query** (ví dụ CPU):
  ```promql
  avg(rate(container_cpu_usage_seconds_total{namespace="foodfast",pod=~"server-app.*",cpu="total"}[5m]) * 1000) / 250 * 100
  ```

**Bước 3: Chọn Visualization**
- Click "Gauge" (hoặc "Time series" nếu muốn xem biểu đồ)

**Bước 4: Cấu hình Panel Settings** (bên phải)
- **Title**: "Server HPA - CPU Usage"
- **Unit**: Percent (0-100)
- **Min**: 0
- **Max**: 100
- **Decimals**: 1

**Bước 5: Cấu hình Thresholds**
- Click "Thresholds"
- Set values:
  - 🟢 **Base**: 0 (màu xanh lá)
  - 🟡 **Warning**: 30 (màu vàng - HPA sẽ scale ở đây)
  - 🔴 **Critical**: 70 (màu đỏ - tải cao)

**Bước 6: Test và Apply**
- Click "Run queries" để xem preview
- Nếu hiển thị ~2-5% và màu xanh → **Đúng!**
- Click "Apply" để lưu panel
- Click "Save dashboard" (icon đĩa mềm) → đặt tên → "Save"

**Bước 7: Thêm panel khác** (Memory, Pods count...)
- Click "Add" → "Visualization"
- Lặp lại Bước 2-6 với query khác

**Bước 8: Cấu hình Auto-refresh**
- Góc trên bên phải → Click dropdown "5s, 10s, 30s..."
- Chọn "10s" để dashboard tự refresh mỗi 10 giây

**4. PromQL — Query chuẩn khớp với `kubectl get hpa`**

**4.1. Giải thích PromQL cơ bản**

PromQL (Prometheus Query Language) là ngôn ngữ query để lấy metrics từ Prometheus.

**Cấu trúc cơ bản:**
```
metric_name{label1="value1", label2="value2"}
```

**Ví dụ:**
```promql
container_cpu_usage_seconds_total{namespace="foodfast", pod="server-app-xxx"}
```

**Các hàm phổ biến:**
- `rate(metric[5m])`: Tốc độ thay đổi trong 5 phút (cho counter metrics)
- `avg(metric)`: Trung bình của tất cả series
- `sum(metric)`: Tổng của tất cả series
- `max(metric)`, `min(metric)`: Giá trị lớn/nhỏ nhất
- `sum by (label)(metric)`: Tổng nhóm theo label

**4.2. Query CPU (chi tiết từng bước)**

**Mục tiêu:** Tính % CPU trung bình của các pods, giống `kubectl get hpa`

**Bước 1: Lấy CPU usage**
```promql
container_cpu_usage_seconds_total{namespace="foodfast",pod=~"server-app.*",cpu="total"}
```
- `container_cpu_usage_seconds_total`: Counter metric (tăng dần theo thời gian)
- `namespace="foodfast"`: Lọc namespace
- `pod=~"server-app.*"`: Regex match pods bắt đầu bằng "server-app"
- `cpu="total"`: Chỉ lấy tổng CPU (không lấy từng core riêng)

**Bước 2: Tính tốc độ (rate)**
```promql
rate(container_cpu_usage_seconds_total{...}[5m])
```
- `[5m]`: Window 5 phút (giống HPA)
- Kết quả: cores/second (ví dụ: 0.006)

**Bước 3: Chuyển cores → milli-cores**
```promql
rate(...)[5m] * 1000
```
- Kết quả: 6 milli-cores

**Bước 4: Trung bình các pods**
```promql
avg(rate(...)[5m] * 1000)
```
- Nếu có 5 pods: (6m + 5m + 6m + 6m + 6m) / 5 = 5.8m

**Bước 5: Chia cho CPU request**
```promql
avg(...) / 250
```
- 250 = CPU request của deployment (250m)
- Kết quả: 5.8 / 250 = 0.0232

**Bước 6: Chuyển thành phần trăm**
```promql
avg(...) / 250 * 100
```
- Kết quả: 2.32% ≈ 2% (khớp HPA!)

**Query hoàn chỉnh:**
```promql
avg(rate(container_cpu_usage_seconds_total{namespace="foodfast",pod=~"server-app.*",cpu="total"}[5m]) * 1000) / 250 * 100
```

**4.3. Query Memory (chi tiết)**

- CPU (avg per‑pod, dùng `cpu="total"` để tránh đếm theo core):

```
avg(rate(container_cpu_usage_seconds_total{namespace="foodfast",pod=~"server-app.*",cpu="total"}[5m]) * 1000) / 250 * 100
```

Giải thích ngắn: `rate(...[5m])` (cores/sec) → `*1000` → milli-cores → `/250` (cpu request = 250m) → `*100` → percent → `avg(...)` trung bình per pod.

- Memory (avg working set / request 256Mi):

```
avg(container_memory_working_set_bytes{namespace="foodfast",pod=~"server-app.*"}) / (256 * 1024 * 1024) * 100
```

**Giải thích từng bước:**

**Bước 1: Lấy memory đang sử dụng**
```promql
container_memory_working_set_bytes{namespace="foodfast",pod=~"server-app.*"}
```
- `container_memory_working_set_bytes`: Memory thực tế đang dùng (HPA dùng metric này)
- **KHÔNG** dùng `container_memory_usage_bytes` (sẽ sai!)

**Bước 2: Trung bình các pods**
```promql
avg(container_memory_working_set_bytes{...})
```
- Ví dụ: (65MB + 67MB + 66MB + 65MB + 68MB) / 5 = 66.2MB

**Bước 3: Chia cho Memory request**
```promql
avg(...) / (256 * 1024 * 1024)
```
- `256 * 1024 * 1024` = 268435456 bytes = 256Mi
- Kết quả: 66.2MB / 256MB = 0.2586

**Bước 4: Chuyển thành phần trăm**
```promql
avg(...) / (256 * 1024 * 1024) * 100
```
- Kết quả: 25.86% ≈ 25% (khớp HPA!)

**4.4. Query Số pods**

- Số pod hiện tại (Stat panel):

```
count(kube_pod_info{namespace="foodfast",pod=~"server-app.*"})
```

**5. Lưu ý khi test autoscaling**
- HPA dựa trên trung bình theo thời gian — tạo load phải đủ lâu (≥ 60–120s) và đủ mạnh.
- Nếu load chỉ khiến I/O tăng (không tăng CPU), HPA sẽ không scale.
- Thử tạo load bằng endpoint gây CPU (ví dụ `/debug/cpuburn?ms=...`) hoặc dùng tool chuyên dụng (`vegeta`, `hey`).

**6. Test nhanh (ví dụ)**
- Chạy load test nội bộ (PowerShell): `.	est-autoscale.ps1 -Target server -Duration 120 -Threads 50`
- Quan sát realtime:
  - `kubectl get hpa -n foodfast -w`
  - `kubectl get pods -n foodfast -w`
  - `kubectl top pods -n foodfast -l app=server-app -w`

**7. Vị trí file & tài nguyên**
- Dashboard JSON: `k8s/grafana-dashboard-foodfast.json`
- HPA config: `k8s/hpa.yaml`
- PromQL helper scripts: `GRAFANA_HPA_QUERIES_FINAL.ps1`, `grafana-final-working-query.ps1`
- Load test: `test-autoscale.ps1`

**8. Next steps (gợi ý)**
- Import `k8s/grafana-dashboard-foodfast.json` vào Grafana.
- Dán 2 PromQL trên vào panel (Code mode) — đặt Unit = Percent (0-100), Min=0, Max=100, Thresholds 30/70.
- Nếu muốn demo, thêm temporary CPU-burn endpoint vào `server-app` để tạo load CPU dễ kiểm soát, rồi revert sau test.

---
File này ngắn gọn để dùng làm phần giải thích về monitoring trong đồ án FOODFAST. Muốn tôi thêm hình minh họa dashboard hoặc export JSON panel mẫu không?