# ========================================
# SETUP GRAFANA & PROMETHEUS
# ========================================
# Script tự động cài đặt Prometheus + Grafana monitoring stack

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 SETUP GRAFANA & PROMETHEUS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Kiểm tra Helm
Write-Host "📋 Step 1: Checking Helm..." -ForegroundColor Yellow
if (!(Get-Command helm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Helm not found. Installing Helm..." -ForegroundColor Red
    
    # Download Helm
    $helmVersion = "v3.13.1"
    $helmUrl = "https://get.helm.sh/helm-$helmVersion-windows-amd64.zip"
    $helmZip = "$env:TEMP\helm.zip"
    $helmDir = "$env:TEMP\helm"
    
    Write-Host "   Downloading Helm $helmVersion..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $helmUrl -OutFile $helmZip
    
    Write-Host "   Extracting..." -ForegroundColor Cyan
    Expand-Archive -Path $helmZip -DestinationPath $helmDir -Force
    
    Write-Host "   Installing to C:\Program Files\helm..." -ForegroundColor Cyan
    $targetDir = "C:\Program Files\helm"
    if (!(Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir | Out-Null
    }
    Copy-Item "$helmDir\windows-amd64\helm.exe" -Destination "$targetDir\helm.exe" -Force
    
    # Add to PATH
    $env:Path += ";C:\Program Files\helm"
    [Environment]::SetEnvironmentVariable("Path", $env:Path, [EnvironmentVariableTarget]::Machine)
    
    Write-Host "✅ Helm installed successfully" -ForegroundColor Green
} else {
    Write-Host "✅ Helm found" -ForegroundColor Green
}
Write-Host ""

# 2. Kiểm tra Metrics Server
Write-Host "📋 Step 2: Checking Metrics Server..." -ForegroundColor Yellow
$metricsServer = kubectl get deployment metrics-server -n kube-system 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Metrics Server not found. Installing..." -ForegroundColor Yellow
    
    kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
    
    Write-Host "   Patching for Docker Desktop..." -ForegroundColor Cyan
    kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
    
    Write-Host "   Waiting for Metrics Server to be ready (30s)..." -ForegroundColor Cyan
    Start-Sleep -Seconds 30
    
    Write-Host "✅ Metrics Server installed" -ForegroundColor Green
} else {
    Write-Host "✅ Metrics Server already exists" -ForegroundColor Green
}
Write-Host ""

# 3. Add Prometheus Helm Repo
Write-Host "📋 Step 3: Adding Prometheus Helm repo..." -ForegroundColor Yellow
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts 2>$null
helm repo update
Write-Host "✅ Helm repo added" -ForegroundColor Green
Write-Host ""

# 4. Create monitoring namespace
Write-Host "📋 Step 4: Creating monitoring namespace..." -ForegroundColor Yellow
kubectl create namespace monitoring 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Namespace created" -ForegroundColor Green
} else {
    Write-Host "✅ Namespace already exists" -ForegroundColor Green
}
Write-Host ""

# 5. Install Prometheus Stack
Write-Host "📋 Step 5: Installing Prometheus + Grafana stack..." -ForegroundColor Yellow
$stackExists = helm list -n monitoring | Select-String "prometheus-stack"
if (!$stackExists) {
    Write-Host "   This may take 3-5 minutes..." -ForegroundColor Cyan
    
    helm install prometheus-stack prometheus-community/kube-prometheus-stack `
        --namespace monitoring `
        --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false `
        --set grafana.adminPassword=admin123 `
        --set grafana.service.type=NodePort `
        --set grafana.service.nodePort=32000 `
        --set prometheus.service.type=NodePort `
        --set prometheus.service.nodePort=32001 `
        --set prometheus-node-exporter.enabled=false
    
    Write-Host "✅ Prometheus Stack installed" -ForegroundColor Green
} else {
    Write-Host "✅ Prometheus Stack already exists" -ForegroundColor Green
}
Write-Host ""

# 6. Wait for pods to be ready
Write-Host "📋 Step 6: Waiting for monitoring pods to be ready..." -ForegroundColor Yellow
Write-Host "   This may take 2-3 minutes..." -ForegroundColor Cyan

$timeout = 180
$elapsed = 0
while ($elapsed -lt $timeout) {
    $notReady = kubectl get pods -n monitoring --no-headers 2>$null | Where-Object { $_ -notmatch "Running|Completed" }
    
    if (!$notReady) {
        Write-Host "✅ All monitoring pods are ready!" -ForegroundColor Green
        break
    }
    
    Write-Host "   Waiting... ($elapsed/$timeout seconds)" -ForegroundColor Gray
    Start-Sleep -Seconds 10
    $elapsed += 10
}

if ($elapsed -ge $timeout) {
    Write-Host "⚠️  Timeout waiting for pods. Some may still be starting..." -ForegroundColor Yellow
}
Write-Host ""

# 7. Deploy ServiceMonitor
Write-Host "📋 Step 7: Deploying ServiceMonitor for FOODFAST..." -ForegroundColor Yellow
if (Test-Path "k8s\servicemonitor.yaml") {
    kubectl apply -f k8s\servicemonitor.yaml
    Write-Host "✅ ServiceMonitor deployed" -ForegroundColor Green
} else {
    Write-Host "⚠️  k8s\servicemonitor.yaml not found. Skipping..." -ForegroundColor Yellow
}
Write-Host ""

# 8. Show status
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 MONITORING STATUS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Monitoring Pods:" -ForegroundColor Yellow
kubectl get pods -n monitoring
Write-Host ""

Write-Host "Monitoring Services:" -ForegroundColor Yellow
kubectl get svc -n monitoring | Select-String "grafana|prometheus"
Write-Host ""

# 9. Show access URLs
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🌐 ACCESS URLs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Grafana Dashboard:" -ForegroundColor Green
Write-Host "   URL:      http://localhost:32000" -ForegroundColor Cyan
Write-Host "   Username: admin" -ForegroundColor Cyan
Write-Host "   Password: admin123" -ForegroundColor Cyan
Write-Host ""

Write-Host "Prometheus UI:" -ForegroundColor Green
Write-Host "   URL: http://localhost:32001" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📝 NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Truy cập Grafana: http://localhost:32000" -ForegroundColor Yellow
Write-Host "2. Login với admin/admin123" -ForegroundColor Yellow
Write-Host "3. Import dashboards:" -ForegroundColor Yellow
Write-Host "   - Kubernetes Cluster Monitoring (ID: 7249)" -ForegroundColor Gray
Write-Host "   - Kubernetes Pods (ID: 6417)" -ForegroundColor Gray
Write-Host "   - Node Exporter Full (ID: 1860)" -ForegroundColor Gray
Write-Host "4. Tạo custom dashboard cho FOODFAST" -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "💡 Xem hướng dẫn chi tiết: KUBERNETES_GRAFANA_GUIDE.md" -ForegroundColor Gray
