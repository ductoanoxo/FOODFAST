# ========================================
# TEST AUTO-SCALING SCRIPT
# ========================================
# Script này tạo load để test HPA (Horizontal Pod Autoscaler)

param(
    [int]$Duration = 60,        # Thời gian test (giây)
    [int]$Threads = 10,         # Số threads đồng thời
    [string]$Target = "server"  # Target: server, client, restaurant, admin, drone
)

# Xác định URL dựa vào target
$urls = @{
    "server" = "http://localhost:30050/api/products"
    "client" = "http://localhost:30000"
    "restaurant" = "http://localhost:30001"
    "admin" = "http://localhost:30002"
    "drone" = "http://localhost:30003"
}

$targetUrl = $urls[$Target]
if (!$targetUrl) {
    Write-Host "❌ Invalid target. Choose: server, client, restaurant, admin, drone" -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔥 AUTO-SCALING LOAD TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Target:   $Target" -ForegroundColor Yellow
Write-Host "URL:      $targetUrl" -ForegroundColor Yellow
Write-Host "Duration: $Duration seconds" -ForegroundColor Yellow
Write-Host "Threads:  $Threads" -ForegroundColor Yellow
Write-Host ""

# Hàm tạo load
function Start-LoadTest {
    param($Url, $ThreadId)
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $count = 0
    
    while ($stopwatch.Elapsed.TotalSeconds -lt $Duration) {
        try {
            $null = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
            $count++
        } catch {
            # Ignore errors
        }
    }
    
    return $count
}

# Hiển thị HPA trước khi test
Write-Host "📊 Current HPA status:" -ForegroundColor Yellow
kubectl get hpa -n foodfast
Write-Host ""

Write-Host "🚀 Starting load test..." -ForegroundColor Green
Write-Host ""

# Tạo jobs để chạy đồng thời
$jobs = @()
for ($i = 1; $i -le $Threads; $i++) {
    $jobs += Start-Job -ScriptBlock {
        param($Url, $ThreadId, $Duration)
        
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $count = 0
        
        while ($stopwatch.Elapsed.TotalSeconds -lt $Duration) {
            try {
                $null = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
                $count++
            } catch {
                # Ignore errors
            }
        }
        
        return $count
    } -ArgumentList $targetUrl, $i, $Duration
}

# Monitor HPA trong khi test
$monitorJob = Start-Job -ScriptBlock {
    param($Duration)
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    while ($stopwatch.Elapsed.TotalSeconds -lt $Duration) {
        Write-Host "`n⏱️  Time: $([int]$stopwatch.Elapsed.TotalSeconds)s / ${Duration}s" -ForegroundColor Cyan
        kubectl get hpa -n foodfast
        kubectl get pods -n foodfast | Select-String "server-app|client-app"
        Start-Sleep -Seconds 5
    }
} -ArgumentList $Duration

# Đợi test hoàn thành
Write-Host "⏳ Running load test for $Duration seconds..." -ForegroundColor Yellow
Write-Host "   (You can monitor HPA in another terminal with: kubectl get hpa -n foodfast -w)" -ForegroundColor Gray
Write-Host ""

Start-Sleep -Seconds $Duration

# Thu thập kết quả
Write-Host ""
Write-Host "📊 Collecting results..." -ForegroundColor Yellow

$totalRequests = 0
foreach ($job in $jobs) {
    $result = Receive-Job -Job $job -Wait
    $totalRequests += $result
    Remove-Job -Job $job
}

Stop-Job -Job $monitorJob
Remove-Job -Job $monitorJob

# Hiển thị kết quả
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ LOAD TEST COMPLETED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Requests: $totalRequests" -ForegroundColor Yellow
Write-Host "Avg RPS:        $([int]($totalRequests / $Duration))" -ForegroundColor Yellow
Write-Host ""

Write-Host "📊 Final HPA status:" -ForegroundColor Yellow
kubectl get hpa -n foodfast
Write-Host ""

Write-Host "🔍 Current pods:" -ForegroundColor Yellow
kubectl get pods -n foodfast
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "💡 TIPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "• Watch HPA in real-time:  kubectl get hpa -n foodfast -w" -ForegroundColor Gray
Write-Host "• Watch pods scale:         kubectl get pods -n foodfast -w" -ForegroundColor Gray
Write-Host "• Check metrics server:     kubectl top pods -n foodfast" -ForegroundColor Gray
Write-Host "• View HPA events:          kubectl describe hpa server-app-hpa -n foodfast" -ForegroundColor Gray
Write-Host ""
