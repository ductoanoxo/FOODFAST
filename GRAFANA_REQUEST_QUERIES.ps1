# ============================================
# GRAFANA - HTTP REQUEST MONITORING QUERIES
# ============================================

Write-Host "🎯 QUERIES ĐỂ MONITOR HTTP REQUESTS KHI TEST SCALING" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Write-Host "📊 QUERY 1: TỔNG REQUEST PER SECOND (RPS)" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

$rpsQuery = 'sum(rate(http_requests_total{namespace="foodfast",pod=~"server-app.*"}[1m]))'

Write-Host "Query:" -ForegroundColor Yellow
Write-Host $rpsQuery -ForegroundColor Green
Write-Host ""
Write-Host "Visualization: Stat hoặc Graph" -ForegroundColor Cyan
Write-Host "Unit: reqps (requests per second)" -ForegroundColor Cyan
Write-Host "Decimals: 1" -ForegroundColor Cyan
Write-Host "Title: HTTP Requests/sec (All Pods)" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 QUERY 2: TỔNG REQUEST (COUNTER - TÍCH LUỸ)" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

$totalQuery = 'sum(http_requests_total{namespace="foodfast",pod=~"server-app.*"})'

Write-Host "Query:" -ForegroundColor Yellow
Write-Host $totalQuery -ForegroundColor Green
Write-Host ""
Write-Host "Visualization: Stat" -ForegroundColor Cyan
Write-Host "Unit: short (số nguyên)" -ForegroundColor Cyan
Write-Host "Title: Total Requests (Counter)" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 QUERY 3: REQUEST PER SECOND THEO TỪNG POD" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

$rpsPerPodQuery = 'sum by (pod) (rate(http_requests_total{namespace="foodfast",pod=~"server-app.*"}[1m]))'

Write-Host "Query:" -ForegroundColor Yellow
Write-Host $rpsPerPodQuery -ForegroundColor Green
Write-Host ""
Write-Host "Visualization: Time series (Graph)" -ForegroundColor Cyan
Write-Host "Legend: {{pod}}" -ForegroundColor Cyan
Write-Host "Unit: reqps" -ForegroundColor Cyan
Write-Host "Title: Requests/sec per Pod" -ForegroundColor Cyan
Write-Host ""
Write-Host "→ Xem được load có phân bố đều giữa các pods không" -ForegroundColor Gray
Write-Host ""

Write-Host "📊 QUERY 4: REQUEST THEO HTTP METHOD" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

$methodQuery = 'sum by (method) (rate(http_requests_total{namespace="foodfast",pod=~"server-app.*"}[1m]))'

Write-Host "Query:" -ForegroundColor Yellow
Write-Host $methodQuery -ForegroundColor Green
Write-Host ""
Write-Host "Visualization: Pie chart hoặc Bar gauge" -ForegroundColor Cyan
Write-Host "Legend: {{method}}" -ForegroundColor Cyan
Write-Host "Title: Requests by Method (GET/POST/...)" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 QUERY 5: REQUEST THEO STATUS CODE" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

$statusQuery = 'sum by (status) (rate(http_requests_total{namespace="foodfast",pod=~"server-app.*"}[1m]))'

Write-Host "Query:" -ForegroundColor Yellow
Write-Host $statusQuery -ForegroundColor Green
Write-Host ""
Write-Host "Visualization: Time series hoặc Bar gauge" -ForegroundColor Cyan
Write-Host "Legend: HTTP {{status}}" -ForegroundColor Cyan
Write-Host "Title: Requests by Status Code" -ForegroundColor Cyan
Write-Host ""
Write-Host "Thresholds:" -ForegroundColor Yellow
Write-Host "  🟢 2xx - Success" -ForegroundColor Green
Write-Host "  🟡 3xx - Redirect" -ForegroundColor Yellow
Write-Host "  🟠 4xx - Client Error" -ForegroundColor Red
Write-Host "  🔴 5xx - Server Error" -ForegroundColor Red
Write-Host ""

Write-Host "📊 QUERY 6: ERROR RATE (%)" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

$errorRateQuery = @"
sum(rate(http_requests_total{namespace="foodfast",pod=~"server-app.*",status=~"5.."}[1m]))
/
sum(rate(http_requests_total{namespace="foodfast",pod=~"server-app.*"}[1m]))
* 100
"@

Write-Host "Query:" -ForegroundColor Yellow
Write-Host $errorRateQuery -ForegroundColor Green
Write-Host ""
Write-Host "Visualization: Gauge" -ForegroundColor Cyan
Write-Host "Unit: Percent (0-100)" -ForegroundColor Cyan
Write-Host "Title: Error Rate (5xx)" -ForegroundColor Cyan
Write-Host "Thresholds:" -ForegroundColor Yellow
Write-Host "  🟢 0-1%   - OK" -ForegroundColor Green
Write-Host "  🟡 1-5%   - Warning" -ForegroundColor Yellow
Write-Host "  🔴 >5%    - Critical" -ForegroundColor Red
Write-Host ""

Write-Host "📊 QUERY 7: REQUEST DURATION (LATENCY)" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

$latencyQuery = @"
histogram_quantile(0.95,
  sum by (le) (rate(http_request_duration_seconds_bucket{namespace="foodfast",pod=~"server-app.*"}[1m]))
)
"@

Write-Host "Query (p95 latency):" -ForegroundColor Yellow
Write-Host $latencyQuery -ForegroundColor Green
Write-Host ""
Write-Host "Visualization: Time series" -ForegroundColor Cyan
Write-Host "Unit: s (seconds)" -ForegroundColor Cyan
Write-Host "Title: Request Latency (p95)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Các variants khác:" -ForegroundColor Gray
Write-Host "  p50: histogram_quantile(0.50, ...)" -ForegroundColor Gray
Write-Host "  p99: histogram_quantile(0.99, ...)" -ForegroundColor Gray
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "⚠️  LƯU Ý QUAN TRỌNG" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Write-Host "Các queries trên yêu cầu server-app PHẢI expose metrics!" -ForegroundColor Red
Write-Host ""
Write-Host "Kiểm tra xem server có expose metrics không:" -ForegroundColor Yellow
Write-Host "  kubectl port-forward -n foodfast svc/server-app 8080:80" -ForegroundColor Cyan
Write-Host "  curl http://localhost:8080/metrics" -ForegroundColor Cyan
Write-Host ""
Write-Host "Nếu KHÔNG có /metrics endpoint:" -ForegroundColor Red
Write-Host "  → Cần cài đặt metrics library (prom-client cho Node.js)" -ForegroundColor Yellow
Write-Host "  → Xem hướng dẫn bên dưới" -ForegroundColor Yellow
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "📦 HƯỚNG DẪN THÊM METRICS CHO SERVER-APP (Node.js)" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Write-Host "BƯỚC 1: Cài prom-client" -ForegroundColor Yellow
Write-Host "  cd server_app" -ForegroundColor Cyan
Write-Host "  npm install prom-client" -ForegroundColor Cyan
Write-Host ""

Write-Host "BƯỚC 2: Thêm vào index.js (đầu file)" -ForegroundColor Yellow
Write-Host @"
  const promClient = require('prom-client');
  
  // Tạo registry
  const register = new promClient.Registry();
  
  // Tự động collect metrics (CPU, memory...)
  promClient.collectDefaultMetrics({ register });
  
  // Tạo counter cho HTTP requests
  const httpRequestCounter = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'status', 'path'],
    registers: [register]
  });
  
  // Tạo histogram cho latency
  const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'status', 'path'],
    registers: [register]
  });
"@ -ForegroundColor Green
Write-Host ""

Write-Host "BƯỚC 3: Thêm middleware (sau các middleware khác)" -ForegroundColor Yellow
Write-Host @"
  app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      
      httpRequestCounter.inc({
        method: req.method,
        status: res.statusCode,
        path: req.route?.path || req.path
      });
      
      httpRequestDuration.observe({
        method: req.method,
        status: res.statusCode,
        path: req.route?.path || req.path
      }, duration);
    });
    
    next();
  });
"@ -ForegroundColor Green
Write-Host ""

Write-Host "BƯỚC 4: Thêm /metrics endpoint (trước các routes khác)" -ForegroundColor Yellow
Write-Host @"
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
"@ -ForegroundColor Green
Write-Host ""

Write-Host "BƯỚC 5: Rebuild & Redeploy" -ForegroundColor Yellow
Write-Host "  docker build -t <your-registry>/server-app:latest ./server_app" -ForegroundColor Cyan
Write-Host "  docker push <your-registry>/server-app:latest" -ForegroundColor Cyan
Write-Host "  kubectl rollout restart deployment/server-app -n foodfast" -ForegroundColor Cyan
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "🚀 QUERY ĐƠN GIẢN HƠN (KHÔNG CẦN METRICS CUSTOM)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Write-Host "Nếu chưa có metrics custom, dùng các metric có sẵn:" -ForegroundColor Yellow
Write-Host ""

Write-Host "QUERY: Network Bytes Received (xấp xỉ requests)" -ForegroundColor Green
$netQuery = 'sum(rate(container_network_receive_bytes_total{namespace="foodfast",pod=~"server-app.*"}[1m]))'
Write-Host $netQuery -ForegroundColor Cyan
Write-Host "  Unit: Bps (bytes per second)" -ForegroundColor Gray
Write-Host "  → Tăng đột biến = nhiều requests đang vào" -ForegroundColor Gray
Write-Host ""

Write-Host "QUERY: Network Packets Received" -ForegroundColor Green
$packetQuery = 'sum(rate(container_network_receive_packets_total{namespace="foodfast",pod=~"server-app.*"}[1m]))'
Write-Host $packetQuery -ForegroundColor Cyan
Write-Host "  Unit: pps (packets per second)" -ForegroundColor Gray
Write-Host "  → Số lượng packets tương quan với số requests" -ForegroundColor Gray
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "📋 DASHBOARD LAYOUT GỢI Ý" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Write-Host "Row 1: PERFORMANCE OVERVIEW" -ForegroundColor Yellow
Write-Host "  [CPU %]  [Memory %]  [Pods Count]  [RPS]" -ForegroundColor Cyan
Write-Host ""

Write-Host "Row 2: REQUEST DETAILS" -ForegroundColor Yellow
Write-Host "  [Total Requests]  [Error Rate %]  [Latency p95]" -ForegroundColor Cyan
Write-Host ""

Write-Host "Row 3: GRAPHS" -ForegroundColor Yellow
Write-Host "  [RPS per Pod - Time series]" -ForegroundColor Cyan
Write-Host "  [Network In/Out - Time series]" -ForegroundColor Cyan
Write-Host ""

Write-Host "Row 4: BREAKDOWN" -ForegroundColor Yellow
Write-Host "  [Requests by Method - Pie]  [Requests by Status - Bar]" -ForegroundColor Cyan
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "✅ COPY QUERIES VÀO CLIPBOARD" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

$allQueries = @"
# 1. RPS (Requests per second)
sum(rate(http_requests_total{namespace="foodfast",pod=~"server-app.*"}[1m]))

# 2. Total Requests
sum(http_requests_total{namespace="foodfast",pod=~"server-app.*"})

# 3. RPS per Pod
sum by (pod) (rate(http_requests_total{namespace="foodfast",pod=~"server-app.*"}[1m]))

# 4. Network Bytes In (alternative)
sum(rate(container_network_receive_bytes_total{namespace="foodfast",pod=~"server-app.*"}[1m]))

# 5. Network Packets In (alternative)
sum(rate(container_network_receive_packets_total{namespace="foodfast",pod=~"server-app.*"}[1m]))

# 6. Error Rate
sum(rate(http_requests_total{namespace="foodfast",pod=~"server-app.*",status=~"5.."}[1m])) / sum(rate(http_requests_total{namespace="foodfast",pod=~"server-app.*"}[1m])) * 100
"@

Write-Host $allQueries -ForegroundColor Green
Write-Host ""

Set-Clipboard -Value $netQuery
Write-Host "✅ Network Bytes query đã copy! (query đơn giản nhất)" -ForegroundColor Green
Write-Host ""

Write-Host "💡 TIP: Khi chạy test scaling, mở 2 màn hình:" -ForegroundColor Yellow
Write-Host "  1. Grafana Dashboard (F11 fullscreen)" -ForegroundColor Cyan
Write-Host "  2. Terminal: kubectl get hpa -n foodfast -w" -ForegroundColor Cyan
Write-Host ""
Write-Host "  → Bạn sẽ thấy realtime:" -ForegroundColor Gray
Write-Host "    • Network tăng → CPU tăng → HPA scale up → Pods tăng" -ForegroundColor Gray
Write-Host "    • Network giảm → CPU giảm → HPA scale down → Pods giảm" -ForegroundColor Gray
Write-Host ""
