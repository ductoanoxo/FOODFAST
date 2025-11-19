# Script tạo Kubernetes Dashboard trong Grafana với PromQL queries

Write-Host "`n📊 TẠO KUBERNETES + HPA DASHBOARD" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray

Write-Host "`n✅ HƯỚNG DẪN TẠO DASHBOARD BẰNG TAY:" -ForegroundColor Yellow
Write-Host "`n1. Mở Grafana: http://localhost:32000 (admin/admin123)" -ForegroundColor White

Write-Host "`n2. Tạo Dashboard mới:" -ForegroundColor Yellow
Write-Host "   • Click '+' → 'Dashboard' → 'Add new panel'" -ForegroundColor Gray

Write-Host "`n3. Thêm các Panel sau (copy PromQL queries):" -ForegroundColor Yellow

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Write-Host "`n📍 PANEL 1: HPA Current vs Target (Gauge)" -ForegroundColor Cyan
Write-Host "   Panel Type: Gauge" -ForegroundColor Gray
Write-Host "   Title: HPA - CPU Usage vs Target" -ForegroundColor Gray
Write-Host "   Query A:" -ForegroundColor Yellow
Write-Host '   100 * sum(rate(container_cpu_usage_seconds_total{namespace="foodfast",pod=~"server-app.*"}[5m])) / sum(kube_pod_container_resource_requests{namespace="foodfast",pod=~"server-app.*",resource="cpu"})' -ForegroundColor White
Write-Host "   Legend: Current CPU %" -ForegroundColor Gray
Write-Host "`n   Threshold: 30 (warning), 50 (critical)" -ForegroundColor Gray
Write-Host "   Unit: Percent (0-100)" -ForegroundColor Gray

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Write-Host "`n📍 PANEL 2: HPA Replicas Count (Stat)" -ForegroundColor Cyan
Write-Host "   Panel Type: Stat" -ForegroundColor Gray
Write-Host "   Title: Server Pods Count" -ForegroundColor Gray
Write-Host "   Query A:" -ForegroundColor Yellow
Write-Host '   kube_deployment_status_replicas_available{namespace="foodfast",deployment="server-app"}' -ForegroundColor White
Write-Host "   Legend: Available Pods" -ForegroundColor Gray
Write-Host "   Query B:" -ForegroundColor Yellow
Write-Host '   kube_deployment_spec_replicas{namespace="foodfast",deployment="server-app"}' -ForegroundColor White
Write-Host "   Legend: Desired Pods" -ForegroundColor Gray

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Write-Host "`n📍 PANEL 3: HPA Scaling History (Time Series)" -ForegroundColor Cyan
Write-Host "   Panel Type: Time series" -ForegroundColor Gray
Write-Host "   Title: Server Pods Scaling History" -ForegroundColor Gray
Write-Host "   Query:" -ForegroundColor Yellow
Write-Host '   kube_deployment_status_replicas{namespace="foodfast",deployment="server-app"}' -ForegroundColor White
Write-Host "   Legend: Server Replicas" -ForegroundColor Gray
Write-Host "   Style: Staircase" -ForegroundColor Gray

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Write-Host "`n📍 PANEL 4: CPU Usage per Pod (Time Series)" -ForegroundColor Cyan
Write-Host "   Panel Type: Time series" -ForegroundColor Gray
Write-Host "   Title: CPU Usage by Pod" -ForegroundColor Gray
Write-Host "   Query:" -ForegroundColor Yellow
Write-Host '   sum(rate(container_cpu_usage_seconds_total{namespace="foodfast",pod=~"server-app.*"}[5m])) by (pod)' -ForegroundColor White
Write-Host "   Legend: {{pod}}" -ForegroundColor Gray
Write-Host "   Unit: cores" -ForegroundColor Gray

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Write-Host "`n📍 PANEL 5: Memory Usage per Pod (Time Series)" -ForegroundColor Cyan
Write-Host "   Panel Type: Time series" -ForegroundColor Gray
Write-Host "   Title: Memory Usage by Pod" -ForegroundColor Gray
Write-Host "   Query:" -ForegroundColor Yellow
Write-Host '   sum(container_memory_working_set_bytes{namespace="foodfast",pod=~"server-app.*"}) by (pod)' -ForegroundColor White
Write-Host "   Legend: {{pod}}" -ForegroundColor Gray
Write-Host "   Unit: bytes" -ForegroundColor Gray

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Write-Host "`n📍 PANEL 6: HPA Memory % (Gauge)" -ForegroundColor Cyan
Write-Host "   Panel Type: Gauge" -ForegroundColor Gray
Write-Host "   Title: HPA - Memory Usage vs Target" -ForegroundColor Gray
Write-Host "   Query:" -ForegroundColor Yellow
Write-Host '   100 * sum(container_memory_working_set_bytes{namespace="foodfast",pod=~"server-app.*"}) / sum(kube_pod_container_resource_requests{namespace="foodfast",pod=~"server-app.*",resource="memory"})' -ForegroundColor White
Write-Host "   Legend: Current Memory %" -ForegroundColor Gray
Write-Host "   Threshold: 50 (warning), 80 (critical)" -ForegroundColor Gray
Write-Host "   Unit: Percent (0-100)" -ForegroundColor Gray

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Write-Host "`n📍 PANEL 7: All Pods Status (Stat)" -ForegroundColor Cyan
Write-Host "   Panel Type: Stat" -ForegroundColor Gray
Write-Host "   Title: Pods Running in FOODFAST" -ForegroundColor Gray
Write-Host "   Query:" -ForegroundColor Yellow
Write-Host '   count(kube_pod_status_phase{namespace="foodfast",phase="Running"})' -ForegroundColor White
Write-Host "   Legend: Running Pods" -ForegroundColor Gray
Write-Host "   Color: Green" -ForegroundColor Gray

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Write-Host "`n📍 PANEL 8: CPU Requests vs Limits (Bar Gauge)" -ForegroundColor Cyan
Write-Host "   Panel Type: Bar gauge" -ForegroundColor Gray
Write-Host "   Title: Server CPU Requests vs Limits" -ForegroundColor Gray
Write-Host "   Query A:" -ForegroundColor Yellow
Write-Host '   sum(kube_pod_container_resource_requests{namespace="foodfast",pod=~"server-app.*",resource="cpu"})' -ForegroundColor White
Write-Host "   Legend: Requests" -ForegroundColor Gray
Write-Host "   Query B:" -ForegroundColor Yellow
Write-Host '   sum(kube_pod_container_resource_limits{namespace="foodfast",pod=~"server-app.*",resource="cpu"})' -ForegroundColor White
Write-Host "   Legend: Limits" -ForegroundColor Gray
Write-Host "   Unit: cores" -ForegroundColor Gray

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Write-Host "`n📍 PANEL 9: Pods Restart Count (Table)" -ForegroundColor Cyan
Write-Host "   Panel Type: Table" -ForegroundColor Gray
Write-Host "   Title: Pod Restarts" -ForegroundColor Gray
Write-Host "   Query:" -ForegroundColor Yellow
Write-Host '   sum(kube_pod_container_status_restarts_total{namespace="foodfast"}) by (pod)' -ForegroundColor White
Write-Host "   Transform: Organize fields → Rename 'Value' to 'Restarts'" -ForegroundColor Gray

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Write-Host "`n📍 PANEL 10: Network I/O (Time Series)" -ForegroundColor Cyan
Write-Host "   Panel Type: Time series" -ForegroundColor Gray
Write-Host "   Title: Network Traffic" -ForegroundColor Gray
Write-Host "   Query A (Receive):" -ForegroundColor Yellow
Write-Host '   sum(rate(container_network_receive_bytes_total{namespace="foodfast"}[5m])) by (pod)' -ForegroundColor White
Write-Host "   Legend: {{pod}} Receive" -ForegroundColor Gray
Write-Host "   Query B (Transmit):" -ForegroundColor Yellow
Write-Host '   sum(rate(container_network_transmit_bytes_total{namespace="foodfast"}[5m])) by (pod)' -ForegroundColor White
Write-Host "   Legend: {{pod}} Transmit" -ForegroundColor Gray
Write-Host "   Unit: Bps" -ForegroundColor Gray

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Write-Host "`n💡 CÁCH XEM METRICS HPA TRỰC TIẾP:" -ForegroundColor Yellow
Write-Host "`n   Ngoài Grafana, bạn có thể xem realtime bằng:" -ForegroundColor Gray

Write-Host "`n   1️⃣  Watch HPA status:" -ForegroundColor Cyan
Write-Host "       kubectl get hpa -n foodfast -w" -ForegroundColor White
Write-Host "       → Hiện: cpu: 3%/30%, memory: 23%/50%" -ForegroundColor Gray

Write-Host "`n   2️⃣  Describe HPA chi tiết:" -ForegroundColor Cyan
Write-Host "       kubectl describe hpa server-app-hpa -n foodfast" -ForegroundColor White
Write-Host "       → Xem scaling events, conditions, policies" -ForegroundColor Gray

Write-Host "`n   3️⃣  Top pods realtime:" -ForegroundColor Cyan
Write-Host "       kubectl top pods -n foodfast --containers" -ForegroundColor White
Write-Host "       → Xem CPU/Memory usage từng pod" -ForegroundColor Gray

Write-Host "`n   4️⃣  Watch pods count:" -ForegroundColor Cyan
Write-Host "       kubectl get pods -n foodfast -l app=server-app -w" -ForegroundColor White
Write-Host "       → Xem pods tăng/giảm realtime" -ForegroundColor Gray

Write-Host "`n✅ DASHBOARD ĐÃ CÓ SẴN!" -ForegroundColor Green
Write-Host "   File: k8s/grafana-dashboard-foodfast.json" -ForegroundColor White
Write-Host "   Hoặc tạo custom dashboard với queries trên" -ForegroundColor Gray

Write-Host "`n📚 TÀI LIỆU THAM KHẢO:" -ForegroundColor Yellow
Write-Host "   • PromQL cheatsheet: https://promlabs.com/promql-cheat-sheet/" -ForegroundColor Gray
Write-Host "   • Kubernetes metrics: https://kubernetes.io/docs/concepts/cluster-administration/system-metrics/" -ForegroundColor Gray
Write-Host "   • HPA walkthrough: https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/" -ForegroundColor Gray

Write-Host "`n" -ForegroundColor Gray
