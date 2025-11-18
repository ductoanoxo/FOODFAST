#!/bin/bash
# Script to create EKS cluster using eksctl

set -e

CLUSTER_NAME="foodfast-cluster"
REGION="us-east-1"
NODE_TYPE="t3.medium"
NODES=3
NODES_MIN=2
NODES_MAX=5

echo "🚀 Creating EKS cluster: ${CLUSTER_NAME}"
echo "   Region: ${REGION}"
echo "   Node type: ${NODE_TYPE}"
echo "   Nodes: ${NODES} (min: ${NODES_MIN}, max: ${NODES_MAX})"
echo ""

# Check if eksctl is installed
if ! command -v eksctl &> /dev/null; then
    echo "❌ eksctl not found. Installing..."
    
    # Detect OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew tap weaveworks/tap
        brew install weaveworks/tap/eksctl
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
        sudo mv /tmp/eksctl /usr/local/bin
    else
        echo "❌ Unsupported OS. Please install eksctl manually: https://eksctl.io/introduction/#installation"
        exit 1
    fi
    
    echo "✅ eksctl installed"
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
echo "🔍 Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Run: aws configure"
    exit 1
fi
echo "✅ AWS credentials OK"

# Check if cluster already exists
echo "🔍 Checking if cluster already exists..."
if eksctl get cluster --name ${CLUSTER_NAME} --region ${REGION} &> /dev/null; then
    echo "⚠️  Cluster ${CLUSTER_NAME} already exists!"
    echo ""
    echo "Options:"
    echo "  1. Delete existing cluster: eksctl delete cluster --name ${CLUSTER_NAME} --region ${REGION}"
    echo "  2. Use existing cluster: aws eks update-kubeconfig --name ${CLUSTER_NAME} --region ${REGION}"
    exit 1
fi

echo "📦 Creating EKS cluster (this will take 15-20 minutes)..."
echo ""

# Create cluster
eksctl create cluster \
  --name ${CLUSTER_NAME} \
  --region ${REGION} \
  --nodegroup-name standard-workers \
  --node-type ${NODE_TYPE} \
  --nodes ${NODES} \
  --nodes-min ${NODES_MIN} \
  --nodes-max ${NODES_MAX} \
  --managed \
  --with-oidc \
  --ssh-access \
  --ssh-public-key ~/.ssh/id_rsa.pub \
  --alb-ingress-access \
  --full-ecr-access

echo ""
echo "✅ EKS cluster created successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Verify cluster: kubectl get nodes"
echo "  2. Create namespace: kubectl create namespace foodfast"
echo "  3. Add GitHub Secrets:"
echo "     - AWS_ACCESS_KEY_ID"
echo "     - AWS_SECRET_ACCESS_KEY"
echo "     - AWS_REGION (${REGION})"
echo "  4. Push code to trigger deployment"
echo ""
echo "💡 To delete cluster later:"
echo "   eksctl delete cluster --name ${CLUSTER_NAME} --region ${REGION}"
echo ""
echo "💰 Estimated cost: ~$0.10/hour for control plane + ~$0.0416/hour per t3.medium node"
echo "   Total: ~$0.22/hour (~$160/month for 3 nodes)"
