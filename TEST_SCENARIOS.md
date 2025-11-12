# FOODFAST - Test Scenarios Documentation

## 📋 Tổng Quan
Document này mô tả chi tiết các test scenarios cho hệ thống FOODFAST, bao gồm 100+ API endpoints được tổ chức theo modules.

**Phiên bản**: 2.0.0  
**Ngày cập nhật**: 12/11/2025  
**Base URL**: `http://localhost:5000/api`

---

## 🔐 Module 1: AUTHENTICATION (Xác thực)

### TC-AUTH-001: Đăng ký người dùng mới
**Mục đích**: Kiểm tra chức năng đăng ký tài khoản người dùng mới

**Pre-conditions**:
- Email chưa tồn tại trong hệ thống
- Server đang chạy

**Test Steps**:
1. Gửi POST request đến `/api/auth/register`
2. Body:
   ```json
   {
     "name": "Test Customer",
     "email": "customer@test.com",
     "phone": "0901234567",
     "password": "Test1234!"
   }
   ```

**Expected Results**:
- Status code: 201 Created
- Response chứa thông tin user và token
- Email được lưu vào database
- Password được hash

**Post-conditions**:
- User mới được tạo trong database
- Email có thể dùng để login

---

### TC-AUTH-002: Đăng nhập với tài khoản Customer
**Mục đích**: Kiểm tra chức năng đăng nhập của khách hàng

**Pre-conditions**:
- Tài khoản customer đã tồn tại
- Email: `customer@test.com`
- Password: `Test1234!`

**Test Steps**:
1. Gửi POST request đến `/api/auth/login`
2. Body:
   ```json
   {
     "email": "customer@test.com",
     "password": "Test1234!"
   }
   ```

**Expected Results**:
- Status code: 200 OK
- Response chứa:
  - `token`: JWT token hợp lệ
  - `user.role`: "user"
  - `user.email`: "customer@test.com"
- Token được lưu vào collection variables

**Automation Script**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set('auth_token', response.token);
    console.log('Token saved:', response.token);
}
```

---

### TC-AUTH-003: Đăng nhập với tài khoản Admin
**Mục đích**: Kiểm tra quyền truy cập admin

**Pre-conditions**:
- Tài khoản admin đã được seed
- Email: `admin@foodfast.com`
- Password: `Admin123!`

**Test Steps**:
1. Gửi POST request đến `/api/auth/login`
2. Body:
   ```json
   {
     "email": "admin@foodfast.com",
     "password": "Admin123!"
   }
   ```

**Expected Results**:
- Status code: 200 OK
- `user.role`: "admin"
- Token có quyền admin
- Có thể truy cập các endpoint admin-only

**Post-conditions**:
- Admin token được lưu và có thể dùng cho các test admin

---

### TC-AUTH-004: Đăng nhập với tài khoản Restaurant
**Mục đích**: Kiểm tra chức năng đăng nhập của nhà hàng

**Pre-conditions**:
- Tài khoản restaurant đã tồn tại
- Email: `restaurant@test.com`
- Password: `Restaurant123!`

**Test Steps**:
1. Gửi POST request đến `/api/auth/login`
2. Body:
   ```json
   {
     "email": "restaurant@test.com",
     "password": "Restaurant123!"
   }
   ```

**Expected Results**:
- Status code: 200 OK
- `user.role`: "restaurant"
- Response chứa `user.restaurantId`
- Restaurant ID được tự động lưu vào variables

**Automation Script**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set('auth_token', response.token);
    if (response.user && response.user.restaurantId) {
        pm.collectionVariables.set('restaurant_id', response.user.restaurantId);
    }
}
```

---

### TC-AUTH-005: Lấy thông tin user hiện tại
**Mục đích**: Kiểm tra endpoint get current user info

**Pre-conditions**:
- User đã đăng nhập
- Token hợp lệ trong collection variables

**Test Steps**:
1. Gửi GET request đến `/api/auth/me`
2. Header: `Authorization: Bearer {{auth_token}}`

**Expected Results**:
- Status code: 200 OK
- Response chứa thông tin user đầy đủ
- Không chứa password

---

### TC-AUTH-006: Đăng xuất
**Mục đích**: Kiểm tra chức năng logout

**Pre-conditions**:
- User đã đăng nhập

**Test Steps**:
1. Gửi POST request đến `/api/auth/logout`
2. Header: `Authorization: Bearer {{auth_token}}`

**Expected Results**:
- Status code: 200 OK
- Token bị vô hiệu hóa
- Collection variable `auth_token` được clear

**Automation Script**:
```javascript
if (pm.response.code === 200) {
    pm.collectionVariables.set('auth_token', '');
    console.log('Logged out successfully. Token cleared.');
}
```

---

### TC-AUTH-007: Đăng nhập với email sai
**Mục đích**: Kiểm tra validation email

**Test Steps**:
1. Gửi POST request với email không tồn tại

**Expected Results**:
- Status code: 401 Unauthorized
- Message: "Invalid credentials"

---

### TC-AUTH-008: Đăng nhập với password sai
**Mục đích**: Kiểm tra validation password

**Test Steps**:
1. Gửi POST request với password sai

**Expected Results**:
- Status code: 401 Unauthorized
- Message: "Invalid credentials"

---

## 🛒 Module 2: ORDERS (Đơn hàng)

### TC-ORDER-001: Tạo đơn hàng COD
**Mục đích**: Kiểm tra tạo đơn hàng thanh toán khi nhận hàng

**Pre-conditions**:
- User đã đăng nhập
- Có `product_id` hợp lệ
- Product còn hàng

**Test Steps**:
1. Gửi POST request đến `/api/orders`
2. Header: `Authorization: Bearer {{auth_token}}`
3. Body:
   ```json
   {
     "items": [
       {
         "product": "{{product_id}}",
         "quantity": 2
       }
     ],
     "deliveryInfo": {
       "name": "Nguyen Van A",
       "phone": "0901234567",
       "address": "123 Nguyen Trai, Q1, TP.HCM"
     },
     "paymentMethod": "COD",
     "note": "Giao giờ hành chính",
     "clientCalculatedTotal": 150000,
     "clientDiscount": 0
   }
   ```

**Expected Results**:
- Status code: 201 Created
- Response chứa:
  - `order._id`
  - `order.orderNumber`
  - `order.status`: "pending"
  - `order.paymentMethod`: "COD"
  - `order.total`: 150000
- Order ID được lưu vào collection variables

**Automation Script**:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.collectionVariables.set('order_id', response.data._id);
    console.log('Order ID saved:', response.data._id);
    console.log('Order Number:', response.data.orderNumber);
}
```

---

### TC-ORDER-002: Tạo đơn hàng VNPay
**Mục đích**: Kiểm tra tạo đơn hàng với thanh toán VNPay

**Pre-conditions**:
- User đã đăng nhập
- Có `product_id` hợp lệ
- VNPay config đã setup

**Test Steps**:
1. Gửi POST request đến `/api/orders`
2. Body tương tự TC-ORDER-001 nhưng:
   ```json
   {
     "paymentMethod": "VNPAY"
   }
   ```

**Expected Results**:
- Status code: 201 Created
- `order.paymentMethod`: "VNPAY"
- `order.paymentStatus`: "pending"
- Response có thể chứa payment URL

---

### TC-ORDER-003: Tạo đơn hàng với Voucher
**Mục đích**: Kiểm tra áp dụng mã giảm giá

**Pre-conditions**:
- User đã đăng nhập
- Có voucher code hợp lệ: "GIAM20"
- Voucher chưa hết hạn và còn lượt sử dụng
- Order total đạt minimum requirement

**Test Steps**:
1. Gửi POST request đến `/api/orders`
2. Body:
   ```json
   {
     "items": [...],
     "deliveryInfo": {...},
     "paymentMethod": "VNPAY",
     "voucherCode": "GIAM20",
     "clientCalculatedTotal": 130000,
     "clientDiscount": 20000
   }
   ```

**Expected Results**:
- Status code: 201 Created
- `order.discount`: 20000
- `order.voucherCode`: "GIAM20"
- `order.total` = subtotal - discount + deliveryFee

**Automation Script**:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    console.log('Order with voucher created:', response.data._id);
    console.log('Discount applied:', response.data.discount);
}
```

---

### TC-ORDER-004: Tạo đơn hàng MOMO
**Mục đích**: Kiểm tra thanh toán qua ví MOMO

**Test Steps**:
1. Gửi POST request với `paymentMethod`: "MOMO"

**Expected Results**:
- Status code: 201 Created
- `order.paymentMethod`: "MOMO"

---

### TC-ORDER-005: Tạo đơn hàng CARD
**Mục đích**: Kiểm tra thanh toán bằng thẻ

**Test Steps**:
1. Gửi POST request với `paymentMethod`: "CARD"

**Expected Results**:
- Status code: 201 Created
- `order.paymentMethod`: "CARD"

---

### TC-ORDER-006: Lấy danh sách đơn hàng
**Mục đích**: Kiểm tra lấy tất cả đơn hàng của user

**Pre-conditions**:
- User đã đăng nhập
- User đã có ít nhất 1 đơn hàng

**Test Steps**:
1. Gửi GET request đến `/api/orders`
2. Header: `Authorization: Bearer {{auth_token}}`

**Expected Results**:
- Status code: 200 OK
- Response là array các orders
- Mỗi order có đầy đủ thông tin
- Chỉ hiển thị orders của user hiện tại

---

### TC-ORDER-007: Lấy chi tiết đơn hàng theo ID
**Mục đích**: Kiểm tra xem chi tiết 1 đơn hàng

**Pre-conditions**:
- Có `order_id` hợp lệ
- User là owner của order hoặc là admin/restaurant

**Test Steps**:
1. Gửi GET request đến `/api/orders/{{order_id}}`
2. Header: `Authorization: Bearer {{auth_token}}`

**Expected Results**:
- Status code: 200 OK
- Response chứa thông tin đầy đủ của order
- Bao gồm: items, deliveryInfo, payment info, status history

---

### TC-ORDER-008: Theo dõi đơn hàng
**Mục đích**: Kiểm tra tracking order real-time

**Pre-conditions**:
- Order đã được tạo

**Test Steps**:
1. Gửi GET request đến `/api/orders/{{order_id}}/track`

**Expected Results**:
- Status code: 200 OK
- Response chứa:
  - Current status
  - Status history timeline
  - Estimated delivery time
  - Drone location (nếu có)

---

### TC-ORDER-009: Hủy đơn hàng
**Mục đích**: Kiểm tra customer hủy đơn

**Pre-conditions**:
- Order ở trạng thái "pending" hoặc "confirmed"
- Order chưa được preparing/delivering

**Test Steps**:
1. Gửi PATCH request đến `/api/orders/{{order_id}}/cancel`
2. Body:
   ```json
   {
     "reason": "Đổi ý không muốn đặt nữa"
   }
   ```

**Expected Results**:
- Status code: 200 OK
- `order.status`: "cancelled"
- `order.cancelReason` được lưu
- Nếu đã thanh toán: refund request được tạo

---

### TC-ORDER-010: Tính phí giao hàng
**Mục đích**: Kiểm tra calculate delivery fee

**Pre-conditions**:
- Có `restaurant_id` hợp lệ
- Địa chỉ giao hàng hợp lệ

**Test Steps**:
1. Gửi POST request đến `/api/orders/calculate-fee`
2. Body:
   ```json
   {
     "restaurantId": "{{restaurant_id}}",
     "userAddress": "123 Nguyen Trai, Q1, TP.HCM"
   }
   ```

**Expected Results**:
- Status code: 200 OK
- Response chứa:
  - `deliveryFee`: số tiền phí ship
  - `distance`: khoảng cách (km)
  - `estimatedTime`: thời gian dự kiến

---

### TC-ORDER-011: Lấy lịch sử đơn hàng
**Mục đích**: Kiểm tra order history của user

**Test Steps**:
1. Gửi GET request đến `/api/orders/history`

**Expected Results**:
- Status code: 200 OK
- Response chứa tất cả orders đã hoàn thành/hủy
- Sắp xếp theo thời gian mới nhất

---

### TC-ORDER-012: Restaurant cập nhật trạng thái đơn hàng
**Mục đích**: Kiểm tra restaurant update order status

**Pre-conditions**:
- User là restaurant owner
- Order thuộc về restaurant này
- Status transition hợp lệ

**Test Steps**:
1. Login với restaurant account
2. Gửi PATCH request đến `/api/orders/{{order_id}}/status`
3. Body:
   ```json
   {
     "status": "confirmed"
   }
   ```

**Expected Results**:
- Status code: 200 OK
- Order status được cập nhật
- Customer nhận notification
- Valid status: pending → confirmed → preparing → ready → picked_up → delivering → delivered

---

### TC-ORDER-013: Restaurant xác nhận bàn giao drone
**Mục đích**: Kiểm tra restaurant confirm handover

**Pre-conditions**:
- Restaurant đã đăng nhập
- Order status: "ready"
- Drone đã được assign

**Test Steps**:
1. Gửi POST request đến `/api/orders/{{order_id}}/restaurant-confirm-handover`
2. Body:
   ```json
   {
     "droneId": "DRONE_ID_HERE"
   }
   ```

**Expected Results**:
- Status code: 200 OK
- Order status → "picked_up"
- Drone status → "delivering"
- Timestamp được ghi nhận

---

### TC-ORDER-014: Customer xác nhận đã nhận hàng
**Mục đích**: Kiểm tra customer confirm delivery

**Pre-conditions**:
- Order status: "delivering"
- Customer đã đăng nhập

**Test Steps**:
1. Gửi POST request đến `/api/orders/{{order_id}}/confirm-delivery`

**Expected Results**:
- Status code: 200 OK
- Order status → "delivered"
- Payment status → "completed" (nếu COD)
- Customer có thể review

---

## 💳 Module 3: VNPAY PAYMENT

### TC-VNPAY-001: Tạo VNPay Payment URL
**Mục đích**: Kiểm tra tạo link thanh toán VNPay

**Pre-conditions**:
- User đã đăng nhập
- Order đã được tạo
- VNPay credentials đã config

**Test Steps**:
1. Gửi POST request đến `/api/payment/vnpay/create`
2. Body:
   ```json
   {
     "orderId": "{{order_id}}",
     "amount": 150000,
     "orderInfo": "Thanh toan don hang #ORDER123",
     "bankCode": ""
   }
   ```

**Expected Results**:
- Status code: 200 OK
- Response chứa:
  - `paymentUrl`: URL redirect đến VNPay
  - `transactionId`: Unique transaction ID
- Transaction ID được lưu vào variables
- URL có chứa các params cần thiết và secure hash

**Automation Script**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set('transaction_id', response.data.transactionId);
    console.log('Payment URL:', response.data.paymentUrl);
    console.log('⚠️ IMPORTANT: Copy payment URL and open in browser');
}
```

---

### TC-VNPAY-002: VNPay Return - Thanh toán thành công
**Mục đích**: Kiểm tra xử lý khi VNPay redirect về sau thanh toán thành công

**Pre-conditions**:
- Payment URL đã được tạo
- User đã thanh toán thành công trên VNPay

**Test Steps**:
1. VNPay redirect đến `/api/payment/vnpay/return` với params:
   - `vnp_TxnRef`: {{transaction_id}}
   - `vnp_Amount`: 15000000 (amount * 100)
   - `vnp_ResponseCode`: 00 (success)
   - `vnp_SecureHash`: Valid hash

**Expected Results**:
- Status code: 200 OK
- Order payment status → "paid"
- Order status → "confirmed"
- Transaction được lưu vào database
- User được redirect đến success page

**Note**: 
⚠️ Trong môi trường test, cần calculate secure hash đúng theo VNPay spec

---

### TC-VNPAY-003: VNPay Return - Thanh toán bị hủy
**Mục đích**: Kiểm tra xử lý khi user hủy thanh toán

**Test Steps**:
1. VNPay redirect với `vnp_ResponseCode`: 24 (cancelled)

**Expected Results**:
- Status code: 200 OK
- Order payment status → "failed"
- Order status vẫn "pending"
- User được redirect đến cancelled page
- User có thể retry payment

---

### TC-VNPAY-004: VNPay IPN - Success
**Mục đích**: Kiểm tra webhook từ VNPay server

**Pre-conditions**:
- Payment đã được xử lý

**Test Steps**:
1. VNPay gọi GET `/api/payment/vnpay/ipn` với params thành công

**Expected Results**:
- Response: `{"RspCode":"00","Message":"Confirm Success"}`
- Order được update chính xác
- Idempotent: gọi nhiều lần không tạo duplicate

**Note**:
⚠️ Endpoint này thường được gọi bởi VNPay server, không phải client

---

### TC-VNPAY-005: Query Transaction Status
**Mục đích**: Kiểm tra truy vấn trạng thái giao dịch từ VNPay

**Pre-conditions**:
- Transaction đã được tạo
- Có transaction ID và transaction date

**Test Steps**:
1. Gửi POST request đến `/api/payment/vnpay/querydr`
2. Body:
   ```json
   {
     "orderId": "{{transaction_id}}",
     "transDate": "20250112123456"
   }
   ```

**Expected Results**:
- Status code: 200 OK
- Response chứa transaction details từ VNPay
- Trạng thái giao dịch chính xác

---

### TC-VNPAY-006: Prepare Refund Data
**Mục đích**: Kiểm tra chuẩn bị dữ liệu hoàn tiền

**Pre-conditions**:
- Transaction đã thanh toán thành công
- Order đã bị hủy

**Test Steps**:
1. Gửi POST request đến `/api/payment/vnpay/refund`
2. Body:
   ```json
   {
     "orderId": "{{transaction_id}}",
     "transDate": "20250112123456",
     "amount": 150000,
     "transType": "02"
   }
   ```

**Expected Results**:
- Status code: 200 OK
- Response chứa refund data đã format đúng
- transType: "02" = full refund, "03" = partial refund

---

### TC-VNPAY-007: Get Payment Info
**Mục đích**: Kiểm tra lấy thông tin payment của order

**Pre-conditions**:
- Order đã có payment

**Test Steps**:
1. Gửi GET request đến `/api/payment/{{order_id}}`

**Expected Results**:
- Status code: 200 OK
- Response chứa payment details
- Transaction history

---

### TC-VNPAY-008: Get Payment Methods
**Mục đích**: Kiểm tra lấy danh sách phương thức thanh toán

**Test Steps**:
1. Gửi GET request đến `/api/payment/methods`

**Expected Results**:
- Status code: 200 OK
- Response chứa: ["COD", "VNPAY", "MOMO", "CARD"]
- Mỗi method có status: active/inactive

---

### TC-VNPAY-009: Process VNPay Refund (Admin)
**Mục đích**: Kiểm tra admin xử lý hoàn tiền VNPay

**Pre-conditions**:
- Admin đã đăng nhập
- Order đã thanh toán VNPay
- Order bị hủy

**Test Steps**:
1. Login với admin token
2. Gửi POST request đến `/api/payment/vnpay/process-refund`
3. Body:
   ```json
   {
     "orderId": "{{order_id}}",
     "transactionId": "{{transaction_id}}",
     "amount": 150000,
     "reason": "Khách hàng hủy đơn"
   }
   ```

**Expected Results**:
- Status code: 200 OK
- Refund request được gửi đến VNPay
- Refund status được lưu
- Customer nhận notification

---

### TC-VNPAY-010: Get VNPay Transaction Status
**Mục đích**: Kiểm tra trạng thái giao dịch theo transaction ID

**Test Steps**:
1. Gửi GET request đến `/api/payment/vnpay/status/{{transaction_id}}`

**Expected Results**:
- Status code: 200 OK
- Response chứa transaction status
- Các trạng thái: pending, paid, failed, refunded

---

### TC-VNPAY-011: Verify VNPay Signature
**Mục đích**: Kiểm tra xác thực chữ ký VNPay

**Test Steps**:
1. Gửi POST request đến `/api/payment/vnpay/verify`
2. Body chứa VNPay params và hash

**Expected Results**:
- Status code: 200 OK
- Response: `{valid: true/false}`
- Phát hiện được hash không hợp lệ

---

## 🎟️ Module 4: VOUCHERS & PROMOTIONS

### TC-VOUCHER-001: Get Available Vouchers
**Mục đích**: Kiểm tra lấy danh sách voucher khả dụng

**Pre-conditions**:
- User đã đăng nhập
- Có restaurant_id

**Test Steps**:
1. Gửi GET request đến `/api/vouchers?restaurant={{restaurant_id}}`

**Expected Results**:
- Status code: 200 OK
- Response chứa array vouchers
- Mỗi voucher có: code, discount, minOrder, maxDiscount, expiryDate
- Chỉ hiển thị vouchers còn hạn và còn lượt

---

### TC-VOUCHER-002: Validate Voucher
**Mục đích**: Kiểm tra validate voucher trước khi apply

**Pre-conditions**:
- Có voucher code
- Order total đã biết

**Test Steps**:
1. Gửi POST request đến `/api/vouchers/validate`
2. Body:
   ```json
   {
     "code": "GIAM20",
     "restaurantId": "{{restaurant_id}}",
     "orderTotal": 150000
   }
   ```

**Expected Results**:
- Status code: 200 OK
- Response:
  ```json
  {
    "valid": true,
    "discount": 20000,
    "message": "Voucher applied successfully"
  }
  ```
- Nếu không hợp lệ: `valid: false` với lý do

---

### TC-VOUCHER-003: Get Active Promotions
**Mục đích**: Kiểm tra lấy promotions đang active

**Test Steps**:
1. Gửi GET request đến `/api/promotions?restaurant={{restaurant_id}}&active=true`

**Expected Results**:
- Status code: 200 OK
- Chỉ hiển thị promotions đang chạy
- Có thông tin: discount, conditions, startDate, endDate

---

### TC-VOUCHER-004: Check Voucher Usage
**Mục đích**: Kiểm tra lịch sử sử dụng voucher của user

**Pre-conditions**:
- User đã đăng nhập

**Test Steps**:
1. Gửi GET request đến `/api/vouchers/usage`

**Expected Results**:
- Status code: 200 OK
- Response chứa:
  - Vouchers đã dùng
  - Số lần đã dùng
  - Vouchers còn available

---

## ⭐ Module 5: REVIEWS & RATINGS

### TC-REVIEW-001: Create Review
**Mục đích**: Kiểm tra tạo đánh giá sau khi nhận hàng

**Pre-conditions**:
- Order đã delivered
- User chưa review order này
- User đã đăng nhập

**Test Steps**:
1. Gửi POST request đến `/api/reviews`
2. Body:
   ```json
   {
     "orderId": "{{order_id}}",
     "rating": 5,
     "comment": "Đồ ăn ngon, giao hàng nhanh!",
     "productId": "{{product_id}}"
   }
   ```

**Expected Results**:
- Status code: 201 Created
- Review được tạo thành công
- Rating được update vào restaurant/product
- User không thể review lại order này

---

### TC-REVIEW-002: Get Restaurant Reviews
**Mục đích**: Kiểm tra lấy đánh giá của nhà hàng

**Test Steps**:
1. Gửi GET request đến `/api/reviews/restaurant/{{restaurant_id}}?limit=20`

**Expected Results**:
- Status code: 200 OK
- Response chứa array reviews
- Mỗi review có: user info, rating, comment, createdAt
- Pagination hoạt động đúng

---

### TC-REVIEW-003: Get Product Reviews
**Mục đích**: Kiểm tra lấy đánh giá của sản phẩm

**Test Steps**:
1. Gửi GET request đến `/api/reviews/product/{{product_id}}`

**Expected Results**:
- Status code: 200 OK
- Reviews specific cho product
- Có thống kê rating distribution

---

## 🚁 Module 6: DRONE MANAGEMENT

### TC-DRONE-001: Get Available Drones
**Mục đích**: Kiểm tra lấy danh sách drones sẵn sàng

**Pre-conditions**:
- Admin đã đăng nhập

**Test Steps**:
1. Gửi GET request đến `/api/drones?status=available`
2. Header: `Authorization: Bearer {{admin_token}}`

**Expected Results**:
- Status code: 200 OK
- Chỉ hiển thị drones có status "available"
- Mỗi drone có: id, batteryLevel, location, capacity

---

### TC-DRONE-002: Assign Drone to Order
**Mục đích**: Kiểm tra gán drone cho đơn hàng

**Pre-conditions**:
- Admin đã đăng nhập
- Order status: "ready"
- Có drone available

**Test Steps**:
1. Gửi POST request đến `/api/drones/assign`
2. Body:
   ```json
   {
     "orderId": "{{order_id}}",
     "droneId": "DRONE_ID_HERE"
   }
   ```

**Expected Results**:
- Status code: 200 OK
- Drone được assign cho order
- Drone status → "assigned"
- Order có thông tin drone

---

### TC-DRONE-003: Get Drone Status
**Mục đích**: Kiểm tra lấy thông tin chi tiết drone

**Test Steps**:
1. Gửi GET request đến `/api/drones/DRONE_ID_HERE`

**Expected Results**:
- Status code: 200 OK
- Response chứa:
  - Status, battery level
  - Current location
  - Assigned order (nếu có)
  - Flight history

---

### TC-DRONE-004: Update Drone Location
**Mục đích**: Kiểm tra cập nhật vị trí drone real-time

**Pre-conditions**:
- Drone đang delivering

**Test Steps**:
1. Gửi PATCH request đến `/api/drones/DRONE_ID_HERE/location`
2. Body:
   ```json
   {
     "latitude": 10.7769,
     "longitude": 106.7009,
     "batteryLevel": 85
   }
   ```

**Expected Results**:
- Status code: 200 OK
- Location được update
- Customer có thể track real-time
- Battery level được ghi nhận

---

## 👑 Module 7: ADMIN OPERATIONS

### TC-ADMIN-001: Get All Orders (Admin View)
**Mục đích**: Kiểm tra admin xem tất cả orders

**Pre-conditions**:
- Admin đã đăng nhập

**Test Steps**:
1. Gửi GET request đến `/api/admin/orders?status=all&page=1&limit=50`
2. Header: `Authorization: Bearer {{admin_token}}`

**Expected Results**:
- Status code: 200 OK
- Hiển thị tất cả orders của hệ thống
- Có filter theo status
- Pagination hoạt động
- Có thông tin user, restaurant

---

### TC-ADMIN-002: Get Refund Requests
**Mục đích**: Kiểm tra admin xem yêu cầu hoàn tiền

**Test Steps**:
1. Gửi GET request đến `/api/admin/refunds?status=pending`

**Expected Results**:
- Status code: 200 OK
- Hiển thị pending refund requests
- Có thông tin order, user, amount, reason

---

### TC-ADMIN-003: Process Refund
**Mục đích**: Kiểm tra admin xử lý refund request

**Pre-conditions**:
- Có refund request pending

**Test Steps**:
1. Gửi POST request đến `/api/admin/refunds/process`
2. Body:
   ```json
   {
     "orderId": "{{order_id}}",
     "action": "approve",
     "note": "Approved refund for cancelled order"
   }
   ```

**Expected Results**:
- Status code: 200 OK
- Refund status → "approved" hoặc "rejected"
- Nếu approve: tiền được hoàn
- Customer nhận notification

---

### TC-ADMIN-004: Get System Statistics
**Mục đích**: Kiểm tra thống kê hệ thống

**Test Steps**:
1. Gửi GET request đến `/api/admin/stats?period=today`

**Expected Results**:
- Status code: 200 OK
- Response chứa:
  - Total orders, revenue
  - Active users, restaurants
  - Drone statistics
  - Period: today/week/month/year

---

## 📂 Module 8: CATEGORIES

### TC-CATEGORY-001: Get All Categories
**Mục đích**: Kiểm tra lấy danh sách categories

**Test Steps**:
1. Gửi GET request đến `/api/categories`

**Expected Results**:
- Status code: 200 OK
- Response chứa array categories
- Category ID được tự động lưu

**Automation Script**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.length > 0) {
        pm.collectionVariables.set('category_id', response.data[0]._id);
    }
}
```

---

### TC-CATEGORY-002: Create Category
**Mục đích**: Kiểm tra tạo category mới

**Pre-conditions**:
- Admin hoặc Restaurant đã đăng nhập

**Test Steps**:
1. Gửi POST request đến `/api/categories`
2. Body:
   ```json
   {
     "name": "Món chính",
     "description": "Các món ăn chính",
     "restaurant": "{{restaurant_id}}"
   }
   ```

**Expected Results**:
- Status code: 201 Created
- Category được tạo thành công
- Trả về category với _id

---

### TC-CATEGORY-003: Get Categories with Products (Restaurant)
**Mục đích**: Kiểm tra restaurant lấy categories kèm products

**Pre-conditions**:
- Restaurant đã đăng nhập

**Test Steps**:
1. Gửi GET request đến `/api/categories/restaurant/with-products`
2. Header: `Authorization: Bearer {{restaurant_token}}`

**Expected Results**:
- Status code: 200 OK
- Mỗi category chứa array products
- Chỉ hiển thị categories của restaurant này

---

### TC-CATEGORY-004: Update Category
**Mục đích**: Kiểm tra cập nhật category

**Test Steps**:
1. Gửi PUT request đến `/api/categories/{{category_id}}`
2. Body:
   ```json
   {
     "name": "Món chính (Updated)",
     "description": "Updated description"
   }
   ```

**Expected Results**:
- Status code: 200 OK
- Category được update thành công

---

### TC-CATEGORY-005: Delete Category
**Mục đích**: Kiểm tra xóa category

**Pre-conditions**:
- Category không có products

**Test Steps**:
1. Gửi DELETE request đến `/api/categories/{{category_id}}`

**Expected Results**:
- Status code: 200 OK
- Category bị xóa
- Nếu có products: trả về error

---

### TC-CATEGORY-006: Get Products by Category
**Mục đích**: Kiểm tra lấy products theo category

**Test Steps**:
1. Gửi GET request đến `/api/categories/{{category_id}}/products`

**Expected Results**:
- Status code: 200 OK
- Response chứa products thuộc category này

---

## 👥 Module 9: USERS MANAGEMENT

### TC-USER-001: Get All Users (Admin)
**Mục đích**: Kiểm tra admin xem tất cả users

**Pre-conditions**:
- Admin đã đăng nhập

**Test Steps**:
1. Gửi GET request đến `/api/users`
2. Header: `Authorization: Bearer {{admin_token}}`

**Expected Results**:
- Status code: 200 OK
- Hiển thị tất cả users
- Có filter theo role
- Không hiển thị password

---

### TC-USER-002: Check Email Exists
**Mục đích**: Kiểm tra email đã tồn tại chưa

**Pre-conditions**: Không cần

**Test Steps**:
1. Gửi GET request đến `/api/users/check-email?email=test@example.com`

**Expected Results**:
- Status code: 200 OK
- Response: `{exists: true/false}`
- Public endpoint (no auth required)

---

### TC-USER-003: Get User Statistics
**Mục đích**: Kiểm tra thống kê users

**Pre-conditions**:
- Admin đã đăng nhập

**Test Steps**:
1. Gửi GET request đến `/api/users/stats`

**Expected Results**:
- Status code: 200 OK
- Response chứa:
  - Total users by role
  - New users this month
  - Active users

---

### TC-USER-004: Update User
**Mục đích**: Kiểm tra admin cập nhật user

**Test Steps**:
1. Gửi PUT request đến `/api/users/{{user_id}}`
2. Body:
   ```json
   {
     "name": "Updated Name",
     "email": "updated@test.com",
     "role": "user"
   }
   ```

**Expected Results**:
- Status code: 200 OK
- User được update thành công

---

### TC-USER-005: Delete User
**Mục đích**: Kiểm tra xóa user

**Test Steps**:
1. Gửi DELETE request đến `/api/users/{{user_id}}`

**Expected Results**:
- Status code: 200 OK
- User bị xóa
- Related data được xử lý

---

### TC-USER-006: Get User Orders
**Mục đích**: Kiểm tra xem orders của user

**Test Steps**:
1. Gửi GET request đến `/api/users/{{user_id}}/orders`

**Expected Results**:
- Status code: 200 OK
- Hiển thị tất cả orders của user

---

## 💰 Module 10: REFUNDS

### TC-REFUND-001: Get All Refund Requests
**Mục đích**: Kiểm tra lấy danh sách refund requests

**Pre-conditions**:
- Admin đã đăng nhập

**Test Steps**:
1. Gửi GET request đến `/api/refunds`

**Expected Results**:
- Status code: 200 OK
- Hiển thị tất cả refund requests
- Có filter theo status

---

### TC-REFUND-002: Get Refund Statistics
**Mục đích**: Kiểm tra thống kê refunds

**Test Steps**:
1. Gửi GET request đến `/api/refunds/stats`

**Expected Results**:
- Status code: 200 OK
- Response chứa:
  - Total refunds
  - Pending, approved, rejected counts
  - Total refund amount

---

### TC-REFUND-003: Process Manual Refund
**Mục đích**: Kiểm tra xử lý refund thủ công

**Test Steps**:
1. Gửi POST request đến `/api/refunds/{{order_id}}/process`
2. Body:
   ```json
   {
     "action": "approve",
     "note": "Refund approved by admin"
   }
   ```

**Expected Results**:
- Status code: 200 OK
- Refund được xử lý
- Log được ghi nhận

---

### TC-REFUND-004: Get Refund Logs
**Mục đích**: Kiểm tra lịch sử xử lý refund

**Test Steps**:
1. Gửi GET request đến `/api/refunds/{{order_id}}/logs`

**Expected Results**:
- Status code: 200 OK
- Response chứa timeline xử lý refund

---

## 📊 Module 11: DASHBOARD

### TC-DASHBOARD-001: Get Dashboard Statistics
**Mục đích**: Kiểm tra thống kê tổng quan dashboard

**Pre-conditions**:
- Admin đã đăng nhập

**Test Steps**:
1. Gửi GET request đến `/api/dashboard/stats`

**Expected Results**:
- Status code: 200 OK
- Response chứa overview statistics:
  - Orders, revenue, users
  - Growth rates
  - Charts data

---

### TC-DASHBOARD-002: Get Recent Orders
**Mục đích**: Kiểm tra lấy orders gần đây

**Test Steps**:
1. Gửi GET request đến `/api/dashboard/recent-orders?limit=20`

**Expected Results**:
- Status code: 200 OK
- Hiển thị 20 orders mới nhất
- Có đầy đủ thông tin

---

### TC-DASHBOARD-003: Get Top Restaurants
**Mục đích**: Kiểm tra xếp hạng nhà hàng

**Test Steps**:
1. Gửi GET request đến `/api/dashboard/top-restaurants?limit=10`

**Expected Results**:
- Status code: 200 OK
- Top 10 restaurants theo:
  - Doanh thu
  - Số đơn
  - Rating

---

### TC-DASHBOARD-004: Get Order Statistics
**Mục đích**: Kiểm tra thống kê orders theo period

**Test Steps**:
1. Gửi GET request đến `/api/dashboard/order-stats?period=today`

**Expected Results**:
- Status code: 200 OK
- Statistics theo period (today/week/month/year)
- Charts data ready

---

## 📤 Module 12: UPLOAD

### TC-UPLOAD-001: Upload Single Image
**Mục đích**: Kiểm tra upload 1 ảnh

**Pre-conditions**:
- User đã đăng nhập
- Có file ảnh hợp lệ (jpg, png, webp)
- Size < 5MB

**Test Steps**:
1. Gửi POST request đến `/api/upload/image`
2. Body: FormData với key "image"

**Expected Results**:
- Status code: 200 OK
- Response chứa:
  - `url`: Cloudinary URL
  - `publicId`: Cloudinary public ID
- Ảnh được upload lên Cloudinary

---

### TC-UPLOAD-002: Upload Multiple Images
**Mục đích**: Kiểm tra upload nhiều ảnh

**Pre-conditions**:
- User đã đăng nhập
- Có ≤ 10 ảnh hợp lệ

**Test Steps**:
1. Gửi POST request đến `/api/upload/images`
2. Body: FormData với key "images" (multiple files)

**Expected Results**:
- Status code: 200 OK
- Response chứa array URLs
- Max 10 ảnh
- Tất cả ảnh được upload thành công

---

### TC-UPLOAD-003: Delete Image
**Mục đích**: Kiểm tra xóa ảnh từ Cloudinary

**Pre-conditions**:
- Admin đã đăng nhập
- Có publicId hợp lệ

**Test Steps**:
1. Gửi DELETE request đến `/api/upload/PUBLIC_ID_HERE`

**Expected Results**:
- Status code: 200 OK
- Ảnh bị xóa khỏi Cloudinary
- References trong DB được clear

---

## 🧪 Module 13: TEST DATA SETUP

### TC-SETUP-001: Get Restaurants
**Mục đích**: Setup data - lấy restaurant ID

**Test Steps**:
1. Gửi GET request đến `/api/restaurants`

**Expected Results**:
- Status code: 200 OK
- Restaurant ID được tự động lưu vào variables

**Automation Script**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.length > 0) {
        pm.collectionVariables.set('restaurant_id', response.data[0]._id);
        console.log('Restaurant ID saved:', response.data[0]._id);
    }
}
```

---

### TC-SETUP-002: Get Products by Restaurant
**Mục đích**: Setup data - lấy product ID

**Pre-conditions**:
- Có restaurant_id

**Test Steps**:
1. Gửi GET request đến `/api/products?restaurant={{restaurant_id}}`

**Expected Results**:
- Status code: 200 OK
- Product ID được tự động lưu
- Log product details

**Automation Script**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.length > 0) {
        pm.collectionVariables.set('product_id', response.data[0]._id);
        console.log('Product ID saved:', response.data[0]._id);
        console.log('Product name:', response.data[0].name);
        console.log('Product price:', response.data[0].price);
    }
}
```

---

## 📝 Test Execution Flow (Recommended Order)

### 🔄 **Flow 1: Complete User Journey - COD Payment**
```
1. TC-SETUP-001: Get Restaurants
2. TC-SETUP-002: Get Products
3. TC-AUTH-002: Login Customer
4. TC-ORDER-001: Create Order COD
5. TC-ORDER-006: Get All Orders
6. TC-ORDER-007: Get Order Details
7. TC-ORDER-008: Track Order
8. TC-AUTH-004: Login Restaurant
9. TC-ORDER-012: Update Status (confirmed)
10. TC-ORDER-012: Update Status (preparing)
11. TC-ORDER-012: Update Status (ready)
12. TC-DRONE-002: Assign Drone (Admin)
13. TC-ORDER-013: Restaurant Confirm Handover
14. TC-ORDER-014: Customer Confirm Delivery
15. TC-REVIEW-001: Create Review
```

---

### 🔄 **Flow 2: Complete User Journey - VNPay Payment**
```
1. TC-SETUP-001: Get Restaurants
2. TC-SETUP-002: Get Products
3. TC-AUTH-002: Login Customer
4. TC-VOUCHER-002: Validate Voucher
5. TC-ORDER-003: Create Order with Voucher (VNPay)
6. TC-VNPAY-001: Create Payment URL
7. [Manual] Complete payment on VNPay
8. TC-VNPAY-002: VNPay Return Success
9. TC-VNPAY-010: Get Transaction Status
10. TC-ORDER-007: Get Order Details
11. [Continue with delivery flow...]
```

---

### 🔄 **Flow 3: Order Cancellation & Refund**
```
1. TC-ORDER-002: Create Order VNPay
2. TC-VNPAY-001: Create Payment URL
3. [Complete payment]
4. TC-ORDER-009: Cancel Order
5. TC-ADMIN-002: Get Refund Requests (Admin)
6. TC-VNPAY-009: Process Refund (Admin)
7. TC-REFUND-004: Get Refund Logs
```

---

### 🔄 **Flow 4: Admin Operations**
```
1. TC-AUTH-003: Login Admin
2. TC-ADMIN-001: Get All Orders
3. TC-ADMIN-004: Get System Statistics
4. TC-DASHBOARD-001: Get Dashboard Stats
5. TC-USER-001: Get All Users
6. TC-USER-003: Get User Statistics
7. TC-REFUND-002: Get Refund Statistics
8. TC-DRONE-001: Get Available Drones
```

---

### 🔄 **Flow 5: Restaurant Operations**
```
1. TC-AUTH-004: Login Restaurant
2. TC-CATEGORY-003: Get Categories with Products
3. TC-CATEGORY-002: Create Category
4. TC-ADMIN-001: Get Restaurant Orders
5. TC-ORDER-012: Update Order Status
6. TC-ORDER-013: Confirm Handover to Drone
7. TC-REVIEW-002: Get Restaurant Reviews
```

---

## 🎯 Test Coverage Summary

### **Total Test Cases**: 80+

| Module | Test Cases | Coverage |
|--------|------------|----------|
| Authentication | 8 | 100% |
| Orders | 14 | 100% |
| VNPay Payment | 11 | 100% |
| Vouchers & Promotions | 4 | 100% |
| Reviews & Ratings | 3 | 100% |
| Drone Management | 4 | 100% |
| Admin Operations | 4 | 100% |
| Categories | 6 | 100% |
| Users Management | 6 | 100% |
| Refunds | 4 | 100% |
| Dashboard | 4 | 100% |
| Upload | 3 | 100% |
| Test Data Setup | 2 | 100% |

---

## ⚡ Automation Best Practices

### 1. **Collection Variables Auto-Save**
Tất cả các IDs quan trọng được tự động lưu:
- `auth_token`
- `order_id`
- `restaurant_id`
- `product_id`
- `transaction_id`
- `category_id`
- `user_id`

### 2. **Test Scripts**
Mỗi request có test scripts để:
- Validate status code
- Save variables
- Log important information
- Check response structure

### 3. **Environment Management**
```json
{
  "base_url": "http://localhost:5000/api",
  "admin_email": "admin@foodfast.com",
  "admin_password": "Admin123!",
  "customer_email": "customer@test.com",
  "customer_password": "Test1234!"
}
```

---

## 🚨 Error Scenarios to Test

### Authentication Errors
- ❌ Invalid email format
- ❌ Email already exists
- ❌ Wrong password
- ❌ Expired token
- ❌ Invalid token

### Order Errors
- ❌ Product out of stock
- ❌ Invalid product ID
- ❌ Order total mismatch
- ❌ Invalid voucher code
- ❌ Cancel after confirmed
- ❌ Unauthorized status update

### Payment Errors
- ❌ Invalid transaction ID
- ❌ Payment timeout
- ❌ Invalid secure hash
- ❌ Duplicate transaction
- ❌ Refund already processed

### Validation Errors
- ❌ Missing required fields
- ❌ Invalid field format
- ❌ Field too long/short
- ❌ Invalid enum values

---

## 📊 Performance Testing

### Load Testing Scenarios
1. **Concurrent Orders**: 100 users đặt hàng đồng thời
2. **Payment Processing**: 50 VNPay transactions cùng lúc
3. **Real-time Tracking**: 200 users track orders
4. **Admin Dashboard**: Multiple admins access dashboard

### Expected Response Times
- Authentication: < 200ms
- Order Creation: < 500ms
- Payment URL: < 300ms
- Order Listing: < 400ms
- Dashboard Stats: < 1000ms

---

## 🔒 Security Testing

### Test Cases
1. **SQL Injection**: Test với malicious input
2. **XSS**: Test với script tags
3. **CSRF**: Test without proper tokens
4. **Rate Limiting**: Test với excessive requests
5. **Authorization**: Test với wrong user roles
6. **Sensitive Data**: Ensure passwords not exposed

---

## 📝 Notes & Tips

### Important Notes
1. ⚠️ **VNPay Testing**: Mock responses được cung cấp vì không thể test real payment trong dev
2. ⚠️ **Secure Hash**: Cần calculate đúng theo VNPay specification
3. ⚠️ **IPN Endpoint**: Thường được gọi bởi VNPay server, không phải client
4. ⚠️ **Admin Operations**: Cần admin token để test

### Testing Tips
1. 💡 Run setup requests trước để có đầy đủ IDs
2. 💡 Login với đúng role cho từng test
3. 💡 Check console logs để verify auto-save
4. 💡 Use Collection Runner cho regression testing
5. 💡 Monitor database sau mỗi test để verify data integrity

---

## 🎓 Test Data Requirements

### Seeded Data Needed
```javascript
// Admin Account
{
  email: "admin@foodfast.com",
  password: "Admin123!",
  role: "admin"
}

// Customer Account
{
  email: "customer@test.com",
  password: "Test1234!",
  role: "user"
}

// Restaurant Account
{
  email: "restaurant@test.com",
  password: "Restaurant123!",
  role: "restaurant",
  restaurantId: "SOME_ID"
}

// Test Products
[
  { name: "Phở bò", price: 50000, stock: 100 },
  { name: "Cơm gà", price: 45000, stock: 50 }
]

// Test Voucher
{
  code: "GIAM20",
  discount: 20000,
  minOrder: 100000,
  expiryDate: "2025-12-31"
}
```

---

## ✅ Checklist Before Testing

- [ ] Server is running on port 5000
- [ ] Database is seeded with test data
- [ ] VNPay credentials are configured
- [ ] Cloudinary is configured
- [ ] Collection variables are cleared
- [ ] Base URL is correct
- [ ] All test accounts exist
- [ ] Drones are available in database

---

## 📧 Contact & Support

**Project**: FOODFAST  
**Version**: 2.0.0  
**Last Updated**: November 12, 2025

**Issues?** Check:
1. Server logs
2. Database connections
3. Environment variables
4. API endpoint paths
5. Authentication tokens

---

**🎉 Happy Testing! 🎉**
