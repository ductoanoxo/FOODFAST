# Thêm HTTP Metrics vào Server App

## Vấn đề hiện tại
Server-app chưa expose Prometheus metrics, nên không thể query `http_requests_total` trong Grafana.

## Giải pháp: Thêm `prom-client` (Prometheus client cho Node.js)

### Bước 1: Cài package
```bash
cd server_app
npm install prom-client
```

### Bước 2: Thêm metrics vào `server_app/index.js`

Thêm vào **đầu file** (sau các import):

```javascript
const express = require('express');
const promClient = require('prom-client');

// Tạo registry
const register = new promClient.Registry();

// Collect default metrics (CPU, Memory, Event Loop...)
promClient.collectDefaultMetrics({ register });

// Tạo custom counter cho HTTP requests
const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});
```

Thêm **middleware** để track requests (sau khi tạo `app`):

```javascript
const app = express();

// Middleware để đếm requests
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // seconds
    const route = req.route ? req.route.path : req.path;
    
    httpRequestCounter.inc({
      method: req.method,
      route: route,
      status_code: res.statusCode
    });
    
    httpRequestDuration.observe({
      method: req.method,
      route: route,
      status_code: res.statusCode
    }, duration);
  });
  
  next();
});
```

Thêm **metrics endpoint** (trước các routes khác):

```javascript
// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Bước 3: Rebuild và redeploy

```powershell
# Rebuild server image
docker build -t ductoanoxo/foodfast-server:latest ./server_app

# Push to registry (nếu cần)
docker push ductoanoxo/foodfast-server:latest

# Restart deployment
kubectl rollout restart deployment/server-app -n foodfast
```

### Bước 4: Verify metrics

```powershell
# Port-forward để test
kubectl port-forward -n foodfast svc/server-app 5000:5000

# Test metrics endpoint (terminal khác)
curl http://localhost:5000/metrics
```

Bạn sẽ thấy output như:
```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/api/products",status_code="200"} 150
http_requests_total{method="POST",route="/api/orders",status_code="201"} 25

# HELP http_request_duration_seconds Duration of HTTP requests in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="GET",route="/api/products",status_code="200",le="0.005"} 120
...
```

---

## PromQL Queries cho Grafana (sau khi có metrics)

### 1. Total Requests per Second (RPS)
```promql
sum(rate(http_requests_total{namespace="foodfast",pod=~"server-app.*"}[1m]))
```

### 2. RPS by Route
```promql
sum(rate(http_requests_total{namespace="foodfast",pod=~"server-app.*"}[1m])) by (route)
```

### 3. RPS by Status Code
```promql
sum(rate(http_requests_total{namespace="foodfast",pod=~"server-app.*"}[1m])) by (status_code)
```

### 4. Total Requests (Counter)
```promql
sum(http_requests_total{namespace="foodfast",pod=~"server-app.*"})
```

### 5. Error Rate (4xx + 5xx)
```promql
sum(rate(http_requests_total{namespace="foodfast",pod=~"server-app.*",status_code=~"[45].*"}[1m]))
/
sum(rate(http_requests_total{namespace="foodfast",pod=~"server-app.*"}[1m]))
* 100
```

### 6. Average Response Time
```promql
rate(http_request_duration_seconds_sum{namespace="foodfast",pod=~"server-app.*"}[1m])
/
rate(http_request_duration_seconds_count{namespace="foodfast",pod=~"server-app.*"}[1m])
```

### 7. P95 Latency
```promql
histogram_quantile(0.95, 
  sum(rate(http_request_duration_seconds_bucket{namespace="foodfast",pod=~"server-app.*"}[1m])) by (le)
)
```

---

## Grafana Panel Settings

### Panel: Request Rate (Time Series)
- **Query**: `sum(rate(http_requests_total{namespace="foodfast",pod=~"server-app.*"}[1m]))`
- **Unit**: reqps (requests per second)
- **Legend**: Request Rate
- **Visualization**: Time series graph

### Panel: Total Requests (Stat)
- **Query**: `sum(increase(http_requests_total{namespace="foodfast",pod=~"server-app.*"}[5m]))`
- **Unit**: short
- **Calculation**: Last
- **Visualization**: Stat (big number)

### Panel: Requests by Route (Time Series)
- **Query**: `sum(rate(http_requests_total{namespace="foodfast",pod=~"server-app.*"}[1m])) by (route)`
- **Legend**: {{route}}
- **Visualization**: Time series (stacked)

---

## Quick Test

Sau khi setup xong, chạy load test và xem metrics:

```powershell
# Chạy load test
.\test-autoscale.ps1 -Target server -Duration 60 -Threads 20

# Trong Grafana, bạn sẽ thấy:
# - Request rate tăng từ 0 → 100-200 req/s
# - Total requests tích lũy theo thời gian
# - Routes /api/products sẽ có requests nhiều nhất
```

---

## Nếu không muốn sửa code

**Cách thay thế**: Dùng metrics từ Nginx Ingress hoặc Service Mesh (Istio/Linkerd), nhưng phức tạp hơn.

**Khuyến nghị**: Thêm `prom-client` vào server-app là cách đơn giản và chuẩn nhất! ✅
