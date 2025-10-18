# ✅ CHECKLIST - Chạy FOODFAST với Docker

> **Hướng dẫn từng bước cho người mới bắt đầu**

---

## ☑️ BƯỚC 1: Kiểm tra yêu cầu hệ thống

- [ ] **Docker Desktop đã cài đặt**
  - Download tại: https://www.docker.com/products/docker-desktop/
  - Đảm bảo Docker Desktop đang chạy (xem icon ở system tray)

- [ ] **RAM đủ** (tối thiểu 8GB)
  
- [ ] **Dung lượng đủ** (tối thiểu 10GB trống)

### ✅ Kiểm tra Docker đã chạy:
```bash
docker --version
docker compose --version
```

Nếu thấy version → OK ✅  
Nếu báo lỗi → Cài đặt Docker Desktop ❌

---

## ☑️ BƯỚC 2: Mở project

### Windows:
```bash
cd C:\path\to\FOODFAST
```

### Linux/Mac:
```bash
cd /path/to/FOODFAST
```

### ✅ Kiểm tra đã đúng thư mục:
```bash
ls docker-compose.yml
```

Nếu thấy file → OK ✅  
Nếu không thấy → Đi đúng thư mục project ❌

---

## ☑️ BƯỚC 3: Chạy Docker

### Chọn 1 trong 2 cách:

**Cách A: Dùng script tự động (Khuyến nghị)**

Windows PowerShell:
```powershell
.\start-docker.ps1
```

Linux/Mac:
```bash
chmod +x start-docker.sh
./start-docker.sh
```

**Cách B: Chạy lệnh trực tiếp**
```bash
docker compose up -d --build
```

### ⏱️ Đợi build...
- Lần đầu: **5-10 phút**
- Lần sau: **< 1 phút**

---

## ☑️ BƯỚC 4: Kiểm tra containers đã chạy

```bash
docker compose ps
```

### ✅ Phải thấy 6 containers với status "Up":

- [ ] `foodfast_mongodb` → Up
- [ ] `foodfast_server` → Up
- [ ] `foodfast_client` → Up
- [ ] `foodfast_restaurant` → Up
- [ ] `foodfast_admin` → Up
- [ ] `foodfast_drone` → Up

Nếu có container không Up → Xem logs: `docker compose logs [tên-container]`

---

## ☑️ BƯỚC 5: Truy cập ứng dụng

### Đợi thêm 30 giây để các services khởi động hoàn tất

Sau đó mở trình duyệt và truy cập:

- [ ] **Client App**: http://localhost:3000
- [ ] **Restaurant App**: http://localhost:3001
- [ ] **Admin Dashboard**: http://localhost:3002
- [ ] **Drone Management**: http://localhost:3003

### ✅ Nếu trang web hiện lên → THÀNH CÔNG! 🎉

---

## ☑️ BƯỚC 6: Xử lý lỗi (nếu có)

### ❌ Trang không load / 404 Error

**Giải pháp:**
1. Clear browser cache: `Ctrl + Shift + R` (Windows) hoặc `Cmd + Shift + R` (Mac)
2. Truy cập: http://localhost:3000/clear-cache.html
3. Refresh lại trang

### ❌ Containers không start

**Kiểm tra logs:**
```bash
docker compose logs -f
```

**Restart:**
```bash
docker compose restart
```

### ❌ Port bị chiếm (Port already in use)

**Windows - Tìm process chiếm port:**
```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :5000
```

**Giải pháp:**
1. Tắt ứng dụng đang chiếm port
2. Hoặc thay đổi port trong `docker-compose.yml`

### ❌ Database trống / Không có dữ liệu

Database mới tạo sẽ trống. Bạn cần:
1. Đăng ký tài khoản mới
2. Hoặc seed dữ liệu mẫu (xem phần dưới)

---

## 🎯 (TÙY CHỌN) Seed dữ liệu mẫu

Nếu muốn có sẵn dữ liệu mẫu để test:

```bash
docker exec foodfast_server node seed.js
```

Sau đó có thể login với:
- Email: `user@foodfast.com`
- Password: `user123`

---

## 🛑 Dừng ứng dụng

### Khi muốn tắt:
```bash
docker compose down
```

### Muốn xóa cả dữ liệu:
```bash
docker compose down -v
```

---

## 🔄 Chạy lại lần sau

Lần sau không cần build nữa, chỉ cần:

```bash
docker compose up -d
```

Nhanh chóng, chỉ mất vài giây! ⚡

---

## 📚 Tài liệu thêm

- **Chi tiết Docker**: [DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md)
- **Các lệnh Docker**: [DOCKER_COMMANDS.md](./DOCKER_COMMANDS.md)
- **Troubleshooting**: [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)

---

## 🎉 HOÀN THÀNH!

Nếu tất cả các bước trên OK:
- ✅ 6 containers đang chạy
- ✅ Tất cả web đều truy cập được
- ✅ Không có lỗi trong logs

→ **BẠN ĐÃ CHẠY THÀNH CÔNG!** 🚀

**Happy coding!** 💻

---

**Made with ❤️ by FOODFAST Team**
