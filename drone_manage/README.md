# Drone Management App

Ứng dụng quản lý drone cho hệ thống giao hàng FOODFAST.

## 🚀 Tính năng

- 🗺️ **Bản đồ theo dõi**: Theo dõi vị trí drone thời gian thực với Leaflet Maps
- 🛸 **Quản lý Drone**: Xem, thêm, sửa, xóa drone
- 📋 **Quản lý nhiệm vụ**: Giao nhiệm vụ cho drone, theo dõi tiến độ
- 📊 **Thống kê**: Xem thống kê hoạt động của drone
- 🔔 **Thông báo thời gian thực**: Cập nhật trạng thái drone qua Socket.io

## 🛠️ Công nghệ sử dụng

- **React 18**: UI framework
- **React Router DOM**: Routing
- **Redux Toolkit**: State management
- **Ant Design**: UI components
- **Leaflet**: Maps và tracking
- **Axios**: HTTP client
- **Socket.io Client**: Real-time communication
- **Vite**: Build tool

## 📦 Cài đặt

```bash
# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env
```

## ⚙️ Cấu hình

Chỉnh sửa file `.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Socket.io
VITE_SOCKET_URL=http://localhost:5000
```

## 🏃 Chạy ứng dụng

```bash
# Development mode
npm run dev

# Build cho production
npm run build

# Preview production build
npm run preview
```

Ứng dụng sẽ chạy tại `http://localhost:3003`

## 📁 Cấu trúc thư mục

```
drone_manage/
├── src/
│   ├── api/              # API calls
│   │   ├── axios.js
│   │   ├── authAPI.js
│   │   ├── droneAPI.js
│   │   ├── missionAPI.js
│   │   └── orderAPI.js
│   ├── components/       # Reusable components
│   │   ├── Layout/
│   │   └── Map/         # Map components (Leaflet)
│   ├── pages/           # Page components
│   │   ├── Auth/
│   │   ├── Drones/
│   │   ├── Map/
│   │   └── Missions/
│   ├── redux/           # Redux store & slices
│   │   ├── store.js
│   │   └── slices/
│   ├── utils/           # Utility functions
│   │   └── mapHelpers.js
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── package.json
└── vite.config.js
```

## 🗺️ Tính năng Bản đồ (Leaflet)

- **Markers**: Hiển thị vị trí drone với icon tùy chỉnh
- **Tooltips**: Thông tin nhanh khi hover
- **Popups**: Chi tiết drone khi click
- **Polylines**: Hiển thị route giao hàng
- **Real-time updates**: Cập nhật vị trí tự động

## 🔑 Đăng nhập

Tài khoản mặc định cho Drone Manager:
- Email: `dronemanager@example.com`
- Password: `123456`

## 📝 API Endpoints

- `GET /api/drones` - Lấy danh sách drone
- `GET /api/drones/:id` - Chi tiết drone
- `POST /api/drones` - Tạo drone mới
- `PUT /api/drones/:id` - Cập nhật drone
- `DELETE /api/drones/:id` - Xóa drone
- `PATCH /api/drones/:id/location` - Cập nhật vị trí
- `PATCH /api/drones/:id/status` - Cập nhật trạng thái

## 🎨 UI Components

- Ant Design components
- Custom Leaflet markers
- Responsive layout
- Dark/Light theme support

## 🔄 Real-time Features

Socket.io events:
- `drone:location-update` - Cập nhật vị trí drone
- `drone:status-change` - Thay đổi trạng thái drone
- `mission:assigned` - Giao nhiệm vụ mới
- `mission:completed` - Hoàn thành nhiệm vụ

## 📄 License

MIT
