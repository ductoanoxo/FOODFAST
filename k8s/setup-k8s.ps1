# ========================================
# FOODFAST K8S LOCAL SETUP SCRIPT
# ========================================
# Chạy script này để deploy FOODFAST lên Kubernetes local (Docker Desktop)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 FOODFAST K8S LOCAL DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check kubectl
# Detect script directory
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$ROOT_DIR = Split-Path -Parent $SCRIPT_DIR
$K8S_DIR = Join-Path $ROOT_DIR "k8s"

Write-Host "📋 Step 1: Checking kubectl..." -ForegroundColor Yellow
if (!(Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Host "❌ kubectl not found. Please install kubectl first." -ForegroundColor Red
    Write-Host "   Download: https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/" -ForegroundColor Yellow
    exit 1
}
try {
    $kubectlVersion = kubectl version --client -o json | ConvertFrom-Json
    Write-Host "✅ kubectl found: v$($kubectlVersion.clientVersion.gitVersion)" -ForegroundColor Green
} catch {
    Write-Host "✅ kubectl found" -ForegroundColor Green
}
Write-Host ""

# 2. Check Kubernetes cluster
Write-Host "📋 Step 2: Checking Kubernetes cluster..." -ForegroundColor Yellow
try {
    kubectl cluster-info | Out-Null
    Write-Host "✅ Kubernetes cluster is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot connect to Kubernetes cluster." -ForegroundColor Red
    Write-Host "   Please enable Kubernetes in Docker Desktop Settings." -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# 3. Check Docker images
Write-Host "📋 Step 3: Checking Docker images..." -ForegroundColor Yellow
$requiredImages = @(
    "ductoanoxo/foodfast-server:latest",
    "ductoanoxo/foodfast-client:latest",
    "ductoanoxo/foodfast-restaurant:latest",
    "ductoanoxo/foodfast-admin:latest",
    "ductoanoxo/foodfast-drone:latest"
)

$missingImages = @()
foreach ($image in $requiredImages) {
    if (!(docker images -q $image)) {
        $missingImages += $image
    }
}

if ($missingImages.Count -gt 0) {
    Write-Host "⚠️  Missing Docker images:" -ForegroundColor Yellow
    foreach ($img in $missingImages) {
        Write-Host "   - $img" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "📦 Building missing images..." -ForegroundColor Yellow
    
    # Build server image
    if ($missingImages -contains "ductoanoxo/foodfast-server:latest") {
        Write-Host "   Building server image..." -ForegroundColor Cyan
        docker build -t ductoanoxo/foodfast-server:latest ./server_app
    }
    
    # Build client images
    $clientApps = @("client", "restaurant", "admin", "drone")
    foreach ($app in $clientApps) {
        $imageName = "ductoanoxo/foodfast-${app}:latest"
        if ($missingImages -contains $imageName) {
            Write-Host "   Building ${app} image..." -ForegroundColor Cyan
            docker build -t $imageName "./${app}_app"
        }
    }
    
    Write-Host "✅ All images built successfully" -ForegroundColor Green
} else {
    Write-Host "✅ All required images found" -ForegroundColor Green
}
Write-Host ""

# 4. Create namespace
Write-Host "📋 Step 4: Creating namespace..." -ForegroundColor Yellow
kubectl apply -f "$K8S_DIR/namespace.yaml"
Write-Host ""

# 5. Create secrets
Write-Host "📋 Step 5: Creating secrets..." -ForegroundColor Yellow
Write-Host "⚠️  IMPORTANT: Make sure you updated k8s/secret.yaml with your credentials!" -ForegroundColor Yellow
$continue = Read-Host "Have you updated secret.yaml? (y/n)"
if ($continue -ne 'y') {
    Write-Host "❌ Please update k8s/secret.yaml first, then run this script again." -ForegroundColor Red
    exit 1
}
kubectl apply -f "$K8S_DIR/secret.yaml"
Write-Host ""

# 6. Create configmap
Write-Host "📋 Step 6: Creating configmap..." -ForegroundColor Yellow
kubectl apply -f "$K8S_DIR/configmap.yaml"
Write-Host ""

# 7. Deploy MongoDB (optional)
Write-Host "📋 Step 7: Deploy MongoDB..." -ForegroundColor Yellow
$useMongoDB = Read-Host "Deploy MongoDB locally? (y/n - choose 'n' if using MongoDB Atlas)"
if ($useMongoDB -eq 'y') {
    Write-Host "   Deploying MongoDB StatefulSet..." -ForegroundColor Cyan
    kubectl apply -f "$K8S_DIR/mongodb-statefulset.yaml"
    Write-Host "   Waiting for MongoDB to be ready (30s)..." -ForegroundColor Cyan
    Start-Sleep -Seconds 30
}
Write-Host ""

# 8. Deploy Server
Write-Host "📋 Step 8: Deploying Server App..." -ForegroundColor Yellow
kubectl apply -f "$K8S_DIR/server-deployment.yaml"
Write-Host ""

# 9. Deploy Client Apps
Write-Host "📋 Step 9: Deploying Client Apps..." -ForegroundColor Yellow
kubectl apply -f "$K8S_DIR/client-apps-deployment.yaml"
Write-Host ""

# 10. Deploy Ingress (optional)
Write-Host "📋 Step 10: Deploy Ingress..." -ForegroundColor Yellow
$useIngress = Read-Host "Deploy Ingress Controller? (y/n)"
if ($useIngress -eq 'y') {
    Write-Host "   Installing NGINX Ingress Controller..." -ForegroundColor Cyan
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
    
    Write-Host "   Waiting for Ingress Controller to be ready (30s)..." -ForegroundColor Cyan
    Start-Sleep -Seconds 30
    
    Write-Host "   Applying Ingress rules..." -ForegroundColor Cyan
    kubectl apply -f "$K8S_DIR/ingress.yaml"
    
    Write-Host ""
    Write-Host "📝 Add these to your C:\Windows\System32\drivers\etc\hosts:" -ForegroundColor Yellow
    Write-Host "   127.0.0.1 api.foodfast.local" -ForegroundColor Cyan
    Write-Host "   127.0.0.1 client.foodfast.local" -ForegroundColor Cyan
    Write-Host "   127.0.0.1 restaurant.foodfast.local" -ForegroundColor Cyan
    Write-Host "   127.0.0.1 admin.foodfast.local" -ForegroundColor Cyan
    Write-Host "   127.0.0.1 drone.foodfast.local" -ForegroundColor Cyan
}
Write-Host ""

# 11. Deploy HPA (optional)
Write-Host "📋 Step 11: Deploy HPA (Horizontal Pod Autoscaler)..." -ForegroundColor Yellow
$useHPA = Read-Host "Deploy HPA? (y/n)"
if ($useHPA -eq 'y') {
    kubectl apply -f "$K8S_DIR/hpa.yaml"
}
Write-Host ""

# 12. Wait for deployments
Write-Host "📋 Step 12: Waiting for deployments to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=available --timeout=120s deployment/server-app -n foodfast
kubectl wait --for=condition=available --timeout=120s deployment/client-app -n foodfast
Write-Host ""

# 13. Show status
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 DEPLOYMENT STATUS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Pods:" -ForegroundColor Yellow
kubectl get pods -n foodfast
Write-Host ""

Write-Host "Services:" -ForegroundColor Yellow
kubectl get svc -n foodfast
Write-Host ""

# 14. Show access URLs
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🌐 ACCESS URLs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($useIngress -eq 'y') {
    Write-Host "✅ Using Ingress (add to hosts file first):" -ForegroundColor Green
    Write-Host "   Client:     http://client.foodfast.local" -ForegroundColor Cyan
    Write-Host "   Restaurant: http://restaurant.foodfast.local" -ForegroundColor Cyan
    Write-Host "   Admin:      http://admin.foodfast.local" -ForegroundColor Cyan
    Write-Host "   Drone:      http://drone.foodfast.local" -ForegroundColor Cyan
    Write-Host "   API:        http://api.foodfast.local" -ForegroundColor Cyan
} else {
    Write-Host "✅ Using NodePort:" -ForegroundColor Green
    Write-Host "   Client:     http://localhost:30000" -ForegroundColor Cyan
    Write-Host "   Restaurant: http://localhost:30001" -ForegroundColor Cyan
    Write-Host "   Admin:      http://localhost:30002" -ForegroundColor Cyan
    Write-Host "   Drone:      http://localhost:30003" -ForegroundColor Cyan
    Write-Host "   API:        http://localhost:5000" -ForegroundColor Cyan
}
Write-Host ""

# 15. Show useful commands
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📝 USEFUL COMMANDS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "View logs (server):     kubectl logs -f deployment/server-app -n foodfast" -ForegroundColor Yellow
Write-Host "View logs (client):     kubectl logs -f deployment/client-app -n foodfast" -ForegroundColor Yellow
Write-Host "Get pods:               kubectl get pods -n foodfast" -ForegroundColor Yellow
Write-Host "Get services:           kubectl get svc -n foodfast" -ForegroundColor Yellow
Write-Host "Describe pod:           kubectl describe pod <pod-name> -n foodfast" -ForegroundColor Yellow
Write-Host "Port forward (server):  kubectl port-forward svc/server-svc 5000:5000 -n foodfast" -ForegroundColor Yellow
Write-Host "Delete all:             kubectl delete namespace foodfast" -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
