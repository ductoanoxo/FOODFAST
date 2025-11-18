# 🚀 Quick Start - Kubernetes Deployment

## Bạn đã có gì?

✅ Server EC2 cho Docker (54.166.228.50) - **GIỮ NGUYÊN**
✅ Server EKS mới (100.25.98.10) - **THÊM K8s**

## Làm gì tiếp theo?

### Bước 1: Setup K8s trên server mới (100.25.98.10)

```bash
# SSH vào server EKS
ssh -i "C:\Users\ADMIN\Downloads\EKS.pem" ubuntu@100.25.98.10

# Chọn 1 trong 2 cách:

# CÁCH 1: Kind (Miễn phí, đơn giản - KHUYÊN DÙNG ĐỂ TEST)
curl -sSL https://raw.githubusercontent.com/ductoanoxo/FOODFAST/main/setup-k8s-simple.sh | bash

# CÁCH 2: EKS thật (Tốn tiền, production-ready)
curl -sSL https://raw.githubusercontent.com/ductoanoxo/FOODFAST/main/setup-eks.sh | bash
```

### Bước 2: Thêm GitHub Secrets

Vào `Settings > Secrets and variables > Actions` và thêm:

```
EKS_SSH_KEY      = (Nội dung file EKS.pem)
EKS_SERVER_HOST  = 100.25.98.10
EKS_SERVER_USER  = ubuntu
```

### Bước 3: Tạo nhánh develop

```bash
# Trong folder FOODFAST
git checkout -b develop
git push -u origin develop
```

### Bước 4: Deploy

```bash
# Mỗi khi push vào develop sẽ tự động deploy lên K8s
git add .
git commit -m "Deploy to K8s"
git push origin develop

# Push vào main vẫn deploy lên EC2 như cũ
git checkout main
git merge develop
git push origin main
```

## Kiểm tra deployment

```bash
# SSH vào server K8s
ssh -i "C:\Users\ADMIN\Downloads\EKS.pem" ubuntu@100.25.98.10

# Xem tất cả pods
kubectl get pods -n foodfast

# Xem logs
kubectl logs -f deployment/foodfast-server -n foodfast

# Xem tất cả resources
kubectl get all -n foodfast
```

## Truy cập ứng dụng

### Với kind (setup đơn giản):
- Client: http://100.25.98.10:3000
- Admin: http://100.25.98.10:3001
- Restaurant: http://100.25.98.10:3002
- API: http://100.25.98.10:5000

### Port forward Grafana:
```bash
kubectl port-forward svc/grafana 3030:3000 -n foodfast
# Truy cập: http://100.25.98.10:3030
# User: admin / Pass: admin123
```

## So sánh 2 hệ thống

| Đặc điểm | EC2 Docker (main) | K8s (develop) |
|----------|-------------------|---------------|
| Server | 54.166.228.50 | 100.25.98.10 |
| Deploy khi | Push main | Push develop |
| Công nghệ | Docker Compose | Kubernetes |
| Auto-scale | ❌ | ✅ |
| Tự phục hồi | ❌ | ✅ |

## Xóa toàn bộ K8s (nếu cần)

```bash
# Xóa tất cả app
kubectl delete namespace foodfast

# Xóa cluster kind
kind delete cluster --name foodfast

# Xóa cluster EKS
eksctl delete cluster --name foodfast-cluster --region us-east-1
```

## ❓ FAQ

**Q: Deploy K8s có ảnh hưởng đến EC2 không?**
A: KHÔNG! Hoàn toàn độc lập.

**Q: Nên dùng kind hay EKS?**
A: Dùng kind để test trước (miễn phí), sau đó chuyển sang EKS khi cần production.

**Q: Làm sao biết deploy thành công?**
A: Vào GitHub Actions, xem workflow "Deploy to EKS" có dấu ✅ xanh.

**Q: Port-forward là gì?**
A: Tạm thời expose service ra ngoài để truy cập từ bên ngoài cluster.

---

📖 Chi tiết đầy đủ: Xem file `K8S_DEPLOYMENT_GUIDE.md`
