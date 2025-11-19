# Rebuild và Deploy với Prometheus Metrics

Write-Host "🔨 Rebuilding Server App với Prometheus metrics..." -ForegroundColor Cyan

# Build new image
Set-Location "d:\TESTFOOD\FOODFAST\server_app"
docker build -t foodfast-server:metrics .

# Tag và load vào Kubernetes
docker tag foodfast-server:metrics foodfast-server:latest

# Restart pods để load image mới
kubectl rollout restart deployment/server-app -n foodfast

Write-Host "`n⏳ Đợi pods restart..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=server-app -n foodfast --timeout=120s

Write-Host "`n✅ Server đã được update với metrics!" -ForegroundColor Green
Write-Host "`nKiểm tra metrics:" -ForegroundColor Cyan
Write-Host "1. Port-forward server pod:" -ForegroundColor White
Write-Host "   kubectl port-forward -n foodfast svc/server-svc 5000:5000" -ForegroundColor Gray
Write-Host "2. Xem metrics: http://localhost:5000/metrics" -ForegroundColor Gray
Write-Host "3. Đợi 30s rồi check Prometheus targets: http://localhost:32001/targets" -ForegroundColor Gray

Set-Location "d:\TESTFOOD\FOODFAST"
