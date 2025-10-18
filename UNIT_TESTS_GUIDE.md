# 🧪 UNIT TESTS - HƯỚNG DẪN TRÌNH BÀY

## 📊 KẾT QUẢ TESTS

```bash
✅ Test Suites: 5 passed, 5 total
✅ Tests:       45 passed, 45 total
⚡ Time:        2.191s
```

---

## 🎯 CHỨC NĂNG ĐÃ TEST

### 1️⃣ **Distance Calculation** ⭐⭐⭐⭐⭐
**File:** `__tests__/unit/distance.test.js`

**Mô tả:** Tính khoảng cách giữa 2 điểm GPS bằng công thức Haversine

**Test Cases (4):**
- ✅ Tính đúng khoảng cách giữa Landmark 81 và Chợ Bến Thành (~3.5km)
- ✅ Trả về 0 khi 2 điểm trùng nhau
- ✅ Xử lý tọa độ âm (Sydney - Melbourne ~713km)
- ✅ Tính khoảng cách nhỏ (<1km)

**Tại sao quan trọng:**  
Dùng để tìm drone gần nhất cho mỗi đơn hàng → Tối ưu thời gian giao hàng

---

### 2️⃣ **Drone Assignment Logic** ⭐⭐⭐⭐⭐
**File:** `__tests__/unit/droneAssignment.test.js`

**Mô tả:** Chọn drone tốt nhất để giao hàng

**Test Cases (5):**
- ✅ Chọn drone GẦN NHẤT và AVAILABLE
- ✅ Bỏ qua drone đang BUSY
- ✅ Bỏ qua drone có PIN YẾU (<30%)
- ❌ Throw error khi KHÔNG CÓ drone available
- ❌ Throw error khi TẤT CẢ drone pin yếu

**Business Rules:**
```javascript
Priority Order:
1. Status = 'available'
2. Battery >= 30%
3. Closest distance
```

**Tại sao quan trọng:**  
Core business logic - Đảm bảo giao hàng thành công

---

### 3️⃣ **Order Calculation** ⭐⭐⭐⭐⭐
**File:** `__tests__/unit/orderCalculation.test.js`

**Mô tả:** Tính tổng tiền đơn hàng với voucher discount

**Test Cases (10):**
- ✅ Tính đúng: Subtotal + Delivery Fee
- ✅ Voucher giảm 20%
- ✅ Voucher 50% nhưng max giảm 30k
- ✅ Voucher giảm cố định 25k
- ❌ Reject voucher hết hạn
- ❌ Reject voucher chưa bắt đầu
- ❌ Reject khi đơn hàng < min order
- ❌ Reject voucher bị vô hiệu hóa
- ✅ Không âm khi discount > subtotal
- ❌ Reject giá trị âm

**Example:**
```javascript
Subtotal:  200,000 VND
Delivery:   15,000 VND
Voucher:    -50,000 VND (20% max 50k)
-----------------------
Total:     165,000 VND ✅
```

**Tại sao quan trọng:**  
Đảm bảo tính tiền chính xác → Không mất revenue

---

### 4️⃣ **Input Validation** ⭐⭐⭐⭐
**File:** `__tests__/unit/validation.test.js`

**Mô tả:** Validate dữ liệu đầu vào

**Test Cases (17):**

**Email (2 tests):**
- ✅ `user@example.com` → Valid
- ❌ `invalid@` → Reject

**Phone (2 tests):**
- ✅ `0901234567` → Valid (VN format)
- ❌ `123456789` → Reject (không đủ 10 số)

**GPS Coordinates (3 tests):**
- ✅ `(10.762, 106.660)` → Valid
- ❌ `(91, 0)` → Reject (lat > 90)

**Order Items (5 tests):**
- ✅ Valid product + quantity
- ❌ Reject: Empty array, Missing ID, Qty ≤ 0, Qty > 99

**Delivery Info (5 tests):**
- ✅ Valid name, phone, address
- ❌ Reject: Tên < 2 ký tự, SĐT sai, Địa chỉ < 10 ký tự

**Tại sao quan trọng:**  
Bảo vệ database, tránh bad data, security

---

### 5️⃣ **Authentication (JWT)** ⭐⭐⭐⭐⭐
**File:** `__tests__/unit/authentication.test.js`

**Mô tả:** Generate & verify JWT token

**Test Cases (9):**
- ✅ Generate token thành công
- ✅ Token chứa đúng user ID + role
- ✅ Verify token hợp lệ
- ✅ Extract user từ token
- ❌ Reject khi thiếu user ID
- ❌ Reject token không hợp lệ
- ❌ Reject khi thiếu token
- ✅ Token có expiration (7 days)
- ✅ Default role = 'user'

**JWT Structure:**
```javascript
{
  "id": "507f1f77bcf86cd799439011",
  "role": "admin",
  "iat": 1729238400,
  "exp": 1729843200
}
```

**Tại sao quan trọng:**  
Bảo mật hệ thống, xác thực người dùng

---

## 🚀 CÁCH CHẠY TESTS

### Chạy tất cả tests:
```bash
cd server_app
npm test
```

### Chạy với watch mode (auto re-run khi code thay đổi):
```bash
npm run test:watch
```

### Chạy test cụ thể:
```bash
npm test distance.test.js
```

---

## 📈 TEST OUTPUT

```
PASS  __tests__/unit/distance.test.js
  📏 Distance Calculation - UNIT TEST
    ✓ ✅ Tính đúng khoảng cách giữa 2 điểm (2 ms)
    ✓ ✅ Trả về 0 khi 2 điểm trùng nhau (1 ms)
    ✓ ✅ Xử lý tọa độ âm (Nam bán cầu) (4 ms)
    ✓ ✅ Tính khoảng cách nhỏ (< 1km) (1 ms)

PASS  __tests__/unit/authentication.test.js
  🔐 Authentication (JWT) - UNIT TEST
    ✓ ✅ GENERATE token thành công (4 ms)
    ✓ ✅ TOKEN chứa ĐÚNG thông tin user (4 ms)
    ... (9 tests total)

PASS  __tests__/unit/validation.test.js
  ✅ Input Validation - UNIT TEST
    📧 Email Validation
      ✓ ✅ ACCEPT email hợp lệ (1 ms)
      ✓ ❌ REJECT email không hợp lệ (1 ms)
    ... (17 tests total)

PASS  __tests__/unit/orderCalculation.test.js
  💰 Order Calculation - UNIT TEST
    ✓ ✅ Tính ĐÚNG tổng tiền KHÔNG CÓ voucher (2 ms)
    ✓ ✅ Áp dụng voucher PHẦN TRĂM
    ... (10 tests total)

PASS  __tests__/unit/droneAssignment.test.js
  🚁 Drone Assignment Logic - UNIT TEST
    ✓ ✅ Chọn drone GẦN NHẤT và AVAILABLE (1 ms)
    ✓ ✅ BỎ QUA drone đang BUSY
    ... (5 tests total)

Test Suites: 5 passed, 5 total
Tests:       45 passed, 45 total
Time:        2.191s
```

---

## 💡 ĐIỂM MẠNH CỦA BỘ TESTS NÀY

✅ **Tập trung vào Critical Features**  
Chỉ test những chức năng quan trọng nhất

✅ **Chạy Nhanh (< 3 giây)**  
Không cần database, API, server

✅ **Dễ Hiểu, Dễ Trình Bày**  
Tên test bằng tiếng Việt, có emoji

✅ **Coverage Tốt**  
Test cả happy path và error cases

✅ **Độc Lập**  
Mỗi test chạy riêng, không phụ thuộc nhau

✅ **Maintainable**  
Code sạch, dễ sửa, dễ mở rộng

---

## 🎓 CÂU HỎI TRÌNH BÀY THƯỜNG GẶP

**Q: Tại sao không test tất cả functions?**  
A: Unit test nên tập trung vào **business logic critical**, không cần test code đơn giản (getters/setters, config).

**Q: Tại sao không connect database thật?**  
A: Đó là **Integration Test**. Unit test phải **độc lập**, chạy nhanh, không phụ thuộc external services.

**Q: 45 tests có đủ không?**  
A: Đủ cho demo/presentation. Production thường cần 100-300+ tests nhưng cho đồ án này đã cover đủ critical features.

**Q: Coverage 0% ở Controllers là sao?**  
A: Đúng! Vì chưa test Controllers thật. Đây là **Pure Unit Tests** (test logic thuần). Để test Controllers cần **Integration Tests** với mock DB.

---

## 📚 THAM KHẢO

- **Jest Documentation:** https://jestjs.io/
- **Testing Best Practices:** https://testingjavascript.com/
- **TDD (Test-Driven Development):** Write tests BEFORE code

---

## 🏆 KẾT LUẬN

Bộ Unit Tests này:
- ✅ **Đủ để trình bày** cho đồ án tốt nghiệp
- ✅ **Chứng minh hiểu** về testing & quality assurance
- ✅ **Professional approach** - theo chuẩn industry
- ✅ **Easy to demo** - chạy nhanh, output đẹp

**"Code without tests is broken by design."** - Jacob Kaplan-Moss
