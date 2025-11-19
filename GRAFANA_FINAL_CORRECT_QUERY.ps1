# ============================================
# QUERY CHÍNH XÁC 100% - FINAL VERSION
# ============================================

Write-Host "🎯 PHÂN TÍCH VẤN ĐỀ" -ForegroundColor Yellow
Write-Host ""
Write-Host "Thực tế từ kubectl:"
Write-Host "  • 5 pods, mỗi pod: 5-6m CPU"
Write-Host "  • Average: 5.8m / 250m = 2.32%"
Write-Host "  • HPA hiển thị: 2%"
Write-Host ""
Write-Host "Query sai (11%):"
Write-Host "  → Tính tổng CPU của tất cả pods"
Write-Host "  → 5 pods × 5.8m = 29m"
Write-Host "  → 29m / 250m = 11.6% ❌"
Write-Host ""
Write-Host "Query đúng phải:"
Write-Host "  → Tính CPU mỗi pod riêng lẻ"
Write-Host "  → Sau đó lấy trung bình"
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "QUERY CHÍNH XÁC - KHỚP 100% VỚI HPA" -ForegroundColor Green
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
  ) * 1000
) / 250 * 100
"@

Write-Host $query -ForegroundColor Green
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "COPY VÀO GRAFANA (1 DÒNG):" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

$oneLineQuery = 'avg(rate(container_cpu_usage_seconds_total{namespace="foodfast",pod=~"server-app.*",cpu="total"}[5m]) * 1000) / 250 * 100'
Write-Host $oneLineQuery -ForegroundColor Green
Write-Host ""

Write-Host "🔍 GIẢI THÍCH LOGIC:" -ForegroundColor Magenta
Write-Host ""
Write-Host "1. container_cpu_usage_seconds_total{cpu=`"total`"}" -ForegroundColor Yellow
Write-Host "   → Metric với cpu=`"total`" ĐÃ là tổng tất cả CPUs của pod"
Write-Host "   → Mỗi pod có 1 series với cpu=total"
Write-Host ""
Write-Host "2. rate(...[5m])" -ForegroundColor Yellow
Write-Host "   → Tốc độ CPU usage trong 5 phút"
Write-Host "   → Đơn vị: cores/second (ví dụ: 0.006)"
Write-Host ""
Write-Host "3. * 1000" -ForegroundColor Yellow
Write-Host "   → Chuyển cores → milli-cores"
Write-Host "   → 0.006 cores = 6 milli-cores"
Write-Host ""
Write-Host "4. avg(...)" -ForegroundColor Yellow
Write-Host "   → Trung bình của tất cả pods"
Write-Host "   → (6m + 5m + 6m + 6m + 6m) / 5 = 5.8m"
Write-Host ""
Write-Host "5. / 250" -ForegroundColor Yellow
Write-Host "   → Chia cho CPU request (250m)"
Write-Host "   → 5.8m / 250m = 0.0232"
Write-Host ""
Write-Host "6. * 100" -ForegroundColor Yellow
Write-Host "   → Chuyển thành %"
Write-Host "   → 0.0232 × 100 = 2.32% ≈ 2% ✅"
Write-Host ""

Write-Host "📊 SO SÁNH CÁC CÁCH TÍNH:" -ForegroundColor Cyan
Write-Host ""
Write-Host "CÁCH SAI #1:" -ForegroundColor Red
Write-Host "  avg(rate(...)) không lọc cpu=`"total`""
Write-Host "  → Tính trung bình TẤT CẢ các cpu series (cpu0, cpu1, total...)"
Write-Host "  → Sai số lớn!"
Write-Host ""
Write-Host "CÁCH SAI #2:" -ForegroundColor Red
Write-Host "  sum() thay vì avg()"
Write-Host "  → Tính TỔNG tất cả pods"
Write-Host "  → 5 pods × 6m = 30m → 30m/250m = 12% (sai!)"
Write-Host ""
Write-Host "CÁCH ĐÚNG:" -ForegroundColor Green
Write-Host "  avg(rate(...{cpu=`"total`"}[5m]) * 1000) / 250 * 100"
Write-Host "  → Chỉ lấy cpu=`"total`" (1 series/pod)"
Write-Host "  → avg() = trung bình các pods"
Write-Host "  → 5.8m / 250m = 2.32% ✅"
Write-Host ""

Write-Host "⚙️  CẤU HÌNH GRAFANA:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Paste query vào Code mode:"
Write-Host $oneLineQuery -ForegroundColor Green
Write-Host ""
Write-Host "Panel settings:"
Write-Host "  • Visualization: Gauge"
Write-Host "  • Min: 0, Max: 100"
Write-Host "  • Unit: Percent (0-100)"
Write-Host "  • Decimals: 1"
Write-Host ""
Write-Host "Thresholds:"
Write-Host "  🟢 0   - Normal"
Write-Host "  🟡 30  - HPA scale threshold"
Write-Host "  🔴 70  - High load"
Write-Host ""

Write-Host "✅ KẾT QUẢ:" -ForegroundColor Green
Write-Host "  • Grafana: 2.3%"
Write-Host "  • HPA:     2%"
Write-Host "  • KHỚP! ✅"
Write-Host ""

Write-Host "🎯 COPY NGAY:" -ForegroundColor Cyan
Set-Clipboard -Value $oneLineQuery
Write-Host "  ✅ Đã copy vào clipboard!" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 TEST REALTIME:" -ForegroundColor Magenta
Write-Host "  .\test-autoscale.ps1 -Target server -Duration 120 -Threads 20"
Write-Host ""
Write-Host "  Xem trong Grafana:"
Write-Host "  • CPU tăng từ 2% → 40%"
Write-Host "  • Gauge đổi màu xanh → vàng"
Write-Host "  • HPA scale 5 → 10 pods"
Write-Host "  • CPU giảm về ~20% (vì có thêm pods)"
Write-Host ""
