# ========================================
# FOODFAST K8S DEPLOYMENT SCRIPT
# Chạy từ root folder: .\deploy-k8s.ps1
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 FOODFAST K8S DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check kubectl
Write-Host "1️⃣ Checking kubectl..." -ForegroundColor Yellow
if (!(Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Host "❌ kubectl not found!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ kubectl found" -ForegroundColor Green
Write-Host ""

# Check cluster
Write-Host "2️⃣ Checking Kubernetes cluster..." -ForegroundColor Yellow
try {
    kubectl cluster-info | Out-Null
    Write-Host "✅ Cluster is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot connect to cluster" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check images
Write-Host "3️⃣ Checking Docker images..." -ForegroundColor Yellow
$images = @(
    "ductoanoxo/foodfast-server:latest",
    "ductoanoxo/foodfast-client:latest"
)
$missing = @()
foreach ($img in $images) {
    if (!(docker images -q $img)) {
        $missing += $img
    }
}
if ($missing.Count -gt 0) {
    Write-Host "⚠️  Missing images:" -ForegroundColor Yellow
    $missing | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    $build = Read-Host "Build missing images now? (y/n)"
    if ($build -eq 'y') {
        docker build -t ductoanoxo/foodfast-server:latest ./server_app
        docker build -t ductoanoxo/foodfast-client:latest ./client_app
        docker build -t ductoanoxo/foodfast-restaurant:latest ./restaurant_app
        docker build -t ductoanoxo/foodfast-admin:latest ./admin_app
        docker build -t ductoanoxo/foodfast-drone:latest ./drone_manage
    }
}
Write-Host "✅ Images ready" -ForegroundColor Green
Write-Host ""

# Deploy namespace
Write-Host "4️⃣ Creating namespace..." -ForegroundColor Yellow
kubectl apply -f k8s/namespace.yaml
Write-Host ""

# Check secrets
Write-Host "5️⃣ Creating secrets..." -ForegroundColor Yellow
Write-Host "⚠️  Make sure you updated k8s/secret.yaml!" -ForegroundColor Yellow
$continue = Read-Host "Continue? (y/n)"
if ($continue -ne 'y') {
    Write-Host "❌ Aborted" -ForegroundColor Red
    exit 1
}
kubectl apply -f k8s/secret.yaml
Write-Host ""

# Deploy configmap
Write-Host "6️⃣ Creating configmap..." -ForegroundColor Yellow
kubectl apply -f k8s/configmap.yaml
Write-Host ""

# MongoDB
Write-Host "7️⃣ Deploy MongoDB?" -ForegroundColor Yellow
$mongo = Read-Host "Deploy local MongoDB? (y/n)"
if ($mongo -eq 'y') {
    kubectl apply -f k8s/mongodb-statefulset.yaml
    Write-Host "   Waiting 20s for MongoDB..." -ForegroundColor Cyan
    Start-Sleep -Seconds 20
}
Write-Host ""

# Server
Write-Host "8️⃣ Deploying Server..." -ForegroundColor Yellow
kubectl apply -f k8s/server-deployment.yaml
Write-Host ""

# Clients
Write-Host "9️⃣ Deploying Client Apps..." -ForegroundColor Yellow
kubectl apply -f k8s/client-apps-deployment.yaml
Write-Host ""

# Wait
Write-Host "🔟 Waiting for pods..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Write-Host ""

# Status
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 STATUS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
kubectl get pods -n foodfast
Write-Host ""
kubectl get svc -n foodfast
Write-Host ""

# URLs
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🌐 ACCESS URLs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Client:     http://localhost:30000" -ForegroundColor Green
Write-Host "Restaurant: http://localhost:30001" -ForegroundColor Green
Write-Host "Admin:      http://localhost:30002" -ForegroundColor Green
Write-Host "Drone:      http://localhost:30003" -ForegroundColor Green
Write-Host "API:        http://localhost:5000" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ DONE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Useful commands:" -ForegroundColor Yellow
Write-Host "   kubectl get pods -n foodfast" -ForegroundColor Cyan
Write-Host "   kubectl logs -f deployment/server-app -n foodfast" -ForegroundColor Cyan
Write-Host "   kubectl delete namespace foodfast" -ForegroundColor Cyan
Write-Host ""
