# ============================================
# QUERY CHÍNH XÁC - KHỚP 100% VỚI KUBECTL GET HPA
# ============================================

Write-Host "🎯 PHÂN TÍCH CÁCH HPA TÍNH TOÁN" -ForegroundColor Cyan
Write-Host ""
Write-Host "Từ kubectl get hpa -o yaml:" -ForegroundColor Yellow
Write-Host "  • averageUtilization: 23%"
Write-Host "  • averageValue: 58m (58 milli-cores)"
Write-Host "  • CPU request per pod: 250m"
Write-Host ""
Write-Host "Công thức HPA:"
Write-Host "  CPU% = (averageValue / request) × 100"
Write-Host "  CPU% = (58m / 250m) × 100 = 23.2% ✅"
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "QUERY GRAFANA - HIỂN THỊ CHÍNH XÁC GIỐNG HPA" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

$query = @"
avg(
  rate(
    container_cpu_usage_seconds_total{
      namespace="foodfast",
      pod=~"server-app.*",
      cpu="total"
    }[5m]
  )
) * 1000 / 250 * 100
"@

Write-Host "QUERY (nhiều dòng - dễ đọc):" -ForegroundColor Cyan
Write-Host $query -ForegroundColor Green
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "QUERY (1 DÒNG - COPY VÀO GRAFANA):" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

$oneLineQuery = 'avg(rate(container_cpu_usage_seconds_total{namespace="foodfast",pod=~"server-app.*",cpu="total"}[5m])) * 1000 / 250 * 100'
Write-Host $oneLineQuery -ForegroundColor Green
Write-Host ""

Write-Host "🔍 GIẢI THÍCH TỪNG PHẦN:" -ForegroundColor Magenta
Write-Host ""
Write-Host "1. container_cpu_usage_seconds_total{...}" -ForegroundColor Yellow
Write-Host "   → Metric CPU usage (đơn vị: cores/second)"
Write-Host "   → Filter: namespace=foodfast, pod=server-app.*, cpu=total"
Write-Host ""
Write-Host "2. rate(...[5m])" -ForegroundColor Yellow
Write-Host "   → Tính tốc độ thay đổi trong 5 phút"
Write-Host "   → Kết quả: cores/sec (ví dụ: 0.058)"
Write-Host ""
Write-Host "3. avg(...)" -ForegroundColor Yellow
Write-Host "   → Trung bình của tất cả pods"
Write-Host "   → Kết quả: average cores/sec per pod"
Write-Host ""
Write-Host "4. * 1000" -ForegroundColor Yellow
Write-Host "   → Chuyển cores → milli-cores"
Write-Host "   → 0.058 cores = 58m"
Write-Host ""
Write-Host "5. / 250" -ForegroundColor Yellow
Write-Host "   → Chia cho CPU request (250m)"
Write-Host "   → 58m / 250m = 0.232"
Write-Host ""
Write-Host "6. * 100" -ForegroundColor Yellow
Write-Host "   → Chuyển thành phần trăm"
Write-Host "   → 0.232 × 100 = 23.2%"
Write-Host ""

Write-Host "📊 VÍ DỤ TÍNH TOÁN THỰC TẾ:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Trường hợp 1: App idle (như hiện tại)"
Write-Host "  • rate() = 0.058 cores/sec"
Write-Host "  • × 1000 = 58 milli-cores"
Write-Host "  • / 250 = 0.232"
Write-Host "  • × 100 = 23.2%"
Write-Host "  → HPA: 23%, Grafana: 23% ✅"
Write-Host ""
Write-Host "Trường hợp 2: App có traffic (load test)"
Write-Host "  • rate() = 0.100 cores/sec"
Write-Host "  • × 1000 = 100 milli-cores"
Write-Host "  • / 250 = 0.40"
Write-Host "  • × 100 = 40%"
Write-Host "  → HPA: 40% > 30% → SCALE UP ⬆️"
Write-Host ""
Write-Host "Trường hợp 3: App max CPU"
Write-Host "  • rate() = 0.250 cores/sec (đúng request)"
Write-Host "  • × 1000 = 250 milli-cores"
Write-Host "  • / 250 = 1.0"
Write-Host "  • × 100 = 100%"
Write-Host "  → HPA: 100% → SCALE TO MAX!"
Write-Host ""

Write-Host "⚙️  CẤU HÌNH GRAFANA PANEL:" -ForegroundColor Yellow
Write-Host ""
Write-Host "BƯỚC 1: Paste query vào Code mode"
Write-Host $oneLineQuery -ForegroundColor Green
Write-Host ""
Write-Host "BƯỚC 2: Panel Settings"
Write-Host "  Visualization: Gauge"
Write-Host ""
Write-Host "  Gauge:"
Write-Host "    Min: 0"
Write-Host "    Max: 100"
Write-Host "    Show threshold labels: ✓"
Write-Host "    Show threshold markers: ✓"
Write-Host ""
Write-Host "  Thresholds:"
Write-Host "    🟢 Base:     0   (OK)"
Write-Host "    🟡 Warning:  30  (HPA scale threshold)"
Write-Host "    🟠 Orange:   50  (Moderate load)"
Write-Host "    🔴 Critical: 70  (High load)"
Write-Host ""
Write-Host "  Standard options:"
Write-Host "    Unit: Percent (0-100)"
Write-Host "    Decimals: 1"
Write-Host "    Display name: Server CPU - {{namespace}}"
Write-Host ""

Write-Host "✅ KẾT QUẢ MONG ĐỢI:" -ForegroundColor Green
Write-Host "  • Grafana hiển thị: 23.0%"
Write-Host "  • kubectl get hpa: cpu: 23%/30%"
Write-Host "  • Khớp 100%! ✅"
Write-Host ""

Write-Host "🚀 TEST AUTOSCALING:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Chạy lệnh này để xem gauge thay đổi realtime:"
Write-Host "  .\test-autoscale.ps1 -Target server -Duration 120 -Threads 20" -ForegroundColor Yellow
Write-Host ""
Write-Host "Quan sát trong Grafana:"
Write-Host "  • 0-30%:   Xanh lá → Không scale"
Write-Host "  • 30-50%:  Vàng → HPA đang scale up"
Write-Host "  • 50-70%:  Cam → Tải cao"
Write-Host "  • 70-100%: Đỏ → Tải rất cao"
Write-Host ""

Write-Host "📋 BONUS: QUERY CHO CLIENT APP" -ForegroundColor Magenta
Write-Host ""
$clientQuery = 'avg(rate(container_cpu_usage_seconds_total{namespace="foodfast",pod=~"client-app.*",cpu="total"}[5m])) * 1000 / 250 * 100'
Write-Host $clientQuery -ForegroundColor Green
Write-Host ""
Write-Host "  (Giả sử client-app cũng request 250m CPU)"
Write-Host ""

Write-Host "🎯 COPY VÀO CLIPBOARD:" -ForegroundColor Cyan
Set-Clipboard -Value $oneLineQuery
Write-Host "  ✅ Query đã copy! Paste vào Grafana Code mode!" -ForegroundColor Green
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "TÓM TẮT" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Query này:"
Write-Host "  ✓ Tính chính xác giống HPA (23%)"
Write-Host "  ✓ Tự động cập nhật khi CPU thay đổi"
Write-Host "  ✓ Hiển thị màu sắc theo threshold (30%, 70%)"
Write-Host "  ✓ Không cần chia cho số pods (avg đã tính)"
Write-Host ""
Write-Host "  Khi HPA scale:"
Write-Host "  • 2 pods → 5 pods: Query vẫn đúng (avg tự động)"
Write-Host "  • CPU tăng > 30%: Màu vàng, HPA scale up"
Write-Host "  • CPU giảm < 30%: Màu xanh, HPA scale down"
Write-Host ""
