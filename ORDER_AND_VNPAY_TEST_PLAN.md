# 🧪 Test Plan: Đặt Hàng & Thanh Toán VNPay

## 📋 Tổng quan

**Mục đích**: Đảm bảo chức năng đặt hàng và thanh toán VNPay hoạt động đúng, an toàn và đáng tin cậy.

**Phạm vi**: 
- Quy trình đặt hàng từ giỏ hàng đến thanh toán
- Tích hợp thanh toán VNPay
- Xử lý callback và IPN từ VNPay
- Xử lý lỗi và các trường hợp đặc biệt

**Môi trường test**:
- Development: VNPay Sandbox
- Production: VNPay Production (sau khi test đầy đủ trên sandbox)

---

## 🎯 1. Test Cases: Đặt Hàng (Order Creation)

### 1.1 Tạo Đơn Hàng Thành Công

#### TC-001: Đặt hàng cơ bản với COD
**Tiền điều kiện**:
- User đã đăng nhập
- Giỏ hàng có ít nhất 1 sản phẩm
- Nhà hàng đang mở cửa

**Bước thực hiện**:
1. User điền đầy đủ thông tin giao hàng (tên, SĐT, địa chỉ)
2. Chọn phương thức thanh toán: COD
3. Xem lại thông tin đơn hàng (items, subtotal, delivery fee, discount, total)
4. Nhấn "Đặt hàng"

**Kết quả mong đợi**:
- ✅ Đơn hàng được tạo thành công với status = `pending`
- ✅ paymentStatus = `pending`
- ✅ paymentMethod = `COD`
- ✅ Thông tin giao hàng được lưu chính xác
- ✅ Tính phí ship chính xác dựa trên khoảng cách thực tế (routing)
- ✅ Tính tổng tiền đúng: subtotal - discount + deliveryFee
- ✅ Emit socket event `new-order` đến nhà hàng
- ✅ Điều hướng đến trang theo dõi đơn hàng
- ✅ Product soldCount được tăng lên

**API Endpoint**: `POST /api/orders`

**Payload mẫu**:
```json
{
  "items": [
    {
      "product": "65f1a2b3c4d5e6f7a8b9c0d1",
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

---

#### TC-002: Đặt hàng với voucher giảm giá
**Tiền điều kiện**:
- User đã đăng nhập
- Có voucher hợp lệ chưa sử dụng
- Đơn hàng đạt giá trị tối thiểu của voucher

**Bước thực hiện**:
1. Điền thông tin giao hàng
2. Nhập mã voucher (ví dụ: `GIAM20K`)
3. Kiểm tra discount được áp dụng
4. Chọn phương thức thanh toán
5. Đặt hàng

**Kết quả mong đợi**:
- ✅ Voucher được áp dụng thành công
- ✅ Discount được tính đúng (theo % hoặc số tiền cố định, có maxDiscount)
- ✅ `appliedVoucher` được lưu trong order
- ✅ VoucherUsage được tạo
- ✅ Voucher.usageCount được tăng lên
- ✅ Tổng tiền = subtotal - discount + deliveryFee
- ✅ User không thể sử dụng lại voucher đã dùng

**Test data**:
```javascript
// Voucher giảm 20%
{
  code: "GIAM20",
  discountType: "percentage",
  discountValue: 20,
  maxDiscount: 50000,
  minOrder: 100000,
  isActive: true,
  startDate: Date.now(),
  endDate: Date.now() + 7 days
}

// Voucher giảm cố định 30k
{
  code: "GIAM30K",
  discountType: "fixed",
  discountValue: 30000,
  minOrder: 150000,
  isActive: true,
  startDate: Date.now(),
  endDate: Date.now() + 7 days
}
```

---

#### TC-003: Đặt hàng với promotion sản phẩm
**Tiền điều kiện**:
- Có promotion active áp dụng cho category của sản phẩm
- Promotion còn trong thời gian hiệu lực

**Bước thực hiện**:
1. Thêm sản phẩm có promotion vào giỏ hàng
2. Kiểm tra giá đã giảm
3. Tiến hành đặt hàng

**Kết quả mong đợi**:
- ✅ Giá sản phẩm được tính sau promotion
- ✅ `appliedPromotion` được lưu trong item
- ✅ `appliedPromotions` (list) được lưu trong order
- ✅ Item.price = Item.originalPrice - discount
- ✅ Hiển thị rõ thông tin promotion (tên, % giảm giá, category)

---

#### TC-004: Tính phí giao hàng chính xác
**Tiền điều kiện**:
- Nhà hàng có tọa độ location hợp lệ
- Địa chỉ giao hàng có thể geocode được

**Test scenarios**:

**Scenario A**: Khoảng cách ≤ 2km
```
Input: 
  - Restaurant: (10.762622, 106.660172)
  - User: (10.773996, 106.657223) ~1.3km
Expected: deliveryFee = 15,000₫
```

**Scenario B**: Khoảng cách > 2km
```
Input:
  - Restaurant: (10.762622, 106.660172)
  - User: (10.801234, 106.720567) ~6km
Expected: deliveryFee = 15,000 + (6-2)*5,000 = 35,000₫
```

**Kết quả mong đợi**:
- ✅ Sử dụng OSRM routing API để tính khoảng cách thực tế
- ✅ Fallback sang Haversine + 35% nếu routing API lỗi
- ✅ Công thức: 15k cho 2km đầu, 5k/km sau đó (làm tròn lên)
- ✅ Lưu `distanceKm`, `estimatedDuration`, `routingMethod`, `routeGeometry`
- ✅ Hiển thị khoảng cách và phí ship rõ ràng cho user

---

### 1.2 Validation & Error Handling

#### TC-005: Đơn hàng thiếu thông tin bắt buộc
**Test cases**:
- ❌ Items rỗng → "No order items"
- ❌ Thiếu tên người nhận → "Delivery information is required"
- ❌ Thiếu SĐT → "Delivery information is required"
- ❌ Thiếu địa chỉ → "Delivery information is required"
- ❌ SĐT không hợp lệ (< 10 số) → Frontend validation error
- ❌ Product không tồn tại → "Product not found: {id}"

---

#### TC-006: Nhà hàng đóng cửa
**Bước thực hiện**:
1. Restaurant có `isOpen = false`
2. User cố đặt món từ nhà hàng này

**Kết quả mong đợi**:
- ❌ Status 400
- ❌ Error: "Nhà hàng hiện đang đóng cửa, không thể đặt hàng"

---

#### TC-007: Voucher không hợp lệ
**Test scenarios**:
- ❌ Voucher không tồn tại → "Mã voucher không tồn tại"
- ❌ Voucher hết hạn → "Voucher không hợp lệ hoặc đã hết hạn"
- ❌ Voucher đã sử dụng → "Bạn đã sử dụng voucher này rồi"
- ❌ Đơn hàng < minOrder → "Đơn hàng tối thiểu {amount}đ"

---

#### TC-008: Không thể geocode địa chỉ
**Bước thực hiện**:
1. Nhập địa chỉ không hợp lệ/không tìm thấy

**Kết quả mong đợi**:
- ❌ Status 400
- ❌ Error: "Could not determine your location from the address to calculate the delivery fee."

---

## 💳 2. Test Cases: Thanh Toán VNPay

### 2.1 Tạo Payment URL

#### TC-009: Tạo VNPay payment URL thành công
**Tiền điều kiện**:
- User đã đăng nhập
- Order đã được tạo với status = `pending`
- User là owner của order

**Bước thực hiện**:
1. User chọn thanh toán VNPay
2. Gọi API `POST /api/payment/vnpay/create`

**Request payload**:
```json
{
  "orderId": "65f1a2b3c4d5e6f7a8b9c0d1",
  "amount": 150000,
  "orderInfo": "Thanh toan don hang #ORDER123",
  "bankCode": "" // optional
}
```

**Kết quả mong đợi**:
- ✅ Status 200
- ✅ Response chứa `paymentUrl` hợp lệ
- ✅ Response chứa `transactionId` (format: DDHHmmss)
- ✅ Order.paymentInfo được cập nhật:
  ```json
  {
    "method": "vnpay",
    "transactionId": "12123456"
  }
  ```
- ✅ paymentUrl chứa các params đúng:
  - vnp_TmnCode
  - vnp_Amount = amount * 100
  - vnp_OrderInfo
  - vnp_ReturnUrl
  - vnp_SecureHash (signature hợp lệ)

**API Endpoint**: `POST /api/payment/vnpay/create`

---

#### TC-010: Tạo payment URL - Order không tồn tại
**Bước thực hiện**:
1. Gọi API với orderId không tồn tại

**Kết quả mong đợi**:
- ❌ Status 404
- ❌ Error: "Order not found"

---

#### TC-011: Tạo payment URL - Không phải owner
**Bước thực hiện**:
1. User A đăng nhập
2. Cố tạo payment cho order của User B

**Kết quả mong đợi**:
- ❌ Status 403
- ❌ Error: "Not authorized"

---

### 2.2 VNPay Return (Callback từ VNPay)

#### TC-012: Thanh toán thành công (vnp_ResponseCode = 00)
**Tiền điều kiện**:
- Order đã tạo payment URL
- User hoàn tất thanh toán trên VNPay

**Bước thực hiện**:
1. VNPay redirect về returnUrl với params:
   ```
   vnp_ResponseCode=00
   vnp_TxnRef=12123456
   vnp_Amount=15000000
   vnp_SecureHash=xxx
   ```

**Kết quả mong đợi**:
- ✅ Verify signature thành công
- ✅ Order.paymentStatus = `paid`
- ✅ Order.paidAt = current timestamp
- ✅ Order.paymentInfo.errorMessage = undefined
- ✅ Emit socket event `order:status-updated` với paymentStatus
- ✅ Frontend hiển thị "Thanh toán thành công"
- ✅ Điều hướng đến trang order tracking

**API Endpoint**: `GET /api/payment/vnpay/return`

**Response**:
```json
{
  "success": true,
  "code": "00",
  "message": "Payment successful",
  "data": {
    "orderId": "65f1a2b3c4d5e6f7a8b9c0d1",
    "transactionId": "12123456",
    "amount": 150000,
    "responseCode": "00"
  }
}
```

---

#### TC-013: Thanh toán thất bại (các mã lỗi phổ biến)

**Scenario A**: User hủy giao dịch (vnp_ResponseCode = 24)
```
Params: vnp_ResponseCode=24
Expected:
  - Order.status = cancelled
  - Order.paymentStatus = failed
  - Order.paymentInfo.errorCode = "24"
  - Order.paymentInfo.errorMessage = "Giao dịch không thành công do: Khách hàng hủy giao dịch"
  - Order.cancelledAt = current timestamp
```

**Scenario B**: Tài khoản không đủ số dư (vnp_ResponseCode = 51)
```
Params: vnp_ResponseCode=51
Expected:
  - Order.status = cancelled
  - Order.paymentStatus = failed
  - Order.paymentInfo.errorMessage = "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch."
```

**Scenario C**: Ngân hàng bảo trì (vnp_ResponseCode = 75)
```
Params: vnp_ResponseCode=75
Expected:
  - Order.status = cancelled
  - Order.paymentStatus = failed
  - Order.paymentInfo.errorMessage = "Ngân hàng thanh toán đang bảo trì."
```

**Scenario D**: Nhập sai OTP (vnp_ResponseCode = 13)
```
Params: vnp_ResponseCode=13
Expected:
  - Order.status = cancelled
  - Order.paymentStatus = failed
  - Order.paymentInfo.errorMessage = "Giao dịch không thành công do: Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch."
```

**Kết quả mong đợi chung**:
- ✅ Order được hủy (status = cancelled)
- ✅ paymentStatus = failed
- ✅ Lưu chi tiết lỗi vào paymentInfo
- ✅ Emit socket event thông báo lỗi
- ✅ Frontend hiển thị message lỗi rõ ràng
- ✅ Rollback voucher usage (nếu có)
- ✅ Giảm product soldCount

---

#### TC-014: VNPay Return - Invalid signature
**Bước thực hiện**:
1. Thay đổi vnp_SecureHash hoặc params

**Kết quả mong đợi**:
- ❌ Status 400
- ❌ Response: `{ success: false, message: "Invalid signature", code: "97" }`

---

#### TC-015: VNPay Return - Order không tồn tại
**Bước thực hiện**:
1. vnp_TxnRef không match với bất kỳ order nào

**Kết quả mong đợi**:
- ❌ Status 404
- ❌ Response: `{ success: false, message: "Order not found", code: "01" }`

---

### 2.3 VNPay IPN (Instant Payment Notification)

#### TC-016: IPN - Thanh toán thành công
**Tiền điều kiện**:
- Order có paymentStatus = `pending`
- Signature hợp lệ
- Amount khớp với order.totalAmount

**Bước thực hiện**:
1. VNPay gửi GET request đến IPN URL với params

**Kết quả mong đợi**:
- ✅ Verify signature thành công
- ✅ Order.paymentStatus = `paid`
- ✅ Order.paidAt = timestamp
- ✅ Response: `{ RspCode: "00", Message: "Success" }`
- ✅ Emit socket event update

**API Endpoint**: `GET /api/payment/vnpay/ipn`

---

#### TC-017: IPN - Amount không khớp
**Bước thực hiện**:
1. vnp_Amount / 100 ≠ order.totalAmount

**Kết quả mong đợi**:
- ❌ Order không được cập nhật
- ❌ Response: `{ RspCode: "04", Message: "Amount invalid" }`

---

#### TC-018: IPN - Order không tồn tại
**Bước thực hiện**:
1. vnp_TxnRef không tồn tại trong DB

**Kết quả mong đợi**:
- ❌ Response: `{ RspCode: "01", Message: "Order not found" }`

---

#### TC-019: IPN - Order đã được cập nhật trước đó
**Bước thực hiện**:
1. IPN được gọi 2 lần cho cùng 1 order
2. Order.paymentStatus đã là `paid` hoặc `failed`

**Kết quả mong đợi**:
- ⚠️ Response: `{ RspCode: "02", Message: "This order has been updated to the payment status" }`
- ⚠️ Không cập nhật DB nữa (idempotency)

---

#### TC-020: IPN - Invalid signature
**Bước thực hiện**:
1. vnp_SecureHash không match

**Kết quả mong đợi**:
- ❌ Response: `{ RspCode: "97", Message: "Checksum failed" }`

---

### 2.4 Query Transaction (Tra cứu giao dịch)

#### TC-021: Query transaction thành công
**Tiền điều kiện**:
- User đã đăng nhập
- Có transactionId và transDate

**Request**:
```json
{
  "orderId": "12123456",
  "transDate": "20250112123456"
}
```

**Kết quả mong đợi**:
- ✅ Status 200
- ✅ Response chứa data object với vnp_SecureHash hợp lệ
- ✅ Message: "Query data prepared. Send to VNPay API."

**API Endpoint**: `POST /api/payment/vnpay/querydr`

---

#### TC-022: Query transaction - Không có token
**Kết quả mong đợi**:
- ❌ Status 401
- ❌ Error: "Not authorized"

---

### 2.5 Refund (Hoàn tiền)

#### TC-023: Prepare refund data thành công
**Tiền điều kiện**:
- User đã đăng nhập
- Order đã thanh toán (paymentStatus = paid)

**Request**:
```json
{
  "orderId": "12123456",
  "transDate": "20250112123456",
  "amount": 150000,
  "transType": "02" // 02: Hoàn toàn phần, 03: Hoàn một phần
}
```

**Kết quả mong đợi**:
- ✅ Status 200
- ✅ Response chứa refund data với vnp_SecureHash
- ✅ Message: "Refund data prepared. Send to VNPay API."

**API Endpoint**: `POST /api/payment/vnpay/refund`

---

#### TC-024: Refund - Không có quyền
**Kết quả mong đợi**:
- ❌ Status 401
- ❌ Error: "Not authorized"

---

### 2.6 Get Payment Info

#### TC-025: Lấy thông tin thanh toán - Owner
**Tiền điều kiện**:
- User là owner của order

**Kết quả mong đợi**:
- ✅ Status 200
- ✅ Response chứa:
  ```json
  {
    "success": true,
    "data": {
      "paymentMethod": "vnpay",
      "paymentStatus": "paid",
      "paymentInfo": {
        "method": "vnpay",
        "transactionId": "12123456"
      },
      "totalAmount": 150000,
      "paidAt": "2025-01-12T12:34:56.000Z"
    }
  }
  ```

**API Endpoint**: `GET /api/payment/:orderId`

---

#### TC-026: Lấy thông tin thanh toán - Admin
**Tiền điều kiện**:
- User có role = `admin`

**Kết quả mong đợi**:
- ✅ Admin có thể xem payment info của mọi order

---

#### TC-027: Lấy thông tin thanh toán - Không phải owner
**Tiền điều kiện**:
- User không phải owner và không phải admin

**Kết quả mong đợi**:
- ❌ Status 403
- ❌ Error: "Not authorized"

---

#### TC-028: Lấy thông tin thanh toán - Order không tồn tại
**Kết quả mong đợi**:
- ❌ Status 404
- ❌ Error: "Order not found"

---

## 🔄 3. Test Cases: Luồng Tích Hợp (Integration Flow)

### 3.1 Happy Path: Đặt hàng + Thanh toán VNPay thành công

**Bước thực hiện**:
1. User thêm món vào giỏ hàng
2. Đi đến trang checkout
3. Điền thông tin giao hàng
4. Nhập voucher (optional)
5. Chọn VNPay làm phương thức thanh toán
6. Review order: items, subtotal, discount, delivery fee, total
7. Nhấn "Đặt hàng"
8. → API tạo order thành công
9. Frontend gọi API tạo VNPay payment URL
10. Redirect user đến VNPay
11. User nhập thông tin thẻ và xác thực OTP
12. VNPay redirect về returnUrl với responseCode = 00
13. Frontend verify payment
14. Hiển thị "Thanh toán thành công"
15. Điều hướng đến order tracking page

**Kết quả mong đợi**:
- ✅ Order được tạo với paymentMethod = vnpay, status = pending
- ✅ Payment URL hợp lệ
- ✅ Sau thanh toán: paymentStatus = paid
- ✅ Socket notification đến restaurant
- ✅ User có thể track order real-time
- ✅ Admin thấy order mới trong dashboard
- ✅ Restaurant app nhận notification

---

### 3.2 Sad Path: User hủy thanh toán VNPay

**Bước thực hiện**:
1-10. (giống happy path)
11. User nhấn "Hủy" trên trang VNPay
12. VNPay redirect về với responseCode = 24
13. Frontend verify payment
14. Hiển thị "Thanh toán thất bại: Khách hàng hủy giao dịch"

**Kết quả mong đợi**:
- ✅ Order.status = cancelled
- ✅ Order.paymentStatus = failed
- ✅ Lưu error message rõ ràng
- ✅ Voucher được rollback (nếu có)
- ✅ Product soldCount giảm về
- ✅ Socket notification hủy đơn

---

### 3.3 Edge Case: Timeout thanh toán

**Bước thực hiện**:
1. User tạo order + payment URL
2. Mở VNPay payment page
3. Để quá 15 phút không thanh toán

**Kết quả mong đợi**:
- ✅ VNPay trả về responseCode = 11 (hết hạn)
- ✅ Order.status = cancelled
- ✅ Error: "Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch."

---

### 3.4 Race Condition: Return và IPN cùng cập nhật

**Bước thực hiện**:
1. User thanh toán thành công
2. VNPay gửi return (redirect) và IPN (server callback) gần như đồng thời

**Kết quả mong đợi**:
- ✅ Request đầu tiên cập nhật order thành công
- ✅ Request thứ hai nhận được response idempotent (RspCode: 02 cho IPN)
- ✅ Không có duplicate update
- ✅ Không emit duplicate socket event

---

## 🧩 4. Test Cases: Các Tính Năng Đặc Biệt

### 4.1 Multiple Items từ cùng nhà hàng

**Bước thực hiện**:
1. Thêm nhiều món từ cùng 1 nhà hàng
2. Một số món có promotion, một số không
3. Đặt hàng

**Kết quả mong đợi**:
- ✅ Tính giá đúng cho từng món (có/không promotion)
- ✅ Subtotal = tổng giá các món sau discount
- ✅ appliedPromotions list chứa tất cả promotion đã áp dụng
- ✅ Mỗi item có appliedDiscount riêng

---

### 4.2 Validation giá từ client vs server

**Bước thực hiện**:
1. Client tính tổng tiền: clientCalculatedTotal
2. Gửi lên server
3. Server tính lại và so sánh

**Test scenarios**:
- ✅ Giá khớp (sai lệch ≤ 1₫ do làm tròn) → Accept
- ⚠️ Giá sai lệch > 1₫ → Log warning nhưng vẫn dùng giá server
- ✅ Luôn ưu tiên giá từ server để đảm bảo an toàn

---

### 4.3 Socket Real-time Updates

**Bước thực hiện**:
1. Restaurant app join room `restaurant-{restaurantId}`
2. User đặt hàng
3. Kiểm tra notification

**Kết quả mong đợi**:
- ✅ Restaurant nhận event `new-order` với đầy đủ thông tin
- ✅ Chỉ restaurant có món trong order mới nhận notification
- ✅ Event chứa: orderId, orderNumber, items, subtotal, totalAmount, user info

**Payment update events**:
- ✅ `order:status-updated` khi paymentStatus thay đổi
- ✅ `order:cancelled` nếu thanh toán thất bại
- ✅ Cả user và restaurant đều nhận update

---

## 🔒 5. Test Cases: Security & Authorization

### 5.1 Authentication

#### TC-029: Tạo order - Không đăng nhập
**Kết quả mong đợi**:
- ❌ Status 401
- ❌ Error: "Not authorized"

---

#### TC-030: Tạo VNPay payment - Không đăng nhập
**Kết quả mong đợi**:
- ❌ Status 401
- ❌ Error: "Not authorized"

---

### 5.2 Authorization

#### TC-031: Tạo payment cho order của người khác
**Kết quả mong đợi**:
- ❌ Status 403
- ❌ Error: "Not authorized"

---

#### TC-032: Xem payment info của order người khác
**Kết quả mong đợi**:
- ❌ Status 403 (nếu không phải admin)
- ✅ Status 200 (nếu là admin)

---

### 5.3 Signature Verification

#### TC-033: Giả mạo vnp_SecureHash
**Bước thực hiện**:
1. Thay đổi vnp_SecureHash trong return URL
2. Hoặc thay đổi params nhưng giữ nguyên hash

**Kết quả mong đợi**:
- ❌ Request bị reject
- ❌ Response: "Invalid signature" hoặc "Checksum failed"
- ❌ Order không được cập nhật

---

#### TC-034: Replay attack prevention
**Bước thực hiện**:
1. Capture 1 request return/IPN thành công
2. Replay request đó nhiều lần

**Kết quả mong đợi**:
- ✅ Request đầu tiên cập nhật order
- ✅ Các request sau trả về "already updated" (idempotent)
- ✅ Không có side effect (duplicate payment, duplicate notification)

---

## 📊 6. Performance & Load Testing

### 6.1 Response Time

**Yêu cầu**:
- ✅ POST /api/orders: < 2s (bao gồm geocoding + routing)
- ✅ POST /api/payment/vnpay/create: < 1s
- ✅ GET /api/payment/vnpay/return: < 500ms
- ✅ GET /api/payment/vnpay/ipn: < 300ms (critical - VNPay có timeout)

---

### 6.2 Concurrent Orders

**Test scenario**:
- 50 users đồng thời đặt hàng
- 100 orders/phút

**Kết quả mong đợi**:
- ✅ Tất cả orders được tạo thành công
- ✅ Không có race condition (voucher usage, soldCount)
- ✅ Database transaction đảm bảo consistency

---

### 6.3 VNPay API Rate Limit

**Test scenario**:
- 1000 payment URLs được tạo trong 1 phút

**Kết quả mong đợi**:
- ✅ Không vượt quá rate limit của VNPay
- ✅ Implement retry logic nếu bị rate limit
- ✅ Error handling graceful

---

## 🧪 7. Test Execution Strategy

### 7.1 Unit Tests

**Mục tiêu**: Test từng function riêng lẻ

**Tools**: Jest

**Coverage target**: ≥ 80%

**Priority tests**:
- ✅ `calculateDeliveryFee()` - TC-004
- ✅ `processRefund()` - logic hoàn tiền
- ✅ Voucher validation
- ✅ Signature generation/verification
- ✅ Price calculation với promotions

**Chạy**:
```bash
npm test -- server_app/__tests__/unit/
```

---

### 7.2 Integration Tests

**Mục tiêu**: Test tích hợp giữa các module

**Tools**: Jest + Supertest + mongodb-memory-server

**Priority tests**:
- ✅ Full order creation flow - TC-001, TC-002, TC-003
- ✅ VNPay return - TC-012, TC-013
- ✅ VNPay IPN - TC-016, TC-017, TC-018
- ✅ Authorization checks - TC-031, TC-032

**Chạy**:
```bash
npm test -- server_app/__tests__/integration/
```

---

### 7.3 E2E Tests

**Mục tiêu**: Test toàn bộ user journey từ UI

**Tools**: Cypress

**Priority flows**:
- ✅ Happy path: Đặt hàng + VNPay success - Section 3.1
- ✅ Sad path: VNPay cancelled - Section 3.2
- ✅ Order với voucher - TC-002

**Chạy**:
```bash
npm run cypress:open
```

**Test files**:
```
cypress/e2e/
  order-creation.cy.js
  vnpay-payment.cy.js
  order-with-voucher.cy.js
```

---

### 7.4 Manual Testing

**Sandbox Testing**:
1. VNPay Sandbox environment
2. Test cards cung cấp bởi VNPay
3. Test tất cả response codes (00, 24, 51, 75, etc.)

**Checklist**:
- [ ] Test trên multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test trên mobile devices (iOS, Android)
- [ ] Test với network slow 3G
- [ ] Test offline → online scenario
- [ ] Test với ad blockers enabled
- [ ] Kiểm tra console logs (không có error)
- [ ] Kiểm tra socket connections (DevTools → Network → WS)

---

## 📝 8. Test Data Setup

### 8.1 Seeding Data

**Users**:
```javascript
{
  name: "Test Customer",
  email: "customer@test.com",
  phone: "0901234567",
  password: "Test1234!",
  role: "user"
}
```

**Restaurants**:
```javascript
{
  name: "Test Restaurant",
  address: "123 Test St, Q1, TP.HCM",
  location: {
    type: "Point",
    coordinates: [106.660172, 10.762622]
  },
  isOpen: true
}
```

**Products**:
```javascript
{
  name: "Test Burger",
  price: 50000,
  restaurant: restaurantId,
  category: categoryId,
  available: true,
  discount: 10 // 10% off
}
```

**Promotions**:
```javascript
{
  name: "Happy Hour 20%",
  restaurant: restaurantId,
  category: categoryId,
  discountPercent: 20,
  startDate: new Date(),
  endDate: new Date(Date.now() + 7*24*60*60*1000),
  isActive: true
}
```

**Vouchers**:
```javascript
[
  {
    code: "GIAM20",
    name: "Giảm 20%",
    restaurant: restaurantId,
    discountType: "percentage",
    discountValue: 20,
    maxDiscount: 50000,
    minOrder: 100000,
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7*24*60*60*1000)
  },
  {
    code: "GIAM30K",
    name: "Giảm 30k",
    restaurant: restaurantId,
    discountType: "fixed",
    discountValue: 30000,
    minOrder: 150000,
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7*24*60*60*1000)
  }
]
```

---

### 8.2 VNPay Sandbox Test Cards

**Thẻ nội địa (Test thành công)**:
```
Ngân hàng: NCB
Số thẻ: 9704198526191432198
Tên chủ thẻ: NGUYEN VAN A
Ngày phát hành: 07/15
Mật khẩu OTP: 123456
```

**Test lỗi**:
- Để test responseCode = 24 (hủy): Nhấn "Hủy giao dịch" trên VNPay
- Để test responseCode = 51 (không đủ tiền): Nhập số thẻ: 9704198526191432198 với số tiền > hạn mức

---

## 🐛 9. Bug Report Template

Khi phát hiện bug, report theo format:

```markdown
## Bug #XXX: [Tiêu đề ngắn gọn]

**Mức độ**: Critical / High / Medium / Low

**Môi trường**:
- OS: Windows 11 / macOS / Linux
- Browser: Chrome 120 / Firefox 121 / Safari 17
- API: Development / Staging / Production

**Test Case**: TC-XXX

**Steps to Reproduce**:
1. ...
2. ...
3. ...

**Expected Result**:
- ...

**Actual Result**:
- ...

**Screenshots/Logs**:
[Attach nếu có]

**Additional Info**:
- Request payload: {...}
- Response: {...}
- Console errors: ...
```

---

## ✅ 10. Definition of Done (DoD)

**1 feature được coi là DONE khi**:
- ✅ Tất cả test cases PASS
- ✅ Code coverage ≥ 80%
- ✅ Không có critical/high bugs
- ✅ Performance đáp ứng yêu cầu (Section 6.1)
- ✅ Security tests PASS (Section 5)
- ✅ E2E tests PASS trên 3 browsers
- ✅ Manual testing checklist hoàn thành
- ✅ Code review approved
- ✅ Documentation cập nhật
- ✅ Deployed lên staging và test thành công

---

## 📅 11. Test Schedule

**Giai đoạn 1: Unit Tests** (2 ngày)
- Day 1: Order creation logic
- Day 2: Payment logic + Validation

**Giai đoạn 2: Integration Tests** (3 ngày)
- Day 1: Order API endpoints
- Day 2: VNPay return/IPN
- Day 3: Authorization & Security

**Giai đoạn 3: E2E Tests** (2 ngày)
- Day 1: Setup Cypress + Happy path
- Day 2: Error scenarios + Edge cases

**Giai đoạn 4: Manual Testing** (2 ngày)
- Day 1: VNPay Sandbox testing (all response codes)
- Day 2: Cross-browser + Mobile testing

**Giai đoạn 5: Bug Fixing** (2 ngày)
- Fix bugs phát hiện từ testing

**Giai đoạn 6: Regression Testing** (1 ngày)
- Re-run tất cả tests sau bug fixes

**Total**: 12 ngày

---

## 📞 12. Contacts & Resources

**VNPay Support**:
- Email: support@vnpay.vn
- Hotline: 1900 5555 88
- Docs: https://sandbox.vnpayment.vn/apis/docs/

**Internal Team**:
- Backend Lead: [Tên]
- Frontend Lead: [Tên]
- QA Lead: [Tên]
- DevOps: [Tên]

**Useful Links**:
- API Documentation: `/server_app/API_ENDPOINTS.md`
- VNPay Integration Guide: `/VNPAY_ERROR_HANDLING_SUMMARY.md`
- Test Results: `/TEST_RESULTS_SUMMARY.md`

---

## 📈 13. Success Metrics

**Mục tiêu**:
- ✅ Test coverage ≥ 80%
- ✅ ≥ 95% test cases PASS
- ✅ 0 critical bugs in production
- ✅ VNPay transaction success rate ≥ 98%
- ✅ Average order creation time < 2s
- ✅ Payment confirmation time < 5s

**Tracking**:
- Daily test execution report
- Bug tracking board (Jira/Trello)
- Weekly metrics review meeting

---

## 🎉 Kết Luận

Test plan này cover toàn diện các khía cạnh của chức năng đặt hàng và thanh toán VNPay:
- ✅ 34+ detailed test cases
- ✅ Happy paths & Error scenarios
- ✅ Security & Performance testing
- ✅ Integration flows
- ✅ Clear execution strategy

**Next Steps**:
1. Review test plan với team
2. Setup test environment (VNPay Sandbox)
3. Implement unit tests
4. Implement integration tests
5. Setup Cypress E2E tests
6. Execute manual testing
7. Track bugs & fix
8. Deploy to production

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-12  
**Author**: GitHub Copilot  
**Status**: Ready for Review
