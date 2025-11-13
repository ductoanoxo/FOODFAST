# 🚀 FOODFAST - Postman Collection Guide

## 📦 File Collection
**File**: `VNPAY_POSTMAN_COLLECTION.json`  
**Version**: 2.0.0 - Complete API Collection  
**Total APIs**: 100+ endpoints

---

## 📥 Import vào Postman

### Bước 1: Import Collection
1. Mở Postman
2. Click **Import** ở góc trái trên
3. Chọn tab **File**
4. Chọn file `VNPAY_POSTMAN_COLLECTION.json`
5. Click **Import**

### Bước 2: Thiết lập Environment Variables
Collection đã có sẵn variables, nhưng bạn có thể tạo Environment riêng:

```json
{
  "base_url": "http://localhost:5000/api",
  "auth_token": "",
  "admin_token": "",
  "restaurant_token": ""
}
```

---

## 🎯 Cấu trúc Collection

Collection được chia thành **15 modules chính**:

### 1. 🔐 Authentication (8 requests)
- Register Customer
- Login Customer/Admin/Restaurant
- Get Profile
- Update Profile
- Logout

### 2. 📦 Orders (11 requests)
- Create Order (COD/VNPAY/MOMO/CARD)
- Get Orders
- Track Order
- Update Status
- Cancel Order
- Confirm Delivery
- Restaurant Confirm Handover
- Calculate Fee

### 3. 💳 VNPay Payment (8 requests)
- Create Payment URL
- VNPay Return/IPN
- Query Transaction
- Refund
- Get Payment Info
- Payment Methods

### 4. 🏪 Restaurants (12 requests)
- CRUD Operations
- Nearby Restaurants
- Restaurant Menu
- Toggle Status
- Statistics
- Create with Account

### 5. 🍕 Products (8 requests)
- CRUD Operations
- Popular Products
- Products by Restaurant

### 6. 🎟️ Vouchers & Promotions (8 requests)
- Get/Create/Update Vouchers
- Validate Voucher
- Active Promotions
- Voucher Usage

### 7. ⭐ Reviews & Ratings (3 requests)
- Create Review
- Get Reviews (Restaurant/Product)

### 8. 🚁 Drone Management (4 requests)
- Get Drones
- Assign Drone
- Update Drone
- Drone Status

### 9. 👨‍💼 Admin Operations (4 requests)
- Pending Orders
- Available Drones
- Assign/Reassign
- Fleet Stats

### 10. 📂 Categories (7 requests)
- CRUD Operations
- Get Products by Category

### 11. 👥 Users Management (7 requests)
- Get All Users
- Check Email
- User Stats
- CRUD Operations

### 12. 💰 Refunds (4 requests)
- Get Refund Requests
- Process Refund
- Refund Stats
- Refund Logs

### 13. 📊 Dashboard (4 requests)
- Dashboard Stats
- Recent Orders
- Top Restaurants
- Order Statistics

### 14. 📤 Upload (3 requests)
- Upload Single/Multiple Images
- Delete Image

### 15. 🧪 Test Data Setup (2 requests)
- Get Restaurants
- Get Products

---

## 🔄 Quy trình test đề xuất

### Phase 1: Setup & Authentication (5 phút)
```
1. Login Admin → Lưu admin_token
2. Login Restaurant → Lưu restaurant_token
3. Register/Login Customer → Lưu auth_token
4. Get Restaurants → Lưu restaurant_id
5. Get Products → Lưu product_id
```

### Phase 2: Customer Flow (10 phút)
```
1. GET /restaurants (Xem danh sách nhà hàng)
2. GET /products?restaurant={id} (Xem menu)
3. GET /promotions/active/{restaurantId} (Xem khuyến mãi)
4. GET /vouchers/public/{restaurantId} (Xem voucher)
5. POST /orders/calculate-fee (Tính phí ship)
6. POST /orders (Đặt hàng)
7. POST /payment/vnpay/create (Thanh toán)
8. GET /orders/{id}/track (Tracking)
9. POST /orders/{id}/confirm-delivery (Xác nhận)
10. POST /reviews (Đánh giá)
```

### Phase 3: Restaurant Flow (8 phút)
```
1. POST /categories (Tạo danh mục)
2. POST /products (Thêm sản phẩm)
3. POST /promotions (Tạo khuyến mãi)
4. POST /vouchers (Tạo voucher)
5. GET /orders/restaurant (Xem đơn hàng)
6. PATCH /orders/{id}/status (Cập nhật: confirmed → preparing → ready)
7. POST /orders/{id}/restaurant-confirm-handover (Giao drone)
8. GET /restaurants/{id}/stats (Xem thống kê)
```

### Phase 4: Admin Flow (7 phút)
```
1. GET /dashboard/stats (Tổng quan)
2. GET /admin/orders/pending (Đơn chờ)
3. POST /drones (Thêm drone)
4. POST /admin/assign-drone (Phân công)
5. GET /refunds (Yêu cầu hoàn tiền)
6. POST /refunds/{orderId}/process (Xử lý)
7. GET /users/stats (Thống kê users)
```

---

## 🔑 Credentials mặc định

### Admin
```json
{
  "email": "admin@foodfast.com",
  "password": "Admin123!"
}
```

### Restaurant
```json
{
  "email": "restaurant@test.com",
  "password": "Restaurant123!"
}
```

### Customer
```json
{
  "email": "customer@test.com",
  "password": "Test1234!"
}
```

⚠️ **Lưu ý**: Cần kiểm tra credentials trong file seed data của bạn!

---

## 📝 Variables tự động lưu

Collection có **Test Scripts** tự động lưu các giá trị quan trọng:

- `auth_token` - Token customer
- `admin_token` - Token admin
- `restaurant_token` - Token restaurant
- `order_id` - ID đơn hàng mới tạo
- `restaurant_id` - ID nhà hàng
- `product_id` - ID sản phẩm
- `user_id` - ID user
- `category_id` - ID category
- `voucher_id` - ID voucher
- `promotion_id` - ID promotion
- `review_id` - ID review
- `drone_id` - ID drone
- `transaction_id` - ID giao dịch VNPay

---

## ✅ Test Cases Priority

### ⭐ Critical (Bắt buộc test)
1. Authentication flow (Login/Register)
2. Order creation & tracking
3. Payment VNPay/MoMo
4. Order status update
5. Restaurant confirm handover

### 🔶 Important (Nên test)
6. Restaurant management
7. Product CRUD
8. Voucher/Promotion
9. Reviews
10. Categories

### 🔷 Optional (Test nếu cần)
11. Upload images
12. Dashboard stats
13. User management
14. Refunds
15. Drone operations

---

## 🐛 Troubleshooting

### Lỗi 401 Unauthorized
```
→ Check: Token đã được lưu chưa?
→ Fix: Chạy lại Login request
```

### Lỗi 404 Not Found
```
→ Check: URL có đúng không? Server đã chạy chưa?
→ Fix: Kiểm tra base_url = http://localhost:5000/api
```

### Lỗi 403 Forbidden
```
→ Check: Role có đủ quyền không?
→ Fix: Dùng đúng token (admin_token cho admin APIs)
```

### Lỗi 400 Validation Error
```
→ Check: Request body có đủ field bắt buộc không?
→ Fix: Xem description của request để biết required fields
```

---

## 💡 Tips & Best Practices

### 1. Sử dụng Environments
Tạo nhiều environments cho dev/staging/production:
```
- Local: http://localhost:5000/api
- Dev: http://dev.foodfast.com/api
- Prod: https://api.foodfast.com/api
```

### 2. Chạy Collection Runner
1. Click vào Collection
2. Click **Run**
3. Chọn requests muốn test
4. Click **Run FOODFAST**

### 3. Export Results
- Sau khi chạy xong, click **Export Results**
- Lưu file JSON để share với team

### 4. Test theo Module
Thay vì test tất cả, chỉ test module đang làm:
```
- Đang làm Orders? → Test folder "Orders"
- Đang làm Payment? → Test folder "VNPay Payment"
```

### 5. Sử dụng Pre-request Scripts
Thêm script để tự động generate data:
```javascript
pm.collectionVariables.set("timestamp", Date.now());
pm.collectionVariables.set("random_email", `user${Date.now()}@test.com`);
```

---

## 📚 Tài liệu API đầy đủ

Xem file `API_ENDPOINTS.md` trong thư mục `server_app` để biết thêm chi tiết về:
- Request/Response format
- Error codes
- Business logic
- Validation rules

---

## 🎉 Happy Testing!

Nếu gặp vấn đề, check:
1. Server đã chạy chưa? (`npm start` trong `server_app`)
2. Database đã seed chưa? (`npm run seed`)
3. Environment variables đã set chưa? (`.env` file)

---

**Last Updated**: 2025-11-12  
**Maintained by**: Development Team
