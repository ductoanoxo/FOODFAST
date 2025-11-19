# Kubernetes Observability Dashboard for FOODFAST
# Import dashboard này để monitor toàn bộ K8s cluster

Write-Host "`n📊 KUBERNETES OBSERVABILITY DASHBOARD" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray

Write-Host "`n🎯 Dashboard này bao gồm:" -ForegroundColor Yellow

Write-Host "`n1️⃣  CLUSTER OVERVIEW" -ForegroundColor Cyan
Write-Host "   • Cluster CPU Usage" -ForegroundColor Gray
Write-Host "   • Cluster Memory Usage" -ForegroundColor Gray
Write-Host "   • Total Pods Running" -ForegroundColor Gray
Write-Host "   • Total Namespaces" -ForegroundColor Gray
Write-Host "   • Node Status" -ForegroundColor Gray

Write-Host "`n2️⃣  POD MONITORING" -ForegroundColor Cyan
Write-Host "   • Pod Status by Namespace" -ForegroundColor Gray
Write-Host "   • Pod Restarts" -ForegroundColor Gray
Write-Host "   • Pod CPU Usage by Namespace" -ForegroundColor Gray
Write-Host "   • Pod Memory Usage by Namespace" -ForegroundColor Gray
Write-Host "   • Pod Network I/O" -ForegroundColor Gray

Write-Host "`n3️⃣  DEPLOYMENT HEALTH" -ForegroundColor Cyan
Write-Host "   • Deployment Replicas (Desired vs Available)" -ForegroundColor Gray
Write-Host "   • Deployment Status" -ForegroundColor Gray
Write-Host "   • ReplicaSet Status" -ForegroundColor Gray

Write-Host "`n4️⃣  NODE MONITORING" -ForegroundColor Cyan
Write-Host "   • Node CPU Usage" -ForegroundColor Gray
Write-Host "   • Node Memory Usage" -ForegroundColor Gray
Write-Host "   • Node Disk Usage" -ForegroundColor Gray
Write-Host "   • Node Network Traffic" -ForegroundColor Gray

Write-Host "`n5️⃣  CONTAINER INSIGHTS" -ForegroundColor Cyan
Write-Host "   • Container CPU by Pod" -ForegroundColor Gray
Write-Host "   • Container Memory by Pod" -ForegroundColor Gray
Write-Host "   • Container Restart Count" -ForegroundColor Gray
Write-Host "   • Container Status" -ForegroundColor Gray

Write-Host "`n6️⃣  STORAGE & VOLUMES" -ForegroundColor Cyan
Write-Host "   • PersistentVolume Status" -ForegroundColor Gray
Write-Host "   • PersistentVolumeClaim Status" -ForegroundColor Gray
Write-Host "   • Storage Usage" -ForegroundColor Gray

Write-Host "`n7️⃣  FOODFAST SPECIFIC" -ForegroundColor Cyan
Write-Host "   • FOODFAST Namespace Pods" -ForegroundColor Gray
Write-Host "   • Server App Replicas" -ForegroundColor Gray
Write-Host "   • Client App Replicas" -ForegroundColor Gray
Write-Host "   • Restaurant App Replicas" -ForegroundColor Gray
Write-Host "   • Admin App Replicas" -ForegroundColor Gray

Write-Host "`n📥 IMPORT VÀO GRAFANA:" -ForegroundColor Yellow
Write-Host "   1. Mở: http://localhost:32000" -ForegroundColor White
Write-Host "   2. Login: admin / admin123" -ForegroundColor White
Write-Host "   3. Click '+' → Import" -ForegroundColor White
Write-Host "   4. Upload: k8s/grafana-dashboard-kubernetes.json" -ForegroundColor White
Write-Host "   5. Select datasource: Prometheus" -ForegroundColor White
Write-Host "   6. Click Import" -ForegroundColor White

Write-Host "`n💡 HOẶC DÙNG DASHBOARD CÓ SẴN:" -ForegroundColor Yellow
Write-Host "   Grafana có sẵn dashboards tuyệt vời cho Kubernetes:" -ForegroundColor Gray
Write-Host "`n   Dashboard ID 15757 - Kubernetes / Views / Global" -ForegroundColor Cyan
Write-Host "   Dashboard ID 15758 - Kubernetes / Views / Namespaces" -ForegroundColor Cyan
Write-Host "   Dashboard ID 15759 - Kubernetes / Views / Pods" -ForegroundColor Cyan
Write-Host "   Dashboard ID 15760 - Kubernetes / System / API Server" -ForegroundColor Cyan
Write-Host "   Dashboard ID 15761 - Kubernetes / System / CoreDNS" -ForegroundColor Cyan

Write-Host "`n   Cách import:" -ForegroundColor White
Write-Host "   1. Click '+' → Import" -ForegroundColor Gray
Write-Host "   2. Nhập ID (vd: 15757)" -ForegroundColor Gray
Write-Host "   3. Click Load" -ForegroundColor Gray
Write-Host "   4. Chọn Prometheus datasource" -ForegroundColor Gray
Write-Host "   5. Click Import" -ForegroundColor Gray

Write-Host "`n🔧 RECOMMENDED DASHBOARDS:" -ForegroundColor Yellow
Write-Host "   📊 General Kubernetes:" -ForegroundColor Cyan
Write-Host "      • ID 15757 (Global Overview)" -ForegroundColor White
Write-Host "      • ID 6417 (Kubernetes Cluster Monitoring)" -ForegroundColor White
Write-Host "      • ID 7249 (Kubernetes Cluster)" -ForegroundColor White
Write-Host "`n   📦 Pod Monitoring:" -ForegroundColor Cyan
Write-Host "      • ID 15759 (Pods Detail)" -ForegroundColor White
Write-Host "      • ID 747 (Kubernetes Deployment)" -ForegroundColor White
Write-Host "`n   💾 Resource Usage:" -ForegroundColor Cyan
Write-Host "      • ID 8588 (Kubernetes Deployment Statefulset)" -ForegroundColor White
Write-Host "      • ID 1860 (Node Exporter Full) - Nếu bật node-exporter" -ForegroundColor White

Write-Host "`n✅ CUSTOM DASHBOARD ĐÃ TẠO:" -ForegroundColor Green
Write-Host "   • k8s/grafana-dashboard-foodfast.json - App metrics" -ForegroundColor Gray
Write-Host "   • k8s/grafana-dashboard-kubernetes.json - K8s metrics" -ForegroundColor Gray

Write-Host "`n=" * 70 -ForegroundColor Gray
