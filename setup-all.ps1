# ========================================
# ALL-IN-ONE SETUP SCRIPT
# ========================================
# Script tự động setup toàn bộ: K8s + App + Monitoring

param(
    [switch]$SkipMonitoring = $false
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                        ║" -ForegroundColor Cyan
Write-Host "║         🚀 FOODFAST - ALL-IN-ONE SETUP 🚀             ║" -ForegroundColor Cyan
Write-Host "║                                                        ║" -ForegroundColor Cyan
Write-Host "║    Kubernetes + Application + Grafana Monitoring      ║" -ForegroundColor Cyan
Write-Host "║                                                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path "k8s\setup-k8s.ps1")) {
    Write-Host "❌ Error: Please run this script from FOODFAST root directory" -ForegroundColor Red
    exit 1
}

# ============================================
# STEP 1: PRE-FLIGHT CHECKS
# ============================================
Write-Host "STEP 1/5: Pre-flight Checks" -ForegroundColor Yellow -BackgroundColor DarkBlue
Write-Host ""

# Check Docker
Write-Host "   Checking Docker..." -ForegroundColor Gray
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "   ❌ Docker not found. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Docker OK" -ForegroundColor Green

# Check Kubernetes
Write-Host "   Checking Kubernetes..." -ForegroundColor Gray
if (!(Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Host "   ❌ kubectl not found. Please enable Kubernetes in Docker Desktop." -ForegroundColor Red
    exit 1
}

try {
    kubectl cluster-info | Out-Null
    Write-Host "   ✅ Kubernetes OK" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Kubernetes not running. Please enable Kubernetes in Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host ""
Start-Sleep -Seconds 2

# ============================================
# STEP 2: BUILD DOCKER IMAGES
# ============================================
Write-Host "STEP 2/5: Building Docker Images" -ForegroundColor Yellow -BackgroundColor DarkBlue
Write-Host ""

$buildImages = Read-Host "Build Docker images? (y/n) [Default: y]"
if ($buildImages -ne 'n') {
    Write-Host "   Building server image..." -ForegroundColor Cyan
    docker build -t ductoanoxo/foodfast-server:latest ./server_app
    
    Write-Host "   Building client image..." -ForegroundColor Cyan
    docker build --build-arg VITE_API_URL=http://localhost:30050/api --build-arg VITE_SOCKET_URL=http://localhost:30050 -t ductoanoxo/foodfast-client:latest ./client_app
    
    Write-Host "   Building restaurant image..." -ForegroundColor Cyan
    docker build --build-arg VITE_API_URL=http://localhost:30050/api --build-arg VITE_SOCKET_URL=http://localhost:30050 -t ductoanoxo/foodfast-restaurant:latest ./restaurant_app
    
    Write-Host "   Building admin image..." -ForegroundColor Cyan
    docker build --build-arg VITE_API_URL=http://localhost:30050/api --build-arg VITE_SOCKET_URL=http://localhost:30050 -t ductoanoxo/foodfast-admin:latest ./admin_app
    
    Write-Host "   Building drone image..." -ForegroundColor Cyan
    docker build --build-arg VITE_API_URL=http://localhost:30050/api --build-arg VITE_SOCKET_URL=http://localhost:30050 -t ductoanoxo/foodfast-drone:latest ./drone_manage
    
    Write-Host "   ✅ All images built successfully" -ForegroundColor Green
} else {
    Write-Host "   ⏭️  Skipping image build" -ForegroundColor Yellow
}

Write-Host ""
Start-Sleep -Seconds 2

# ============================================
# STEP 3: DEPLOY APPLICATION TO KUBERNETES
# ============================================
Write-Host "STEP 3/5: Deploying Application to Kubernetes" -ForegroundColor Yellow -BackgroundColor DarkBlue
Write-Host ""

# Create namespace
Write-Host "   Creating namespace..." -ForegroundColor Cyan
kubectl apply -f k8s/namespace.yaml

# Check Secret
Write-Host "   Checking Secret configuration..." -ForegroundColor Cyan
$secretReady = Read-Host "Have you updated k8s/secret.yaml with your MongoDB URI? (y/n)"
if ($secretReady -ne 'y') {
    Write-Host "   ⚠️  Please update k8s/secret.yaml first!" -ForegroundColor Yellow
    Write-Host "   Opening file for editing..." -ForegroundColor Cyan
    notepad k8s\secret.yaml
    Read-Host "Press Enter after updating the file..."
}

kubectl apply -f k8s/secret.yaml

# Apply ConfigMap
Write-Host "   Applying ConfigMap..." -ForegroundColor Cyan
kubectl apply -f k8s/configmap.yaml

# Deploy Server
Write-Host "   Deploying Server App..." -ForegroundColor Cyan
kubectl apply -f k8s/server-deployment.yaml

# Deploy Client Apps
Write-Host "   Deploying Client Apps..." -ForegroundColor Cyan
kubectl apply -f k8s/client-apps-deployment.yaml

# Deploy HPA
Write-Host "   Deploying HPA (Auto-Scaling)..." -ForegroundColor Cyan
kubectl apply -f k8s/hpa.yaml

Write-Host "   ✅ Application deployed successfully" -ForegroundColor Green

# Wait for pods
Write-Host "   Waiting for pods to be ready..." -ForegroundColor Cyan
kubectl wait --for=condition=available --timeout=120s deployment/server-app -n foodfast 2>$null
kubectl wait --for=condition=available --timeout=120s deployment/client-app -n foodfast 2>$null

Write-Host ""
Start-Sleep -Seconds 2

# ============================================
# STEP 4: SETUP MONITORING (OPTIONAL)
# ============================================
if (!$SkipMonitoring) {
    Write-Host "STEP 4/5: Setting up Monitoring (Prometheus + Grafana)" -ForegroundColor Yellow -BackgroundColor DarkBlue
    Write-Host ""
    
    $setupMonitoring = Read-Host "Setup Grafana monitoring? (y/n) [Default: y]"
    if ($setupMonitoring -ne 'n') {
        Write-Host "   Running setup-grafana.ps1..." -ForegroundColor Cyan
        .\setup-grafana.ps1
    } else {
        Write-Host "   ⏭️  Skipping monitoring setup" -ForegroundColor Yellow
    }
} else {
    Write-Host "STEP 4/5: Monitoring Setup" -ForegroundColor Yellow -BackgroundColor DarkBlue
    Write-Host "   ⏭️  Skipped (--SkipMonitoring flag)" -ForegroundColor Yellow
}

Write-Host ""
Start-Sleep -Seconds 2

# ============================================
# STEP 5: VERIFICATION & STATUS
# ============================================
Write-Host "STEP 5/5: Verification & Status" -ForegroundColor Yellow -BackgroundColor DarkBlue
Write-Host ""

Write-Host "   Pods Status:" -ForegroundColor Cyan
kubectl get pods -n foodfast

Write-Host ""
Write-Host "   Services:" -ForegroundColor Cyan
kubectl get svc -n foodfast

Write-Host ""
Write-Host "   HPA (Auto-Scaling):" -ForegroundColor Cyan
kubectl get hpa -n foodfast

Write-Host ""
Start-Sleep -Seconds 2

# ============================================
# FINAL SUMMARY
# ============================================
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                        ║" -ForegroundColor Green
Write-Host "║                  ✅ SETUP COMPLETE! ✅                 ║" -ForegroundColor Green
Write-Host "║                                                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🌐 APPLICATION URLs:" -ForegroundColor Cyan
Write-Host "   Client:     http://localhost:30000" -ForegroundColor White
Write-Host "   Restaurant: http://localhost:30001" -ForegroundColor White
Write-Host "   Admin:      http://localhost:30002" -ForegroundColor White
Write-Host "   Drone:      http://localhost:30003" -ForegroundColor White
Write-Host "   API:        http://localhost:30050/api" -ForegroundColor White
Write-Host ""

if (!$SkipMonitoring -and $setupMonitoring -ne 'n') {
    Write-Host "📊 MONITORING URLs:" -ForegroundColor Cyan
    Write-Host "   Grafana:    http://localhost:32000" -ForegroundColor White
    Write-Host "   Username:   admin" -ForegroundColor Gray
    Write-Host "   Password:   admin123" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Prometheus: http://localhost:32001" -ForegroundColor White
    Write-Host ""
}

Write-Host "📋 USEFUL COMMANDS:" -ForegroundColor Cyan
Write-Host "   View logs:          kubectl logs -f deployment/server-app -n foodfast" -ForegroundColor Gray
Write-Host "   View pods:          kubectl get pods -n foodfast" -ForegroundColor Gray
Write-Host "   View HPA:           kubectl get hpa -n foodfast -w" -ForegroundColor Gray
Write-Host "   Test auto-scaling:  .\test-autoscale.ps1 -Target server -Duration 60" -ForegroundColor Gray
Write-Host "   Monitor:            .\monitor-autoscale.ps1" -ForegroundColor Gray
Write-Host "   Diagnostic:         .\diagnostic.ps1" -ForegroundColor Gray
Write-Host ""

Write-Host "📖 DOCUMENTATION:" -ForegroundColor Cyan
Write-Host "   Quick Start:        K8S_QUICKSTART.md" -ForegroundColor Gray
Write-Host "   Full Guide:         KUBERNETES_GRAFANA_GUIDE.md" -ForegroundColor Gray
Write-Host ""

Write-Host "🎯 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "   1. Open http://localhost:30000 to test the application" -ForegroundColor Yellow
if (!$SkipMonitoring -and $setupMonitoring -ne 'n') {
    Write-Host "   2. Open http://localhost:32000 and import Grafana dashboards" -ForegroundColor Yellow
    Write-Host "      - Dashboard IDs: 7249, 6417, 1860" -ForegroundColor Gray
    Write-Host "   3. Test auto-scaling: .\test-autoscale.ps1" -ForegroundColor Yellow
} else {
    Write-Host "   2. Test auto-scaling: .\test-autoscale.ps1" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "💡 Need help? Run: .\diagnostic.ps1" -ForegroundColor Gray
Write-Host ""
