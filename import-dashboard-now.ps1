# Quick Import Dashboard

Write-Host "`n🚀 IMPORT DASHBOARD VÀO GRAFANA" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray

Write-Host "`n1. Mở Grafana UI:" -ForegroundColor Yellow
Write-Host "   http://localhost:32000" -ForegroundColor White
Write-Host "   Login: admin / admin123" -ForegroundColor Gray

Write-Host "`n2. Import Dashboard:" -ForegroundColor Yellow
Write-Host "   a. Click biểu tượng '+' bên trái → chọn 'Import'" -ForegroundColor Gray
Write-Host "   b. Click 'Upload JSON file'" -ForegroundColor Gray
Write-Host "   c. Chọn file:" -ForegroundColor Gray
Write-Host "      $PWD\k8s\grafana-dashboard-foodfast.json" -ForegroundColor White
Write-Host "   d. Trong dropdown 'Select a Prometheus data source', chọn 'Prometheus'" -ForegroundColor Gray
Write-Host "   e. Click 'Import'" -ForegroundColor Gray

Write-Host "`n3. Hoặc import bằng Dashboard ID (dễ hơn):" -ForegroundColor Yellow
Write-Host "   • Dashboard ID 15760: Kubernetes Cluster (Prometheus)" -ForegroundColor White
Write-Host "   • Dashboard ID 15661: Kubernetes cluster monitoring (via Prometheus)" -ForegroundColor White
Write-Host "   • Dashboard ID 3662: Prometheus 2.0 Stats" -ForegroundColor White

Write-Host "`n📊 XEM AUTOSCALING TRONG GRAFANA:" -ForegroundColor Cyan
Write-Host "`n   Sau khi import, bạn sẽ thấy:" -ForegroundColor Gray
Write-Host "   • Panel 'Pods Running' → hiện 4/4 server pods" -ForegroundColor White
Write-Host "   • Panel 'Available Replicas' → server-app: 4" -ForegroundColor White
Write-Host "   • Panel 'CPU Usage' → ~3%" -ForegroundColor White
Write-Host "   • Panel 'Memory Usage' → ~23%" -ForegroundColor White

Write-Host "`n✅ HPA ĐÃ HOẠT ĐỘNG!" -ForegroundColor Green
Write-Host "   • Từ 2 pods → 4 pods (scaled up 3 phút trước)" -ForegroundColor White
Write-Host "   • Trigger: CPU vượt 30% threshold" -ForegroundColor White
Write-Host "   • Hiện tại: CPU 3%, Memory 23% → Ổn định" -ForegroundColor White

Write-Host "`n🧪 MUỐN TEST LẠI AUTOSCALING?" -ForegroundColor Yellow
Write-Host "   Chạy script để tạo load:" -ForegroundColor Gray
Write-Host "   .\test-autoscale.ps1" -ForegroundColor White
Write-Host "`n   Script sẽ:" -ForegroundColor Gray
Write-Host "   • Gửi nhiều requests đồng thời để tăng CPU" -ForegroundColor White
Write-Host "   • Monitor HPA scaling realtime" -ForegroundColor White
Write-Host "   • Show metrics trong terminal" -ForegroundColor White

Write-Host "`n" -ForegroundColor Gray
