# Quick Start - Deploy Foodfast trên AWS EKS

## 🚀 Triển khai nhanh (3 bước)

### Bước 1: Cài đặt công cụ

**Windows (PowerShell as Admin):**
```powershell
# Cài AWS CLI
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Cài eksctl
choco install eksctl

# Hoặc tải về: https://github.com/weaveworks/eksctl/releases
```

**macOS:**
```bash
brew install awscli eksctl
```

**Linux:**
```bash
# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install

# eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
```

### Bước 2: Cấu hình AWS

```bash
aws configure
# Nhập: Access Key, Secret Key, Region (us-east-1), Output (json)
```

### Bước 3: Tạo EKS Cluster

**Tự động (Khuyến nghị):**

Windows:
```powershell
cd scripts
.\create-eks-cluster.ps1
```

Linux/macOS:
```bash
cd scripts
chmod +x create-eks-cluster.sh
./create-eks-cluster.sh
```

**Hoặc dùng config file:**
```bash
eksctl create cluster -f eksctl-cluster.yaml
```

⏳ **Đợi 15-20 phút**

### Bước 4: Cấu hình GitHub Secrets

Vào: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Thêm:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `GHCR_TOKEN`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Bước 5: Deploy

```bash
git add .
git commit -m "feat: add EKS deployment"
git push origin main
```

✅ Xem tiến trình tại: `https://github.com/YOUR_USERNAME/FOODFAST/actions`

---

## 📋 Lấy URLs sau khi deploy

```bash
# Backend API
kubectl get svc foodfast-server -n foodfast -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Client App
kubectl get svc foodfast-client -n foodfast -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Admin Dashboard
kubectl get svc foodfast-admin -n foodfast -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Restaurant Portal
kubectl get svc foodfast-restaurant -n foodfast -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Grafana (admin/admin123)
kubectl get svc grafana -n foodfast -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

---

## 🔍 Debug Commands

```bash
# Xem tất cả resources
kubectl get all -n foodfast

# Xem pods
kubectl get pods -n foodfast

# Xem logs
kubectl logs -f deployment/foodfast-server -n foodfast

# Describe pod
kubectl describe pod <POD_NAME> -n foodfast

# Restart deployment
kubectl rollout restart deployment/foodfast-server -n foodfast

# Scale deployment
kubectl scale deployment foodfast-server --replicas=5 -n foodfast
```

---

## 🧹 Xóa cluster (dừng tính phí)

```bash
eksctl delete cluster --name foodfast-cluster --region us-east-1
```

---

## 💰 Chi phí ước tính

- **Control Plane**: $73/tháng
- **3 Worker Nodes** (t3.medium): $90/tháng
- **Load Balancers**: $20-30/tháng
- **Tổng**: ~$180-200/tháng

💡 **Tiết kiệm**: Dùng t3.small cho staging (~$100/tháng)

---

## 📚 Tài liệu chi tiết

Xem `EKS_DEPLOYMENT_GUIDE.md` để biết thêm chi tiết.

---

## ⚡ So sánh: Docker vs EKS

| Feature | Docker (EC2) | EKS |
|---------|--------------|-----|
| Chi phí | ~$20-30/tháng | ~$180-200/tháng |
| Khả năng mở rộng | Thủ công | Tự động (HPA) |
| High Availability | Không | Có (multi-AZ) |
| Rolling Updates | Thủ công | Tự động |
| Load Balancer | Manual setup | Tự động (AWS ELB) |
| Monitoring | Docker stats | Prometheus/Grafana |
| Phù hợp | Dev/Staging | Production |

---

**Câu hỏi? Xem `EKS_DEPLOYMENT_GUIDE.md` hoặc tạo issue!**
