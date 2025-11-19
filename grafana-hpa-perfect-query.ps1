# ============================================
# QUERY GRAFANA CHÍNH XÁC 100% GIỐNG HPA
# ============================================

Write-Host "🎯 METRIC CHÍNH THỨC CỦA HPA" -ForegroundColor Green
Write-Host ""

Write-Host "✅ SỬ DỤNG METRIC NÀY (đơn giản nhất, chính xác nhất):" -ForegroundColor Cyan
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "kube_horizontalpodautoscaler_status_current_metrics_average_utilization{" -ForegroundColor Green
Write-Host "  namespace=`"foodfast`"," -ForegroundColor Green
Write-Host "  horizontalpodautoscaler=`"server-app-hpa`"," -ForegroundColor Green
Write-Host "  metric_name=`"cpu`"" -ForegroundColor Green
Write-Host "}" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Write-Host "🔥 ƯU ĐIỂM:" -ForegroundColor Yellow
Write-Host "   ✓ Giá trị CHÍNH XÁC 100% giống kubectl get hpa"
Write-Host "   ✓ HPA tự tính, không cần công thức phức tạp"
Write-Host "   ✓ Đã ở dạng % (0-100), không cần * 100"
Write-Host "   ✓ Query ngắn gọn, dễ hiểu"
Write-Host ""

Write-Host "📊 TẠO PANEL HOÀN CHỈNH:" -ForegroundColor Cyan
Write-Host ""
Write-Host "BƯỚC 1: Tạo Panel mới hoặc edit panel cũ" -ForegroundColor Yellow
Write-Host "   • Click 'Add' → 'Visualization'"
Write-Host "   • Hoặc edit panel 'CPU USAGE HPA' hiện tại"
Write-Host ""

Write-Host "BƯỚC 2: Chọn visualization type" -ForegroundColor Yellow
Write-Host "   • Chọn 'Gauge' (đồng hồ tròn)"
Write-Host ""

Write-Host "BƯỚC 3: Paste query (tab Code)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
$cpuQuery = 'kube_horizontalpodautoscaler_status_current_metrics_average_utilization{namespace="foodfast",horizontalpodautoscaler="server-app-hpa",metric_name="cpu"}'
Write-Host $cpuQuery -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Write-Host "BƯỚC 4: Cấu hình Panel options (bên phải)" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Title: Server HPA - CPU Usage"
Write-Host ""
Write-Host "   Gauge:"
Write-Host "     Min: 0"
Write-Host "     Max: 100"
Write-Host "     Show threshold labels: ON"
Write-Host ""
Write-Host "   Thresholds:"
Write-Host "     🟢 Base:     0   (xanh lá - bình thường)"
Write-Host "     🟡 Warning:  30  (vàng - HPA threshold)"
Write-Host "     🔴 Critical: 70  (đỏ - production threshold)"
Write-Host ""
Write-Host "   Standard options:"
Write-Host "     Unit: Percent (0-100)"
Write-Host "     Decimals: 1"
Write-Host ""

Write-Host "✅ KẾT QUẢ:" -ForegroundColor Green
Write-Host "   • Hiển thị: 3.0% (giống kubectl get hpa)"
Write-Host "   • Màu xanh lá (< 30%)"
Write-Host "   • Gauge chỉ 3/100"
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "BONUS: PANEL HIỂN THỊ CẢ CPU VÀ MEMORY" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host ""

Write-Host "Query A (CPU):" -ForegroundColor Cyan
$cpuQuery = 'kube_horizontalpodautoscaler_status_current_metrics_average_utilization{namespace="foodfast",horizontalpodautoscaler="server-app-hpa",metric_name="cpu"}'
Write-Host $cpuQuery -ForegroundColor Green
Write-Host "   Legend: CPU: {{value}}%"
Write-Host ""

Write-Host "Query B (Memory):" -ForegroundColor Cyan
$memQuery = 'kube_horizontalpodautoscaler_status_current_metrics_average_utilization{namespace="foodfast",horizontalpodautoscaler="server-app-hpa",metric_name="memory"}'
Write-Host $memQuery -ForegroundColor Green
Write-Host "   Legend: Memory: {{value}}%"
Write-Host ""

Write-Host "Visualization: Stat (hoặc Time series)"
Write-Host "   • Stat: Hiển thị số lớn, dễ nhìn"
Write-Host "   • Time series: Xem biểu đồ theo thời gian"
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "BONUS 2: PANEL HIỂN THỊ TARGET THRESHOLD" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host ""

Write-Host "Query A (Current CPU):" -ForegroundColor Cyan
Write-Host $cpuQuery -ForegroundColor Green
Write-Host ""

Write-Host "Query B (Target - from HPA spec):" -ForegroundColor Cyan
$targetQuery = 'kube_horizontalpodautoscaler_spec_target_metric{namespace="foodfast",horizontalpodautoscaler="server-app-hpa",metric_name="cpu"}'
Write-Host $targetQuery -ForegroundColor Green
Write-Host ""

Write-Host "Value options:" -ForegroundColor Yellow
Write-Host "   • Calculation: All values"
Write-Host "   • Fields: Show all"
Write-Host ""
Write-Host "   → Hiển thị: Current: 3% / Target: 30%"
Write-Host ""

Write-Host "🚀 COPY QUERIES VÀO CLIPBOARD:" -ForegroundColor Cyan
Write-Host ""
$queries = @"
# CPU Current
kube_horizontalpodautoscaler_status_current_metrics_average_utilization{namespace="foodfast",horizontalpodautoscaler="server-app-hpa",metric_name="cpu"}

# Memory Current
kube_horizontalpodautoscaler_status_current_metrics_average_utilization{namespace="foodfast",horizontalpodautoscaler="server-app-hpa",metric_name="memory"}

# CPU Target
kube_horizontalpodautoscaler_spec_target_metric{namespace="foodfast",horizontalpodautoscaler="server-app-hpa",metric_name="cpu"}
"@
Write-Host $queries -ForegroundColor Green
Set-Clipboard -Value $cpuQuery
Write-Host ""
Write-Host "✅ CPU query đã copy! Paste vào Grafana!" -ForegroundColor Green
Write-Host ""

Write-Host "💡 SO SÁNH VỚI QUERY CŨ:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Query cũ (phức tạp, có thể sai):" -ForegroundColor Red
Write-Host "   sum(rate(...)) / sum(...) / count(...) * 100"
Write-Host "   → 15 dòng code, dễ nhầm lẫn"
Write-Host ""
Write-Host "   Query mới (HPA native metric):" -ForegroundColor Green
Write-Host "   kube_horizontalpodautoscaler_status_current_metrics_average_utilization{...}"
Write-Host "   → 1 dòng, chính xác 100%"
Write-Host ""

Write-Host "🎯 KẾT LUẬN:" -ForegroundColor Cyan
Write-Host "   • LUÔN dùng metric của HPA nếu có"
Write-Host "   • Đơn giản hơn, chính xác hơn"
Write-Host "   • Không cần tính toán thủ công"
Write-Host ""
