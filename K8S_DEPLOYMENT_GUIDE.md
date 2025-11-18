# Kubernetes Deployment Guide for FoodFast

## 🎯 Overview

This guide explains how to deploy FoodFast on Kubernetes alongside your existing EC2 Docker deployment.

## 📁 Architecture

### Two Separate Deployments:

1. **EC2 Production** (main branch)
   - Uses Docker containers directly
   - Workflow: `.github/workflows/deploy-production.yml`
   - Server: `54.166.228.50`

2. **Kubernetes Staging** (develop branch)
   - Uses Kubernetes on EKS/kind
   - Workflow: `.github/workflows/deploy-eks.yml`
   - Server: `100.25.98.10`

## 🚀 Quick Start

### Step 1: Setup Kubernetes on Server

SSH to your EKS server:
```bash
ssh -i "C:\Users\ADMIN\Downloads\EKS.pem" ubuntu@100.25.98.10
```

Choose ONE of the following setup options:

#### Option A: Full EKS Cluster (Production-ready, costs money)
```bash
# Download and run the EKS setup script
wget https://raw.githubusercontent.com/<your-repo>/main/setup-eks.sh
chmod +x setup-eks.sh
./setup-eks.sh
```

#### Option B: Kind Cluster (Development, FREE)
```bash
# Download and run the simple K8s setup
wget https://raw.githubusercontent.com/<your-repo>/main/setup-k8s-simple.sh
chmod +x setup-k8s-simple.sh
./setup-k8s-simple.sh
```

**Recommendation**: Use Option B (kind) for testing first, then move to Option A for production.

### Step 2: Configure GitHub Secrets

Add these NEW secrets (don't remove existing EC2 secrets):

```
EKS_SSH_KEY         = <SSH private key content for EKS server>
EKS_SERVER_HOST     = 100.25.98.10
EKS_SERVER_USER     = ubuntu
```

Existing secrets are reused:
- `GHCR_TOKEN`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Step 3: Create develop branch

```bash
# On your local machine
git checkout -b develop
git push -u origin develop
```

### Step 4: Deploy

Push to the `develop` branch to trigger K8s deployment:

```bash
git add .
git commit -m "Setup Kubernetes deployment"
git push origin develop
```

The workflow will:
1. Wait for Docker images to build
2. Deploy to Kubernetes cluster
3. Setup monitoring (Prometheus & Grafana)

## 📂 File Structure

```
FOODFAST/
├── .github/workflows/
│   ├── deploy-production.yml    # EC2 deployment (main branch)
│   └── deploy-eks.yml            # K8s deployment (develop branch)
├── k8s/
│   ├── base/
│   │   ├── namespace.yaml
│   │   ├── configmap.yaml
│   │   ├── secret.yaml
│   │   ├── monitoring-prometheus.yaml
│   │   └── monitoring-grafana.yaml
│   ├── deployments/
│   │   ├── server.yaml
│   │   ├── client.yaml
│   │   ├── admin.yaml
│   │   ├── restaurant.yaml
│   │   └── drone.yaml
│   ├── ingress/
│   │   └── ingress.yaml
│   └── hpa/
│       └── hpa.yaml
├── setup-eks.sh                  # Full EKS cluster setup
└── setup-k8s-simple.sh           # Simple kind setup
```

## 🔍 Verify Deployment

SSH to your K8s server and run:

```bash
# Check all pods
kubectl get pods -n foodfast

# Check services
kubectl get svc -n foodfast

# Check deployments
kubectl get deployments -n foodfast

# Check ingress
kubectl get ingress -n foodfast

# View logs
kubectl logs -f deployment/foodfast-server -n foodfast

# Access Grafana (port-forward)
kubectl port-forward svc/grafana 3030:3000 -n foodfast
# Then open: http://100.25.98.10:3030
```

## 🌐 Access Applications

### If using kind (simple setup):
- Client: `http://100.25.98.10:3000`
- Admin: `http://100.25.98.10:3001`
- Restaurant: `http://100.25.98.10:3002`
- API: `http://100.25.98.10:5000`
- Grafana: `http://100.25.98.10:3030`

### If using EKS with Ingress:
Update your DNS to point to the Load Balancer URL, then:
- Client: `http://app.foodfast.local`
- Admin: `http://admin.foodfast.local`
- Restaurant: `http://restaurant.foodfast.local`
- API: `http://api.foodfast.local`

## 🔧 Manual Operations

### Scale deployment:
```bash
kubectl scale deployment foodfast-server --replicas=3 -n foodfast
```

### Update image manually:
```bash
kubectl set image deployment/foodfast-server server=ghcr.io/ductoanoxo/foodfast-server:latest -n foodfast
kubectl rollout restart deployment/foodfast-server -n foodfast
```

### View resource usage:
```bash
kubectl top pods -n foodfast
kubectl top nodes
```

### Delete all resources:
```bash
kubectl delete namespace foodfast
```

## 🆚 Comparison: EC2 vs K8s

| Feature | EC2 (Production) | K8s (Staging) |
|---------|------------------|---------------|
| Branch | `main` | `develop` |
| Server | 54.166.228.50 | 100.25.98.10 |
| Technology | Docker Compose | Kubernetes |
| Auto-scaling | ❌ | ✅ HPA |
| Load Balancing | ❌ | ✅ Built-in |
| Self-healing | ❌ | ✅ |
| Rolling Updates | ❌ | ✅ |
| Resource Limits | ❌ | ✅ |

## 🐛 Troubleshooting

### Pods not starting:
```bash
kubectl describe pod <pod-name> -n foodfast
kubectl logs <pod-name> -n foodfast
```

### Image pull errors:
```bash
# Check secret
kubectl get secret ghcr-secret -n foodfast

# Recreate secret
kubectl delete secret ghcr-secret -n foodfast
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=ductoanoxo \
  --docker-password=<token> \
  --namespace=foodfast
```

### Can't connect to cluster:
```bash
# Update kubeconfig (for EKS)
aws eks update-kubeconfig --region us-east-1 --name foodfast-cluster

# Or check kind
kind get clusters
kubectl cluster-info
```

## 📝 Notes

1. **Both deployments are independent** - Changes to K8s won't affect EC2 production
2. **Use develop branch for K8s testing** - Keep main branch for stable EC2 production
3. **Monitor costs** - EKS costs money, kind is free
4. **Start with kind** - Test K8s deployment before creating EKS cluster

## 🎓 Next Steps

1. Test deployment on develop branch
2. Verify all services are running
3. Test application functionality
4. Monitor with Grafana
5. When ready, merge develop → main to update EC2 production (optional)

---

**Need Help?** Check logs with `kubectl logs` or GitHub Actions workflow logs.
