# ========================================
# DIAGNOSTIC SCRIPT - K8S & MONITORING
# ========================================
# Thu thập thông tin để troubleshoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔍 KUBERNETES & MONITORING DIAGNOSTIC" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$reportFile = "diagnostic-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"

function Write-Section {
    param($Title)
    $separator = "=" * 60
    $output = "`n$separator`n$Title`n$separator`n"
    Write-Host $output -ForegroundColor Yellow
    Add-Content -Path $reportFile -Value $output
}

# 1. Cluster Info
Write-Section "CLUSTER INFO"
$output = kubectl cluster-info 2>&1
Write-Host $output
Add-Content -Path $reportFile -Value $output

# 2. Nodes
Write-Section "NODES"
$output = kubectl get nodes -o wide 2>&1
Write-Host $output
Add-Content -Path $reportFile -Value $output

# 3. Namespaces
Write-Section "NAMESPACES"
$output = kubectl get namespaces 2>&1
Write-Host $output
Add-Content -Path $reportFile -Value $output

# 4. FOODFAST Pods
Write-Section "FOODFAST PODS"
$output = kubectl get pods -n foodfast -o wide 2>&1
Write-Host $output
Add-Content -Path $reportFile -Value $output

# 5. FOODFAST Services
Write-Section "FOODFAST SERVICES"
$output = kubectl get svc -n foodfast 2>&1
Write-Host $output
Add-Content -Path $reportFile -Value $output

# 6. HPA Status
Write-Section "HPA STATUS"
$output = kubectl get hpa -n foodfast 2>&1
Write-Host $output
Add-Content -Path $reportFile -Value $output

# 7. Metrics Server
Write-Section "METRICS SERVER"
$output = kubectl get deployment metrics-server -n kube-system 2>&1
Write-Host $output
Add-Content -Path $reportFile -Value $output

# 8. Top Nodes
Write-Section "TOP NODES"
$output = kubectl top nodes 2>&1
Write-Host $output
Add-Content -Path $reportFile -Value $output

# 9. Top Pods
Write-Section "TOP PODS (FOODFAST)"
$output = kubectl top pods -n foodfast 2>&1
Write-Host $output
Add-Content -Path $reportFile -Value $output

# 10. Monitoring Pods
Write-Section "MONITORING PODS"
$output = kubectl get pods -n monitoring 2>&1
Write-Host $output
Add-Content -Path $reportFile -Value $output

# 11. Monitoring Services
Write-Section "MONITORING SERVICES"
$output = kubectl get svc -n monitoring 2>&1
Write-Host $output
Add-Content -Path $reportFile -Value $output

# 12. Recent Events (FOODFAST)
Write-Section "RECENT EVENTS (FOODFAST)"
$output = kubectl get events -n foodfast --sort-by='.lastTimestamp' --field-selector type!=Normal 2>&1 | Select-Object -Last 20
Write-Host $output
Add-Content -Path $reportFile -Value $output

# 13. Recent Events (Monitoring)
Write-Section "RECENT EVENTS (MONITORING)"
$output = kubectl get events -n monitoring --sort-by='.lastTimestamp' --field-selector type!=Normal 2>&1 | Select-Object -Last 20
Write-Host $output
Add-Content -Path $reportFile -Value $output

# 14. Docker Images
Write-Section "DOCKER IMAGES (FOODFAST)"
$output = docker images | Select-String "foodfast"
Write-Host $output
Add-Content -Path $reportFile -Value $output

# 15. Helm Releases
Write-Section "HELM RELEASES"
$output = helm list -A 2>&1
Write-Host $output
Add-Content -Path $reportFile -Value $output

# 16. Pod Logs (Failed pods only)
Write-Section "FAILED POD LOGS"
$failedPods = kubectl get pods -n foodfast --no-headers 2>$null | Where-Object { $_ -match "Error|CrashLoop|Pending" }
if ($failedPods) {
    foreach ($pod in $failedPods) {
        $podName = ($pod -split '\s+')[0]
        Write-Host "`nLogs for $podName`:" -ForegroundColor Red
        $logs = kubectl logs $podName -n foodfast --tail=50 2>&1
        Write-Host $logs
        Add-Content -Path $reportFile -Value "`nLogs for $podName`:`n$logs"
    }
} else {
    $msg = "No failed pods found"
    Write-Host $msg -ForegroundColor Green
    Add-Content -Path $reportFile -Value $msg
}

# 17. ConfigMap
Write-Section "CONFIGMAP (FOODFAST)"
$output = kubectl get configmap foodfast-config -n foodfast -o yaml 2>&1
Write-Host $output
Add-Content -Path $reportFile -Value $output

# 18. HPA Describe
Write-Section "HPA DESCRIBE"
$hpas = kubectl get hpa -n foodfast --no-headers 2>$null | ForEach-Object { ($_ -split '\s+')[0] }
foreach ($hpa in $hpas) {
    $output = kubectl describe hpa $hpa -n foodfast 2>&1
    Write-Host $output
    Add-Content -Path $reportFile -Value $output
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ DIAGNOSTIC COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Report saved to: $reportFile" -ForegroundColor Yellow
Write-Host ""

# Quick Summary
Write-Host "📊 QUICK SUMMARY:" -ForegroundColor Cyan
Write-Host ""

$foodfastPods = kubectl get pods -n foodfast --no-headers 2>$null
$foodfastRunning = ($foodfastPods | Where-Object { $_ -match "Running" }).Count
$foodfastTotal = ($foodfastPods).Count
Write-Host "FOODFAST Pods:    $foodfastRunning/$foodfastTotal Running" -ForegroundColor $(if ($foodfastRunning -eq $foodfastTotal) { "Green" } else { "Yellow" })

$monitoringPods = kubectl get pods -n monitoring --no-headers 2>$null
$monitoringRunning = ($monitoringPods | Where-Object { $_ -match "Running" }).Count
$monitoringTotal = ($monitoringPods).Count
Write-Host "Monitoring Pods:  $monitoringRunning/$monitoringTotal Running" -ForegroundColor $(if ($monitoringRunning -eq $monitoringTotal) { "Green" } else { "Yellow" })

$metricsOk = kubectl top nodes 2>&1 | Select-String "error"
if (!$metricsOk) {
    Write-Host "Metrics Server:   ✅ OK" -ForegroundColor Green
} else {
    Write-Host "Metrics Server:   ❌ NOT WORKING" -ForegroundColor Red
}

$grafanaPort = kubectl get svc -n monitoring 2>$null | Select-String "grafana.*32000"
if ($grafanaPort) {
    Write-Host "Grafana Access:   ✅ http://localhost:32000" -ForegroundColor Green
} else {
    Write-Host "Grafana Access:   ⚠️  Port 32000 not exposed" -ForegroundColor Yellow
}

Write-Host ""
