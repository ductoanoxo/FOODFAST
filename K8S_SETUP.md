# 🚀 FOODFAST KUBERNETES SETUP GUIDE

## 📋 MỤC LỤC

1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Chuẩn bị](#chuẩn-bị)
3. [Build Docker Images](#build-docker-images)
4. [Cấu hình Secrets](#cấu-hình-secrets)
5. [Deploy lên Kubernetes](#deploy-lên-kubernetes)
6. [Truy cập ứng dụng](#truy-cập-ứng-dụng)
7. [Troubleshooting](#troubleshooting)
8. [Migrate sang AWS EKS](#migrate-sang-aws-eks)

---

## ⚙️ YÊU CẦU HỆ THỐNG

### Local Development (Docker Desktop)

- ✅ **Docker Desktop** (Windows/Mac) với **Kubernetes enabled**
- ✅ **kubectl** CLI tool
- ✅ **PowerShell** hoặc **Git Bash**
- ✅ **Minimum 8GB RAM**, 20GB disk space

### AWS Production (EKS)

- ✅ **AWS CLI** configured
- ✅ **eksctl** tool
- ✅ **Helm** (optional)
- ✅ AWS Account với quyền tạo EKS cluster

---

## 📦 CHUẨN BỊ

### 1. Enable Kubernetes trong Docker Desktop

**Windows/Mac:**
1. Mở **Docker Desktop**
2. Settings → **Kubernetes**
3. Check ☑️ **Enable Kubernetes**
4. Click **Apply & Restart**
5. Đợi status = **Kubernetes is running** (màu xanh)

**Verify:**
```powershell
kubectl version --short
kubectl cluster-info
```

**Expected output:**
```
Client Version: v1.28.x
Server Version: v1.28.x
Kubernetes control plane is running at https://kubernetes.docker.internal:6443
```

---

### 2. Cài đặt kubectl (nếu chưa có)

**Windows (Chocolatey):**
```powershell
choco install kubernetes-cli
```

**Windows (Manual):**
```powershell
curl -LO "https://dl.k8s.io/release/v1.28.0/bin/windows/amd64/kubectl.exe"
# Copy kubectl.exe vào C:\Windows\System32\
```

**Mac (Homebrew):**
```bash
brew install kubectl
```

---

### 3. Cài đặt NGINX Ingress Controller (Optional)

**Local (Docker Desktop):**
```powershell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
```

**Verify:**
```powershell
kubectl get pods -n ingress-nginx
```

---

## 🐳 BUILD DOCKER IMAGES

### Option 1: Build tất cả images (Recommended)

```powershell
cd D:\TESTFOOD\FOODFAST

# Build Server
docker build -t ductoanoxo/foodfast-server:latest ./server_app

# Build Client Apps
docker build -t ductoanoxo/foodfast-client:latest ./client_app
docker build -t ductoanoxo/foodfast-restaurant:latest ./restaurant_app
docker build -t ductoanoxo/foodfast-admin:latest ./admin_app
docker build -t ductoanoxo/foodfast-drone:latest ./drone_manage
```

### Option 2: Pull từ Docker Hub (nếu đã push)

```powershell
docker pull ductoanoxo/foodfast-server:latest
docker pull ductoanoxo/foodfast-client:latest
docker pull ductoanoxo/foodfast-restaurant:latest
docker pull ductoanoxo/foodfast-admin:latest
docker pull ductoanoxo/foodfast-drone:latest
```

**Verify images:**
```powershell
docker images | Select-String "foodfast"
```

---

## 🔐 CẤU HÌNH SECRETS

### 1. Copy template secret

```powershell
cd k8s
cp secret.yaml secret-local.yaml
```

### 2. Sửa file `secret-local.yaml`

**⚠️ QUAN TRỌNG: Update các giá trị sau:**

```yaml
stringData:
  # MongoDB - Chọn 1 trong 2:
  
  # Option 1: Local MongoDB (đơn giản, cho dev)
  MONGO_URI: "mongodb://mongodb-svc.foodfast.svc.cluster.local:27017/FOODFAST"
  
  # Option 2: MongoDB Atlas (recommended cho production)
  MONGO_URI: "mongodb+srv://toantra349:toantoan123@ktpm.dwb8wtz.mongodb.net/FOODFASTDRONEDELIVERY?retryWrites=true&w=majority"
  
  # JWT Secret (generate mới: openssl rand -base64 32)
  JWT_SECRET: "your_new_jwt_secret_here"
  
  # Cloudinary (nếu dùng)
  CLOUDINARY_API_SECRET: "your_cloudinary_secret"
  
  # VNPay
  VNPAY_HASH_SECRET: "VTN3PF8TMIMQNLDOYTM93JOE4XI8C62L"
  
  # SMTP
  SMTP_PASS: "your_gmail_app_password"
```

**🔒 Security Note:**
- ❌ **KHÔNG** commit `secret-local.yaml` lên Git
- ✅ Add vào `.gitignore`: `k8s/secret-local.yaml`

---

## 🚀 DEPLOY LÊN KUBERNETES

### Option 1: Dùng script tự động (Recommended)

```powershell
cd D:\TESTFOOD\FOODFAST
.\k8s\setup-k8s.ps1
```

Script sẽ hỏi:
- ✅ Deploy MongoDB locally? → **y** (nếu không dùng Atlas)
- ✅ Deploy Ingress? → **y** (nếu muốn dùng domain names)
- ✅ Deploy HPA? → **y** (auto-scaling)

---

### Option 2: Deploy thủ công từng bước

#### 1. Create Namespace
```powershell
kubectl apply -f k8s/namespace.yaml
```

#### 2. Create Secrets
```powershell
kubectl apply -f k8s/secret-local.yaml
```

#### 3. Create ConfigMap
```powershell
kubectl apply -f k8s/configmap.yaml
```

#### 4. Deploy MongoDB (nếu không dùng Atlas)
```powershell
kubectl apply -f k8s/mongodb-statefulset.yaml

# Đợi MongoDB ready
kubectl wait --for=condition=ready pod -l app=mongodb -n foodfast --timeout=120s
```

#### 5. Deploy Server App
```powershell
kubectl apply -f k8s/server-deployment.yaml

# Check logs
kubectl logs -f deployment/server-app -n foodfast
```

#### 6. Deploy Client Apps
```powershell
kubectl apply -f k8s/client-apps-deployment.yaml

# Check status
kubectl get pods -n foodfast
```

#### 7. Deploy Ingress (optional)
```powershell
# Cài NGINX Ingress Controller trước (nếu chưa)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# Apply Ingress rules
kubectl apply -f k8s/ingress.yaml
```

#### 8. Deploy HPA (optional)
```powershell
kubectl apply -f k8s/hpa.yaml
```

---

## 🌐 TRUY CẬP ỨNG DỤNG

### Cách 1: Dùng NodePort (Mặc định)

```
✅ Client App:     http://localhost:30000
✅ Restaurant App: http://localhost:30001
✅ Admin App:      http://localhost:30002
✅ Drone App:      http://localhost:30003
✅ API Server:     http://localhost:5000/api/health
```

**Test API:**
```powershell
curl http://localhost:5000/api/health
```

---

### Cách 2: Dùng Ingress (Với domain names)

#### 1. Thêm vào file `hosts`

**Windows:** `C:\Windows\System32\drivers\etc\hosts`

```
127.0.0.1 api.foodfast.local
127.0.0.1 client.foodfast.local
127.0.0.1 restaurant.foodfast.local
127.0.0.1 admin.foodfast.local
127.0.0.1 drone.foodfast.local
```

**Mac/Linux:** `/etc/hosts`

#### 2. Truy cập qua domain

```
✅ Client:     http://client.foodfast.local
✅ Restaurant: http://restaurant.foodfast.local
✅ Admin:      http://admin.foodfast.local
✅ Drone:      http://drone.foodfast.local
✅ API:        http://api.foodfast.local
```

---

### Cách 3: Port Forwarding

```powershell
# Forward Server API
kubectl port-forward svc/server-svc 5000:5000 -n foodfast

# Forward Client App
kubectl port-forward svc/client-svc 3000:80 -n foodfast
```

Sau đó truy cập: `http://localhost:5000`, `http://localhost:3000`

---

## 🐛 TROUBLESHOOTING

### 1. Check Pod Status

```powershell
kubectl get pods -n foodfast
```

**Expected:**
```
NAME                            READY   STATUS    RESTARTS   AGE
server-app-xxx-yyy              1/1     Running   0          2m
client-app-xxx-yyy              1/1     Running   0          2m
mongodb-0                       1/1     Running   0          5m
```

**Common Issues:**

#### ❌ Status = `ImagePullBackOff`
```powershell
# Kiểm tra image có tồn tại không
docker images | Select-String "foodfast"

# Nếu thiếu, build lại
docker build -t ductoanoxo/foodfast-server:latest ./server_app
```

#### ❌ Status = `CrashLoopBackOff`
```powershell
# Xem logs
kubectl logs deployment/server-app -n foodfast

# Kiểm tra env variables
kubectl describe pod <pod-name> -n foodfast
```

#### ❌ Status = `Pending`
```powershell
# Kiểm tra resources
kubectl describe pod <pod-name> -n foodfast

# Có thể do thiếu CPU/Memory
```

---

### 2. Check Service Connectivity

```powershell
# List services
kubectl get svc -n foodfast

# Test từ bên trong cluster
kubectl run -it --rm debug --image=alpine --restart=Never -n foodfast -- sh
# Inside pod:
wget -O- http://server-svc:5000/api/health
```

---

### 3. MongoDB Connection Issues

```powershell
# Check MongoDB pod
kubectl get pods -l app=mongodb -n foodfast

# View MongoDB logs
kubectl logs mongodb-0 -n foodfast

# Test connection từ server pod
kubectl exec -it deployment/server-app -n foodfast -- sh
# Inside pod:
mongosh mongodb://mongodb-svc:27017/FOODFAST
```

**Nếu dùng Atlas:**
- Kiểm tra IP whitelist (thêm `0.0.0.0/0` cho test)
- Kiểm tra username/password trong secret

---

### 4. View All Logs

```powershell
# Server logs
kubectl logs -f deployment/server-app -n foodfast --tail=100

# Client logs
kubectl logs -f deployment/client-app -n foodfast --tail=100

# All pods in namespace
kubectl logs -f -l app=server-app -n foodfast
```

---

### 5. Delete và Re-deploy

```powershell
# Xóa toàn bộ namespace
kubectl delete namespace foodfast

# Deploy lại
.\k8s\setup-k8s.ps1
```

---

## 📊 MONITORING & SCALING

### Check Resource Usage

```powershell
# Pod CPU/Memory usage
kubectl top pods -n foodfast

# Node usage
kubectl top nodes
```

### Manual Scaling

```powershell
# Scale server to 3 replicas
kubectl scale deployment server-app --replicas=3 -n foodfast

# Scale client to 5 replicas
kubectl scale deployment client-app --replicas=5 -n foodfast
```

### Auto-scaling (HPA)

```powershell
# Check HPA status
kubectl get hpa -n foodfast

# Describe HPA
kubectl describe hpa server-app-hpa -n foodfast
```

**Expected output:**
```
NAME              REFERENCE               TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
server-app-hpa    Deployment/server-app   45%/70%   2         10        2          5m
```

---

## ☁️ MIGRATE SANG AWS EKS

### 1. Tạo EKS Cluster

```bash
# Install eksctl
brew install eksctl  # Mac
choco install eksctl # Windows

# Create cluster
eksctl create cluster \
  --name foodfast-cluster \
  --region ap-southeast-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 10 \
  --managed
```

---

### 2. Push Images lên ECR (AWS Container Registry)

```bash
# Login to ECR
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com

# Create repositories
aws ecr create-repository --repository-name foodfast-server
aws ecr create-repository --repository-name foodfast-client
# ... (tương tự cho các apps khác)

# Tag images
docker tag ductoanoxo/foodfast-server:latest <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/foodfast-server:latest

# Push images
docker push <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/foodfast-server:latest
```

---

### 3. Update Deployment YAML

**Thay đổi image trong các file deployment:**

```yaml
# FROM:
image: ductoanoxo/foodfast-server:latest

# TO:
image: <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/foodfast-server:latest
```

---

### 4. Update ConfigMap cho AWS

```yaml
# k8s/configmap-aws.yaml
data:
  CLIENT_URL: "https://client.foodfast.app"
  ADMIN_URL: "https://admin.foodfast.app"
  API_URL: "https://api.foodfast.app"
  MONGO_URI: "<use-secrets-manager>"
```

---

### 5. Deploy lên EKS

```bash
# Set kubectl context
aws eks update-kubeconfig --region ap-southeast-1 --name foodfast-cluster

# Verify
kubectl get nodes

# Deploy
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret-aws.yaml
kubectl apply -f k8s/configmap-aws.yaml
kubectl apply -f k8s/server-deployment.yaml
kubectl apply -f k8s/client-apps-deployment.yaml
```

---

### 6. Setup Ingress cho AWS (ALB)

```bash
# Install AWS Load Balancer Controller
kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller//crds?ref=master"

helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=foodfast-cluster
```

**Update ingress.yaml:**
```yaml
annotations:
  kubernetes.io/ingress.class: alb
  alb.ingress.kubernetes.io/scheme: internet-facing
  alb.ingress.kubernetes.io/target-type: ip
```

---

### 7. Setup Domain & SSL

```bash
# Request ACM certificate
aws acm request-certificate \
  --domain-name "*.foodfast.app" \
  --validation-method DNS

# Update Route53 DNS records
# Point domains to ALB endpoint
```

---

## 📝 USEFUL COMMANDS

### Development

```powershell
# Watch pods
kubectl get pods -n foodfast -w

# Exec into pod
kubectl exec -it deployment/server-app -n foodfast -- sh

# Copy files from pod
kubectl cp foodfast/server-app-xxx:/app/logs/error.log ./error.log

# View events
kubectl get events -n foodfast --sort-by='.lastTimestamp'
```

### Production

```bash
# Rolling update
kubectl set image deployment/server-app server-app=new-image:v2 -n foodfast

# Rollback
kubectl rollout undo deployment/server-app -n foodfast

# Check rollout status
kubectl rollout status deployment/server-app -n foodfast

# View rollout history
kubectl rollout history deployment/server-app -n foodfast
```

---

## 🎯 CHECKLIST TRƯỚC KHI PRODUCTION

- [ ] Update tất cả secrets (JWT, MongoDB, API keys)
- [ ] Enable HTTPS/TLS
- [ ] Setup monitoring (Prometheus/Grafana)
- [ ] Setup logging (ELK/CloudWatch)
- [ ] Configure backup cho MongoDB
- [ ] Setup CI/CD pipeline (GitHub Actions)
- [ ] Load testing
- [ ] Security audit
- [ ] Setup alerts & notifications
- [ ] Document runbook for on-call

---

## 🆘 SUPPORT

**Issues:** https://github.com/ductoanoxo/FOODFAST/issues

**Documentation:** See `docs/` folder

**Contact:** toantra349@gmail.com

---

**🚀 Happy Deploying!**
