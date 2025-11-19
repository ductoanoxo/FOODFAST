# ============================================
# QUERY GRAFANA CHUẨN NHẤT - KHỚP VỚI HPA
# ============================================

Write-Host "🎯 PHÂN TÍCH TỪ KUBECTL GET HPA" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Write-Host "Từ kubectl get hpa -o yaml:" -ForegroundColor Yellow
Write-Host "  currentMetrics:"
Write-Host "    CPU:"
Write-Host "      averageUtilization: 2%"
Write-Host "      averageValue: 7m"
Write-Host "    Memory:"
Write-Host "      averageUtilization: 25%"
Write-Host "      averageValue: 67068Ki (~65MB)"
Write-Host ""
Write-Host "  Pod Resources (từ deployment):"
Write-Host "    CPU Request: 250m"
Write-Host "    Memory Request: 256Mi"
Write-Host ""
Write-Host "Công thức HPA:"
Write-Host "  CPU% = (7m / 250m) × 100 = 2.8% → 2%"
Write-Host "  Memory% = (65MB / 256MB) × 100 = 25.4% → 25%"
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "QUERY 1: CPU USAGE (CHÍNH XÁC NHẤT)" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

$cpuQuery = 'avg(rate(container_cpu_usage_seconds_total{namespace="foodfast",pod=~"server-app.*",cpu="total"}[5m]) * 1000) / 250 * 100'

Write-Host "Copy query này:" -ForegroundColor Yellow
Write-Host $cpuQuery -ForegroundColor Green
Write-Host ""

Write-Host "Giải thích:" -ForegroundColor Cyan
Write-Host "  • rate(...[5m]): Tốc độ CPU trong 5 phút (cores/sec)"
Write-Host "  • cpu=`"total`": Chỉ lấy tổng CPU của mỗi pod (không lấy từng core riêng)"
Write-Host "  • * 1000: Chuyển cores → milli-cores"
Write-Host "  • avg(...): Trung bình của tất cả pods"
Write-Host "  • / 250: Chia cho CPU request (250m)"
Write-Host "  • * 100: Chuyển thành phần trăm"
Write-Host ""

Write-Host "Kết quả mong đợi: ~2-3% (khớp với HPA 2%)" -ForegroundColor Yellow
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "QUERY 2: MEMORY USAGE (CHÍNH XÁC NHẤT)" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

$memQuery = 'avg(container_memory_working_set_bytes{namespace="foodfast",pod=~"server-app.*"}) / (256 * 1024 * 1024) * 100'

Write-Host "Copy query này:" -ForegroundColor Yellow
Write-Host $memQuery -ForegroundColor Green
Write-Host ""

Write-Host "Giải thích:" -ForegroundColor Cyan
Write-Host "  • container_memory_working_set_bytes: Memory đang sử dụng (HPA dùng metric này)"
Write-Host "  • avg(...): Trung bình của tất cả pods"
Write-Host "  • / (256 * 1024 * 1024): Chia cho 256Mi (memory request)"
Write-Host "  • * 100: Chuyển thành phần trăm"
Write-Host ""

Write-Host "Kết quả mong đợi: ~25% (khớp với HPA 25%)" -ForegroundColor Yellow
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "CẤU HÌNH GRAFANA PANEL" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Write-Host "PANEL 1: CPU USAGE HPA" -ForegroundColor Yellow
Write-Host "  Visualization: Gauge"
Write-Host "  Query (Code mode):"
Write-Host "    $cpuQuery" -ForegroundColor Green
Write-Host ""
Write-Host "  Settings:"
Write-Host "    Min: 0, Max: 100"
Write-Host "    Unit: Percent (0-100)"
Write-Host "    Decimals: 1"
Write-Host ""
Write-Host "  Thresholds:"
Write-Host "    🟢 0   - Normal (OK)"
Write-Host "    🟡 30  - Warning (HPA sẽ scale up)"
Write-Host "    🔴 70  - Critical (Tải cao)"
Write-Host ""

Write-Host "PANEL 2: MEMORY USAGE HPA" -ForegroundColor Yellow
Write-Host "  Visualization: Gauge"
Write-Host "  Query (Code mode):"
Write-Host "    $memQuery" -ForegroundColor Green
Write-Host ""
Write-Host "  Settings:"
Write-Host "    Min: 0, Max: 100"
Write-Host "    Unit: Percent (0-100)"
Write-Host "    Decimals: 1"
Write-Host ""
Write-Host "  Thresholds:"
Write-Host "    🟢 0   - Normal"
Write-Host "    🟡 50  - Warning (HPA sẽ scale up)"
Write-Host "    🔴 80  - Critical"
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "PANEL 3: NUMBER OF PODS (BONUS)" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

$podsQuery = 'count(kube_pod_info{namespace="foodfast",pod=~"server-app.*"})'

Write-Host "Query:" -ForegroundColor Yellow
Write-Host $podsQuery -ForegroundColor Green
Write-Host ""
Write-Host "  Visualization: Stat"
Write-Host "  Unit: None"
Write-Host "  Display name: Server Pods"
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "PANEL 4: HPA TARGET vs CURRENT (BONUS)" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Write-Host "Query A (Current CPU):" -ForegroundColor Yellow
Write-Host $cpuQuery -ForegroundColor Green
Write-Host "  Legend: Current CPU"
Write-Host ""

Write-Host "Query B (Target - constant):" -ForegroundColor Yellow
Write-Host "30" -ForegroundColor Green
Write-Host "  Legend: HPA Target (30%)"
Write-Host ""

Write-Host "  Visualization: Time series"
Write-Host "  → Xem CPU tăng/giảm so với threshold realtime"
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "TẠI SAO QUERIES NÀY CHUẨN NHẤT?" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Write-Host "✅ CPU Query:" -ForegroundColor Green
Write-Host "  • Dùng rate([5m]) giống HPA (HPA cũng dùng 5min window)"
Write-Host "  • Lọc cpu=`"total`" → 1 series/pod, tránh đếm nhiều lần"
Write-Host "  • avg() tính trung bình per pod"
Write-Host "  • Chia đúng request (250m) của deployment"
Write-Host ""

Write-Host "✅ Memory Query:" -ForegroundColor Green
Write-Host "  • Dùng container_memory_working_set_bytes (HPA dùng metric này)"
Write-Host "  • KHÔNG dùng container_memory_usage_bytes (sẽ sai!)"
Write-Host "  • avg() tính trung bình per pod"
Write-Host "  • Chia đúng request (256Mi) của deployment"
Write-Host ""

Write-Host "✅ Tự động cập nhật:" -ForegroundColor Green
Write-Host "  • Khi HPA scale 2→5 pods: Query tự động avg(5 pods)"
Write-Host "  • Khi HPA scale 5→10 pods: Query tự động avg(10 pods)"
Write-Host "  • Không cần sửa gì!"
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "TEST AUTOSCALING" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Write-Host "Chạy lệnh này để tạo load:" -ForegroundColor Cyan
Write-Host "  .\test-autoscale.ps1 -Target server -Duration 120 -Threads 20" -ForegroundColor Yellow
Write-Host ""

Write-Host "Quan sát trong Grafana:" -ForegroundColor Cyan
Write-Host "  1. CPU tăng từ 2% → 40-50%"
Write-Host "  2. Gauge đổi màu: Xanh → Vàng"
Write-Host "  3. HPA scale: 5 pods → 8-10 pods"
Write-Host "  4. CPU giảm về: ~20-25% (vì có thêm pods)"
Write-Host "  5. Panel 'Number of Pods' tăng realtime"
Write-Host ""

Write-Host "Theo dõi HPA realtime:" -ForegroundColor Cyan
Write-Host "  kubectl get hpa -n foodfast -w" -ForegroundColor Yellow
Write-Host "  kubectl get pods -n foodfast -w" -ForegroundColor Yellow
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "COPY QUERIES VÀO CLIPBOARD" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

$allQueries = @"
# CPU Usage (HPA)
$cpuQuery

# Memory Usage (HPA)
$memQuery

# Number of Pods
$podsQuery
"@

Write-Host $allQueries -ForegroundColor Green
Write-Host ""

Set-Clipboard -Value $cpuQuery
Write-Host "✅ CPU query đã copy vào clipboard!" -ForegroundColor Green
Write-Host "   Paste vào Grafana Code mode và Apply!" -ForegroundColor Yellow
Write-Host ""

Write-Host "🎯 Sau khi paste CPU query, copy Memory query:" -ForegroundColor Cyan
Write-Host "   Set-Clipboard -Value '$memQuery'" -ForegroundColor Gray
Write-Host ""
