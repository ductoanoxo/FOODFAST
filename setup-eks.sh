#!/bin/bash

# ==============================================
# FOODFAST EKS CLUSTER SETUP SCRIPT
# ==============================================
# This script sets up an EKS cluster for FoodFast application
# Run this on your EKS server (3.236.196.130)
# ==============================================

set -e

echo "=========================================="
echo "FoodFast EKS Cluster Setup"
echo "=========================================="

# Configuration
CLUSTER_NAME="foodfast-cluster"
REGION="us-east-1"  # Change to your preferred region
NODE_COUNT=2
NODE_TYPE="t3.medium"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ==============================================
# Step 1: Check Prerequisites
# ==============================================
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI not found. Installing...${NC}"
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
fi

# Check kubectl
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}kubectl not found. Installing...${NC}"
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    chmod +x kubectl
    sudo mv kubectl /usr/local/bin/
fi

# Check eksctl
if ! command -v eksctl &> /dev/null; then
    echo -e "${RED}eksctl not found. Installing...${NC}"
    curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
    sudo mv /tmp/eksctl /usr/local/bin
fi

echo -e "${GREEN}✅ All prerequisites installed${NC}"

# ==============================================
# Step 2: Configure AWS Credentials
# ==============================================
echo -e "${YELLOW}Step 2: Configuring AWS credentials...${NC}"

if [ ! -f ~/.aws/credentials ]; then
    echo -e "${YELLOW}AWS credentials not found. Please configure:${NC}"
    aws configure
else
    echo -e "${GREEN}✅ AWS credentials already configured${NC}"
fi

# ==============================================
# Step 3: Create EKS Cluster (OPTIONAL - Comment out if using existing cluster)
# ==============================================
echo -e "${YELLOW}Step 3: Creating EKS cluster...${NC}"
echo -e "${YELLOW}WARNING: This will create AWS resources and may incur costs!${NC}"
read -p "Do you want to create a new EKS cluster? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    eksctl create cluster \
        --name $CLUSTER_NAME \
        --region $REGION \
        --nodegroup-name foodfast-nodes \
        --node-type $NODE_TYPE \
        --nodes $NODE_COUNT \
        --nodes-min 1 \
        --nodes-max 4 \
        --managed
    
    echo -e "${GREEN}✅ EKS cluster created${NC}"
else
    echo -e "${YELLOW}⏭️  Skipping cluster creation${NC}"
fi

# ==============================================
# Step 4: Update kubeconfig
# ==============================================
echo -e "${YELLOW}Step 4: Updating kubeconfig...${NC}"

aws eks update-kubeconfig --region $REGION --name $CLUSTER_NAME

echo -e "${GREEN}✅ Kubeconfig updated${NC}"

# ==============================================
# Step 5: Verify cluster connection
# ==============================================
echo -e "${YELLOW}Step 5: Verifying cluster connection...${NC}"

kubectl get nodes
kubectl get ns

echo -e "${GREEN}✅ Connected to cluster${NC}"

# ==============================================
# Step 6: Install NGINX Ingress Controller
# ==============================================
echo -e "${YELLOW}Step 6: Installing NGINX Ingress Controller...${NC}"

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/aws/deploy.yaml

echo "Waiting for ingress controller to be ready..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s

echo -e "${GREEN}✅ NGINX Ingress Controller installed${NC}"

# Get the Load Balancer URL
echo -e "${YELLOW}Getting Load Balancer URL...${NC}"
LB_URL=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo -e "${GREEN}Load Balancer URL: ${LB_URL}${NC}"
echo -e "${YELLOW}Update your DNS records to point to this URL${NC}"

# ==============================================
# Step 7: Install Metrics Server (for HPA)
# ==============================================
echo -e "${YELLOW}Step 7: Installing Metrics Server...${NC}"

kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

echo -e "${GREEN}✅ Metrics Server installed${NC}"

# ==============================================
# Step 8: Create Docker registry secret (will be updated by CI/CD)
# ==============================================
echo -e "${YELLOW}Step 8: Setting up namespaces...${NC}"

kubectl create namespace foodfast --dry-run=client -o yaml | kubectl apply -f -

echo -e "${GREEN}✅ Namespace created${NC}"

# ==============================================
# Summary
# ==============================================
echo ""
echo "=========================================="
echo -e "${GREEN}✅ EKS Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Cluster Information:"
echo "  Name: $CLUSTER_NAME"
echo "  Region: $REGION"
echo "  Load Balancer: $LB_URL"
echo ""
echo "Next Steps:"
echo "  1. Update your GitHub Secrets with:"
echo "     - EKS_SSH_KEY: SSH private key for this server"
echo "     - EKS_SERVER_HOST: 3.236.196.130"
echo "     - EKS_SERVER_USER: ubuntu"
echo ""
echo "  2. Update DNS records to point to Load Balancer"
echo ""
echo "  3. Push to 'develop' branch to trigger K8s deployment"
echo ""
echo "  4. Monitor deployment with:"
echo "     kubectl get all -n foodfast"
echo "     kubectl logs -f deployment/foodfast-server -n foodfast"
echo ""
echo "=========================================="
