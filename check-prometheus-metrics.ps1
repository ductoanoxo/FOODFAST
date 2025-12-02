# Script kiểm tra Prometheus metrics
Write-Host "🔍 Checking Prometheus Metrics for server-app" -ForegroundColor Cyan
Write-Host ""

$prometheusUrl = "http://localhost:9090"

# Test 1: Kiểm tra container_cpu_usage_seconds_total
Write-Host "1️⃣  Checking container_cpu_usage_seconds_total..." -ForegroundColor Yellow
$query1 = "container_cpu_usage_seconds_total{namespace=`"foodfast`"}"
try {
    $result1 = Invoke-RestMethod -Uri "$prometheusUrl/api/v1/query?query=$query1" -Method Get
    if ($result1.data.result.Count -gt 0) {
        Write-Host "   ✅ Found $($result1.data.result.Count) metrics" -ForegroundColor Green
        Write-Host "   Sample labels:" -ForegroundColor Gray
        $result1.data.result[0].metric | ConvertTo-Json -Compress | Write-Host
    } else {
        Write-Host "   ❌ No data found" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Kiểm tra pods có đúng tên không
Write-Host "2️⃣  Checking actual pod names..." -ForegroundColor Yellow
$pods = kubectl get pods -n foodfast -l app=server-app -o jsonpath='{.items[*].metadata.name}'
Write-Host "   Pods: $pods" -ForegroundColor White
Write-Host ""

# Test 3: Kiểm tra kube_pod_container_resource_requests
Write-Host "3️⃣  Checking kube_pod_container_resource_requests..." -ForegroundColor Yellow
$query2 = "kube_pod_container_resource_requests{namespace=`"foodfast`",resource=`"cpu`"}"
try {
    $result2 = Invoke-RestMethod -Uri "$prometheusUrl/api/v1/query?query=$query2" -Method Get
    if ($result2.data.result.Count -gt 0) {
        Write-Host "   ✅ Found $($result2.data.result.Count) metrics" -ForegroundColor Green
        Write-Host "   Sample labels:" -ForegroundColor Gray
        $result2.data.result[0].metric | ConvertTo-Json -Compress | Write-Host
    } else {
        Write-Host "   ❌ No data found" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Thử các query đơn giản
Write-Host "4️⃣  Testing simple queries..." -ForegroundColor Yellow

$testQueries = @(
    @{
        Name = "All CPU metrics in namespace"
        Query = "container_cpu_usage_seconds_total{namespace=`"foodfast`"}"
    },
    @{
        Name = "CPU for server-app pods"
        Query = "container_cpu_usage_seconds_total{namespace=`"foodfast`",pod=~`"server-app-.*`"}"
    },
    @{
        Name = "CPU rate for server-app"
        Query = "rate(container_cpu_usage_seconds_total{namespace=`"foodfast`",pod=~`"server-app-.*`",container!=`"POD`"}[5m])"
    },
    @{
        Name = "Resource requests"
        Query = "kube_pod_container_resource_requests{namespace=`"foodfast`",pod=~`"server-app-.*`"}"
    }
)

foreach ($test in $testQueries) {
    Write-Host "   Testing: $($test.Name)" -ForegroundColor Gray
    try {
        $result = Invoke-RestMethod -Uri "$prometheusUrl/api/v1/query?query=$($test.Query)" -Method Get
        if ($result.data.result.Count -gt 0) {
            Write-Host "      ✅ $($result.data.result.Count) results" -ForegroundColor Green
        } else {
            Write-Host "      ❌ No data" -ForegroundColor Red
        }
    } catch {
        Write-Host "      ❌ Error" -ForegroundColor Red
    }
}
Write-Host ""

# Test 5: Kiểm tra metrics server
Write-Host "5️⃣  Checking Kubernetes Metrics Server..." -ForegroundColor Yellow
try {
    kubectl top pods -n foodfast -l app=server-app 2>$null
    Write-Host "   ✅ Metrics server working" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Metrics server not available" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "💡 RECOMMENDATIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If no data found, try these queries instead:" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Simple CPU query:" -ForegroundColor Green
Write-Host "sum(rate(container_cpu_usage_seconds_total{pod=~`"server-app.*`"}[5m]))" -ForegroundColor White
Write-Host ""
Write-Host "✅ CPU % based on limits (not requests):" -ForegroundColor Green
Write-Host "100 * sum(rate(container_cpu_usage_seconds_total{pod=~`"server-app.*`",container!=`"`"}[5m])) / sum(kube_pod_container_resource_limits{pod=~`"server-app.*`",resource=`"cpu`"})" -ForegroundColor White
Write-Host ""
Write-Host "✅ Use HPA metrics directly:" -ForegroundColor Green
Write-Host "kubectl get --raw /apis/metrics.k8s.io/v1beta1/namespaces/foodfast/pods | ConvertFrom-Json | Select-Object -ExpandProperty items | Where-Object { `$_.metadata.name -like 'server-app*' }" -ForegroundColor White
Write-Host ""
