🔥 HPA Status:
NAME             REFERENCE               TARGETS                        MINPODS   MAXPODS   REPLICAS   AGE
client-app-hpa   Deployment/client-app   cpu: 0%/30%                    2         5         2          6d15h
server-app-hpa   Deployment/server-app   cpu: 3%/30%, memory: 22%/50%   2         10        4          6d15h# ========================================
# KUBERNETES LOCAL LOAD TEST - 30% CPU
# ========================================
# Test autoscaling trên Kubernetes local cluster

param(
    [int]$Duration = 120,           # Thời gian test (giây)
    [int]$Threads = 25,             # Số threads đồng thời
    [int]$DelayMs = 100             # Delay giữa các request (ms)
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔥 K8S LOCAL LOAD TEST - TARGET 30% CPU" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Target:           localhost:30000 (server-app)" -ForegroundColor Yellow
Write-Host "Duration:         $Duration seconds" -ForegroundColor Yellow
Write-Host "Threads:          $Threads" -ForegroundColor Yellow
Write-Host "Delay per req:    ${DelayMs}ms" -ForegroundColor Yellow
Write-Host ""

# Kiểm tra kubectl
try {
    $null = kubectl version --client 2>$null
} catch {
    Write-Host "❌ kubectl not found. Please install kubectl first." -ForegroundColor Red
    exit 1
}

# Test endpoints trên local K8s
$baseUrl = "http://localhost:30000"
$endpoints = @(
    "/api/products",
    "/api/categories", 
    "/api/restaurants",
    "/api/health",
    "/"
)

# Test connection
Write-Host "🔍 Testing K8s service connection..." -ForegroundColor Yellow
try {
    $test = Invoke-WebRequest -Uri "$baseUrl/api/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Server is running on $baseUrl" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot connect to $baseUrl" -ForegroundColor Red
    Write-Host "   Make sure server-app is running:" -ForegroundColor Yellow
    Write-Host "   kubectl get svc -n foodfast" -ForegroundColor Gray
    Write-Host "   kubectl get pods -n foodfast" -ForegroundColor Gray
    exit 1
}
Write-Host ""

# Hiển thị trạng thái trước khi test
Write-Host "📊 Current K8s Status:" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
kubectl get hpa -n foodfast 2>$null
Write-Host ""
kubectl get pods -n foodfast -l app=server-app
Write-Host ""

# Hàm tạo load
$loadTestScript = {
    param($BaseUrl, $Endpoints, $Duration, $DelayMs, $ThreadId)
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $stats = @{
        Success = 0
        Error = 0
        TotalTime = 0
    }
    
    while ($stopwatch.Elapsed.TotalSeconds -lt $Duration) {
        try {
            $endpoint = $Endpoints | Get-Random
            $url = "$BaseUrl$endpoint"
            
            $sw = [System.Diagnostics.Stopwatch]::StartNew()
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
            $sw.Stop()
            
            $stats.Success++
            $stats.TotalTime += $sw.ElapsedMilliseconds
            
            if ($DelayMs -gt 0) {
                Start-Sleep -Milliseconds $DelayMs
            }
            
        } catch {
            $stats.Error++
            Start-Sleep -Milliseconds 200
        }
    }
    
    return $stats
}

Write-Host "🚀 Starting load test..." -ForegroundColor Green
Write-Host ""

# Tạo jobs
$jobs = @()
for ($i = 1; $i -le $Threads; $i++) {
    $jobs += Start-Job -ScriptBlock $loadTestScript -ArgumentList $baseUrl, $endpoints, $Duration, $DelayMs, $i
}

# Monitor real-time
$startTime = Get-Date
$checkInterval = 10

while ((Get-Date) - $startTime -lt [TimeSpan]::FromSeconds($Duration)) {
    $elapsed = [int]((Get-Date) - $startTime).TotalSeconds
    $remaining = $Duration - $elapsed
    
    Clear-Host
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "⏱️  LOAD TEST RUNNING" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Time:     ${elapsed}s / ${Duration}s (${remaining}s left)" -ForegroundColor Yellow
    Write-Host "Threads:  $Threads active" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "📊 HPA Status:" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
    $hpaOutput = kubectl get hpa -n foodfast --no-headers 2>$null
    if ($hpaOutput) {
        $hpaOutput | ForEach-Object {
            if ($_ -match "server") {
                $cpuMatch = $_ -match '(\d+)%/(\d+)%'
                if ($cpuMatch) {
                    $currentCpu = $matches[1]
                    $targetCpu = $matches[2]
                    $color = if ([int]$currentCpu -ge 30) { "Green" } elseif ([int]$currentCpu -ge 20) { "Yellow" } else { "White" }
                    Write-Host "   $_" -ForegroundColor $color
                    
                    if ([int]$currentCpu -ge 30) {
                        Write-Host "   🎯 TARGET REACHED: ${currentCpu}% >= 30%!" -ForegroundColor Green
                    }
                } else {
                    Write-Host "   $_" -ForegroundColor White
                }
            }
        }
    } else {
        Write-Host "   No HPA found" -ForegroundColor Gray
    }
    Write-Host ""
    
    Write-Host "🎯 Pods Status:" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
    $pods = kubectl get pods -n foodfast -l app=server-app --no-headers 2>$null
    if ($pods) {
        $podCount = ($pods | Measure-Object).Count
        $runningCount = ($pods | Select-String "Running" | Measure-Object).Count
        Write-Host "   Total: $podCount | Running: $runningCount" -ForegroundColor White
        
        # Hiển thị top 3 pods
        $pods | Select-Object -First 3 | ForEach-Object {
            Write-Host "   $_" -ForegroundColor Gray
        }
    }
    Write-Host ""
    
    Write-Host "💾 CPU/Memory Usage:" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
    $topPods = kubectl top pods -n foodfast -l app=server-app --no-headers 2>$null
    if ($topPods) {
        $topPods | ForEach-Object {
            Write-Host "   $_" -ForegroundColor White
        }
    } else {
        Write-Host "   (metrics not available)" -ForegroundColor Gray
    }
    Write-Host ""
    
    Start-Sleep -Seconds $checkInterval
}

# Thu thập kết quả
Write-Host ""
Write-Host "📊 Collecting results..." -ForegroundColor Yellow

$totalSuccess = 0
$totalError = 0
$totalTime = 0

foreach ($job in $jobs) {
    $result = Receive-Job -Job $job -Wait
    $totalSuccess += $result.Success
    $totalError += $result.Error
    $totalTime += $result.TotalTime
    Remove-Job -Job $job
}

$totalRequests = $totalSuccess + $totalError
$actualRPS = [math]::Round($totalSuccess / $Duration, 2)
$successRate = if ($totalRequests -gt 0) { [math]::Round(($totalSuccess / $totalRequests) * 100, 2) } else { 0 }
$avgResponseTime = if ($totalSuccess -gt 0) { [math]::Round($totalTime / $totalSuccess, 2) } else { 0 }

# Kết quả cuối cùng
Clear-Host
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ LOAD TEST COMPLETED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📈 PERFORMANCE METRICS:" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
Write-Host "   Total Requests:       $totalRequests" -ForegroundColor White
Write-Host "   Successful:           $totalSuccess ($successRate%)" -ForegroundColor Green
Write-Host "   Failed:               $totalError" -ForegroundColor $(if ($totalError -gt 0) { "Red" } else { "White" })
Write-Host "   Actual RPS:           $actualRPS req/s" -ForegroundColor White
Write-Host "   Avg Response Time:    ${avgResponseTime}ms" -ForegroundColor White
Write-Host "   Duration:             ${Duration}s" -ForegroundColor White
Write-Host "   Threads Used:         $Threads" -ForegroundColor White
Write-Host ""

Write-Host "📊 FINAL K8S STATUS:" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
kubectl get hpa -n foodfast 2>$null
Write-Host ""
kubectl get pods -n foodfast -l app=server-app
Write-Host ""

Write-Host "💾 FINAL CPU/MEMORY:" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
kubectl top pods -n foodfast -l app=server-app 2>$null
Write-Host ""

# Recommendations
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "💡 RECOMMENDATIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Lấy CPU hiện tại từ HPA
$hpaStatus = kubectl get hpa -n foodfast --no-headers 2>$null | Select-String "server"
if ($hpaStatus -and $hpaStatus -match '(\d+)%') {
    $finalCpu = [int]$matches[1]
    
    if ($finalCpu -lt 20) {
        Write-Host "⚠️  CPU too low (${finalCpu}%). To reach 30%:" -ForegroundColor Yellow
        Write-Host "   .\k8s-load-test.ps1 -Threads $([int]($Threads * 1.5)) -Duration 120 -DelayMs $([int]($DelayMs * 0.7))" -ForegroundColor Gray
    } elseif ($finalCpu -ge 20 -and $finalCpu -lt 30) {
        Write-Host "📊 CPU close to target (${finalCpu}%). Fine-tune:" -ForegroundColor Yellow
        Write-Host "   .\k8s-load-test.ps1 -Threads $([int]($Threads * 1.2)) -Duration 120 -DelayMs $([int]($DelayMs * 0.8))" -ForegroundColor Gray
    } elseif ($finalCpu -ge 30 -and $finalCpu -lt 50) {
        Write-Host "✅ Perfect! CPU at ${finalCpu}% - HPA should scale up!" -ForegroundColor Green
        Write-Host "   Watch scaling: kubectl get pods -n foodfast -w" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  CPU too high (${finalCpu}%). Reduce load:" -ForegroundColor Yellow
        Write-Host "   .\k8s-load-test.ps1 -Threads $([int]($Threads * 0.7)) -Duration 120 -DelayMs $([int]($DelayMs * 1.3))" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🔍 Monitoring Commands:" -ForegroundColor Cyan
Write-Host "   kubectl get hpa -n foodfast -w" -ForegroundColor Gray
Write-Host "   kubectl get pods -n foodfast -w" -ForegroundColor Gray
Write-Host "   kubectl top pods -n foodfast" -ForegroundColor Gray
Write-Host "   kubectl describe hpa -n foodfast" -ForegroundColor Gray
Write-Host ""

Write-Host "📊 View Metrics:" -ForegroundColor Cyan
Write-Host "   curl http://localhost:30000/metrics" -ForegroundColor Gray
Write-Host ""
