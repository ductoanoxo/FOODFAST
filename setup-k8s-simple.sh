#!/bin/bash

# ==============================================
# SIMPLE K8S SETUP (Using kubeadm on single node)
# ==============================================
# Use this if you want to run K8s on a single EC2 instance
# without creating a full EKS cluster (saves cost)
# ==============================================

set -e

echo "=========================================="
echo "FoodFast K8s Setup (Single Node)"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ==============================================
# Step 1: Install Docker (if not installed)
# ==============================================
echo -e "${YELLOW}Step 1: Installing Docker...${NC}"

if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker installed${NC}"
else
    echo -e "${GREEN}✅ Docker already installed${NC}"
fi

# ==============================================
# Step 2: Install kubectl
# ==============================================
echo -e "${YELLOW}Step 2: Installing kubectl...${NC}"

if ! command -v kubectl &> /dev/null; then
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    chmod +x kubectl
    sudo mv kubectl /usr/local/bin/
    echo -e "${GREEN}✅ kubectl installed${NC}"
else
    echo -e "${GREEN}✅ kubectl already installed${NC}"
fi

# ==============================================
# Step 3: Install kind (Kubernetes in Docker)
# ==============================================
echo -e "${YELLOW}Step 3: Installing kind...${NC}"

if ! command -v kind &> /dev/null; then
    curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
    chmod +x ./kind
    sudo mv ./kind /usr/local/bin/kind
    echo -e "${GREEN}✅ kind installed${NC}"
else
    echo -e "${GREEN}✅ kind already installed${NC}"
fi

# ==============================================
# Step 4: Create kind cluster
# ==============================================
echo -e "${YELLOW}Step 4: Creating kind cluster...${NC}"

if kind get clusters | grep -q "foodfast"; then
    echo -e "${YELLOW}Cluster 'foodfast' already exists. Deleting...${NC}"
    kind delete cluster --name foodfast
fi

cat <<EOF | kind create cluster --name foodfast --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
  - containerPort: 30000
    hostPort: 5000
    protocol: TCP
  - containerPort: 30001
    hostPort: 3000
    protocol: TCP
  - containerPort: 30002
    hostPort: 3001
    protocol: TCP
  - containerPort: 30003
    hostPort: 3002
    protocol: TCP
  - containerPort: 30004
    hostPort: 9090
    protocol: TCP
  - containerPort: 30005
    hostPort: 3030
    protocol: TCP
EOF

echo -e "${GREEN}✅ kind cluster created${NC}"

# ==============================================
# Step 5: Install NGINX Ingress
# ==============================================
echo -e "${YELLOW}Step 5: Installing NGINX Ingress...${NC}"

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

echo "Waiting for ingress controller..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s

echo -e "${GREEN}✅ NGINX Ingress installed${NC}"

# ==============================================
# Step 6: Install Metrics Server
# ==============================================
echo -e "${YELLOW}Step 6: Installing Metrics Server...${NC}"

kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Patch metrics server for kind
kubectl patch deployment metrics-server -n kube-system --type='json' \
  -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'

echo -e "${GREEN}✅ Metrics Server installed${NC}"

# ==============================================
# Step 7: Create namespace
# ==============================================
echo -e "${YELLOW}Step 7: Creating namespace...${NC}"

kubectl create namespace foodfast --dry-run=client -o yaml | kubectl apply -f -

echo -e "${GREEN}✅ Namespace created${NC}"

# ==============================================
# Summary
# ==============================================
echo ""
echo "=========================================="
echo -e "${GREEN}✅ K8s Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Cluster Information:"
echo "  Type: kind (Kubernetes in Docker)"
echo "  Name: foodfast"
echo "  Access: Server IP on ports 80, 443, 5000, 3000-3002"
echo ""
echo "Verify cluster:"
echo "  kubectl cluster-info"
echo "  kubectl get nodes"
echo "  kubectl get ns"
echo ""
echo "Next Steps:"
echo "  1. Update GitHub Secrets:"
echo "     - EKS_SSH_KEY: SSH private key"
echo "     - EKS_SERVER_HOST: 3.236.196.130"
echo "     - EKS_SERVER_USER: ubuntu"
echo ""
echo "  2. Uncomment line in k8s-deploy.sh:"
echo "     Comment out: aws eks update-kubeconfig..."
echo ""
echo "  3. Push to 'main' branch to deploy"
echo ""
echo "=========================================="
