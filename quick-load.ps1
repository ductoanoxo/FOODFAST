# Quick K8s Load Test
# Sử dụng: .\quick-load.ps1

Write-Host "🔥 Quick Load Test - K8s Local" -ForegroundColor Cyan
Write-Host ""

# Test connection
try {
    $test = Invoke-WebRequest -Uri "http://localhost:30000/api/health" -UseBasicParsing -TimeoutSec 3
    Write-Host "✅ Server OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Server not responding at localhost:30000" -ForegroundColor Red
    exit 1
}

Write-Host "📊 Before:" -ForegroundColor Yellow
kubectl get hpa -n foodfast
kubectl get pods -n foodfast -l app=server-app
Write-Host ""

Write-Host "🚀 Generating load for 60 seconds..." -ForegroundColor Yellow
Write-Host ""

# Simple load generator
$jobs = 1..30 | ForEach-Object {
    Start-Job {
        $urls = @(
            "http://localhost:30000/api/products",
            "http://localhost:30000/api/categories",
            "http://localhost:30000/api/restaurants",
            "http://localhost:30000/api/health"
        )
        
        $end = (Get-Date).AddSeconds(60)
        while ((Get-Date) -lt $end) {
            try {
                Invoke-WebRequest -Uri ($urls | Get-Random) -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue | Out-Null
            } catch {}
            Start-Sleep -Milliseconds 50
        }
    }
}

# Monitor
for ($i = 0; $i -lt 12; $i++) {
    Start-Sleep -Seconds 5
    Write-Host "⏱️  $([int]($i * 5))s..." -ForegroundColor Cyan
    kubectl get hpa -n foodfast --no-headers | Select-String "server"
}

# Cleanup
$jobs | Remove-Job -Force

Write-Host ""
Write-Host "📊 After:" -ForegroundColor Yellow
kubectl get hpa -n foodfast
kubectl get pods -n foodfast -l app=server-app
kubectl top pods -n foodfast -l app=server-app 2>$null
Write-Host ""
