# 🚀 Hướng dẫn Deploy Foodfast lên AWS EKS

## 📋 Tổng quan

Tài liệu này hướng dẫn bạn triển khai Foodfast lên AWS EKS (Elastic Kubernetes Service) sử dụng `eksctl` và GitHub Actions.

## 🎯 Yêu cầu

### 1. Tài khoản và công cụ
- ✅ Tài khoản AWS (với quyền EKS, EC2, VPC)
- ✅ AWS CLI đã cài đặt và cấu hình
- ✅ `eksctl` (sẽ được cài tự động trong script)
- ✅ `kubectl` (sẽ được cài trong GitHub Actions)
- ✅ GitHub repository với Secrets đã cấu hình

### 2. Ước tính chi phí
- **EKS Control Plane**: $0.10/giờ (~$73/tháng)
- **Worker Nodes** (3 x t3.medium): $0.0416/giờ/node (~$90/tháng cho 3 nodes)
- **Load Balancers**: ~$20-30/tháng
- **Tổng ước tính**: ~$180-200/tháng

> 💡 **Tip**: Dùng free tier và t3.small để giảm chi phí khi test

---

## 🔧 Bước 1: Cài đặt AWS CLI và eksctl

### Trên Windows (PowerShell):
```powershell
# Cài AWS CLI
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Cài eksctl (dùng Chocolatey)
choco install eksctl

# Hoặc tải binary:
# https://github.com/weaveworks/eksctl/releases
```

### Trên macOS:
```bash
# Cài AWS CLI
brew install awscli

# Cài eksctl
brew tap weaveworks/tap
brew install weaveworks/tap/eksctl
```

### Trên Linux:
```bash
# Cài AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Cài eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
```

---

## 🔑 Bước 2: Cấu hình AWS credentials

```bash
aws configure
```

Nhập thông tin:
```
AWS Access Key ID: YOUR_ACCESS_KEY
AWS Secret Access Key: YOUR_SECRET_KEY
Default region name: us-east-1
Default output format: json
```

Kiểm tra:
```bash
aws sts get-caller-identity
```

---

## 🏗️ Bước 3: Tạo EKS Cluster

### Cách 1: Dùng script tự động (Khuyến nghị)

```bash
# Chuyển đến thư mục scripts
cd scripts

# Cấp quyền thực thi
chmod +x create-eks-cluster.sh

# Chạy script
./create-eks-cluster.sh
```

Script sẽ tạo cluster với:
- **Tên**: `foodfast-cluster`
- **Region**: `us-east-1`
- **Nodes**: 3 x t3.medium
- **Auto-scaling**: 2-5 nodes

⏳ **Thời gian**: ~15-20 phút

### Cách 2: Tạo thủ công

```bash
eksctl create cluster \
  --name foodfast-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 5 \
  --managed \
  --with-oidc \
  --alb-ingress-access \
  --full-ecr-access
```

### Kiểm tra cluster

```bash
# Lấy kubeconfig
aws eks update-kubeconfig --name foodfast-cluster --region us-east-1

# Kiểm tra nodes
kubectl get nodes

# Kiểm tra namespaces
kubectl get namespaces
```

---

## 🔐 Bước 4: Cấu hình GitHub Secrets

Vào **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Thêm các secrets sau:

| Secret Name | Mô tả | Ví dụ |
|------------|-------|-------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `GHCR_TOKEN` | GitHub Personal Access Token | `ghp_xxxxxxxxxxxx` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT secret key | `your-secret-key` |
| `JWT_EXPIRE` | JWT expiration | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abcdefghijklmnopqrstuvwx` |

---

## 🚀 Bước 5: Deploy lên EKS

### Tự động (thông qua GitHub Actions)

1. Push code lên branch `main`:
```bash
git add .
git commit -m "chore: add EKS deployment"
git push origin main
```

2. Workflow sẽ tự động chạy:
   - ✅ Build Docker images → Push lên GHCR
   - ✅ Generate Kubernetes manifests
   - ✅ Deploy lên EKS cluster
   - ✅ Tạo LoadBalancers

3. Theo dõi tiến trình tại:
   - `https://github.com/YOUR_USERNAME/FOODFAST/actions`

### Thủ công (deploy local)

Nếu muốn deploy từ máy local:

```bash
# 1. Cấu hình kubectl
aws eks update-kubeconfig --name foodfast-cluster --region us-east-1

# 2. Tạo namespace
kubectl create namespace foodfast

# 3. Tạo secrets
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GHCR_TOKEN \
  -n foodfast

kubectl create secret generic foodfast-secrets \
  --from-literal=MONGO_URI='mongodb+srv://...' \
  --from-literal=JWT_SECRET='your-secret' \
  --from-literal=JWT_EXPIRE='7d' \
  --from-literal=CLOUDINARY_CLOUD_NAME='your-cloud' \
  --from-literal=CLOUDINARY_API_KEY='your-key' \
  --from-literal=CLOUDINARY_API_SECRET='your-secret' \
  -n foodfast

# 4. Apply manifests (nếu có trong thư mục k8s/)
kubectl apply -f k8s/ -n foodfast

# 5. Kiểm tra
kubectl get all -n foodfast
```

---

## 🌐 Bước 6: Truy cập ứng dụng

### Lấy LoadBalancer URLs

```bash
# Backend API
kubectl get svc foodfast-server -n foodfast -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Client
kubectl get svc foodfast-client -n foodfast -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Admin
kubectl get svc foodfast-admin -n foodfast -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Restaurant
kubectl get svc foodfast-restaurant -n foodfast -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Prometheus
kubectl get svc prometheus -n foodfast -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Grafana
kubectl get svc grafana -n foodfast -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### Truy cập

⏳ Chờ 2-3 phút để LoadBalancer hoàn tất provisioning, sau đó:

- **Client**: `http://<CLIENT_LB>`
- **Admin**: `http://<ADMIN_LB>`
- **Restaurant**: `http://<RESTAURANT_LB>`
- **Backend API**: `http://<SERVER_LB>:5000`
- **Prometheus**: `http://<PROMETHEUS_LB>:9090`
- **Grafana**: `http://<GRAFANA_LB>:3000` (admin / admin123)

---

## 🔍 Bước 7: Kiểm tra và Debug

### Kiểm tra pods
```bash
kubectl get pods -n foodfast
kubectl describe pod <POD_NAME> -n foodfast
kubectl logs <POD_NAME> -n foodfast
```

### Kiểm tra services
```bash
kubectl get svc -n foodfast
```

### Kiểm tra deployments
```bash
kubectl get deployments -n foodfast
kubectl rollout status deployment/foodfast-server -n foodfast
```

### Xem events
```bash
kubectl get events -n foodfast --sort-by='.lastTimestamp'
```

### Scale deployments
```bash
# Scale server lên 3 replicas
kubectl scale deployment foodfast-server --replicas=3 -n foodfast
```

### Restart deployment
```bash
kubectl rollout restart deployment/foodfast-server -n foodfast
```

---

## 📊 Monitoring

### Prometheus
Truy cập Prometheus UI:
```
http://<PROMETHEUS_LB>:9090
```

Queries hữu ích:
```promql
# CPU usage
rate(container_cpu_usage_seconds_total[5m])

# Memory usage
container_memory_usage_bytes

# HTTP requests
http_requests_total
```

### Grafana
Truy cập Grafana:
```
http://<GRAFANA_LB>:3000
Username: admin
Password: admin123
```

Add Prometheus data source:
- URL: `http://prometheus:9090`

---

## 🧹 Dọn dẹp (Xóa cluster)

### Xóa ứng dụng
```bash
kubectl delete namespace foodfast
```

### Xóa cluster
```bash
eksctl delete cluster --name foodfast-cluster --region us-east-1
```

⚠️ **Lưu ý**: Việc này sẽ xóa tất cả resources và dừng tính phí.

---

## 🛠️ Troubleshooting

### 1. Pods không start được

**Vấn đề**: Pods ở trạng thái `ImagePullBackOff`

**Giải pháp**:
```bash
# Kiểm tra image pull secret
kubectl get secret ghcr-secret -n foodfast -o yaml

# Tạo lại secret với token mới
kubectl delete secret ghcr-secret -n foodfast
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_USERNAME \
  --docker-password=NEW_TOKEN \
  -n foodfast

# Restart deployment
kubectl rollout restart deployment/foodfast-server -n foodfast
```

### 2. LoadBalancer không được tạo

**Vấn đề**: Service ở trạng thái `<pending>`

**Giải pháp**:
```bash
# Kiểm tra AWS Load Balancer Controller
kubectl get deployment -n kube-system aws-load-balancer-controller

# Nếu chưa có, cài đặt:
eksctl utils associate-iam-oidc-provider --region=us-east-1 --cluster=foodfast-cluster --approve

# Cài Load Balancer Controller
kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller//crds?ref=master"
helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=foodfast-cluster
```

### 3. Connection timeout

**Vấn đề**: Không thể kết nối tới LoadBalancer

**Giải pháp**:
- Kiểm tra Security Groups của nodes
- Đảm bảo các ports cần thiết đã mở
- Kiểm tra health checks của pods

### 4. Out of memory/CPU

**Vấn đề**: Pods bị killed hoặc OOMKilled

**Giải pháp**:
```bash
# Tăng resource limits trong deployment
kubectl edit deployment foodfast-server -n foodfast

# Hoặc scale node group
eksctl scale nodegroup --cluster=foodfast-cluster --name=standard-workers --nodes=5
```

---

## 📚 Tài liệu tham khảo

- [EKS Documentation](https://docs.aws.amazon.com/eks/)
- [eksctl Documentation](https://eksctl.io/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/)

---

## ✅ Checklist Triển khai

- [ ] Cài đặt AWS CLI và eksctl
- [ ] Cấu hình AWS credentials
- [ ] Tạo EKS cluster (~15-20 phút)
- [ ] Cấu hình GitHub Secrets
- [ ] Push code để trigger deployment
- [ ] Kiểm tra pods và services
- [ ] Lấy LoadBalancer URLs
- [ ] Test các ứng dụng
- [ ] Cấu hình monitoring (Prometheus/Grafana)
- [ ] Setup alerts (optional)

---

**Chúc bạn deploy thành công! 🎉**
