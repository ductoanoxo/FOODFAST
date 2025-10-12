# 🍽️ Restaurant App - FOODFAST Drone Delivery System

Ứng dụng quản lý nhà hàng cho hệ thống giao đồ ăn bằng drone FOODFAST.

## 📋 Tính năng

### 🎯 Quản lý đơn hàng
- ✅ Xem danh sách đơn hàng theo trạng thái (Chờ xác nhận, Đang chuẩn bị, Sẵn sàng, Đang giao, Hoàn thành)
- ✅ Cập nhật trạng thái đơn hàng
- ✅ Xem chi tiết đơn hàng
- ✅ Nhận thông báo real-time khi có đơn hàng mới
- ✅ Lọc và tìm kiếm đơn hàng

### 🍕 Quản lý thực đơn
- ✅ Thêm, sửa, xóa món ăn
- ✅ Upload hình ảnh món ăn
- ✅ Quản lý danh mục món ăn
- ✅ Cập nhật trạng thái còn hàng/hết hàng
- ✅ Tìm kiếm và lọc món ăn

### 📊 Dashboard & Thống kê
- ✅ Tổng quan đơn hàng
- ✅ Thống kê doanh thu theo ngày
- ✅ Biểu đồ trạng thái đơn hàng
- ✅ Danh sách đơn hàng gần đây
- ✅ Thống kê món ăn

### 👤 Quản lý hồ sơ
- ✅ Cập nhật thông tin nhà hàng
- ✅ Thay đổi trạng thái mở cửa/đóng cửa
- ✅ Xem đánh giá và thống kê

## 🚀 Cài đặt

### Yêu cầu
- Node.js >= 18
- npm hoặc yarn

### Các bước cài đặt

1. **Di chuyển vào thư mục restaurant_app:**
```bash
cd restaurant_app
```

2. **Cài đặt dependencies:**
```bash
npm install
```

3. **Cấu hình môi trường:**

Tạo file `.env` (nếu cần):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

4. **Chạy ứng dụng:**
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:3001`

## 🏗️ Cấu trúc Project

```
restaurant_app/
├── src/
│   ├── api/                    # API services
│   │   ├── axios.js           # Axios instance
│   │   ├── authAPI.js         # Authentication API
│   │   ├── orderAPI.js        # Order API
│   │   └── productAPI.js      # Product API
│   ├── components/            # React components
│   │   ├── Layout/
│   │   │   └── MainLayout.jsx # Main layout
│   │   ├── OrderCard.jsx      # Order card component
│   │   ├── OrderDetailModal.jsx
│   │   ├── ProductCard.jsx
│   │   └── ProductFormModal.jsx
│   ├── pages/                 # Pages
│   │   ├── Auth/
│   │   │   └── LoginPage.jsx
│   │   ├── Dashboard/
│   │   │   └── DashboardPage.jsx
│   │   ├── Orders/
│   │   │   └── OrdersPage.jsx
│   │   ├── Menu/
│   │   │   └── MenuPage.jsx
│   │   └── Profile/
│   │       └── ProfilePage.jsx
│   ├── redux/                 # Redux state management
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── orderSlice.js
│   │   │   └── productSlice.js
│   │   └── store.js
│   ├── utils/                 # Utilities
│   │   ├── socket.js          # Socket.IO client
│   │   └── helpers.js         # Helper functions
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
└── vite.config.js
```

## 🔑 Đăng nhập

### Tài khoản demo:
- **Email:** `restaurant@foodfast.com`
- **Mật khẩu:** `restaurant123`

## 📱 Các tính năng chính

### 1. Dashboard
- Hiển thị tổng quan hoạt động
- Thống kê đơn hàng theo trạng thái
- Biểu đồ doanh thu 7 ngày qua
- Danh sách đơn hàng gần đây

### 2. Quản lý đơn hàng
- Tab phân loại theo trạng thái
- Card hiển thị thông tin đơn hàng
- Cập nhật trạng thái nhanh
- Modal chi tiết đơn hàng
- Real-time notifications

### 3. Quản lý thực đơn
- Grid view món ăn
- Tìm kiếm và lọc
- Form thêm/sửa món ăn
- Upload hình ảnh
- Quản lý trạng thái còn hàng

### 4. Hồ sơ nhà hàng
- Cập nhật thông tin
- Toggle trạng thái mở/đóng
- Xem đánh giá

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **React Router DOM** - Routing
- **Ant Design** - UI components
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **Recharts** - Charts
- **Day.js** - Date formatting
- **React Toastify** - Notifications

## 🔄 Flow xử lý đơn hàng

1. **Pending (Chờ xác nhận)** → Nhà hàng nhận đơn mới
2. **Preparing (Đang chuẩn bị)** → Nhà hàng xác nhận và chuẩn bị món
3. **Ready (Sẵn sàng giao)** → Món ăn đã sẵn sàng
4. **Delivering (Đang giao)** → Drone đang giao hàng
5. **Completed (Hoàn thành)** → Đơn hàng hoàn tất

## 🔔 Real-time Features

- Nhận thông báo khi có đơn hàng mới
- Cập nhật trạng thái đơn hàng real-time
- Auto-refresh danh sách đơn hàng

## 🎨 UI/UX

- Responsive design (Mobile, Tablet, Desktop)
- Modern & Clean interface
- Smooth animations
- Intuitive navigation
- Vietnamese language support

## 📞 API Endpoints sử dụng

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Đăng thông tin user (endpoint hiện có trên server)

### Orders
- `GET /api/orders/restaurant` - Lấy danh sách đơn hàng
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng
- `PATCH /api/orders/:id/status` - Cập nhật trạng thái

### Products
- `GET /api/products/restaurant` - Lấy danh sách món ăn
- `POST /api/products` - Thêm món ăn
- `PUT /api/products/:id` - Cập nhật món ăn
- `DELETE /api/products/:id` - Xóa món ăn

## 🐛 Troubleshooting

### Lỗi kết nối API
- Kiểm tra server backend đã chạy chưa (port 5000)
- Kiểm tra URL trong file `axios.js`

### Lỗi Socket.IO
- Kiểm tra server Socket.IO đã được cấu hình đúng
- Kiểm tra token trong localStorage

### Lỗi upload ảnh
- Kiểm tra kích thước file < 2MB
- Kiểm tra định dạng file (jpg, png, gif)

## 📝 Notes

- Ứng dụng yêu cầu backend server chạy trước
- Token được lưu trong localStorage
- Tự động đăng xuất khi token hết hạn
- Auto-refresh đơn hàng mỗi 30 giây

## 👥 Author

FOODFAST Development Team

## 📄 License

MIT License
