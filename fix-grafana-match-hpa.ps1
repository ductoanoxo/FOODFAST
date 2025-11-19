# ============================================
# FIX GRAFANA HIỂN THỊ ĐÚNG NHƯ HPA
# ============================================

Write-Host "🎯 VẤN ĐỀ: Grafana 11% vs HPA 3%" -ForegroundColor Yellow
Write-Host ""

Write-Host "📊 NGUYÊN NHÂN:" -ForegroundColor Cyan
Write-Host "   • HPA tính: Trung bình CPU MỖI POD (per pod)"
Write-Host "   • Grafana đang tính: TỔNG CPU TẤT CẢ PODS"
Write-Host ""
Write-Host "   Ví dụ hiện tại:"
Write-Host "   • 4 pods, mỗi pod dùng 3% CPU"
Write-Host "   • HPA:     sum(usage) / sum(requests) / pod_count = 3%"
Write-Host "   • Grafana: sum(usage) / sum(requests) = 12% (4×3%)"
Write-Host ""

Write-Host "🔧 GIẢI PHÁP: Sửa Query trong Grafana" -ForegroundColor Green
Write-Host ""

Write-Host "QUERY CŨ (SAI - tính tổng):" -ForegroundColor Red
Write-Host @"
sum(rate(container_cpu_usage_seconds_total{namespace="foodfast",pod=~"server-app.*"}[5m])) / 
sum(kube_pod_container_resource_requests{namespace="foodfast",pod=~"server-app.*",resource="cpu"}) * 100
"@
Write-Host ""

Write-Host "QUERY MỚI (ĐÚNG - tính trung bình per pod):" -ForegroundColor Green
Write-Host @"
sum(rate(container_cpu_usage_seconds_total{namespace="foodfast",pod=~"server-app.*"}[5m])) / 
sum(kube_pod_container_resource_requests{namespace="foodfast",pod=~"server-app.*",resource="cpu"}) / 
count(kube_pod_container_resource_requests{namespace="foodfast",pod=~"server-app.*",resource="cpu"}) * 100
"@
Write-Host ""

Write-Host "THAY ĐỔI CHỦ YẾU:" -ForegroundColor Cyan
Write-Host "   Thêm: / count(kube_pod_container_resource_requests{...})"
Write-Host "   → Chia cho số lượng pods để được trung bình per pod"
Write-Host ""

Write-Host "📝 CÁCH SỬA TRONG GRAFANA:" -ForegroundColor Yellow
Write-Host "   1. Vào panel 'CPU USAGE HPA'"
Write-Host "   2. Click Edit"
Write-Host "   3. Chuyển sang tab 'Code' (quan trọng!)"
Write-Host "   4. XÓA query cũ"
Write-Host "   5. DÁN query mới (bên dưới):"
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "sum(rate(container_cpu_usage_seconds_total{namespace=`"foodfast`",pod=~`"server-app.*`"}[5m])) / sum(kube_pod_container_resource_requests{namespace=`"foodfast`",pod=~`"server-app.*`",resource=`"cpu`"}) / count(kube_pod_container_resource_requests{namespace=`"foodfast`",pod=~`"server-app.*`",resource=`"cpu`"}) * 100" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Write-Host "   6. Click 'Run queries' để test"
Write-Host "   7. Click 'Apply' để lưu"
Write-Host ""

Write-Host "✅ KẾT QUẢ SAU KHI SỬA:" -ForegroundColor Green
Write-Host "   • Grafana sẽ hiển thị: ~3% (giống HPA)"
Write-Host "   • Khi có 2 pods, mỗi pod 5% → Grafana: 5%"
Write-Host "   • Khi có 4 pods, mỗi pod 3% → Grafana: 3%"
Write-Host ""

Write-Host "🧮 GIẢI THÍCH CÔNG THỨC:" -ForegroundColor Magenta
Write-Host ""
Write-Host "   HPA tính như sau:"
Write-Host "   CPU% = (Total CPU Usage / Total CPU Requests) / Number of Pods × 100"
Write-Host ""
Write-Host "   Ví dụ với 4 pods:"
Write-Host "   • Total Usage:    0.012 cores/sec"
Write-Host "   • Total Requests: 0.5 cores (4 pods × 0.125 cores request)"
Write-Host "   • Pod Count:      4"
Write-Host "   → (0.012 / 0.5) / 4 × 100 = 0.6% ❌ SAI"
Write-Host ""
Write-Host "   CHÍNH XÁC HƠN (cách HPA tính):"
Write-Host "   • Usage per pod:  0.003 cores/sec (0.012 / 4)"
Write-Host "   • Request per pod: 0.125 cores"
Write-Host "   → (0.003 / 0.125) × 100 = 2.4% ✅ ĐÚNG"
Write-Host ""

Write-Host "💡 TẠI SAO CẦN CHIA CHO POD COUNT?" -ForegroundColor Yellow
Write-Host "   • HPA muốn biết: 'Mỗi pod đang dùng bao nhiêu % request của nó?'"
Write-Host "   • Không phải: 'Tổng tất cả pods dùng bao nhiêu?'"
Write-Host "   • Để quyết định scale: Nếu mỗi pod > 30% → scale up"
Write-Host ""

Write-Host "🚀 COPY QUERY NGAY (đã format sẵn):" -ForegroundColor Cyan
Write-Host ""
$query = "sum(rate(container_cpu_usage_seconds_total{namespace=`"foodfast`",pod=~`"server-app.*`"}[5m])) / sum(kube_pod_container_resource_requests{namespace=`"foodfast`",pod=~`"server-app.*`",resource=`"cpu`"}) / count(kube_pod_container_resource_requests{namespace=`"foodfast`",pod=~`"server-app.*`",resource=`"cpu`"}) * 100"
Write-Host $query -ForegroundColor Green
Write-Host ""
Set-Clipboard -Value $query
Write-Host "✅ Query đã copy vào clipboard! Paste vào Grafana Code mode!" -ForegroundColor Green
Write-Host ""
