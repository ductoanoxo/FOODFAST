# Setup Dashboard Metrics - Automated
# Script này sẽ tự động setup metrics cho FOODFAST dashboard

Write-Host "`n🚀 AUTOMATED DASHBOARD METRICS SETUP" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray

# Step 1: Verify prom-client in package.json
Write-Host "`n[1/6] Kiểm tra prom-client dependency..." -ForegroundColor Yellow
$packageJson = Get-Content "server_app\package.json" -Raw | ConvertFrom-Json
if ($packageJson.dependencies.'prom-client') {
    Write-Host "   ✅ prom-client đã có trong package.json" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Thêm prom-client vào package.json..." -ForegroundColor Yellow
    Set-Location "server_app"
    npm install prom-client --save
    Set-Location ..
    Write-Host "   ✅ Đã thêm prom-client" -ForegroundColor Green
}

# Step 2: Verify metrics.js exists
Write-Host "`n[2/6] Kiểm tra metrics.js..." -ForegroundColor Yellow
if (Test-Path "server_app\metrics.js") {
    Write-Host "   ✅ metrics.js đã tồn tại" -ForegroundColor Green
} else {
    Write-Host "   ❌ metrics.js chưa có! Vui lòng tạo file này trước." -ForegroundColor Red
    Write-Host "   📄 Xem nội dung cần thiết trong GRAFANA_DASHBOARD_GUIDE.ps1" -ForegroundColor Yellow
    exit 1
}

# Step 3: Rebuild server image
Write-Host "`n[3/6] Rebuild server image với metrics..." -ForegroundColor Yellow
Set-Location "server_app"
docker build -t foodfast-server:latest . --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Server image rebuilt" -ForegroundColor Green
} else {
    Write-Host "   ❌ Build failed! Check errors above." -ForegroundColor Red
    exit 1
}
Set-Location ..

# Step 4: Restart server deployment
Write-Host "`n[4/6] Restart server pods..." -ForegroundColor Yellow
kubectl rollout restart deployment/server-app -n foodfast | Out-Null
Start-Sleep -Seconds 2
kubectl wait --for=condition=ready pod -l app=server-app -n foodfast --timeout=120s | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Server pods restarted successfully" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Some pods may still be starting..." -ForegroundColor Yellow
}

# Step 5: Test metrics endpoint
Write-Host "`n[5/6] Test metrics endpoint..." -ForegroundColor Yellow
$job = Start-Job -ScriptBlock { kubectl port-forward -n foodfast svc/server-svc 5000:5000 }
Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/metrics" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200 -and $response.Content -like "*http_requests_total*") {
        Write-Host "   ✅ Metrics endpoint working! Found metrics:" -ForegroundColor Green
        $metrics = $response.Content -split "`n" | Where-Object { $_ -match "^(http_|foodfast_)" -and $_ -notmatch "^#" } | Select-Object -First 5
        $metrics | ForEach-Object { Write-Host "      • $_" -ForegroundColor Gray }
    } else {
        Write-Host "   ⚠️  Endpoint accessible but no metrics found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Cannot access metrics endpoint: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   💡 Server có thể chưa sẵn sàng. Đợi vài phút rồi test thủ công:" -ForegroundColor Yellow
    Write-Host "      kubectl port-forward -n foodfast svc/server-svc 5000:5000" -ForegroundColor Gray
    Write-Host "      http://localhost:5000/metrics" -ForegroundColor Gray
} finally {
    Stop-Job -Job $job | Out-Null
    Remove-Job -Job $job | Out-Null
}

# Step 6: Verify Prometheus targets
Write-Host "`n[6/6] Kiểm tra Prometheus targets..." -ForegroundColor Yellow
Write-Host "   🔗 Mở Prometheus UI: http://localhost:32001/targets" -ForegroundColor Cyan
Write-Host "   🔍 Tìm kiếm 'foodfast' trong danh sách targets" -ForegroundColor Cyan
Write-Host "   ✅ Targets phải hiện trạng thái UP (không phải DOWN)" -ForegroundColor Cyan

Write-Host "`n📊 Import Dashboard vào Grafana:" -ForegroundColor Yellow
Write-Host "   1. Mở: http://localhost:32000 (admin/admin123)" -ForegroundColor White
Write-Host "   2. Click '+' → Import" -ForegroundColor White
Write-Host "   3. Upload file: k8s/grafana-dashboard-foodfast.json" -ForegroundColor White
Write-Host "   4. Chọn Prometheus datasource" -ForegroundColor White
Write-Host "   5. Click Import" -ForegroundColor White

Write-Host "`n✅ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Gray

Write-Host "`n💡 Next Steps:" -ForegroundColor Yellow
Write-Host "   • Đợi 30-60s để Prometheus scrape metrics" -ForegroundColor Gray
Write-Host "   • Import dashboard vào Grafana" -ForegroundColor Gray
Write-Host "   • Verify data hiển thị trên dashboard" -ForegroundColor Gray
Write-Host "   • Nếu vẫn 'No data', check Prometheus targets" -ForegroundColor Gray
