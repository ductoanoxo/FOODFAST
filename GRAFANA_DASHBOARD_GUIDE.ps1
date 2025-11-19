# Hướng dẫn Import Dashboard cho FOODFAST

Write-Host "📊 HƯỚNG DẪN TẠO DASHBOARD GRAFANA CHO FOODFAST" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray

Write-Host "`n1️⃣  Truy cập Grafana UI" -ForegroundColor Yellow
Write-Host "   URL: http://localhost:32000" -ForegroundColor White
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White

Write-Host "`n2️⃣  Import Dashboard từ File JSON" -ForegroundColor Yellow
Write-Host "   a. Click vào '+' (bên trái) → Import" -ForegroundColor Gray
Write-Host "   b. Click 'Upload JSON file'" -ForegroundColor Gray
Write-Host "   c. Chọn file: k8s/grafana-dashboard-foodfast.json" -ForegroundColor White
Write-Host "   d. Chọn Prometheus datasource" -ForegroundColor Gray
Write-Host "   e. Click 'Import'" -ForegroundColor Gray

Write-Host "`n3️⃣  Dashboard Panels (11 panels)" -ForegroundColor Yellow
Write-Host "`n   📍 INFRASTRUCTURE HEALTH:" -ForegroundColor Cyan
Write-Host "      • Pods Running - Số pods đang chạy" -ForegroundColor Gray
Write-Host "      • CPU Usage - % CPU đang dùng" -ForegroundColor Gray
Write-Host "      • Memory Usage % - % RAM đang dùng" -ForegroundColor Gray
Write-Host "      • Available Replicas - Số replicas sẵn sàng" -ForegroundColor Gray

Write-Host "`n   📍 APPLICATION PERFORMANCE:" -ForegroundColor Cyan
Write-Host "      • HTTP Request Rate - Requests/second" -ForegroundColor Gray
Write-Host "      • HTTP Response Time - p95 & p99 latency" -ForegroundColor Gray
Write-Host "      • HTTP Status Codes - 2xx, 4xx, 5xx breakdown" -ForegroundColor Gray

Write-Host "`n   📍 BUSINESS METRICS:" -ForegroundColor Cyan
Write-Host "      • Active Orders - Số đơn hàng đang xử lý" -ForegroundColor Gray
Write-Host "      • Drone Status Distribution - Pie chart drone status" -ForegroundColor Gray
Write-Host "      • Database Connection - MongoDB connection status" -ForegroundColor Gray

Write-Host "`n   📍 RESOURCE USAGE:" -ForegroundColor Cyan
Write-Host "      • Memory Usage by Pod - RAM per pod" -ForegroundColor Gray

Write-Host "`n4️⃣  Troubleshooting 'No Data'" -ForegroundColor Yellow
Write-Host "   ⚠️  Nếu thấy 'No data' sau khi import:" -ForegroundColor Red

Write-Host "`n   BƯỚC A: Cài prom-client vào server" -ForegroundColor White
Write-Host "      cd server_app" -ForegroundColor Gray
Write-Host "      npm install prom-client --save" -ForegroundColor Gray

Write-Host "`n   BƯỚC B: Rebuild server image" -ForegroundColor White
Write-Host "      docker build -t foodfast-server:latest ." -ForegroundColor Gray

Write-Host "`n   BƯỚC C: Restart server pods" -ForegroundColor White
Write-Host "      kubectl rollout restart deployment/server-app -n foodfast" -ForegroundColor Gray
Write-Host "      kubectl wait --for=condition=ready pod -l app=server-app -n foodfast --timeout=120s" -ForegroundColor Gray

Write-Host "`n   BƯỚC D: Test metrics endpoint" -ForegroundColor White
Write-Host "      kubectl port-forward -n foodfast svc/server-svc 5000:5000" -ForegroundColor Gray
Write-Host "      # Mở browser: http://localhost:5000/metrics" -ForegroundColor Gray
Write-Host "      # Phải thấy metrics như: http_requests_total, foodfast_active_orders, etc." -ForegroundColor Gray

Write-Host "`n   BƯỚC E: Verify Prometheus scraping" -ForegroundColor White
Write-Host "      # Mở: http://localhost:32001/targets" -ForegroundColor Gray
Write-Host "      # Tìm 'foodfast' - phải thấy endpoints UP (không phải DOWN)" -ForegroundColor Gray

Write-Host "`n   BƯỚC F: Test PromQL queries" -ForegroundColor White
Write-Host "      # Mở: http://localhost:32001/graph" -ForegroundColor Gray
Write-Host "      # Thử query: up{namespace=`"foodfast`"}" -ForegroundColor Gray
Write-Host "      # Phải return value = 1" -ForegroundColor Gray

Write-Host "`n5️⃣  Các Metrics Quan Trọng" -ForegroundColor Yellow
Write-Host "`n   🔹 KUBERNETES METRICS (luôn có sẵn):" -ForegroundColor Cyan
Write-Host "      kube_pod_status_phase" -ForegroundColor Gray
Write-Host "      container_cpu_usage_seconds_total" -ForegroundColor Gray
Write-Host "      container_memory_working_set_bytes" -ForegroundColor Gray
Write-Host "      kube_deployment_status_replicas_available" -ForegroundColor Gray

Write-Host "`n   🔹 APPLICATION METRICS (cần server export):" -ForegroundColor Cyan
Write-Host "      http_requests_total - Tổng HTTP requests" -ForegroundColor Gray
Write-Host "      http_request_duration_seconds - Response time" -ForegroundColor Gray
Write-Host "      foodfast_active_orders - Số orders đang active" -ForegroundColor Gray
Write-Host "      foodfast_drone_status - Drone status count" -ForegroundColor Gray
Write-Host "      foodfast_database_connections - DB connection state" -ForegroundColor Gray

Write-Host "`n6️⃣  Quick Setup Script" -ForegroundColor Yellow
Write-Host "   Chạy script sau để setup metrics nhanh:" -ForegroundColor Gray
Write-Host "`n   .\setup-dashboard-metrics.ps1" -ForegroundColor White

Write-Host "`n7️⃣  Tips & Best Practices" -ForegroundColor Yellow
Write-Host "   • Dashboard tự động refresh mỗi 10s" -ForegroundColor Gray
Write-Host "   • Time range mặc định: Last 1 hour" -ForegroundColor Gray
Write-Host "   • Có thể edit panels để thay đổi queries" -ForegroundColor Gray
Write-Host "   • Save dashboard sau khi edit để không mất" -ForegroundColor Gray
Write-Host "   • Export dashboard thường xuyên để backup" -ForegroundColor Gray

Write-Host "`n📚 Files Liên Quan:" -ForegroundColor Yellow
Write-Host "   • k8s/grafana-dashboard-foodfast.json - Dashboard definition" -ForegroundColor Gray
Write-Host "   • k8s/servicemonitor.yaml - Prometheus scrape config" -ForegroundColor Gray
Write-Host "   • server_app/metrics.js - Metrics exporter code" -ForegroundColor Gray
Write-Host "   • server_app/index.js - Metrics integration" -ForegroundColor Gray

Write-Host "`n✅ DONE! Bây giờ mở Grafana và import dashboard!" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Gray
