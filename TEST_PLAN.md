# 📋 TEST PLAN - HỆ THỐNG FOODFAST DRONE DELIVERY

---

## 📌 THÔNG TIN Dự ÁN

| **Mục** | **Thông tin** |
|---------|---------------|
| **Tên dự án** | FoodFast Drone Delivery System |
| **Phiên bản** | Deploy Branch v1.0 |
| **Ngày lập** | 12/11/2025 |
| **Người lập** | FoodFast Team |
| **Môi trường** | Development, Staging, Production |
| **Công nghệ** | MERN Stack (MongoDB, Express, React, Node.js) |

---

## 📖 MỤC LỤC

1. [Giới thiệu](#1-giới-thiệu)
2. [Mục tiêu Test](#2-mục-tiêu-test)
3. [Phạm vi Test](#3-phạm-vi-test)
4. [Chiến lược Test](#4-chiến-lược-test)
5. [Môi trường Test](#5-môi-trường-test)
6. [Kế hoạch Test Cases](#6-kế-hoạch-test-cases)
7. [Test Data](#7-test-data)
8. [Lịch trình thực hiện](#8-lịch-trình-thực-hiện)
9. [Tiêu chí Pass/Fail](#9-tiêu-chí-passfail)
10. [Rủi ro và Giải pháp](#10-rủi-ro-và-giải-pháp)

---

## 1. GIỚI THIỆU

### 1.1 Mục đích tài liệu
Tài liệu này mô tả chi tiết kế hoạch kiểm thử cho hệ thống **FoodFast Drone Delivery** - một nền tảng đặt đồ ăn với giao hàng tự động bằng drone.

### 1.2 Tổng quan hệ thống
**FoodFast** là hệ thống giao đồ ăn tích hợp 4 ứng dụng chính:

- **Client App** (Port 3000): Ứng dụng khách hàng
- **Restaurant App** (Port 3001): Ứng dụng quản lý nhà hàng
- **Admin App** (Port 3002): Ứng dụng quản trị hệ thống
- **Drone Management** (Port 3003): Ứng dụng quản lý drone
- **Server API** (Port 5000): Backend RESTful API

### 1.3 Kiến trúc hệ thống

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Client App │────▶│  Server API  │◀────│Restaurant App│
└─────────────┘     │  (Node.js)   │     └─────────────┘
                    │              │
┌─────────────┐     │   MongoDB    │     ┌─────────────┐
│  Admin App  │────▶│   Database   │◀────│  Drone App  │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │  Socket.IO  │
                    │ (Real-time) │
                    └─────────────┘
```

---

## 2. MỤC TIÊU TEST

### 2.1 Mục tiêu chính

✅ **Đảm bảo chất lượng**: Kiểm tra toàn diện các chức năng của hệ thống  
✅ **Phát hiện lỗi sớm**: Tìm và sửa lỗi trước khi deploy production  
✅ **Đảm bảo hiệu năng**: Kiểm tra thời gian phản hồi và khả năng chịu tải  
✅ **Bảo mật**: Xác minh các cơ chế authentication và authorization  
✅ **Trải nghiệm người dùng**: Đảm bảo UI/UX hoạt động mượt mà  

### 2.2 Mục tiêu cụ thể

| **Loại Test** | **Mục tiêu Coverage** | **Thời gian** |
|---------------|----------------------|---------------|
| Unit Test | ≥ 80% code coverage | 2 tuần |
| Integration Test | 100% API endpoints | 2 tuần |
| E2E Test | Các flow chính | 1 tuần |
| Performance Test | Response < 2s | 1 tuần |
| Security Test | OWASP Top 10 | 1 tuần |

---

## 3. PHẠM VI TEST

### 3.1 Các module được test

#### 🔐 **Authentication & Authorization**
- ✅ Đăng ký tài khoản (Customer, Restaurant, Admin, Drone)
- ✅ Đăng nhập/Đăng xuất
- ✅ JWT Token validation
- ✅ Password encryption
- ✅ Role-based access control (RBAC)
- ✅ Session management

#### 👤 **User Management**
- ✅ CRUD operations cho users
- ✅ Profile management (cập nhật thông tin, avatar)
- ✅ Email verification
- ✅ Password reset
- ✅ User statistics

#### 🍔 **Product Management**
- ✅ CRUD sản phẩm (tạo, đọc, cập nhật, xóa)
- ✅ Upload hình ảnh sản phẩm (Cloudinary)
- ✅ Lọc sản phẩm theo category, price, rating
- ✅ Tìm kiếm sản phẩm
- ✅ Sản phẩm phổ biến

#### 🏪 **Restaurant Management**
- ✅ CRUD nhà hàng
- ✅ Quản lý menu nhà hàng
- ✅ Tìm nhà hàng gần (nearby search)
- ✅ Toggle trạng thái (mở/đóng cửa)
- ✅ Thống kê doanh thu nhà hàng

#### 📦 **Order Management**
- ✅ Tạo đơn hàng mới
- ✅ Quản lý trạng thái đơn hàng (State Machine)
  - `pending` → `confirmed` → `preparing` → `ready` → `delivering` → `delivered`
- ✅ Hủy đơn hàng (cancel)
- ✅ Lịch sử đơn hàng
- ✅ Real-time tracking (Socket.IO)
- ✅ Order validation (items, price, location)

#### 🚁 **Drone Management**
- ✅ CRUD drone
- ✅ Tìm drone gần nhất (nearest available)
- ✅ Gán drone cho đơn hàng
- ✅ Cập nhật vị trí drone (real-time)
- ✅ Cập nhật pin drone
- ✅ Cập nhật trạng thái (available, busy, charging, maintenance)
- ✅ Drone statistics

#### 💳 **Payment Integration**
- ✅ VNPay payment gateway
  - Tạo payment URL
  - Return URL callback
  - IPN (Instant Payment Notification)
  - Query transaction
  - Refund
- ✅ Momo payment (placeholder)
- ✅ COD (Cash on Delivery)

#### 🎟️ **Voucher & Promotion**
- ✅ CRUD voucher
- ✅ Validate voucher (min order, expiry, usage limit)
- ✅ Apply voucher tự động
- ✅ Promotion management
- ✅ Voucher statistics

#### ⭐ **Review & Rating**
- ✅ Tạo review cho sản phẩm/nhà hàng
- ✅ Cập nhật/xóa review
- ✅ Tính rating trung bình
- ✅ Lọc review theo rating

#### 📊 **Dashboard & Analytics** (Admin)
- ✅ Tổng quan hệ thống (users, orders, revenue)
- ✅ Biểu đồ doanh thu theo thời gian
- ✅ Top sản phẩm bán chạy
- ✅ Drone performance metrics

#### 🔔 **Real-time Notifications**
- ✅ Socket.IO connection
- ✅ Order status updates
- ✅ Drone location updates
- ✅ Payment notifications

### 3.2 Các module KHÔNG được test
- ❌ Third-party libraries (axios, lodash, etc.)
- ❌ Node.js built-in modules
- ❌ External APIs (chỉ mock)

---

## 4. CHIẾN LƯỢC TEST

### 4.1 Test Pyramid

```
        ╱╲
       ╱  ╲
      ╱ E2E ╲         10% - End-to-End Tests
     ╱──────╲        (Cypress, Selenium)
    ╱        ╲
   ╱Integration╲     30% - Integration Tests
  ╱────────────╲    (API Tests, Database)
 ╱              ╲
╱  Unit Tests    ╲   60% - Unit Tests
──────────────────  (Jest, Vitest)
```

### 4.2 Các loại test

#### **4.2.1 Unit Tests** (60% effort)
- **Framework**: Jest (Backend), Vitest (Frontend)
- **Coverage**: ≥ 80%
- **Mục tiêu**: Test từng function/component riêng lẻ
- **Số lượng**: ~150 test cases

**Ví dụ Unit Tests:**
```javascript
// Backend: Distance calculation
test('Tính khoảng cách GPS chính xác (Haversine)', () => {
  const point1 = { lat: 10.762622, lng: 106.660172 }; // HCMC
  const point2 = { lat: 10.771885, lng: 106.698377 }; // Thủ Đức
  const distance = calculateDistance(point1, point2);
  expect(distance).toBeCloseTo(4.2, 1); // ~4.2km
});

// Frontend: Redux state management
test('setCurrentOrder cập nhật order hiện tại', () => {
  const state = reducer(undefined, setCurrentOrder(mockOrder));
  expect(state.currentOrder).toEqual(mockOrder);
});
```

#### **4.2.2 Integration Tests** (30% effort)
- **Framework**: Supertest + MongoMemoryServer
- **Coverage**: 100% API endpoints
- **Mục tiêu**: Test tích hợp giữa các module
- **Số lượng**: ~80 test cases

**Ví dụ Integration Tests:**
```javascript
test('API POST /api/orders - Tạo đơn hàng và gán drone', async () => {
  // 1. Tạo user
  const user = await User.create({ name: 'John', email: 'john@test.com' });
  
  // 2. Tạo drone
  const drone = await Drone.create({ name: 'D1', status: 'available' });
  
  // 3. Gọi API tạo order
  const res = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${token}`)
    .send(orderData);
  
  // 4. Verify
  expect(res.status).toBe(201);
  expect(res.body.data.drone).toBe(drone._id);
});
```

#### **4.2.3 End-to-End Tests** (10% effort)
- **Framework**: Cypress
- **Coverage**: Các flow chính
- **Mục tiêu**: Test toàn bộ user journey
- **Số lượng**: ~30 test cases

**Ví dụ E2E Tests:**
```javascript
describe('Flow đặt hàng hoàn chỉnh', () => {
  it('Khách hàng đặt món và theo dõi giao hàng', () => {
    // 1. Login
    cy.visit('/login');
    cy.get('[data-test=email]').type('customer@test.com');
    cy.get('[data-test=password]').type('password');
    cy.get('[data-test=submit]').click();
    
    // 2. Chọn nhà hàng
    cy.get('[data-test=restaurant-card]').first().click();
    
    // 3. Thêm món vào giỏ
    cy.get('[data-test=add-to-cart]').first().click();
    
    // 4. Checkout
    cy.get('[data-test=cart-icon]').click();
    cy.get('[data-test=checkout]').click();
    
    // 5. Điền thông tin giao hàng
    cy.get('[data-test=address]').type('123 Nguyen Hue, Q1');
    cy.get('[data-test=phone]').type('0901234567');
    
    // 6. Chọn phương thức thanh toán
    cy.get('[data-test=payment-cod]').click();
    
    // 7. Đặt hàng
    cy.get('[data-test=place-order]').click();
    
    // 8. Verify success
    cy.url().should('include', '/order-tracking');
    cy.contains('Đơn hàng đã được tạo thành công');
  });
});
```

#### **4.2.4 Performance Tests**
- **Framework**: Artillery, k6
- **Mục tiêu**: 
  - Response time < 2s (95th percentile)
  - Support 1000 concurrent users
  - Database query < 500ms

#### **4.2.5 Security Tests**
- **Framework**: OWASP ZAP, Burp Suite
- **Checklist**:
  - ✅ SQL Injection prevention (MongoDB Injection)
  - ✅ XSS protection
  - ✅ CSRF tokens
  - ✅ Rate limiting
  - ✅ JWT token security
  - ✅ Password hashing (bcrypt)
  - ✅ HTTPS/TLS encryption

---

## 5. MÔI TRƯỜNG TEST

### 5.1 Cấu hình môi trường

| **Môi trường** | **Database** | **URL** | **Mục đích** |
|----------------|--------------|---------|-------------|
| **Local** | MongoDB Local | localhost:5000 | Development & Unit Tests |
| **CI/CD** | MongoMemoryServer | GitHub Actions | Automated Tests |
| **Staging** | MongoDB Atlas | staging.foodfast.app | Integration Tests |
| **Production** | MongoDB Atlas | foodfast.app | Smoke Tests only |

### 5.2 Dependencies

```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "vitest": "^1.0.0",
    "cypress": "^13.0.0",
    "supertest": "^6.3.0",
    "mongodb-memory-server": "^9.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "eslint": "^8.0.0",
    "artillery": "^2.0.0"
  }
}
```

### 5.3 Test Data Setup

#### **Database Seeding Script**
```bash
# Seed test data vào database
node server_app/scripts/seed-test-data.js
```

#### **Clean up sau test**
```bash
# Xóa toàn bộ test data
node server_app/scripts/cleanup-test-data.js
```

---

## 6. KẾ HOẠCH TEST CASES

### 6.1 Backend API Tests

#### **6.1.1 Authentication API** (`/api/auth`)

| **ID** | **Test Case** | **Method** | **Endpoint** | **Expected Result** | **Priority** |
|--------|---------------|------------|--------------|---------------------|--------------|
| AUTH-001 | Đăng ký user mới thành công | POST | `/api/auth/register` | 201, user created | P0 |
| AUTH-002 | Đăng ký với email trùng | POST | `/api/auth/register` | 400, error message | P0 |
| AUTH-003 | Đăng ký với password yếu | POST | `/api/auth/register` | 400, validation error | P1 |
| AUTH-004 | Đăng nhập thành công | POST | `/api/auth/login` | 200, JWT token | P0 |
| AUTH-005 | Đăng nhập sai password | POST | `/api/auth/login` | 401, unauthorized | P0 |
| AUTH-006 | Lấy profile với token hợp lệ | GET | `/api/auth/me` | 200, user data | P0 |
| AUTH-007 | Lấy profile với token không hợp lệ | GET | `/api/auth/me` | 401, unauthorized | P0 |
| AUTH-008 | Đăng xuất | POST | `/api/auth/logout` | 200, success | P1 |

#### **6.1.2 User API** (`/api/users`)

| **ID** | **Test Case** | **Method** | **Endpoint** | **Expected Result** | **Priority** |
|--------|---------------|------------|--------------|---------------------|--------------|
| USER-001 | Admin lấy danh sách users | GET | `/api/users` | 200, users array | P0 |
| USER-002 | User thường không thể lấy danh sách | GET | `/api/users` | 403, forbidden | P0 |
| USER-003 | Lấy thông tin user theo ID | GET | `/api/users/:id` | 200, user object | P1 |
| USER-004 | Admin cập nhật user | PUT | `/api/users/:id` | 200, updated user | P1 |
| USER-005 | Admin xóa user | DELETE | `/api/users/:id` | 200, success | P1 |
| USER-006 | Kiểm tra email tồn tại | GET | `/api/users/check-email` | 200, { exists: true/false } | P1 |
| USER-007 | Lấy thống kê users | GET | `/api/users/stats` | 200, statistics | P2 |

#### **6.1.3 Product API** (`/api/products`)

| **ID** | **Test Case** | **Method** | **Endpoint** | **Expected Result** | **Priority** |
|--------|---------------|------------|--------------|---------------------|--------------|
| PROD-001 | Lấy danh sách sản phẩm | GET | `/api/products` | 200, products array | P0 |
| PROD-002 | Lấy sản phẩm theo ID | GET | `/api/products/:id` | 200, product object | P0 |
| PROD-003 | Restaurant tạo sản phẩm mới | POST | `/api/products` | 201, product created | P0 |
| PROD-004 | Tạo sản phẩm với hình ảnh | POST | `/api/products` (multipart) | 201, image uploaded | P0 |
| PROD-005 | Tạo sản phẩm thiếu field bắt buộc | POST | `/api/products` | 400, validation error | P1 |
| PROD-006 | Cập nhật sản phẩm | PUT | `/api/products/:id` | 200, updated product | P1 |
| PROD-007 | Xóa sản phẩm | DELETE | `/api/products/:id` | 200, success | P1 |
| PROD-008 | Lọc sản phẩm theo category | GET | `/api/products?category=pizza` | 200, filtered products | P1 |
| PROD-009 | Lấy sản phẩm phổ biến | GET | `/api/products/popular` | 200, popular products | P2 |

#### **6.1.4 Restaurant API** (`/api/restaurants`)

| **ID** | **Test Case** | **Method** | **Endpoint** | **Expected Result** | **Priority** |
|--------|---------------|------------|--------------|---------------------|--------------|
| REST-001 | Lấy danh sách nhà hàng | GET | `/api/restaurants` | 200, restaurants array | P0 |
| REST-002 | Lấy nhà hàng theo ID | GET | `/api/restaurants/:id` | 200, restaurant object | P0 |
| REST-003 | Admin tạo nhà hàng | POST | `/api/restaurants` | 201, restaurant created | P0 |
| REST-004 | Tìm nhà hàng gần vị trí | GET | `/api/restaurants/nearby?lat=10.76&lng=106.66` | 200, nearby restaurants | P0 |
| REST-005 | Lấy menu nhà hàng | GET | `/api/restaurants/:id/menu` | 200, menu products | P0 |
| REST-006 | Toggle trạng thái nhà hàng | PATCH | `/api/restaurants/:id/toggle-status` | 200, updated status | P1 |
| REST-007 | Lấy thống kê nhà hàng | GET | `/api/restaurants/:id/stats` | 200, statistics | P2 |

#### **6.1.5 Order API** (`/api/orders`)

| **ID** | **Test Case** | **Method** | **Endpoint** | **Expected Result** | **Priority** |
|--------|---------------|------------|--------------|---------------------|--------------|
| ORD-001 | Tạo đơn hàng mới | POST | `/api/orders` | 201, order created | P0 |
| ORD-002 | Tạo đơn với voucher hợp lệ | POST | `/api/orders` | 201, discount applied | P0 |
| ORD-003 | Tạo đơn với voucher hết hạn | POST | `/api/orders` | 400, voucher expired | P1 |
| ORD-004 | Lấy chi tiết đơn hàng | GET | `/api/orders/:id` | 200, order object | P0 |
| ORD-005 | Lấy lịch sử đơn hàng | GET | `/api/orders/history` | 200, orders array | P0 |
| ORD-006 | Restaurant cập nhật trạng thái | PATCH | `/api/orders/:id/status` | 200, status updated | P0 |
| ORD-007 | Chuyển trạng thái không hợp lệ | PATCH | `/api/orders/:id/status` | 400, invalid transition | P1 |
| ORD-008 | Hủy đơn hàng | PATCH | `/api/orders/:id/cancel` | 200, order cancelled | P1 |
| ORD-009 | Tracking đơn hàng real-time | GET | `/api/orders/:id/track` | 200, tracking data | P0 |

#### **6.1.6 Drone API** (`/api/drones`)

| **ID** | **Test Case** | **Method** | **Endpoint** | **Expected Result** | **Priority** |
|--------|---------------|------------|--------------|---------------------|--------------|
| DRN-001 | Lấy danh sách drones | GET | `/api/drones` | 200, drones array | P0 |
| DRN-002 | Admin tạo drone | POST | `/api/drones` | 201, drone created | P0 |
| DRN-003 | Cập nhật vị trí drone | PATCH | `/api/drones/:id/location` | 200, location updated | P0 |
| DRN-004 | Cập nhật pin drone | PATCH | `/api/drones/:id/battery` | 200, battery updated | P0 |
| DRN-005 | Cập nhật trạng thái drone | PATCH | `/api/drones/:id/status` | 200, status updated | P0 |
| DRN-006 | Tìm drone gần nhất | GET | `/api/drones/nearby?lat=10.76&lng=106.66` | 200, nearest drone | P0 |
| DRN-007 | Gán drone cho đơn hàng | POST | `/api/drones/:id/assign` | 200, assigned | P0 |
| DRN-008 | Không gán drone pin yếu | POST | `/api/drones/:id/assign` | 400, low battery | P1 |
| DRN-009 | Lấy thống kê drone | GET | `/api/drones/:id/stats` | 200, statistics | P2 |

#### **6.1.7 Payment API** (`/api/payment`)

| **ID** | **Test Case** | **Method** | **Endpoint** | **Expected Result** | **Priority** |
|--------|---------------|------------|--------------|---------------------|--------------|
| PAY-001 | Tạo VNPay payment URL | POST | `/api/payment/vnpay/create` | 200, payment URL | P0 |
| PAY-002 | VNPay return callback | GET | `/api/payment/vnpay/return` | 200, payment success | P0 |
| PAY-003 | VNPay IPN webhook | GET | `/api/payment/vnpay/ipn` | 200, processed | P0 |
| PAY-004 | Query VNPay transaction | POST | `/api/payment/vnpay/querydr` | 200, transaction data | P1 |
| PAY-005 | VNPay refund | POST | `/api/payment/vnpay/refund` | 200, refund success | P1 |
| PAY-006 | Lấy phương thức thanh toán | GET | `/api/payment/methods` | 200, methods array | P2 |

#### **6.1.8 Voucher API** (`/api/vouchers`)

| **ID** | **Test Case** | **Method** | **Endpoint** | **Expected Result** | **Priority** |
|--------|---------------|------------|--------------|---------------------|--------------|
| VOU-001 | Lấy vouchers công khai | GET | `/api/vouchers/public/:restaurantId` | 200, vouchers array | P0 |
| VOU-002 | Validate voucher hợp lệ | POST | `/api/vouchers/validate` | 200, valid | P0 |
| VOU-003 | Validate voucher hết hạn | POST | `/api/vouchers/validate` | 400, expired | P1 |
| VOU-004 | Validate voucher dưới min order | POST | `/api/vouchers/validate` | 400, min order not met | P1 |
| VOU-005 | Restaurant tạo voucher | POST | `/api/vouchers` | 201, voucher created | P1 |
| VOU-006 | Cập nhật voucher | PUT | `/api/vouchers/:id` | 200, updated | P1 |
| VOU-007 | Xóa voucher | DELETE | `/api/vouchers/:id` | 200, deleted | P2 |

### 6.2 Frontend Component Tests

#### **6.2.1 Authentication Components**

| **ID** | **Component** | **Test Case** | **Expected Result** | **Priority** |
|--------|---------------|---------------|---------------------|--------------|
| UI-AUTH-001 | LoginPage | Hiển thị form đăng nhập | Form có email & password | P0 |
| UI-AUTH-002 | LoginPage | Submit với thông tin hợp lệ | Gọi API login, redirect | P0 |
| UI-AUTH-003 | LoginPage | Hiển thị lỗi khi sai password | Error message xuất hiện | P0 |
| UI-AUTH-004 | RegisterPage | Validate email format | Error khi email sai format | P1 |
| UI-AUTH-005 | RegisterPage | Validate password strength | Error khi password yếu | P1 |

#### **6.2.2 Product Components**

| **ID** | **Component** | **Test Case** | **Expected Result** | **Priority** |
|--------|---------------|---------------|---------------------|--------------|
| UI-PROD-001 | ProductCard | Hiển thị thông tin sản phẩm | Tên, giá, hình ảnh hiển thị | P0 |
| UI-PROD-002 | ProductCard | Click vào sản phẩm | Navigate đến detail page | P0 |
| UI-PROD-003 | ProductFilter | Lọc theo category | Chỉ hiển thị sản phẩm đúng category | P1 |
| UI-PROD-004 | ProductFilter | Lọc theo price range | Sản phẩm trong range hiển thị | P1 |

#### **6.2.3 Cart & Checkout**

| **ID** | **Component** | **Test Case** | **Expected Result** | **Priority** |
|--------|---------------|---------------|---------------------|--------------|
| UI-CART-001 | CartPage | Hiển thị items trong giỏ | Tất cả items hiển thị đúng | P0 |
| UI-CART-002 | CartPage | Tăng/giảm số lượng | Total price cập nhật | P0 |
| UI-CART-003 | CartPage | Xóa item khỏi giỏ | Item bị remove | P0 |
| UI-CART-004 | CheckoutPage | Apply voucher hợp lệ | Discount được áp dụng | P0 |
| UI-CART-005 | CheckoutPage | Validate địa chỉ giao hàng | Error khi thiếu thông tin | P1 |
| UI-CART-006 | CheckoutPage | Đặt hàng thành công | Redirect đến tracking page | P0 |

#### **6.2.4 Order Tracking**

| **ID** | **Component** | **Test Case** | **Expected Result** | **Priority** |
|--------|---------------|---------------|---------------------|--------------|
| UI-TRACK-001 | OrderTrackingPage | Hiển thị trạng thái đơn hàng | Status hiển thị đúng | P0 |
| UI-TRACK-002 | OrderTrackingPage | Real-time update vị trí drone | Map cập nhật real-time | P0 |
| UI-TRACK-003 | OrderTrackingPage | Timeline trạng thái | Các bước hiển thị rõ ràng | P1 |

### 6.3 End-to-End Test Scenarios

#### **Scenario 1: Khách hàng đặt hàng hoàn chỉnh**

| **Bước** | **Hành động** | **Kết quả mong đợi** |
|----------|---------------|----------------------|
| 1 | Truy cập trang chủ | Trang chủ hiển thị danh sách nhà hàng |
| 2 | Đăng ký tài khoản mới | Đăng ký thành công, redirect đến login |
| 3 | Đăng nhập | Login thành công, redirect đến home |
| 4 | Chọn nhà hàng | Vào trang menu nhà hàng |
| 5 | Thêm sản phẩm vào giỏ | Số lượng cart icon tăng lên |
| 6 | Xem giỏ hàng | Hiển thị đúng sản phẩm đã thêm |
| 7 | Áp dụng voucher | Giá giảm theo discount |
| 8 | Checkout | Form checkout hiển thị |
| 9 | Điền thông tin giao hàng | Form validation pass |
| 10 | Chọn thanh toán COD | Phương thức được chọn |
| 11 | Đặt hàng | Đơn hàng tạo thành công |
| 12 | Tracking đơn hàng | Map hiển thị vị trí drone real-time |
| 13 | Drone giao hàng | Status thay đổi: delivering → delivered |
| 14 | Xác nhận đã nhận hàng | Order hoàn tất |
| 15 | Đánh giá sản phẩm | Review được tạo thành công |

#### **Scenario 2: Nhà hàng quản lý đơn hàng**

| **Bước** | **Hành động** | **Kết quả mong đợi** |
|----------|---------------|----------------------|
| 1 | Đăng nhập restaurant app | Dashboard nhà hàng hiển thị |
| 2 | Xem đơn hàng mới | Danh sách orders pending |
| 3 | Xác nhận đơn hàng | Status: pending → confirmed |
| 4 | Cập nhật "Đang chuẩn bị" | Status: confirmed → preparing |
| 5 | Đánh dấu "Sẵn sàng giao" | Status: preparing → ready |
| 6 | Hệ thống gán drone | Drone được assign tự động |
| 7 | Xem lịch sử đơn hàng | Tất cả orders hiển thị |
| 8 | Xem thống kê doanh thu | Charts hiển thị dữ liệu |

#### **Scenario 3: Admin quản trị hệ thống**

| **Bước** | **Hành động** | **Kết quả mong đợi** |
|----------|---------------|----------------------|
| 1 | Đăng nhập admin app | Admin dashboard hiển thị |
| 2 | Xem tổng quan hệ thống | Cards: users, orders, revenue |
| 3 | Quản lý users | CRUD operations hoạt động |
| 4 | Quản lý restaurants | Tạo/sửa/xóa nhà hàng |
| 5 | Quản lý drones | CRUD drones, xem status |
| 6 | Xem biểu đồ doanh thu | Charts hiển thị theo thời gian |
| 7 | Gán drone cho đơn hàng | Drone assignment thành công |

---

## 7. TEST DATA

### 7.1 User Test Data

```javascript
// Test users với các roles khác nhau
const testUsers = {
  customer: {
    name: "Test Customer",
    email: "customer@test.com",
    password: "Test@123",
    phone: "0901234567",
    role: "customer"
  },
  restaurant: {
    name: "Test Restaurant Owner",
    email: "restaurant@test.com",
    password: "Test@123",
    phone: "0902345678",
    role: "restaurant",
    restaurantId: "restaurant_id_here"
  },
  admin: {
    name: "Test Admin",
    email: "admin@test.com",
    password: "Admin@123",
    role: "admin"
  },
  drone: {
    name: "Drone Operator",
    email: "drone@test.com",
    password: "Drone@123",
    role: "drone",
    droneId: "drone_id_here"
  }
};
```

### 7.2 Product Test Data

```javascript
const testProducts = [
  {
    name: "Phở Bò",
    description: "Phở bò Hà Nội truyền thống",
    price: 50000,
    category: "main-dish",
    restaurant: "restaurant_id",
    image: "https://example.com/pho.jpg",
    isAvailable: true
  },
  {
    name: "Pizza Margherita",
    description: "Pizza Ý cổ điển",
    price: 150000,
    category: "pizza",
    restaurant: "restaurant_id",
    image: "https://example.com/pizza.jpg",
    isAvailable: true
  }
];
```

### 7.3 Order Test Data

```javascript
const testOrder = {
  customer: {
    name: "Nguyễn Văn A",
    phone: "0901234567",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM"
  },
  restaurant: "restaurant_id",
  items: [
    {
      product: "product_id_1",
      quantity: 2,
      price: 50000
    }
  ],
  deliveryLocation: {
    type: "Point",
    coordinates: [106.700172, 10.776622] // [lng, lat]
  },
  voucher: "voucher_code",
  totalAmount: 100000,
  paymentMethod: "cod"
};
```

### 7.4 Voucher Test Data

```javascript
const testVouchers = [
  {
    code: "DISCOUNT20",
    discountValue: 20, // 20%
    discountType: "percentage",
    minOrder: 50000,
    maxDiscount: 30000,
    validFrom: new Date(),
    validTo: new Date(Date.now() + 30*24*60*60*1000), // 30 days
    usageLimit: 100,
    restaurant: "restaurant_id",
    isActive: true
  },
  {
    code: "FREESHIP",
    discountValue: 15000,
    discountType: "fixed",
    minOrder: 0,
    validFrom: new Date(),
    validTo: new Date(Date.now() + 7*24*60*60*1000), // 7 days
    usageLimit: 50,
    isActive: true
  }
];
```

### 7.5 Drone Test Data

```javascript
const testDrones = [
  {
    name: "Drone Alpha 1",
    model: "DJI Matrice 300",
    status: "available",
    battery: 95,
    maxRange: 15, // km
    location: {
      type: "Point",
      coordinates: [106.660172, 10.762622]
    }
  },
  {
    name: "Drone Beta 2",
    model: "DJI Phantom 4",
    status: "busy",
    battery: 45,
    maxRange: 10,
    location: {
      type: "Point",
      coordinates: [106.670172, 10.772622]
    }
  }
];
```

---

## 8. LỊCH TRÌNH THỰC HIỆN

### 8.1 Timeline

```
Week 1-2: Unit Tests
├── Backend: Distance, Validation, Auth utils
├── Frontend: Redux slices, Helper functions
└── Coverage: 80%+

Week 3-4: Integration Tests
├── API endpoints testing (Supertest)
├── Database integration (MongoMemoryServer)
└── Coverage: 100% endpoints

Week 5: E2E Tests
├── Cypress setup
├── Critical user flows
└── 30+ test scenarios

Week 6: Performance & Security Tests
├── Artillery load testing
├── OWASP security scan
└── Optimization

Week 7: Bug Fixes & Regression
├── Fix all critical bugs
├── Re-run all tests
└── Final validation

Week 8: Documentation & Handover
├── Test report
├── Test plan update
└── Knowledge transfer
```

### 8.2 Milestone Deliverables

| **Week** | **Deliverable** | **Owner** | **Status** |
|----------|-----------------|-----------|------------|
| Week 2 | Unit Tests Complete | Dev Team | ✅ Done |
| Week 4 | Integration Tests Complete | Dev Team | ✅ Done |
| Week 5 | E2E Tests Complete | QA Team | 🔄 In Progress |
| Week 6 | Performance Report | QA Team | ⏳ Pending |
| Week 7 | Bug Fix Complete | Dev Team | ⏳ Pending |
| Week 8 | Final Test Report | QA Lead | ⏳ Pending |

---

## 9. TIÊU CHÍ PASS/FAIL

### 9.1 Exit Criteria (Điều kiện kết thúc test)

✅ **Pass Criteria:**
- Unit Test Coverage ≥ 80%
- Integration Test Coverage = 100% API endpoints
- E2E Test: 0 critical bugs
- Performance: Response time < 2s (95th percentile)
- Security: 0 high-severity vulnerabilities
- All P0 test cases passed

❌ **Fail Criteria:**
- Unit Test Coverage < 70%
- Critical bugs > 0
- Security vulnerabilities detected
- Performance degradation > 20%

### 9.2 Bug Severity Classification

| **Severity** | **Mô tả** | **Ví dụ** | **Fix Timeline** |
|--------------|-----------|-----------|------------------|
| **P0 - Critical** | Hệ thống crash, mất dữ liệu | Server down, payment failed | < 24 hours |
| **P1 - High** | Chức năng chính không hoạt động | Không thể đặt hàng | < 3 days |
| **P2 - Medium** | Chức năng phụ lỗi | Filter không hoạt động | < 1 week |
| **P3 - Low** | UI/UX issues | Button alignment | < 2 weeks |

### 9.3 Test Metrics

#### **Code Coverage**
```bash
# Backend coverage
cd server_app
npm run test:coverage

# Expected output:
# Statements   : 82.5% (850/1030)
# Branches     : 78.3% (345/441)
# Functions    : 85.7% (120/140)
# Lines        : 83.1% (820/987)
```

#### **API Response Time**
```
Target: 95th percentile < 2s
- GET /api/products: 150ms
- POST /api/orders: 450ms
- GET /api/restaurants/nearby: 320ms
- Real-time tracking: < 100ms latency
```

#### **Load Testing Results**
```
Concurrent Users: 1000
Duration: 5 minutes
Success Rate: > 99%
Error Rate: < 1%
```

---

## 10. RỦI RO VÀ GIẢI PHÁP

### 10.1 Rủi ro kỹ thuật

| **Rủi ro** | **Mức độ** | **Tác động** | **Giải pháp** |
|------------|------------|--------------|---------------|
| Database connection timeout | High | Tests fail randomly | Sử dụng MongoMemoryServer cho tests |
| External API unavailable (VNPay) | Medium | Payment tests fail | Mock external APIs |
| Real-time Socket.IO testing | Medium | Flaky tests | Use `socket.io-client` mock |
| Cloudinary upload slow | Low | Slow test execution | Mock upload service |
| Timezone issues | Low | Date/time tests fail | Use UTC time in tests |

### 10.2 Rủi ro tiến độ

| **Rủi ro** | **Mức độ** | **Giải pháp** |
|------------|------------|---------------|
| Thiếu nhân lực | High | Thuê thêm QA tester |
| Dependencies conflict | Medium | Lock package versions |
| CI/CD pipeline fail | Medium | Setup backup pipeline |

### 10.3 Mitigation Plan

**1. Flaky Tests Prevention:**
```javascript
// Sử dụng retry mechanism
test.retry(3)('API call với retry', async () => {
  const response = await api.get('/data');
  expect(response.status).toBe(200);
});

// Tăng timeout cho tests chậm
jest.setTimeout(10000); // 10 seconds
```

**2. Test Isolation:**
```javascript
// Clean up sau mỗi test
afterEach(async () => {
  await User.deleteMany({});
  await Order.deleteMany({});
  await Product.deleteMany({});
});
```

**3. Mock External Services:**
```javascript
// Mock VNPay
jest.mock('../services/vnpay', () => ({
  createPaymentUrl: jest.fn(() => 'https://mock-vnpay-url.com'),
  verifyReturnUrl: jest.fn(() => ({ success: true }))
}));

// Mock Cloudinary
jest.mock('cloudinary', () => ({
  uploader: {
    upload: jest.fn(() => ({ secure_url: 'https://mock-image.jpg' }))
  }
}));
```

---

## 11. CÔNG CỤ VÀ TÀI NGUYÊN

### 11.1 Test Tools

| **Loại Test** | **Tool** | **Version** | **Mục đích** |
|---------------|----------|-------------|--------------|
| Unit Test (Backend) | Jest | ^29.0.0 | Test logic backend |
| Unit Test (Frontend) | Vitest | ^1.0.0 | Test React components |
| Integration Test | Supertest | ^6.3.0 | Test API endpoints |
| E2E Test | Cypress | ^13.0.0 | Test user flows |
| Performance Test | Artillery | ^2.0.0 | Load testing |
| Security Test | OWASP ZAP | Latest | Vulnerability scan |
| Code Coverage | Istanbul/c8 | Built-in | Coverage report |
| Mock Database | MongoMemoryServer | ^9.0.0 | In-memory MongoDB |

### 11.2 CI/CD Integration

#### **GitHub Actions Workflow**

```yaml
name: CI/CD Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd server_app && npm install
          cd ../client_app && npm install
      
      - name: Run unit tests
        run: |
          cd server_app && npm test
          cd ../client_app && npm test
      
      - name: Run integration tests
        run: cd server_app && npm run test:integration
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
      
      - name: Run E2E tests
        run: npm run test:e2e
```

---

## 12. BÁO CÁO VÀ THEO DÕI

### 12.1 Test Report Template

**Daily Test Report:**
```
📅 Date: [DD/MM/YYYY]
👤 Tester: [Name]
🎯 Module: [Module name]

📊 Execution Summary:
- Total Tests: 150
- Passed: 145 ✅
- Failed: 3 ❌
- Skipped: 2 ⏭️
- Pass Rate: 96.7%

🐛 Bugs Found:
1. [BUG-001] Order status không update real-time (P1)
2. [BUG-002] Voucher validation sai logic (P2)
3. [BUG-003] Image upload timeout (P3)

📝 Notes:
- Integration tests chạy chậm hơn dự kiến
- Cần optimize database queries
```

### 12.2 Bug Tracking

**Sử dụng GitHub Issues với labels:**
- 🐛 `bug`: General bugs
- 🔥 `critical`: P0 bugs
- ⚠️ `high`: P1 bugs
- 📝 `medium`: P2 bugs
- 🔍 `low`: P3 bugs
- ✅ `test`: Test-related issues

### 12.3 Test Coverage Dashboard

**Tools:**
- **Codecov**: Automated coverage reports
- **SonarQube**: Code quality & security
- **Cypress Dashboard**: E2E test results

---

## 13. TÀI LIỆU THAM KHẢO

### 13.1 Internal Documents
- `API_ENDPOINTS.md` - API documentation
- `STRUCTURE.md` - Project structure
- `TEST_IMPLEMENTATION_COMPLETE.md` - Test implementation guide
- `TESTING_SUMMARY.md` - Test summary

### 13.2 External Resources
- [Jest Documentation](https://jestjs.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Supertest Guide](https://github.com/visionmedia/supertest)
- [MongoDB Testing](https://mongoosejs.com/docs/jest.html)

---

## 14. PHÊ DUYỆT

| **Vai trò** | **Họ tên** | **Chữ ký** | **Ngày** |
|-------------|------------|------------|----------|
| Test Lead | _______________ | _______________ | ___/___/___ |
| Dev Lead | _______________ | _______________ | ___/___/___ |
| Project Manager | _______________ | _______________ | ___/___/___ |
| Product Owner | _______________ | _______________ | ___/___/___ |

---

## 15. PHỤ LỤC

### 15.1 Test Environment URLs

```
Local Development:
- Client:     http://localhost:3000
- Restaurant: http://localhost:3001
- Admin:      http://localhost:3002
- Drone:      http://localhost:3003
- API:        http://localhost:5000

Staging:
- Client:     https://staging-client.foodfast.app
- API:        https://staging-api.foodfast.app

Production:
- Client:     https://foodfast.app
- API:        https://api.foodfast.app
```

### 15.2 Test Account Credentials

```
Customer Account:
Email: test.customer@foodfast.app
Password: TestCustomer@123

Restaurant Account:
Email: test.restaurant@foodfast.app
Password: TestRestaurant@123

Admin Account:
Email: test.admin@foodfast.app
Password: TestAdmin@123

Drone Account:
Email: test.drone@foodfast.app
Password: TestDrone@123
```

### 15.3 Database Connection Strings

```bash
# Local MongoDB
MONGO_URI=mongodb://localhost:27017/foodfast_test

# MongoDB Atlas (Test)
MONGO_URI=mongodb+srv://test_user:password@cluster.mongodb.net/foodfast_test

# MongoMemoryServer (Automated Tests)
# Tự động khởi tạo trong test setup
```

---

## 📞 LIÊN HỆ

**Test Team:**
- **Test Lead:** [Name] - [email@foodfast.app]
- **QA Engineer:** [Name] - [email@foodfast.app]
- **Automation Engineer:** [Name] - [email@foodfast.app]

**Development Team:**
- **Dev Lead:** [Name] - [email@foodfast.app]
- **Backend Dev:** [Name] - [email@foodfast.app]
- **Frontend Dev:** [Name] - [email@foodfast.app]

---

<div align="center">

**🍔🚁 FOODFAST DRONE DELIVERY**

*Smart Delivery, Smarter Technology*

© 2025 FoodFast Team | All rights reserved.

**Version:** 1.0  
**Last Updated:** 12/11/2025

</div>
