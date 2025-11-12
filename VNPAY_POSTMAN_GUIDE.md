# 📮 Hướng Dẫn Test API VNPay với Postman

## 📥 Import Postman Collection

### Bước 1: Import Collection
1. Mở Postman
2. Click **Import** (góc trên bên trái)
3. Chọn file `VNPAY_POSTMAN_COLLECTION.json`
4. Click **Import**

### **Bước 2: Cấu hình base_url**
```
✅ Đã set sẵn: http://localhost:5000
Nếu server của bạn chạy ở port khác, có thể thay đổi:
1. Click vào collection "FOODFAST - Order & VNPay Payment"
2. Tab "Variables"
3. Update base_url theo server của bạn
```

Collection đã có sẵn các variables, nhưng bạn cần cấu hình `base_url`:

**Trong Collection Variables:**
- `base_url`: `http://localhost:5000` (đã set sẵn)
- `auth_token`: (tự động set sau khi login)
- `order_id`: (tự động set sau khi tạo order)
- `restaurant_id`: (tự động set khi get restaurants)
- `product_id`: (tự động set khi get products)
- `transaction_id`: (tự động set khi tạo VNPay payment)

---

## 🚀 Quy Trình Test Đầy Đủ

### Phase 1: Setup Test Data

#### 1.1. Get Restaurants
```
GET {{base_url}}/restaurants
```
**Mục đích**: Lấy danh sách nhà hàng và tự động lưu `restaurant_id` đầu tiên

**Response mẫu**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Test Restaurant",
      "address": "123 Test St",
      "isOpen": true
    }
  ]
}
```

#### 1.2. Get Products by Restaurant
```
GET {{base_url}}/products?restaurant={{restaurant_id}}
```
**Mục đích**: Lấy sản phẩm của nhà hàng và tự động lưu `product_id` đầu tiên

**Response mẫu**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c0d2",
      "name": "Burger",
      "price": 50000,
      "available": true
    }
  ]
}
```

---

### Phase 2: Authentication

#### 2.1. Register User (nếu chưa có account)
```
POST {{base_url}}/auth/register
```
**Body**:
```json
{
  "name": "Test Customer",
  "email": "customer@test.com",
  "phone": "0901234567",
  "password": "Test1234!"
}
```

#### 2.2. Login User
```
POST {{base_url}}/auth/login
```
**Body**:
```json
{
  "email": "customer@test.com",
  "password": "Test1234!"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d3",
    "name": "Test Customer",
    "email": "customer@test.com"
  }
}
```

✅ **Token tự động được lưu vào `{{auth_token}}`**

---

### Phase 3: Test Order Creation

#### 3.1. Calculate Delivery Fee (Optional)
```
POST {{base_url}}/orders/calculate-fee
Headers: Authorization: Bearer {{auth_token}}
```
**Body**:
```json
{
  "restaurantId": "{{restaurant_id}}",
  "userAddress": "123 Nguyen Trai, Q1, TP.HCM"
}
```

**Response**:
```json
{
  "success": true,
  "deliveryFee": 15000,
  "distance": "1.35",
  "estimatedDuration": 8,
  "routingMethod": "routing"
}
```

#### 3.2. Create Order - COD
```
POST {{base_url}}/orders
Headers: Authorization: Bearer {{auth_token}}
```
**Body**:
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

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d4",
    "orderNumber": "ORD-20250112-001",
    "status": "pending",
    "paymentStatus": "pending",
    "paymentMethod": "COD",
    "subtotal": 100000,
    "deliveryFee": 15000,
    "discount": 0,
    "totalAmount": 115000
  }
}
```

✅ **`order_id` tự động được lưu**

#### 3.3. Create Order with Voucher
```
POST {{base_url}}/orders
Headers: Authorization: Bearer {{auth_token}}
```
**Body**:
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
  "paymentMethod": "vnpay",
  "note": "Order with voucher",
  "voucherCode": "GIAM20",
  "clientCalculatedTotal": 95000,
  "clientDiscount": 20000
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d5",
    "orderNumber": "ORD-20250112-002",
    "subtotal": 100000,
    "discount": 20000,
    "deliveryFee": 15000,
    "totalAmount": 95000,
    "appliedVoucher": {
      "code": "GIAM20",
      "discountAmount": 20000
    }
  }
}
```

---

### Phase 4: VNPay Payment Testing

#### 4.1. Create VNPay Payment URL
```
POST {{base_url}}/payment/vnpay/create
Headers: Authorization: Bearer {{auth_token}}
```
**Body**:
```json
{
  "orderId": "{{order_id}}",
  "amount": 150000,
  "orderInfo": "Thanh toan don hang #ORDER123",
  "bankCode": ""
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=15000000&vnp_Command=pay&...",
    "transactionId": "12123456"
  }
}
```

✅ **`transaction_id` tự động được lưu**

**⚠️ IMPORTANT NEXT STEPS:**
1. **Copy `paymentUrl`** từ response
2. **Paste vào browser** để mở trang thanh toán VNPay
3. **Đăng nhập VNPay Sandbox** với test card:
   ```
   Ngân hàng: NCB
   Số thẻ: 9704198526191432198
   Tên: NGUYEN VAN A
   Ngày phát hành: 07/15
   Mật khẩu OTP: 123456
   ```
4. **Hoàn tất thanh toán** → VNPay sẽ redirect về `returnUrl`

#### 4.2. Check Order Status After Payment
```
GET {{base_url}}/orders/{{order_id}}
Headers: Authorization: Bearer {{auth_token}}
```

**Response (Thanh toán thành công)**:
```json
{
  "success": true,
  "data": {
    "_id": "{{order_id}}",
    "paymentStatus": "paid",
    "paidAt": "2025-01-12T12:34:56.000Z",
    "paymentInfo": {
      "method": "vnpay",
      "transactionId": "12123456"
    }
  }
}
```

#### 4.3. Get Payment Info
```
GET {{base_url}}/payment/{{order_id}}
Headers: Authorization: Bearer {{auth_token}}
```

**Response**:
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

---

### Phase 5: Advanced VNPay Operations

#### 5.1. Query Transaction Status
```
POST {{base_url}}/payment/vnpay/querydr
Headers: Authorization: Bearer {{auth_token}}
```
**Body**:
```json
{
  "orderId": "{{transaction_id}}",
  "transDate": "20250112123456"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "vnp_RequestId": "123456",
    "vnp_TxnRef": "12123456",
    "vnp_SecureHash": "abc123..."
  },
  "message": "Query data prepared. Send to VNPay API."
}
```

**📝 Note**: Đây chỉ prepare data. Để thực sự query, bạn cần gửi data này đến VNPay API.

#### 5.2. Prepare Refund Data
```
POST {{base_url}}/payment/vnpay/refund
Headers: Authorization: Bearer {{auth_token}}
```
**Body**:
```json
{
  "orderId": "{{transaction_id}}",
  "transDate": "20250112123456",
  "amount": 150000,
  "transType": "02"
}
```

**transType values**:
- `"02"`: Hoàn toàn phần (full refund)
- `"03"`: Hoàn một phần (partial refund)

**Response**:
```json
{
  "success": true,
  "data": {
    "vnp_TransactionType": "02",
    "vnp_Amount": 15000000,
    "vnp_SecureHash": "def456..."
  },
  "message": "Refund data prepared. Send to VNPay API."
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Happy Path - Thanh toán thành công

**Steps**:
1. ✅ Login → Get token
2. ✅ Get restaurants → Save restaurant_id
3. ✅ Get products → Save product_id
4. ✅ Create Order với `paymentMethod: "vnpay"` → Save order_id
5. ✅ Create VNPay Payment URL → Save transaction_id
6. ✅ Open paymentUrl in browser
7. ✅ Complete payment với test card
8. ✅ VNPay redirect về returnUrl
9. ✅ Check order status → `paymentStatus: "paid"`

**Expected Results**:
- Order status không đổi (vẫn `pending`)
- paymentStatus = `paid`
- paidAt có timestamp
- paymentInfo có transactionId

---

### Scenario 2: User Cancel Payment

**Steps**:
1-5. (giống scenario 1)
6. ✅ Open paymentUrl in browser
7. ❌ Click "Hủy giao dịch"
8. ❌ VNPay redirect về với `vnp_ResponseCode=24`
9. ✅ Check order status

**Expected Results**:
- Order status = `cancelled`
- paymentStatus = `failed`
- paymentInfo.errorCode = "24"
- paymentInfo.errorMessage = "Giao dịch không thành công do: Khách hàng hủy giao dịch"

---

### Scenario 3: Order with Voucher

**Steps**:
1. ✅ Login
2. ✅ Create Order with voucher
   ```json
   {
     "voucherCode": "GIAM20",
     "paymentMethod": "vnpay"
   }
   ```
3. ✅ Verify discount được áp dụng
4. ✅ Create VNPay payment
5. ✅ Complete payment

**Expected Results**:
- discount > 0
- appliedVoucher có thông tin voucher
- totalAmount = subtotal - discount + deliveryFee
- Sau payment thành công, order vẫn giữ discount

---

### Scenario 4: Calculate Delivery Fee

**Steps**:
1. ✅ Login
2. ✅ Call `POST /orders/calculate-fee`
   ```json
   {
     "restaurantId": "{{restaurant_id}}",
     "userAddress": "123 Nguyen Trai, Q1, TP.HCM"
   }
   ```

**Expected Results**:
- deliveryFee được tính dựa trên distance
- distance trong km (routing hoặc haversine)
- estimatedDuration trong phút
- routingMethod: "routing" hoặc "haversine_adjusted"

---

## 🔐 Testing Authorization

### Test 1: Create Order without Token
**Request**:
```
POST {{base_url}}/orders
(NO Authorization header)
```

**Expected**: 401 Unauthorized

### Test 2: Create Payment for Other User's Order
**Steps**:
1. User A login → token_A
2. User A create order → order_A
3. User B login → token_B
4. User B try to create payment for order_A

**Expected**: 403 Forbidden

### Test 3: Get Payment Info of Other User's Order
**Expected**: 403 Forbidden (unless admin)

---

## 🐛 Testing Error Cases

### Error 1: Order không tồn tại
```
POST {{base_url}}/payment/vnpay/create
Body:
{
  "orderId": "000000000000000000000000",
  "amount": 150000
}
```
**Expected**: 404 Not Found

### Error 2: Items rỗng
```
POST {{base_url}}/orders
Body:
{
  "items": [],
  "deliveryInfo": {...}
}
```
**Expected**: 400 Bad Request - "No order items"

### Error 3: Voucher không hợp lệ
```
POST {{base_url}}/orders
Body:
{
  "voucherCode": "INVALID_CODE"
}
```
**Expected**: 404 Not Found - "Mã voucher không tồn tại"

### Error 4: Nhà hàng đóng cửa
**Steps**:
1. Set restaurant `isOpen: false`
2. Try to create order

**Expected**: 400 Bad Request - "Nhà hàng hiện đang đóng cửa, không thể đặt hàng"

---

## 📊 Monitoring & Debugging

### Check Console trong Postman

Postman scripts tự động log các thông tin quan trọng:
```javascript
// Sau khi login
console.log('Token saved:', response.token);

// Sau khi create order
console.log('Order ID saved:', response.data._id);
console.log('Order Number:', response.data.orderNumber);

// Sau khi create VNPay payment
console.log('Payment URL:', response.data.paymentUrl);
console.log('Transaction ID:', response.data.transactionId);
console.log('⚠️ IMPORTANT: Copy payment URL and open in browser');
```

Mở **Postman Console** (View → Show Postman Console) để xem logs.

---

## 🔧 Troubleshooting

### Problem 1: Token expired
**Solution**:
1. Chạy lại "Login User"
2. Token mới tự động được set vào `{{auth_token}}`

### Problem 2: Variables không tự động set
**Solution**:
1. Check **Tests** tab của request
2. Verify script có chạy đúng không
3. Check Postman Console để xem errors

### Problem 3: VNPay payment không redirect về
**Solution**:
1. Check `vnp_ReturnUrl` trong server config
2. Verify `CLIENT_URL` environment variable
3. Check VNPay sandbox logs

### Problem 4: Signature invalid
**Solution**:
1. Verify `vnp_HashSecret` đúng với VNPay sandbox
2. Check params order (phải sort alphabetically)
3. Verify không có params bị missing

---

## 📝 Best Practices

### 1. Luôn test theo thứ tự
1. ✅ Setup data (get restaurants, products)
2. ✅ Authentication
3. ✅ Create order
4. ✅ Create payment
5. ✅ Complete payment
6. ✅ Verify result

### 2. Save Environment
- Click **...** bên cạnh collection name
- Click **Export**
- Lưu file `.json` để backup

### 3. Use Pre-request Scripts
Thêm vào **Pre-request Script** của collection:
```javascript
// Log current time
console.log('Request time:', new Date().toISOString());

// Log request URL
console.log('Request:', pm.request.url.toString());
```

### 4. Organize Requests
- Sử dụng folders để group requests
- Đặt tên rõ ràng: "Success", "Error", "Mock"
- Thêm description cho mỗi request

---

## 🎯 Quick Reference

### Collection Variables
| Variable | Auto-set | Purpose |
|----------|----------|---------|
| `base_url` | ❌ Manual | Server URL |
| `auth_token` | ✅ After login | Authentication |
| `order_id` | ✅ After create order | Order operations |
| `restaurant_id` | ✅ After get restaurants | Order creation |
| `product_id` | ✅ After get products | Order items |
| `transaction_id` | ✅ After create payment | Payment tracking |

### Response Codes
| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Get order |
| 201 | Created | Create order |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | No token |
| 403 | Forbidden | Wrong user |
| 404 | Not Found | Order not exist |
| 500 | Server Error | Internal error |

### VNPay Response Codes
| Code | Meaning |
|------|---------|
| 00 | Success |
| 07 | Suspicious transaction |
| 09 | Not registered for internet banking |
| 10 | Wrong authentication ≥3 times |
| 11 | Payment timeout |
| 12 | Card locked |
| 13 | Wrong OTP |
| 24 | User cancelled |
| 51 | Insufficient balance |
| 65 | Daily limit exceeded |
| 75 | Bank maintenance |
| 79 | Wrong password too many times |
| 99 | Other errors |

---

## 🚀 Next Steps

1. ✅ Import collection vào Postman
2. ✅ Cấu hình `base_url`
3. ✅ Run "Get Restaurants" để setup data
4. ✅ Run "Login User" để get token
5. ✅ Test từng scenario theo thứ tự
6. ✅ Check response và verify results
7. ✅ Report bugs nếu có

---

**Happy Testing! 🎉**

Need help? Check:
- `/server_app/API_ENDPOINTS.md`
- `/ORDER_AND_VNPAY_TEST_PLAN.md`
- VNPay Docs: https://sandbox.vnpayment.vn/apis/docs/
