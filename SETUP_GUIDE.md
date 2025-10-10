# 🚀 Hướng dẫn cài đặt và chạy dự án FOODFAST DRONE DELIVERY

## ⚡ QUICK START (Cho người mới clone)

**Chỉ cần 3 bước:**

### 1️⃣ Clone project
```bash
git clone https://github.com/ductoanoxo/FOODFAST.git
cd FOODFAST
```

### 2️⃣ Chạy script setup tự động
```powershell
.\setup.ps1
```
Script này sẽ:
- Kiểm tra Node.js
- Tạo file `.env` (nếu chưa có)
- Cài đặt dependencies cho tất cả 5 apps

### 3️⃣ Cập nhật MongoDB URI trong `.env`
```env
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/FOODFASTDRONEDELIVERY
```

### 4️⃣ Seed database và start
```powershell
.\seed.ps1   # Tạo dữ liệu mẫu
.\start.ps1  # Chạy tất cả apps
```

**Xong! Mở http://localhost:3000** 🎉

---

## 📋 Yêu cầu hệ thống

- Node.js >= 18.x
- MongoDB >= 6.x (hoặc MongoDB Atlas)
- npm >= 9.x hoặc yarn
- Docker & Docker Compose (tùy chọn)

## 🔧 Cài đặt

### Bước 1: Clone repository và cài đặt dependencies

```powershell
# Di chuyển vào thư mục dự án
cd d:\BUILDWEB\FOODFAST-DRONE-DELIVERY

# Cài đặt dependencies cho tất cả các app
cd client_app
npm install

cd ..\restaurant_app
npm install

cd ..\admin_app
npm install

cd ..\drone_manage
npm install

cd ..\server_app
npm install

cd ..
```

### Bước 2: Cấu hình môi trường

File `.env` đã được tạo sẵn. Bạn cần cập nhật các thông tin sau:

```env
# MongoDB - Chọn 1 trong 2 options:
# Option 1: Local MongoDB
MONGO_URI=mongodb://localhost:27017/foodfast_drone_delivery

# Option 2: MongoDB Atlas (recommended)
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/foodfast

# JWT Secret - Thay đổi trong production
JWT_SECRET=your_super_secret_key_change_this_in_production

# Google Maps API (lấy tại https://console.cloud.google.com)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Cloudinary cho upload ảnh (lấy tại https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Bước 3: Khởi động MongoDB (nếu dùng local)

```powershell
# Khởi động MongoDB service
mongod
```

### Bước 4: Chạy ứng dụng

#### Option 1: Chạy Development Mode

**Terminal 1 - Backend Server:**
```powershell
cd server_app
npm run dev
# Server chạy tại: http://localhost:5000
```

**Terminal 2 - Client App:**
```powershell
cd client_app
npm run dev
# Client chạy tại: http://localhost:3000
```

**Terminal 3 - Restaurant App:**
```powershell
cd restaurant_app
npm run dev
# Restaurant chạy tại: http://localhost:3001
```

**Terminal 4 - Admin App:**
```powershell
cd admin_app
npm run dev
# Admin chạy tại: http://localhost:3002
```

**Terminal 5 - Drone Management:**
```powershell
cd drone_manage
npm run dev
# Drone chạy tại: http://localhost:3003
```

#### Option 2: Chạy với Docker Compose

```powershell
# Build và chạy tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down

# Dừng và xóa volumes
docker-compose down -v
```

## 🌐 Truy cập ứng dụng

Sau khi chạy thành công, truy cập:

- **Client App (Khách hàng):** http://localhost:3000
- **Restaurant App (Nhà hàng):** http://localhost:3001
- **Admin Dashboard:** http://localhost:3002
- **Drone Management:** http://localhost:3003
- **Backend API:** http://localhost:5000

## 📱 Tính năng chính đã implement

### ✅ Client App
- [x] Trang chủ với banner và sản phẩm nổi bật
- [x] Tìm kiếm và lọc món ăn
- [x] Xem chi tiết sản phẩm
- [x] Giỏ hàng đa nhà hàng
- [x] Đăng ký / Đăng nhập
- [x] Redux state management
- [x] Responsive design
- [ ] Checkout và thanh toán (cần backend)
- [ ] Theo dõi đơn hàng real-time (cần backend)
- [ ] Xem vị trí drone (cần backend + drone service)

### 🏗️ Cấu trúc Frontend đã hoàn thiện

```
client_app/
├── src/
│   ├── api/                    ✅ API integration
│   │   ├── axios.js
│   │   ├── authAPI.js
│   │   ├── productAPI.js
│   │   ├── restaurantAPI.js
│   │   ├── orderAPI.js
│   │   └── paymentAPI.js
│   ├── components/             ✅ Reusable components
│   │   ├── Layout/
│   │   │   ├── MainLayout.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── AuthLayout.jsx
│   │   ├── Product/
│   │   │   ├── ProductCard.jsx
│   │   │   └── ProductFilter.jsx
│   │   ├── Restaurant/
│   │   │   └── RestaurantCard.jsx
│   │   └── Route/
│   │       └── ProtectedRoute.jsx
│   ├── pages/                  ✅ Main pages
│   │   ├── Home/
│   │   ├── Auth/ (Login, Register)
│   │   ├── Menu/
│   │   ├── Store/
│   │   ├── Product/
│   │   └── NotFound/
│   ├── redux/                  ✅ State management
│   │   ├── store.js
│   │   └── slices/
│   │       ├── authSlice.js
│   │       ├── cartSlice.js
│   │       ├── productSlice.js
│   │       └── orderSlice.js
│   ├── App.jsx
│   └── main.jsx
├── Dockerfile                  ✅ Docker config
├── nginx.conf                  ✅ Nginx config
├── package.json
└── vite.config.js
```

## 🔨 Các bước tiếp theo

### 1. Backend Server (server_app)
Cần implement:
- Authentication API (JWT)
- Products CRUD
- Orders management
- Payment integration (VNPay/Momo)
- WebSocket for real-time tracking
- Database models (MongoDB/Mongoose)

### 2. Restaurant App
- Dashboard thống kê
- Quản lý menu
- Quản lý đơn hàng
- Thông báo real-time

### 3. Admin App
- User management
- Restaurant management
- Order management
- Drone management
- Analytics & Reports

### 4. Drone Management
- Drone list & status
- Real-time tracking map
- Route planning
- Telemetry data

## 🐛 Troubleshooting

### Lỗi: Cannot find module
```powershell
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: Port already in use
```powershell
# Kiểm tra process đang dùng port
netstat -ano | findstr :3000

# Kill process (thay PID bằng số hiện tại)
taskkill /PID <PID> /F
```

### Lỗi: MongoDB connection
- Kiểm tra MongoDB đã chạy chưa
- Kiểm tra connection string trong `.env`
- Nếu dùng Atlas, kiểm tra IP whitelist

## 📚 Tài liệu tham khảo

- [React Documentation](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Ant Design](https://ant.design/)
- [Vite](https://vitejs.dev/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/docs/)

## 💡 Tips

1. **Development**: Luôn chạy backend trước, sau đó frontend
2. **Hot Reload**: Vite hỗ trợ hot reload, thay đổi code sẽ tự động cập nhật
3. **Redux DevTools**: Cài extension để debug Redux state
4. **API Testing**: Dùng Postman/Thunder Client để test API

## 🎯 Roadmap

- [ ] Hoàn thiện Backend API
- [ ] Implement Restaurant App
- [ ] Implement Admin Dashboard
- [ ] Implement Drone Management
- [ ] WebSocket integration
- [ ] Payment gateway integration
- [ ] Google Maps integration
- [ ] Push notifications
- [ ] Unit tests
- [ ] E2E tests
- [ ] Deploy lên cloud

---

Nếu gặp vấn đề, hãy check:
1. Node.js version: `node --version` (phải >= 18)
2. npm version: `npm --version`
3. MongoDB running: `mongosh` để kết nối
4. Ports available: 3000, 3001, 3002, 3003, 5000

**Made with ❤️ by FoodFast Team**
