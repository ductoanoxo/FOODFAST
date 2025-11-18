# Script to create EKS cluster using eksctl on Windows
# Usage: .\create-eks-cluster.ps1

$CLUSTER_NAME = "foodfast-cluster"
$REGION = "us-east-1"
$NODE_TYPE = "t3.medium"
$NODES = 3
$NODES_MIN = 2
$NODES_MAX = 5

Write-Host "🚀 Creating EKS cluster: $CLUSTER_NAME" -ForegroundColor Green
Write-Host "   Region: $REGION"
Write-Host "   Node type: $NODE_TYPE"
Write-Host "   Nodes: $NODES (min: $NODES_MIN, max: $NODES_MAX)"
Write-Host ""

# Check if eksctl is installed
if (-not (Get-Command eksctl -ErrorAction SilentlyContinue)) {
    Write-Host "❌ eksctl not found. Please install it:" -ForegroundColor Red
    Write-Host ""
    Write-Host "Option 1 - Chocolatey:"
    Write-Host "  choco install eksctl"
    Write-Host ""
    Write-Host "Option 2 - Manual download:"
    Write-Host "  https://github.com/weaveworks/eksctl/releases"
    Write-Host ""
    exit 1
}

Write-Host "✅ eksctl found" -ForegroundColor Green

# Check if AWS CLI is installed
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "❌ AWS CLI not found. Please install: https://aws.amazon.com/cli/" -ForegroundColor Red
    exit 1
}

Write-Host "✅ AWS CLI found" -ForegroundColor Green

# Check AWS credentials
Write-Host "🔍 Checking AWS credentials..."
try {
    aws sts get-caller-identity | Out-Null
    Write-Host "✅ AWS credentials OK" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS credentials not configured. Run: aws configure" -ForegroundColor Red
    exit 1
}

# Check if cluster already exists
Write-Host "🔍 Checking if cluster already exists..."
$clusterExists = eksctl get cluster --name $CLUSTER_NAME --region $REGION 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "⚠️  Cluster $CLUSTER_NAME already exists!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  1. Delete existing cluster: eksctl delete cluster --name $CLUSTER_NAME --region $REGION"
    Write-Host "  2. Use existing cluster: aws eks update-kubeconfig --name $CLUSTER_NAME --region $REGION"
    exit 1
}

Write-Host "📦 Creating EKS cluster (this will take 15-20 minutes)..." -ForegroundColor Cyan
Write-Host ""

# Create cluster using config file
if (Test-Path "eksctl-cluster.yaml") {
    Write-Host "Using eksctl-cluster.yaml configuration file..." -ForegroundColor Cyan
    eksctl create cluster -f eksctl-cluster.yaml
} else {
    # Fallback to command line
    eksctl create cluster `
        --name $CLUSTER_NAME `
        --region $REGION `
        --nodegroup-name standard-workers `
        --node-type $NODE_TYPE `
        --nodes $NODES `
        --nodes-min $NODES_MIN `
        --nodes-max $NODES_MAX `
        --managed `
        --with-oidc `
        --alb-ingress-access `
        --full-ecr-access
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ EKS cluster created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Verify cluster: kubectl get nodes"
    Write-Host "  2. Create namespace: kubectl create namespace foodfast"
    Write-Host "  3. Add GitHub Secrets:"
    Write-Host "     - AWS_ACCESS_KEY_ID"
    Write-Host "     - AWS_SECRET_ACCESS_KEY"
    Write-Host "  4. Push code to trigger deployment"
    Write-Host ""
    Write-Host "💡 To delete cluster later:" -ForegroundColor Yellow
    Write-Host "   eksctl delete cluster --name $CLUSTER_NAME --region $REGION"
    Write-Host ""
    Write-Host "💰 Estimated cost: ~`$0.10/hour for control plane + ~`$0.0416/hour per t3.medium node" -ForegroundColor Magenta
    Write-Host "   Total: ~`$0.22/hour (~`$160/month for 3 nodes)"
} else {
    Write-Host ""
    Write-Host "❌ Failed to create EKS cluster" -ForegroundColor Red
    exit 1
}
