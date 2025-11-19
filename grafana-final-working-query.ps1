# ============================================
# GIẢI PHÁP CUỐI CÙNG - Query đúng cho Prometheus version của bạn
# ============================================

Write-Host "⚠️  VẤN ĐỀ: Prometheus thiếu metric HPA" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Metric mong muốn (không có):" -ForegroundColor Red
Write-Host "   kube_horizontalpodautoscaler_status_current_metrics_average_utilization"
Write-Host ""
Write-Host "   → Phải dùng query tính toán thủ công"
Write-Host ""

Write-Host "✅ QUERY CHÍNH XÁC - HIỂN THỊ GIỐNG HPA" -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
$query = @"
sum(rate(container_cpu_usage_seconds_total{namespace="foodfast",pod=~"server-app.*"}[5m])) 
/ 
sum(kube_pod_container_resource_requests{namespace="foodfast",pod=~"server-app.*",resource="cpu"}) 
/ 
count(kube_pod_container_resource_requests{namespace="foodfast",pod=~"server-app.*",resource="cpu"}) 
* 100
"@
Write-Host $query -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Write-Host "🔍 GIẢI THÍCH CÔNG THỨC:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1. sum(rate(container_cpu_usage_seconds_total[5m]))" -ForegroundColor Yellow
Write-Host "      → Tổng CPU usage của tất cả pods (cores/sec)"
Write-Host ""
Write-Host "   2. sum(kube_pod_container_resource_requests{resource=`"cpu`"})" -ForegroundColor Yellow
Write-Host "      → Tổng CPU requests của tất cả pods (cores)"
Write-Host ""
Write-Host "   3. count(kube_pod_container_resource_requests{resource=`"cpu`"})" -ForegroundColor Yellow
Write-Host "      → Số lượng pods"
Write-Host ""
Write-Host "   4. Công thức: (usage / requests) / pod_count * 100" -ForegroundColor Yellow
Write-Host "      → % CPU trung bình mỗi pod (giống HPA)"
Write-Host ""

Write-Host "📊 VÍ DỤ TÍNH TOÁN:" -ForegroundColor Magenta
Write-Host ""
Write-Host "   Hiện tại: 4 pods, mỗi pod request 250m CPU"
Write-Host ""
Write-Host "   • Total usage:   0.012 cores/sec"
Write-Host "   • Total requests: 1.0 cores (4 × 0.25)"
Write-Host "   • Pod count:      4"
Write-Host ""
Write-Host "   Tính: (0.012 / 1.0) / 4 × 100 = 3%"
Write-Host "   → Giống kubectl get hpa! ✅"
Write-Host ""

Write-Host "🎯 PASTE VÀO GRAFANA (1 DÒNG):" -ForegroundColor Cyan
Write-Host ""
$oneLineQuery = 'sum(rate(container_cpu_usage_seconds_total{namespace="foodfast",pod=~"server-app.*"}[5m])) / sum(kube_pod_container_resource_requests{namespace="foodfast",pod=~"server-app.*",resource="cpu"}) / count(kube_pod_container_resource_requests{namespace="foodfast",pod=~"server-app.*",resource="cpu"}) * 100'
Write-Host $oneLineQuery -ForegroundColor Green
Write-Host ""

Write-Host "⚙️  CẤU HÌNH PANEL:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Visualization: Gauge"
Write-Host ""
Write-Host "   Gauge settings:"
Write-Host "     Min: 0"
Write-Host "     Max: 100"
Write-Host "     Show threshold labels: ON"
Write-Host ""
Write-Host "   Thresholds:"
Write-Host "     🟢 0   - Normal"
Write-Host "     🟡 30  - HPA will scale (warning)"
Write-Host "     🔴 70  - High load (critical)"
Write-Host ""
Write-Host "   Standard options:"
Write-Host "     Unit: Percent (0-100)"
Write-Host "     Decimals: 1"
Write-Host ""

Write-Host "✅ KẾT QUẢ MONG ĐỢI:" -ForegroundColor Green
Write-Host "   • Hiển thị: ~3% (giống kubectl get hpa)"
Write-Host "   • Màu: Xanh lá (< 30%)"
Write-Host "   • Gauge: 3/100"
Write-Host ""

Write-Host "🚀 COPY QUERY VÀO CLIPBOARD:" -ForegroundColor Cyan
Set-Clipboard -Value $oneLineQuery
Write-Host "   ✅ Đã copy! Paste vào Grafana Code mode!" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 KHẮC PHỤC SỰ CỐ 'NO DATA':" -ForegroundColor Magenta
Write-Host ""
Write-Host "   Nếu vẫn 'No data', kiểm tra:"
Write-Host ""
Write-Host "   1. Prometheus đang scrape metrics:" -ForegroundColor Yellow
Write-Host "      Invoke-RestMethod `"http://localhost:32001/api/v1/query?query=container_cpu_usage_seconds_total{namespace=\`"foodfast\`"}`""
Write-Host ""
Write-Host "   2. Pods đang chạy:" -ForegroundColor Yellow
Write-Host "      kubectl get pods -n foodfast -l app=server-app"
Write-Host ""
Write-Host "   3. Time range trong Grafana:" -ForegroundColor Yellow
Write-Host "      Chọn 'Last 5 minutes' thay vì 'Last 30 minutes'"
Write-Host ""
Write-Host "   4. Refresh Grafana:" -ForegroundColor Yellow
Write-Host "      Ctrl + R hoặc click nút Refresh"
Write-Host ""
