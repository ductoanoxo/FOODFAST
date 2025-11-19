Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          KIỂM TRA GRAFANA DATA AVAILABILITY            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Kiểm tra Prometheus pods
Write-Host "[1/6] Checking Prometheus pods..." -ForegroundColor Yellow
$promPods = kubectl get pods -n monitoring -l app.kubernetes.io/name=prometheus -o jsonpath='{.items[*].status.phase}'
if ($promPods -match "Running") {
    Write-Host "   ✅ Prometheus pods: RUNNING" -ForegroundColor Green
} else {
    Write-Host "   ❌ Prometheus pods: NOT RUNNING" -ForegroundColor Red
    Write-Host "      Fix: kubectl rollout restart statefulset -n monitoring prometheus-prometheus-stack-kube-prom-prometheus" -ForegroundColor Cyan
}

# 2. Kiểm tra Grafana pods
Write-Host "`n[2/6] Checking Grafana pods..." -ForegroundColor Yellow
$grafanaPods = kubectl get pods -n monitoring -l app.kubernetes.io/name=grafana -o jsonpath='{.items[*].status.phase}'
if ($grafanaPods -match "Running") {
    Write-Host "   ✅ Grafana pods: RUNNING" -ForegroundColor Green
    Write-Host "      Access: http://localhost:32000 (admin/admin123)" -ForegroundColor Cyan
} else {
    Write-Host "   ❌ Grafana pods: NOT RUNNING" -ForegroundColor Red
}

# 3. Kiểm tra ServiceMonitor
Write-Host "`n[3/6] Checking ServiceMonitor..." -ForegroundColor Yellow
$sm = kubectl get servicemonitor foodfast-monitor -n monitoring 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ ServiceMonitor: EXISTS" -ForegroundColor Green
    
    # Kiểm tra label
    $labels = kubectl get servicemonitor foodfast-monitor -n monitoring -o jsonpath='{.metadata.labels.release}'
    if ($labels -eq "prometheus-stack") {
        Write-Host "   ✅ ServiceMonitor label: CORRECT (release=prometheus-stack)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  ServiceMonitor label: MISSING or INCORRECT" -ForegroundColor Yellow
        Write-Host "      Fix: kubectl label servicemonitor foodfast-monitor -n monitoring release=prometheus-stack --overwrite" -ForegroundColor Cyan
    }
} else {
    Write-Host "   ❌ ServiceMonitor: NOT FOUND" -ForegroundColor Red
    Write-Host "      Fix: kubectl apply -f k8s/servicemonitor.yaml" -ForegroundColor Cyan
}

# 4. Kiểm tra FOODFAST pods
Write-Host "`n[4/6] Checking FOODFAST pods..." -ForegroundColor Yellow
$foodfastPods = kubectl get pods -n foodfast -o json | ConvertFrom-Json
$runningCount = ($foodfastPods.items | Where-Object { $_.status.phase -eq "Running" }).Count
$totalCount = $foodfastPods.items.Count
Write-Host "   ✅ FOODFAST pods: $runningCount/$totalCount Running" -ForegroundColor Green

if ($runningCount -eq 0) {
    Write-Host "   ⚠️  WARNING: No pods running in foodfast namespace!" -ForegroundColor Yellow
    Write-Host "      Fix: kubectl apply -f k8s/ -R" -ForegroundColor Cyan
}

# 5. Port forward và test Prometheus API
Write-Host "`n[5/6] Testing Prometheus API..." -ForegroundColor Yellow
Write-Host "   Port forwarding Prometheus (this may take 5 seconds)..." -ForegroundColor Gray

$job = Start-Job -ScriptBlock {
    kubectl port-forward -n monitoring svc/prometheus-stack-kube-prom-prometheus 9092:9090 2>$null
}
Start-Sleep -Seconds 5

try {
    # Test query 1: up metric
    $query1 = "up{namespace='foodfast'}"
    $encodedQuery1 = [System.Uri]::EscapeDataString($query1)
    $response1 = Invoke-RestMethod -Uri "http://localhost:9092/api/v1/query?query=$encodedQuery1" -TimeoutSec 5 -ErrorAction Stop
    
    if ($response1.status -eq "success" -and $response1.data.result.Count -gt 0) {
        Write-Host "   ✅ Prometheus query 'up': WORKING ($($response1.data.result.Count) results)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Prometheus query 'up': NO RESULTS" -ForegroundColor Yellow
    }
    
    # Test query 2: kube_pod_info
    $query2 = "kube_pod_info{namespace='foodfast'}"
    $encodedQuery2 = [System.Uri]::EscapeDataString($query2)
    $response2 = Invoke-RestMethod -Uri "http://localhost:9092/api/v1/query?query=$encodedQuery2" -TimeoutSec 5 -ErrorAction Stop
    
    if ($response2.status -eq "success" -and $response2.data.result.Count -gt 0) {
        Write-Host "   ✅ Prometheus query 'kube_pod_info': WORKING ($($response2.data.result.Count) pods found)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Prometheus query 'kube_pod_info': NO RESULTS" -ForegroundColor Yellow
    }
    
    # Test query 3: container CPU
    $query3 = "container_cpu_usage_seconds_total{namespace='foodfast'}"
    $encodedQuery3 = [System.Uri]::EscapeDataString($query3)
    $response3 = Invoke-RestMethod -Uri "http://localhost:9092/api/v1/query?query=$encodedQuery3" -TimeoutSec 5 -ErrorAction Stop
    
    if ($response3.status -eq "success" -and $response3.data.result.Count -gt 0) {
        Write-Host "   ✅ Prometheus query 'container_cpu_usage': WORKING ($($response3.data.result.Count) metrics)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Prometheus query 'container_cpu_usage': NO RESULTS" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   ❌ Prometheus API: ERROR" -ForegroundColor Red
    Write-Host "      Error: $_" -ForegroundColor Gray
    Write-Host "      Fix: Check if Prometheus pod is running" -ForegroundColor Cyan
}

Stop-Job $job -ErrorAction SilentlyContinue
Remove-Job $job -ErrorAction SilentlyContinue

# 6. Kiểm tra Prometheus targets
Write-Host "`n[6/6] Checking Prometheus targets..." -ForegroundColor Yellow
Write-Host "   Opening Prometheus UI in browser..." -ForegroundColor Gray

# Port forward lại cho targets
$job2 = Start-Job -ScriptBlock {
    kubectl port-forward -n monitoring svc/prometheus-stack-kube-prom-prometheus 9093:9090 2>$null
}
Start-Sleep -Seconds 3

try {
    $targets = Invoke-RestMethod -Uri "http://localhost:9093/api/v1/targets" -TimeoutSec 5 -ErrorAction Stop
    $activeTargets = $targets.data.activeTargets
    $upCount = ($activeTargets | Where-Object { $_.health -eq "up" }).Count
    $totalTargets = $activeTargets.Count
    
    Write-Host "   ✅ Prometheus targets: $upCount/$totalTargets UP" -ForegroundColor Green
    
    if ($upCount -lt $totalTargets) {
        Write-Host "   ⚠️  WARNING: Some targets are DOWN" -ForegroundColor Yellow
        Write-Host "      Check: http://localhost:9093/targets" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ⚠️  Could not fetch targets status" -ForegroundColor Yellow
    Write-Host "      Check manually: http://localhost:9093/targets" -ForegroundColor Cyan
}

Stop-Job $job2 -ErrorAction SilentlyContinue
Remove-Job $job2 -ErrorAction SilentlyContinue

# Summary
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                         SUMMARY                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open Grafana: http://localhost:32000" -ForegroundColor White
Write-Host "   Login: admin / admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Create a new dashboard with these simple queries:" -ForegroundColor White
Write-Host "   • count(kube_pod_info{namespace=`"foodfast`"})" -ForegroundColor Cyan
Write-Host "   • sum(rate(container_cpu_usage_seconds_total{namespace=`"foodfast`",container!=`"POD`"}[5m])) by (pod)" -ForegroundColor Cyan
Write-Host "   • sum(container_memory_working_set_bytes{namespace=`"foodfast`",container!=`"POD`"}) by (pod)" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Set Time Range: Last 15 minutes + Auto-refresh: 5s" -ForegroundColor White
Write-Host ""
Write-Host "4. For complete PromQL queries, see:" -ForegroundColor White
Write-Host "   • GRAFANA_NO_DATA_FIX.md (quick fix)" -ForegroundColor Cyan
Write-Host "   • KUBERNETES_GRAFANA_GUIDE.md (full guide, section 7)" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. If still no data, run:" -ForegroundColor White
Write-Host "   .\setup-grafana.ps1 -Reinstall" -ForegroundColor Cyan
Write-Host ""
