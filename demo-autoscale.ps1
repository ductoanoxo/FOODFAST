# ========================================
# DEMO AUTO-SCALING NHANH
# ========================================
# Script này sẽ tạo load và hiển thị auto-scaling real-time

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔥 DEMO AUTO-SCALING - REAL-TIME" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 HPA trước khi test:" -ForegroundColor Yellow
kubectl get hpa -n foodfast
Write-Host ""

Write-Host "📦 Pods hiện tại:" -ForegroundColor Yellow
kubectl get pods -n foodfast | Select-String "NAME|server-app"
Write-Host ""

Write-Host "🚀 Bắt đầu tạo load trong 60 giây..." -ForegroundColor Green
Write-Host "   (Bạn sẽ thấy pods tăng từ 2 → 4 → 6...)" -ForegroundColor Gray
Write-Host ""

# Tạo load trong background
$loadJob = Start-Job -ScriptBlock {
    param($Duration)
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    while ($stopwatch.Elapsed.TotalSeconds -lt $Duration) {
        try {
            1..10 | ForEach-Object -Parallel {
                Invoke-WebRequest -Uri "http://localhost:30050/api/products" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue | Out-Null
            } -ThrottleLimit 10
        } catch {
            # Ignore
        }
    }
} -ArgumentList 60

# Monitor mỗi 5 giây
for ($i = 1; $i -le 12; $i++) {
    $elapsed = $i * 5
    Write-Host "⏱️  $elapsed giây..." -ForegroundColor Cyan
    
    Write-Host "   HPA:" -ForegroundColor Yellow
    kubectl get hpa -n foodfast | Select-String "server-app"
    
    Write-Host "   Pods:" -ForegroundColor Yellow
    $pods = kubectl get pods -n foodfast | Select-String "server-app"
    $podCount = ($pods | Measure-Object).Count
    Write-Host "   → Tổng: $podCount server pods" -ForegroundColor Green
    $pods | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }
    
    Write-Host "   CPU Usage:" -ForegroundColor Yellow
    kubectl top pods -n foodfast 2>$null | Select-String "server-app"
    
    Write-Host ""
    
    if ($i -lt 12) {
        Start-Sleep -Seconds 5
    }
}

# Dọn dẹp
Stop-Job -Job $loadJob -ErrorAction SilentlyContinue
Remove-Job -Job $loadJob -ErrorAction SilentlyContinue

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ DEMO HOÀN TẤT!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Kết quả cuối cùng:" -ForegroundColor Yellow
kubectl get hpa -n foodfast
Write-Host ""
kubectl get pods -n foodfast | Select-String "NAME|server-app"
Write-Host ""

Write-Host "💡 Lưu ý: Pods sẽ tự scale DOWN sau ~5 phút khi load giảm" -ForegroundColor Gray
Write-Host "   Xem real-time: kubectl get pods -n foodfast -w" -ForegroundColor Gray
Write-Host ""
