# 🚀 HƯỚNG DẪN CHẠY FOODFAST VỚI DOCKER

> **Hướng dẫn nhanh chạy toàn bộ hệ thống chỉ với vài lệnh đơn giản**

---

## 📋 YÊU CẦU

1. **Docker Desktop** đã cài đặt và đang chạy
   - Download: https://www.docker.com/products/docker-desktop/
   - Kiểm tra: `docker --version`

2. **8GB RAM** trở lên (khuyến nghị)

3. **10GB dung lượng trống**

---

## 🎯 CHẠY NGAY (3 BƯỚC)

### Bước 1: Clone hoặc mở project
```bash
cd /path/to/FOODFAST
```

### Bước 2: Build và chạy tất cả containers
```bash
docker compose up -d --build
```

> ⏱️ Lần đầu sẽ mất **5-10 phút** để build (tùy tốc độ mạng)

### Bước 3: Mở trình duyệt và truy cập

Đợi khoảng **30 giây** để các services khởi động xong, sau đó mở:

| Ứng dụng | URL |
|----------|-----|
| 👥 **Client App** | http://localhost:3000 |
| 🏪 **Restaurant App** | http://localhost:3001 |
| 👨‍💼 **Admin Dashboard** | http://localhost:3002 |
| 🚁 **Drone Management** | http://localhost:3003 |

---

## ✅ KIỂM TRA TRẠNG THÁI

Xem tất cả containers đang chạy:
```bash
docker compose ps
```

Bạn sẽ thấy 6 containers với trạng thái **Up**:
```
NAME                  STATUS
foodfast_mongodb      Up
foodfast_server       Up
foodfast_client       Up
foodfast_restaurant   Up
foodfast_admin        Up
foodfast_drone        Up
```

---

## 🔍 XEM LOGS (Nếu có lỗi)

### Xem logs tất cả services:
```bash
docker compose logs -f
```

### Xem logs một service cụ thể:
```bash
docker compose logs -f server_app
docker compose logs -f client_app
```

---

## 🛑 DỪNG ỨNG DỤNG

### Dừng tất cả containers:
```bash
docker compose down
```

### Dừng và xóa volumes (dữ liệu):
```bash
docker compose down -v
```

---

## 🔄 KHỞI ĐỘNG LẠI

### Nếu đã build rồi, chỉ cần:
```bash
docker compose up -d
```

### Nếu có thay đổi code, rebuild:
```bash
docker compose up -d --build
```

---

## 🧹 DỌN DẸP (Khi cần)

### Xóa tất cả containers và images của project:
```bash
docker compose down --rmi all -v
```

### Dọn dẹp Docker system (giải phóng dung lượng):
```bash
docker system prune -a
```

---

## 🐛 TROUBLESHOOTING

### ❌ Port đã được sử dụng

**Windows:**
```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :5000
```

**Linux/Mac:**
```bash
lsof -i :3000
lsof -i :5000
```

Dừng process đang chiếm port hoặc thay đổi port trong `docker-compose.yml`

---

### ❌ Container không start

1. Kiểm tra logs:
```bash
docker compose logs [service_name]
```

2. Restart service:
```bash
docker compose restart [service_name]
```

---

### ❌ Trang web không load

1. **Clear browser cache**: `Ctrl + Shift + R`

2. Truy cập trang clear cache:
   - http://localhost:3000/clear-cache.html
   - http://localhost:3001/clear-cache.html
   - http://localhost:3002/clear-cache.html
   - http://localhost:3003/clear-cache.html

3. Restart containers:
```bash
docker compose restart
```

---

### ❌ Lỗi kết nối MongoDB

Kiểm tra MongoDB đã chạy chưa:
```bash
docker compose ps mongodb
```

Restart MongoDB:
```bash
docker compose restart mongodb
```

---

## 📊 KIỂM TRA RESOURCE USAGE

Xem CPU, RAM của containers:
```bash
docker stats
```

---

## 🎓 TÀI KHOẢN ĐĂNG NHẬP MẪU

Sau khi seed dữ liệu (nếu có), sử dụng:

| Role | Email | Password |
|------|-------|----------|
| **User** | user@foodfast.com | user123 |
| **Restaurant** | restaurant@foodfast.com | rest123 |
| **Admin** | admin@foodfast.com | admin123 |
| **Drone Manager** | drone@foodfast.com | drone123 |

> ⚠️ **Lưu ý**: Tài khoản này chỉ có nếu database đã có dữ liệu mẫu

---

## 🔐 CẤU HÌNH BẢO MẬT (Production)

Trước khi deploy production, nhớ thay đổi:

1. `JWT_SECRET` trong `docker-compose.yml`
2. MongoDB credentials
3. API keys (VNPay, Cloudinary, Google Maps...)

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:

1. Đọc file `DOCKER_GUIDE.md` để biết chi tiết hơn
2. Kiểm tra logs: `docker compose logs -f`
3. Tạo issue trên GitHub repository

---

## 🎉 HOÀN TẤT!

Nếu mọi thứ OK, bạn sẽ thấy:

✅ 6 containers đang chạy  
✅ Tất cả trang web đều truy cập được  
✅ Backend API hoạt động bình thường  
✅ MongoDB đã kết nối  

**Chúc bạn code vui vẻ!** 🚀

---

**Made with ❤️ by FOODFAST Team**
