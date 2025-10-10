# 🍔🚁 FOODFAST DRONE DELIVERY

> Hệ thống đặt đồ ăn với giao hàng bằng drone - Food delivery system with drone management

## 📋 Tổng quan dự án

FOODFAST DRONE DELIVERY là một hệ thống đặt đồ ăn hiện đại, cho phép khách hàng đặt món từ nhiều nhà hàng và cửa hàng khác nhau, với tính năng giao hàng tự động bằng drone.

### 🎯 Tính năng chính

- **Client App**: Ứng dụng cho khách hàng đặt món ăn
- **Restaurant App**: Quản lý đơn hàng cho nhà hàng/cửa hàng
- **Admin Dashboard**: Quản lý toàn bộ hệ thống
- **Drone Management**: Theo dõi và điều khiển drone giao hàng

## 🏗️ Kiến trúc hệ thống

```
FOODFAST-DRONE-DELIVERY/
├── client_app/          # ReactJS - Ứng dụng khách hàng (Port: 3000)
├── restaurant_app/      # ReactJS - Ứng dụng nhà hàng (Port: 3001)
├── admin_app/          # ReactJS - Admin Dashboard (Port: 3002)
├── drone_manage/       # ReactJS - Quản lý Drone (Port: 3003)
├── server_app/         # NodeJS + Express - Backend API (Port: 5000)
└── docker-compose.yml  # Docker configuration
```

## 🚀 Công nghệ sử dụng

### Frontend
- **React 18** - UI Framework
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **React Router v6** - Routing
- **Ant Design** - UI Components
- **Axios** - HTTP Client
- **Socket.io-client** - Real-time communication
- **Leaflet/Google Maps** - Map visualization

### Backend
- **Node.js & Express** - REST API
- **MongoDB & Mongoose** - Database
- **Socket.io** - WebSocket
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer & Cloudinary** - File upload
- **Node-cron** - Task scheduling

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js >= 18.x
- MongoDB >= 6.x
- npm hoặc yarn
- Docker & Docker Compose (optional)

### 1. Clone repository
```bash
git clone <your-repo-url>
cd FOODFAST-DRONE-DELIVERY
```

### 2. Cài đặt dependencies
```bash
# Cài đặt cho tất cả các app
npm run install-all

# Hoặc cài đặt từng app
cd client_app && npm install
cd ../restaurant_app && npm install
cd ../admin_app && npm install
cd ../drone_manage && npm install
cd ../server_app && npm install
```

### 3. Cấu hình môi trường
Copy file `.env` và điền thông tin:
```bash
cp .env.example .env
```

### 4. Chạy ứng dụng

#### Development mode
```bash
# Chạy tất cả services
npm run dev

# Hoặc chạy từng service
npm run dev:client      # Port 3000
npm run dev:restaurant  # Port 3001
npm run dev:admin       # Port 3002
npm run dev:drone       # Port 3003
npm run dev:server      # Port 5000
```

#### Production mode với Docker
```bash
docker-compose up -d
```

## 🌐 Truy cập ứng dụng

- **Client App**: http://localhost:3000
- **Restaurant App**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3002
- **Drone Management**: http://localhost:3003
- **Backend API**: http://localhost:5000

## 📱 Chức năng chi tiết

### Client App (Khách hàng)
- 🔐 Đăng ký/Đăng nhập
- 🍕 Tìm kiếm món ăn từ nhiều nhà hàng
- 🛒 Giỏ hàng đa nhà hàng
- 💳 Thanh toán online (VNPay, Momo)
- 📍 Theo dõi đơn hàng real-time
- 🚁 Xem vị trí drone giao hàng
- ⭐ Đánh giá và review
- 📱 Quản lý profile và lịch sử đơn hàng

### Restaurant App (Nhà hàng)
- 📊 Dashboard thống kê
- 📦 Quản lý đơn hàng
- 🍔 Quản lý menu và món ăn
- 📦 Quản lý kho
- 📈 Báo cáo doanh thu
- 🔔 Thông báo đơn hàng mới

### Admin Dashboard
- 👥 Quản lý người dùng
- 🏪 Quản lý nhà hàng/cửa hàng
- 📦 Quản lý đơn hàng toàn hệ thống
- 🚁 Quản lý drone
- 📊 Báo cáo và thống kê
- ⚙️ Cấu hình hệ thống

### Drone Management
- 🚁 Danh sách drone
- 🗺️ Theo dõi real-time trên bản đồ
- 📍 Quản lý lộ trình
- 🔋 Giám sát trạng thái drone
- 📊 Telemetry data

## 🗄️ Database Schema

### Collections chính
- **users** - Thông tin người dùng
- **restaurants** - Nhà hàng/cửa hàng
- **products** - Món ăn/sản phẩm
- **orders** - Đơn hàng
- **drones** - Thông tin drone
- **deliveries** - Lịch sử giao hàng
- **reviews** - Đánh giá
- **notifications** - Thông báo

## 🔐 Authentication

Hệ thống sử dụng JWT (JSON Web Token) cho authentication:
- Access Token (expires: 1 day)
- Refresh Token (expires: 7 days)
- Role-based access control (User, Restaurant, Admin, Drone Manager)

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/refresh` - Refresh token

### Products
- `GET /api/products` - Lấy danh sách món ăn
- `GET /api/products/:id` - Chi tiết món ăn
- `POST /api/products` - Tạo món ăn mới

### Orders
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `PATCH /api/orders/:id/status` - Cập nhật trạng thái

### Drones
- `GET /api/drones` - Danh sách drone
- `GET /api/drones/:id/location` - Vị trí drone
- `PATCH /api/drones/:id/assign` - Gán drone cho đơn hàng

## 🧪 Testing

```bash
# Backend tests
cd server_app
npm test

# Frontend tests
cd client_app
npm test
```

## 📝 License

MIT License - Copyright (c) 2025

## 👥 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo Pull Request hoặc Issue.

## 📞 Liên hệ

- Email: support@foodfast.com
- Website: https://foodfast.com
- GitHub: https://github.com/your-repo

---

Made with ❤️ by FOODFAST Team
