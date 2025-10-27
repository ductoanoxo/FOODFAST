# 🎯 HƯỚNG DẪN DEMO TESTING

## 📋 TÓM TẮT TEST COVERAGE

Dự án này có **3 loại test** quan trọng:

### 1️⃣ UNIT TESTS (18 tests) - Test từng function riêng lẻ
- ✅ **Authentication** (6 tests) - Đăng ký/Đăng nhập
- ✅ **Product** (12 tests) - CRUD sản phẩm (Tạo/Sửa/Xóa/Lấy danh sách)

### 2️⃣ INTEGRATION TESTS (6 tests) - Test toàn bộ flow
- ✅ **Order Flow** (6 tests) - Tạo order → Assign drone → Payment

### 3️⃣ E2E TESTS (Cypress) - Test trên giao diện thật
- ✅ **User Journeys** - Test toàn bộ hành trình người dùng

---

## 🚀 CÁCH CHẠY TEST TRONG DEMO

### ⚡ OPTION 1: Chạy TẤT CẢ tests (nhanh nhất)

```powershell
cd server_app
npm test
```

**Kết quả mong đợi:**
```
PASS  __tests__/unit/authentication.test.js (6/6 tests)
PASS  __tests__/unit/product.test.js (12/12 tests)
PASS  __tests__/integration/order-flow.demo.test.js (6/6 tests)

Tests:       24 passed, 24 total
Time:        ~5-10 seconds
```

---

### 🎯 OPTION 2: Chạy TỪNG LOẠI test (demo chi tiết)

#### A. Unit Tests - Authentication (2-3 giây)

```powershell
cd server_app
npm test -- authentication.test.js
```

**Demo script:**
> "Đây là unit test cho phần đăng ký và đăng nhập. Chúng ta test các trường hợp thành công, lỗi validation, email trùng..."

**Kết quả:**
```
✓ Register user - SUCCESS with valid data (50ms)
✓ Register user - FAIL with existing email (25ms)
✓ Register user - FAIL with invalid email (20ms)
✓ Register user - FAIL with missing password (18ms)
✓ Login user - SUCCESS with correct credentials (35ms)
✓ Login user - FAIL with wrong password (30ms)

Coverage: 57.44% of authController.js
```

#### B. Unit Tests - Product (3-4 giây)

```powershell
npm test -- product.test.js
```

**Demo script:**
> "Đây là unit test cho CRUD sản phẩm - các chức năng cơ bản nhất của hệ thống. Chúng ta test việc tạo, sửa, xóa, lấy danh sách sản phẩm với filter và pagination..."

**Kết quả:**
```
✓ Get all products - SUCCESS (35ms)
✓ Filter products by CATEGORY (30ms)
✓ Filter products by RESTAURANT (25ms)
✓ Pagination works correctly (28ms)
✓ Get product - SUCCESS with valid ID (32ms)
✓ Get product - FAIL with invalid ID (20ms)
✓ Create product - SUCCESS (40ms)
✓ Create product - FAIL missing required fields (25ms)
✓ Create product - FAIL invalid price (negative) (22ms)
✓ Update product - SUCCESS (35ms)
✓ Update product - FAIL product not found (20ms)
✓ Delete product - SUCCESS (30ms)
✓ Delete product - FAIL product not found (18ms)

Tests: 12 passed, 12 total
Coverage: ~55% of productController.js
```

#### C. Integration Test - Order Flow (5-7 giây)

```powershell
npm test -- order-flow.demo.test.js
```

**Demo script:**
> "Đây là integration test cho toàn bộ flow đặt hàng. Từ user login, tạo order, tính phí ship, assign drone, đến payment..."

**Kết quả:**
```
✓ FLOW 1: Tạo order THÀNH CÔNG với đầy đủ thông tin (120ms)
✓ FLOW 2: Phí ship được TÍNH ĐÚNG dựa trên khoảng cách (95ms)
✓ FLOW 3: Drone được AUTO-ASSIGN khi available (110ms)
✓ FLOW 4: Order status được CẬP NHẬT sau payment (85ms)
✓ FLOW 5: Tạo order THẤT BẠI khi thiếu thông tin (45ms)
✓ FLOW 6: Không assign được drone khi KHÔNG CÓ drone available (75ms)

Tests: 6 passed, 6 total
```

---

### 📊 OPTION 3: Chạy với COVERAGE REPORT (cho điểm cao)

```powershell
npm test -- --coverage
```

**Demo script:**
> "Chúng em có thể xem coverage report chi tiết để biết bao nhiêu % code đã được test..."

**Kết quả:**
```
--------------------------|---------|----------|---------|---------|
File                      | % Stmts | % Branch | % Funcs | % Lines |
--------------------------|---------|----------|---------|---------|
authController.js         |   57.44 |    50.00 |   66.67 |   57.89 |
productController.js      |   55.23 |    48.00 |   62.50 |   56.78 |
orderController.js        |   45.23 |    40.00 |   55.56 |   46.78 |
--------------------------|---------|----------|---------|---------|

HTML Report: server_app/coverage/lcov-report/index.html
```

**Mở HTML report:**
```powershell
start coverage/lcov-report/index.html
```

---

## 🎬 KỊCH BẢN DEMO (5-7 phút)

### Phần 1: Giới thiệu (30 giây)
> "Dự án FoodFast có hệ thống testing đầy đủ gồm unit tests, integration tests. 
> Chúng em test các chức năng quan trọng như authentication, payment, order flow..."

### Phần 2: Chạy Unit Tests (1-2 phút)
```powershell
# Terminal 1
npm test -- authentication.test.js

# Terminal 2  
npm test -- product.test.js
```

> "Authentication test kiểm tra đăng ký, đăng nhập với các trường hợp lỗi..."
> "Product test kiểm tra CRUD sản phẩm - tạo, sửa, xóa, filter theo category/restaurant..."

### Phần 3: Chạy Integration Test (2-3 phút)
```powershell
npm test -- order-flow.demo.test.js
```

> "Integration test kiểm tra toàn bộ flow đặt hàng thực tế..."
> "Từ user login, tạo order, hệ thống tự động tính phí ship, assign drone, đến thanh toán..."

### Phần 4: Coverage Report (1-2 phút)
```powershell
npm test -- --coverage
start coverage/lcov-report/index.html
```

> "Đây là coverage report chi tiết..."
> "Chúng em đã test được hơn 50% code của các controller quan trọng..."

---

## 📝 CÂU HỎI THẦY CÔ THƯỜNG HỎI

### Q1: "Em test những gì?"
**Trả lời:**
> "Em test 3 chức năng chính:
> 1. Authentication - Đăng ký/Đăng nhập với validation
> 2. Product CRUD - Tạo, sửa, xóa, lấy danh sách sản phẩm
> 3. Order Flow - Toàn bộ quy trình đặt hàng từ đầu đến cuối"

### Q2: "Coverage bao nhiêu %?"
**Trả lời:**
> "Em đạt được:
> - Authentication: 57.44% coverage
> - Product: 55.23% coverage
> - Overall: Khoảng 50-55% các file quan trọng
> Em tập trung test các case quan trọng nhất thay vì chạy theo % coverage"

### Q3: "Tại sao không 100% coverage?"
**Trả lời:**
> "Vì em focus vào test các flow và case quan trọng nhất:
> - Success cases: User có thể đăng ký, tạo sản phẩm, đặt hàng thành công
> - Error cases: Xử lý lỗi đúng (email trùng, thiếu dữ liệu, giá âm...)
> - Business logic: Tính phí ship đúng, assign drone, filter/pagination...
> Thay vì test tất cả code, em test những gì user thực sự dùng"

### Q4: "Integration test khác unit test thế nào?"
**Trả lời:**
> "Unit test: Test 1 function riêng lẻ với mock data
> Integration test: Test cả flow với database thật (in-memory)
> Ví dụ: Unit test chỉ test function register(), nhưng integration test sẽ test: login → create order → assign drone → payment"

---

## 🐛 XỬ LÝ KHI GẶP LỖI TRONG DEMO

### ❌ Lỗi: "Cannot find module 'jest'"
```powershell
npm install
```

### ❌ Lỗi: "MongoDB connection error"
- Do: mongodb-memory-server chưa cài
```powershell
npm install --save-dev mongodb-memory-server
```

### ❌ Lỗi: Tests timeout
- Tăng timeout:
```powershell
npm test -- --testTimeout=10000
```

### ❌ Lỗi: "Port already in use"
- Integration test dùng in-memory DB, không cần server chạy
- Tắt server (Ctrl+C) rồi chạy test lại

---

## 📦 FILES QUAN TRỌNG CHO DEMO

```
server_app/
├── __tests__/
│   ├── unit/
│   │   ├── authentication.test.js  ⭐ (6 tests)
│   │   └── product.test.js        ⭐⭐ (12 tests - DỄ GIẢI THÍCH)
│   ├── integration/
│   │   └── order-flow.demo.test.js ⭐⭐⭐ (6 tests - QUAN TRỌNG NHẤT)
│   ├── TEST_STRATEGY.md           📋 (Chiến lược test)
│   └── DEMO_GUIDE.md             📖 (File này)
├── jest.config.js                 ⚙️ (Config Jest)
└── package.json                   📦 (Scripts)
```

---

## ⏱️ THỜI GIAN CHẠY TỪNG TEST

| Test File | Tests | Thời gian | Coverage |
|-----------|-------|-----------|----------|
| authentication.test.js | 6 | ~2s | 57.44% |
| product.test.js | 12 | ~3s | 55.23% |
| order-flow.demo.test.js | 6 | ~5-7s | N/A |
| **TỔNG** | **24** | **~10-12s** | **~50%** |

---

## 🎓 TIPS ĐỂ ĐIỂM CAO

1. **Chạy tests TRƯỚC khi demo** để đảm bảo tất cả pass
2. **Mở 2 terminals** - 1 chạy test, 1 show code
3. **Giải thích LOGIC** thay vì chỉ show kết quả
4. **Nhấn mạnh BUSINESS LOGIC**:
   - Product CRUD với validation (giá không âm, required fields)
   - Tính phí ship dựa trên khoảng cách
   - Validate email/password đúng format
   - Filter và pagination cho danh sách sản phẩm
   - Auto-assign drone gần nhất
5. **Chuẩn bị trả lời** các câu hỏi về:
   - Tại sao chọn Jest?
   - Mock data như thế nào?
   - Integration test khác unit test?
   - Tại sao test Product thay vì Payment? (Vì logic đơn giản, dễ giải thích hơn)

---

## 🚀 QUICK START - CHỈ CẦN CHẠY

```powershell
cd d:\TESTFOOD\FOODFAST\server_app
npm test
```

**Xong! Tất cả 24 tests sẽ chạy trong ~10 giây!** ✅
