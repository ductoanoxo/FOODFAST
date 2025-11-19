# ========================================
# MONITOR AUTO-SCALING
# ========================================
# Script để monitor HPA, Pods, CPU/Memory real-time

param(
    [int]$Interval = 3  # Refresh interval (seconds)
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 AUTO-SCALING MONITOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Refresh every $Interval seconds. Press Ctrl+C to stop." -ForegroundColor Yellow
Write-Host ""

while ($true) {
    Clear-Host
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "📊 AUTO-SCALING MONITOR - $timestamp" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # HPA Status
    Write-Host "🔥 HPA Status:" -ForegroundColor Yellow
    kubectl get hpa -n foodfast 2>$null
    Write-Host ""
    
    # Pod Status
    Write-Host "🚀 Pods (Server & Client):" -ForegroundColor Yellow
    kubectl get pods -n foodfast | Select-String "NAME|server-app|client-app"
    Write-Host ""
    
    # Resource Usage (requires metrics-server)
    Write-Host "💻 Resource Usage:" -ForegroundColor Yellow
    $metricsAvailable = kubectl top pods -n foodfast 2>$null
    if ($LASTEXITCODE -eq 0) {
        $metricsAvailable | Select-String "NAME|server-app|client-app"
    } else {
        Write-Host "   ⚠️  Metrics server not available" -ForegroundColor Red
        Write-Host "   Install: kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml" -ForegroundColor Gray
    }
    Write-Host ""
    
    # Deployment Replicas
    Write-Host "📦 Deployments:" -ForegroundColor Yellow
    kubectl get deployment -n foodfast 2>$null | Select-String "NAME|server-app|client-app"
    Write-Host ""
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Gray
    
    Start-Sleep -Seconds $Interval
}
