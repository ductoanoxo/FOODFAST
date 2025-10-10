# 🚀 QUICK START GUIDE

## Chạy dự án trong 3 bước

### Bước 1: Cài đặt dependencies (chỉ 1 lần)
```powershell
cd d:\BUILDWEB\FOODFAST-DRONE-DELIVERY
npm run install-all
```

### Bước 2: Seed dữ liệu mẫu
```powershell
npm run seed
```

### Bước 3: Chạy tất cả 5 apps
```powershell
npm run dev
```

---

## 🌐 Truy cập ứng dụng

| App | URL | Tài khoản |
|-----|-----|-----------|
| **Client App** | http://localhost:3000 | user@foodfast.com / user123 |
| **Restaurant App** | http://localhost:3001 | restaurant@foodfast.com / restaurant123 |
| **Admin App** | http://localhost:3002 | admin@foodfast.com / admin123 |
| **Drone Management** | http://localhost:3003 | drone@foodfast.com / drone123 |
| **API Server** | http://localhost:5000/api | - |

---

## ✅ Danh sách apps đã hoàn thành

### 1. Client App (Port 3000) ✅
- 11 Pages đầy đủ
- Giỏ hàng, thanh toán, tracking
- Redux + Socket.io

### 2. Restaurant App (Port 3001) ✅
- Dashboard với statistics
- Quản lý đơn hàng
- Quản lý menu

### 3. Admin App (Port 3002) ✅
- Quản lý users, restaurants
- Giám sát orders
- Quản lý drones

### 4. Drone Management (Port 3003) ✅
- Bản đồ Leaflet
- Danh sách drone
- Tracking realtime

### 5. Server App (Port 5000) ✅
- RESTful API đầy đủ
- MongoDB + Mongoose
- Socket.io realtime
- JWT authentication

---

## 📦 Dữ liệu mẫu sau khi seed

**Users**: 4 tài khoản (admin, user, restaurant, drone)
**Categories**: 5 (Cơm, Phở, Bún, Đồ uống, Fastfood)
**Restaurants**: 3 (Cơm Tấm SG, Phở HN, KFC)
**Products**: 7 món ăn với giá, rating
**Drones**: 3 drones với vị trí, pin

---

## 🔥 Demo Flow

1. **Mở Client App** → Login → Browse menu → Add to cart → Checkout
2. **Mở Restaurant App** → Xem đơn hàng mới → Accept
3. **Mở Drone Management** → Xem drone trên map
4. **Mở Admin App** → Monitor toàn hệ thống

---

## 🛠️ Commands hữu ích

```powershell
# Cài đặt lại tất cả
npm run install-all

# Chạy từng app riêng
npm run dev:server       # Backend
npm run dev:client       # Client
npm run dev:restaurant   # Restaurant
npm run dev:admin        # Admin
npm run dev:drone        # Drone

# Seed lại data
npm run seed
```

---

## 📚 Chi tiết đầy đủ

Xem **PROJECT_COMPLETE.md** để biết:
- Danh sách 140+ files đã tạo
- API endpoints đầy đủ
- Socket.io events
- Database schema
- User flows chi tiết

---

## 🎉 HÃY BẮT ĐẦU!

```powershell
cd d:\BUILDWEB\FOODFAST-DRONE-DELIVERY
npm run dev
```

**Enjoy coding! 🚀**
