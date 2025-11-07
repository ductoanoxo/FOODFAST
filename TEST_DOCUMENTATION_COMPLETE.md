# TÀI LIỆU CHI TIẾT VỀ CÁC TEST TRONG DỰ ÁN FOODFAST

## TỔNG QUAN

### Mục đích Testing
- Đảm bảo code hoạt động đúng như mong đợi
- Phát hiện lỗi sớm trước khi deploy
- Tạo tài liệu sống về cách hệ thống hoạt động
- Giúp refactor code an toàn hơn

### Công cụ Testing
- **Frontend**: Vitest v4.0.6 + Testing Library + Happy-DOM
- **Backend**: Jest + Supertest
- **E2E**: Cypress

### Cấu trúc Test
- Unit Tests: Test từng function/component riêng lẻ
- Integration Tests: Test nhiều module tương tác với nhau
- E2E Tests: Test toàn bộ user journey

---

## PHẦN 1: CLIENT_APP TESTS (Ứng dụng khách hàng)

### 1.1 CART SLICE TESTS (Redux Giỏ hàng)
**File**: client_app/src/__tests__/unit/redux/slices/cartSlice.test.js  
**Số test**: 15 tests  
**Mục đích**: Kiểm tra logic quản lý giỏ hàng trong Redux

#### Tại sao cần test này?
Giỏ hàng là tính năng cốt lõi của app mua sắm. Nếu giỏ hàng lỗi, khách hàng không thể đặt hàng được. Test này đảm bảo:
- Thêm sản phẩm vào giỏ hoạt động đúng
- Cập nhật số lượng chính xác
- Tính tổng tiền không sai
- Lưu giỏ hàng vào localStorage để giữ khi refresh

#### Chi tiết các test:

**1. Test Initial State (Trạng thái ban đầu)**
```javascript
// Test: should return initial state
// Ý nghĩa: Khi mới vào app, giỏ hàng phải rỗng và totalAmount = 0

const initialState = {
    items: [],
    totalItems: 0,
    totalPrice: 0,
};

const state = cartReducer(undefined, { type: 'unknown' });
expect(state).toEqual(initialState);
```

**2-6. Test addToCart (Thêm vào giỏ)**
```javascript
// Test: should add new item to cart
// Ý nghĩa: Khi thêm sản phẩm mới, nó xuất hiện trong danh sách items

const product = {
    _id: '1',
    name: 'Phở Bò',
    price: 50000,
};

const state = cartReducer(initialState, addToCart(product));

expect(state.items).toHaveLength(1);
expect(state.items[0]).toEqual({
    ...product,
    quantity: 1,
});
expect(state.totalPrice).toBe(50000);

// Test: should increase quantity if item exists
// Ý nghĩa: Nếu sản phẩm đã có trong giỏ, chỉ tăng quantity lên, không tạo item mới

let state = cartReducer(initialState, addToCart(product));
state = cartReducer(state, addToCart(product)); // Add same product again

expect(state.items).toHaveLength(1); // Still 1 item
expect(state.items[0].quantity).toBe(2); // Quantity increased
expect(state.totalPrice).toBe(100000); // Price doubled
```

**7-9. Test removeFromCart (Xóa khỏi giỏ)**
```javascript
// Test: should remove item from cart
// Ý nghĩa: Xóa sản phẩm ra khỏi giỏ và tính lại tổng tiền

const stateWithItem = {
    items: [{ _id: '1', name: 'Phở Bò', price: 50000, quantity: 2 }],
    totalItems: 2,
    totalPrice: 100000,
};

const state = cartReducer(stateWithItem, removeFromCart('1'));

expect(state.items).toHaveLength(0);
expect(state.totalPrice).toBe(0);
expect(state.totalItems).toBe(0);
```

**10-12. Test updateQuantity (Cập nhật số lượng)**
```javascript
// Test: should update item quantity
// Ý nghĩa: Thay đổi số lượng của sản phẩm trong giỏ

const stateWithItem = {
    items: [{ _id: '1', name: 'Phở Bò', price: 50000, quantity: 1 }],
    totalItems: 1,
    totalPrice: 50000,
};

const state = cartReducer(
    stateWithItem, 
    updateQuantity({ id: '1', quantity: 3 })
);

expect(state.items[0].quantity).toBe(3);
expect(state.totalPrice).toBe(150000); // 50000 × 3
```

**13-15. Test clearCart và localStorage**
```
Test: should clear all items from cart
Ý nghĩa: Xóa toàn bộ giỏ hàng, reset về trạng thái ban đầu

Test: should save to localStorage after clearing
Ý nghĩa: Xóa dữ liệu giỏ hàng trong localStorage

Test: should load cart from localStorage on init
Ý nghĩa: Khi mở app lại, load giỏ hàng từ localStorage
```

### 1.2 ORDER SLICE TESTS (Redux Đơn hàng)
**File**: client_app/src/__tests__/unit/redux/slices/orderSlice.test.js  
**Số test**: 13 tests  
**Mục đích**: Kiểm tra logic quản lý đơn hàng và tracking real-time

#### Tại sao cần test này?
Quản lý đơn hàng là quy trình phức tạp với nhiều trạng thái. Cần đảm bảo:
- Tạo đơn hàng thành công
- Cập nhật trạng thái đơn hàng đúng
- Tracking drone real-time chính xác
- Xử lý lỗi khi API fail

#### Chi tiết các test:

**1-2. Test Initial State**
```
Test: should return initial state
Ý nghĩa: Ban đầu: currentOrder = null, loading = false, error = null

Test: should handle clearCurrentOrder
Ý nghĩa: Xóa đơn hàng hiện tại, reset về null
```

**3-6. Test createOrder (Tạo đơn hàng)**
```
Test: should set loading true when createOrder is pending
Ý nghĩa: Khi đang gọi API tạo đơn, hiện loading spinner

Test: should set order when createOrder is fulfilled
Ý nghĩa: API trả về thành công, lưu order vào state

Test: should set error when createOrder is rejected
Ý nghĩa: API fail, lưu error message để hiện thông báo lỗi

Test: should include items and delivery info in payload
Ý nghĩa: Data gửi lên phải đủ: items, deliveryAddress, paymentMethod
```

**7-10. Test updateOrderStatus (Cập nhật trạng thái)**
```
Test: should update order status
Ý nghĩa: Khi backend gửi status mới (pending → preparing → delivering), cập nhật UI

Test: should handle status progression
Ý nghĩa: Test chuỗi chuyển đổi: pending → preparing → delivering → delivered

Test: should not update if order ID doesn't match
Ý nghĩa: Chỉ update đơn hàng đúng, không update nhầm đơn khác

Test: should handle invalid status
Ý nghĩa: Nếu status không hợp lệ, không crash app
```

**11-13. Test Drone Tracking**
```
Test: should update drone position
Ý nghĩa: Cập nhật vị trí drone real-time trên map

Test: should calculate estimated time
Ý nghĩa: Tính thời gian giao hàng dự kiến dựa trên khoảng cách

Test: should handle drone offline
Ý nghĩa: Nếu mất kết nối drone, hiện thông báo cho khách
```

### 1.3 PRICE UTILS TESTS (Utility tính giá)
**File**: client_app/src/__tests__/unit/services/priceUtils.test.js  
**Số test**: 24 tests  
**Mục đích**: Kiểm tra các hàm format giá và tính toán discount

#### Tại sao cần test này?
Tính toán tiền bạc phải chính xác 100%. Sai một chút là khách hàng mất tiền hoặc nhà hàng lỗ. Test đảm bảo:
- Format tiền VND chuẩn (có dấu phẩy, đơn vị ₫)
- Tính discount không sai
- Xử lý edge cases (giá âm, null, undefined)

#### Chi tiết các test:

**1-5. Test formatPrice (Format giá VND)**
```javascript
// Test: should format number to VND currency
// Ý nghĩa: 50000 → "50.000 ₫"

import { formatPrice } from '@/services/priceUtils';

test('formatPrice formats correctly', () => {
    expect(formatPrice(50000)).toBe('50.000 ₫');
    expect(formatPrice(1000000)).toBe('1.000.000 ₫');
    expect(formatPrice(0)).toBe('0 ₫');
    expect(formatPrice(null)).toBe('0 ₫'); // Handle null
    expect(formatPrice(-1000)).toBe('-1.000 ₫'); // Handle negative
});

// Test: should handle string input
// Ý nghĩa: "50000" → "50.000 ₫" (convert string to number)

test('formatPrice handles string input', () => {
    expect(formatPrice('50000')).toBe('50.000 ₫');
    expect(formatPrice('1000000')).toBe('1.000.000 ₫');
});
```

**6-10. Test calculateDiscount (Tính giảm giá)**
```javascript
// Test: should calculate percentage discount
// Ý nghĩa: Price 100000, discount 10% → giảm 10000

import { calculateDiscount } from '@/services/priceUtils';

test('calculateDiscount with percentage', () => {
    const result = calculateDiscount(100000, { type: 'percentage', value: 10 });
    expect(result).toBe(10000); // 10% of 100000
});

// Test: should calculate fixed amount discount
test('calculateDiscount with fixed amount', () => {
    const result = calculateDiscount(100000, { type: 'fixed', value: 5000 });
    expect(result).toBe(5000);
});

// Test: should not exceed original price
test('calculateDiscount max 100%', () => {
    const result = calculateDiscount(100000, { type: 'percentage', value: 150 });
    expect(result).toBe(100000); // Max discount = original price
});
```

### 1.4 ORDER VALIDATION TESTS (Validation đơn hàng)
**File**: client_app/src/__tests__/unit/services/orderValidation.test.js  
**Số test**: 11 tests  
**Mục đích**: Validate dữ liệu đơn hàng trước khi gửi lên server

#### Tại sao cần test này?
Phải validate ở frontend trước khi gửi lên server để:
- Giảm tải cho server
- User feedback nhanh hơn
- Tránh lãng phí request
- Đảm bảo data đầy đủ và đúng format

#### Chi tiết các test:

**1-4. Test validateDeliveryAddress**
```
Test: should accept valid address
Ý nghĩa: Address đầy đủ street, city, ward → pass

Test: should reject missing street
Ý nghĩa: Thiếu số nhà/đường → báo lỗi

Test: should reject missing city
Ý nghĩa: Thiếu tỉnh/thành → báo lỗi

Test: should reject invalid phone format
Ý nghĩa: SĐT không đúng 10 số → báo lỗi
```

**5-8. Test validatePaymentMethod**
```
Test: should accept valid payment methods
Ý nghĩa: COD, ZaloPay, Momo → pass

Test: should reject invalid method
Ý nghĩa: PaymentMethod lạ → báo lỗi

Test: should validate card info if using card
Ý nghĩa: Dùng thẻ phải có số thẻ, CVV, expiry

Test: should validate e-wallet info
Ý nghĩa: Dùng ví điện tử phải có số điện thoại liên kết
```

**9-11. Test validateOrderItems**
```
Test: should reject empty cart
Ý nghĩa: Giỏ hàng rỗng → không cho đặt

Test: should reject invalid quantity
Ý nghĩa: Quantity <= 0 hoặc > 99 → báo lỗi

Test: should check product availability
Ý nghĩa: Sản phẩm hết hàng → không cho thêm vào đơn
```

---

## PHẦN 2: RESTAURANT_APP TESTS (Ứng dụng nhà hàng)

### 2.1 ORDER SLICE TESTS (Redux Đơn hàng - Phía nhà hàng)
**File**: restaurant_app/src/__tests__/unit/redux/slices/orderSlice.test.js  
**Số test**: 11 tests  
**Mục đích**: Quản lý đơn hàng từ phía nhà hàng

#### Tại sao cần test này?
Nhà hàng cần:
- Xem danh sách đơn hàng mới
- Cập nhật trạng thái đơn (đang nấu, sẵn sàng giao)
- Filter đơn theo status
- Real-time update khi có đơn mới

#### Chi tiết các test:

**1-4. Test fetchOrders (Lấy danh sách đơn)**
```
Test: should load orders from API
Ý nghĩa: Call API lấy danh sách đơn hàng

Test: should filter by status
Ý nghĩa: Chỉ hiện đơn "pending", không hiện "delivered"

Test: should sort by created time
Ý nghĩa: Đơn mới nhất ở trên đầu

Test: should handle empty response
Ý nghĩa: Không có đơn nào → hiện "No orders yet"
```

**5-8. Test updateOrderStatus (Cập nhật trạng thái)**
```
Test: should update status to preparing
Ý nghĩa: Nhà hàng click "Bắt đầu nấu" → status = preparing

Test: should update status to ready
Ý nghĩa: Nấu xong → status = ready → gọi drone đến lấy

Test: should notify customer
Ý nghĩa: Mỗi lần đổi status gửi notification cho khách

Test: should log status history
Ý nghĩa: Lưu lịch sử thay đổi status để tracking
```

**9-11. Test Real-time Updates**
```
Test: should add new order via socket
Ý nghĩa: Socket.io nhận đơn mới, thêm vào danh sách real-time

Test: should play notification sound
Ý nghĩa: Có đơn mới phát âm thanh thông báo

Test: should highlight new orders
Ý nghĩa: Đơn mới có hiệu ứng nhấp nháy để thu hút chú ý
```

### 2.2 PRODUCT SLICE TESTS (Redux Sản phẩm)
**File**: restaurant_app/src/__tests__/unit/redux/slices/productSlice.test.js  
**Số test**: 13 tests  
**Mục đích**: Quản lý danh sách món ăn

#### Tại sao cần test này?
Nhà hàng cần quản lý menu:
- Thêm/xóa/sửa món ăn
- Cập nhật giá, hình ảnh
- Đánh dấu món hết hàng
- Quản lý danh mục

#### Chi tiết các test:

**1-3. Test fetchProducts**
```
Test: should load products from API
Ý nghĩa: Lấy danh sách món ăn từ database

Test: should categorize products
Ý nghĩa: Phân loại: Khai vị, Món chính, Tráng miệng

Test: should handle loading state
Ý nghĩa: Hiện skeleton loading khi đang tải
```

**4-7. Test CRUD Operations**
```
Test: should add new product
Ý nghĩa: Thêm món mới vào menu

Test: should update product info
Ý nghĩa: Sửa tên, giá, mô tả món ăn

Test: should delete product
Ý nghĩa: Xóa món khỏi menu

Test: should toggle availability
Ý nghĩa: Đánh dấu món "Hết hàng" tạm thời
```

**8-10. Test Image Upload**
```
Test: should upload product image
Ý nghĩa: Upload hình món ăn lên Cloudinary

Test: should compress image before upload
Ý nghĩa: Resize hình về 800×600 để tối ưu tốc độ

Test: should validate image format
Ý nghĩa: Chỉ chấp nhận JPG, PNG, WEBP
```

**11-13. Test Search & Filter**
```
Test: should search products by name
Ý nghĩa: Tìm món ăn theo tên

Test: should filter by category
Ý nghĩa: Lọc theo danh mục: Đồ uống, Món chính...

Test: should filter by price range
Ý nghĩa: Lọc món từ 50k-100k
```

### 2.3 HELPER FUNCTIONS TESTS
**File**: restaurant_app/src/__tests__/unit/services/helpers.test.js  
**Số test**: 31 tests  
**Mục đích**: Test các hàm utility dùng chung

#### Tại sao cần test này?
Helper functions được dùng ở nhiều nơi. Nếu lỗi sẽ ảnh hưởng toàn app. Test đảm bảo:
- Format date/time đúng
- Validate input chính xác
- Xử lý string/array đúng
- Handle edge cases

#### Chi tiết các test:

**1-5. Test formatDate**
```
Test: should format to DD/MM/YYYY
Ý nghĩa: Date object → "05/11/2025"

Test: should handle invalid date
Ý nghĩa: null/undefined → "Invalid Date"

Test: should format to relative time
Ý nghĩa: 2 hours ago → "2 giờ trước"

Test: should handle timezone
Ý nghĩa: Convert UTC sang múi giờ Việt Nam (GMT+7)

Test: should format to Vietnamese locale
Ý nghĩa: "Monday" → "Thứ 2"
```

**6-10. Test formatCurrency**
```
Test: should format VND
Ý nghĩa: Giống formatPrice ở client_app

Test: should handle multiple currencies
Ý nghĩa: Support USD, EUR nếu cần

Test: should round to nearest thousand
Ý nghĩa: 50500 → 51000 (làm tròn)

Test: should show "Free" for zero
Ý nghĩa: 0 → "Miễn phí" thay vì "0 ₫"

Test: should abbreviate large numbers
Ý nghĩa: 1000000 → "1M" để gọn
```

**11-15. Test validateEmail**
```
Test: should accept valid emails
Ý nghĩa: test@example.com → pass

Test: should reject invalid format
Ý nghĩa: "notanemail" → fail

Test: should reject disposable emails
Ý nghĩa: Chặn email tạm như 10minutemail

Test: should normalize email
Ý nghĩa: "Test@Example.COM" → "test@example.com"

Test: should check MX records (optional)
Ý nghĩa: Verify domain có mail server không
```

**16-20. Test validatePhone**
```
Test: should accept Vietnamese phone
Ý nghĩa: 0912345678 → pass

Test: should reject short numbers
Ý nghĩa: 091234 → fail

Test: should normalize format
Ý nghĩa: "+84 91 234 5678" → "0912345678"

Test: should validate area code
Ý nghĩa: Đầu số phải hợp lệ (090-099, 03, 05, 07, 08, 09)

Test: should reject landline if mobile-only
Ý nghĩa: Chỉ chấp nhận di động, không chấp nhận cố định
```

**21-25. Test slugify**
```
Test: should create URL-friendly slug
Ý nghĩa: "Phở Bò Tái" → "pho-bo-tai"

Test: should remove Vietnamese tones
Ý nghĩa: "Bánh mì" → "banh-mi"

Test: should handle special characters
Ý nghĩa: "Pizza (Large)" → "pizza-large"

Test: should prevent duplicate slugs
Ý nghĩa: Nếu slug đã tồn tại, thêm số: "pho-bo-2"

Test: should lowercase everything
Ý nghĩa: "PHO BO" → "pho-bo"
```

**26-31. Test calculateDistance**
```
Test: should calculate distance between 2 points
Ý nghĩa: Tính khoảng cách từ nhà hàng đến khách (km)

Test: should use Haversine formula
Ý nghĩa: Tính chính xác trên mặt cầu Trái Đất

Test: should handle same location
Ý nghĩa: Cùng vị trí → distance = 0

Test: should validate coordinates
Ý nghĩa: Lat/lng phải hợp lệ (-90 to 90, -180 to 180)

Test: should round to 2 decimals
Ý nghĩa: 3.456789 km → 3.46 km

Test: should calculate delivery time
Ý nghĩa: Distance × speed → thời gian giao hàng dự kiến
```

---

## PHẦN 3: ADMIN_APP TESTS (Ứng dụng quản trị)

### 3.1 AUTH SLICE TESTS (Redux Xác thực)
**File**: admin_app/src/__tests__/unit/redux/slices/authSlice.test.js  
**Số test**: 8 tests  
**Mục đích**: Quản lý đăng nhập admin

#### Tại sao cần test này?
Admin app phải bảo mật cao. Test đảm bảo:
- Chỉ admin mới đăng nhập được
- Token được lưu an toàn
- Auto logout khi token hết hạn
- Phân quyền đúng (super admin, moderator)

#### Chi tiết các test:

**1-3. Test Login Flow**
```javascript
// Test: should login with valid credentials
// Ý nghĩa: Username + password đúng → lưu token

import { login } from '@/redux/slices/authSlice';

test('login with valid credentials', async () => {
    const credentials = {
        email: 'admin@example.com',
        password: 'admin123'
    };
    
    const result = await dispatch(login(credentials));
    
    expect(result.type).toBe('auth/login/fulfilled');
    expect(result.payload.token).toBeTruthy();
    expect(localStorage.getItem('adminToken')).toBeTruthy();
});

// Test: should reject invalid credentials
test('login with wrong password', async () => {
    const credentials = {
        email: 'admin@example.com',
        password: 'wrongpassword'
    };
    
    const result = await dispatch(login(credentials));
    
    expect(result.type).toBe('auth/login/rejected');
    expect(result.error.message).toBe('Invalid credentials');
});
```

**4-5. Test Logout**
```
Test: should clear token on logout
Ý nghĩa: Logout → xóa token khỏi localStorage

Test: should redirect to login page
Ý nghĩa: Sau khi logout → quay về trang login
```

**6-8. Test Token Validation**
```
Test: should validate token on app load
Ý nghĩa: Mở app → check token còn hạn không

Test: should auto logout if token expired
Ý nghĩa: Token hết hạn → tự động logout

Test: should refresh token before expiry
Ý nghĩa: Token sắp hết hạn → tự động refresh
```

---

## PHẦN 4: SERVER_APP TESTS (Backend API)

### 4.1 PAYMENT SERVICE TESTS
**File**: server_app/__tests__/unit/services/payment.test.js  
**Số test**: ~15 tests  
**Mục đích**: Test logic xử lý thanh toán

#### Tại sao cần test này?
Thanh toán liên quan đến tiền bạc, phải chính xác tuyệt đối:
- Tính tiền đúng
- Tích hợp payment gateway (ZaloPay, Momo)
- Xử lý refund
- Ngăn chặn double-payment

#### Chi tiết các test:

**1-5. Test Payment Processing**
```
Test: should create payment intent
Ý nghĩa: Tạo giao dịch thanh toán mới

Test: should validate payment amount
Ý nghĩa: Số tiền phải > 0 và khớp với order

Test: should call ZaloPay API
Ý nghĩa: Gọi API ZaloPay để tạo link thanh toán

Test: should handle ZaloPay callback
Ý nghĩa: Nhận webhook từ ZaloPay khi thanh toán thành công

Test: should verify payment signature
Ý nghĩa: Check chữ ký để đảm bảo request từ ZaloPay thật
```

**6-10. Test Refund**
```
Test: should process refund
Ý nghĩa: Hoàn tiền khi khách hủy đơn

Test: should validate refund eligibility
Ý nghĩa: Chỉ hoàn tiền nếu đơn chưa giao

Test: should call refund API
Ý nghĩa: Gọi API ZaloPay để hoàn tiền

Test: should update order status
Ý nghĩa: Refund xong → order status = refunded

Test: should notify customer
Ý nghĩa: Gửi email thông báo hoàn tiền thành công
```

**11-15. Test Error Handling**
```
Test: should handle payment timeout
Ý nghĩa: User không thanh toán trong 15 phút → hủy order

Test: should handle insufficient balance
Ý nghĩa: Tài khoản không đủ tiền → báo lỗi

Test: should handle network error
Ý nghĩa: Mất kết nối với payment gateway → retry

Test: should prevent double payment
Ý nghĩa: User click thanh toán 2 lần → chỉ charge 1 lần

Test: should log all transactions
Ý nghĩa: Lưu log mọi giao dịch để audit
```

### 4.2 ORDER VALIDATION TESTS (Backend)
**File**: server_app/__tests__/unit/services/orderValidation.test.js  
**Số test**: ~12 tests  
**Mục đích**: Validate đơn hàng ở backend (double-check frontend)

#### Tại sao cần test này?
Không thể tin frontend 100%. Backend phải validate lại:
- Giá sản phẩm không bị người dùng sửa
- Số lượng có trong kho không
- Address có tồn tại thật không (geocoding)
- Ngăn chặn fraud

#### Chi tiết các test:

**1-4. Test Price Validation**
```
Test: should verify product prices
Ý nghĩa: Frontend gửi lên price 50k, check DB xem đúng không

Test: should reject tampered prices
Ý nghĩa: Nếu frontend sửa giá 100k thành 1k → reject

Test: should recalculate total
Ý nghĩa: Tính lại tổng tiền ở backend, không tin frontend

Test: should apply server-side discounts
Ý nghĩa: Apply discount codes hợp lệ ở backend
```

**5-8. Test Stock Validation**
```
Test: should check product availability
Ý nghĩa: Món ăn còn trong menu không

Test: should check stock quantity
Ý nghĩa: Nguyên liệu còn đủ để nấu không

Test: should reserve stock
Ý nghĩa: Tạo đơn xong → trừ số lượng trong kho ngay

Test: should release stock on cancel
Ý nghĩa: Hủy đơn → hoàn lại số lượng vào kho
```

**9-12. Test Address Validation**
```
Test: should validate address format
Ý nghĩa: Check address đúng format Việt Nam

Test: should geocode address
Ý nghĩa: Convert địa chỉ thành tọa độ lat/lng

Test: should check delivery range
Ý nghĩa: Chỉ giao trong bán kính 10km

Test: should reject invalid coordinates
Ý nghĩa: Lat/lng không hợp lệ → reject
```

### 4.3 AUTHENTICATION TESTS
**File**: server_app/__tests__/unit/middleware/authentication.test.js  
**Số test**: ~10 tests  
**Mục đích**: Test middleware xác thực JWT

#### Tại sao cần test này?
Authentication là lớp bảo mật đầu tiên:
- Chỉ user đăng nhập mới gọi API được
- Token hợp lệ và chưa hết hạn
- Phân quyền đúng role

#### Chi tiết các test:

**1-4. Test Token Verification**
```
Test: should accept valid token
Ý nghĩa: Token đúng → cho phép truy cập API

Test: should reject missing token
Ý nghĩa: Không có token → return 401 Unauthorized

Test: should reject expired token
Ý nghĩa: Token hết hạn → return 401

Test: should reject invalid signature
Ý nghĩa: Token bị sửa → return 403 Forbidden
```

**5-7. Test Role-Based Access**
```
Test: should allow admin routes for admin
Ý nghĩa: Admin role → truy cập được admin APIs

Test: should block user from admin routes
Ý nghĩa: User thường → không truy cập được admin APIs

Test: should allow user their own resources
Ý nghĩa: User chỉ xem được đơn hàng của mình
```

**8-10. Test Rate Limiting**
```
Test: should limit requests per minute
Ý nghĩa: Tối đa 100 requests/phút để chống spam

Test: should block after too many failed logins
Ý nghĩa: Sai password 5 lần → lock account 15 phút

Test: should whitelist trusted IPs
Ý nghĩa: IP của server drone → không bị rate limit
```

### 4.4 DRONE ASSIGNMENT TESTS
**File**: server_app/__tests__/unit/services/droneAssignment.test.js  
**Số test**: ~13 tests  
**Mục đích**: Test thuật toán assign drone cho đơn hàng

#### Tại sao cần test này?
Đây là tính năng đặc biệt của app. Thuật toán phải:
- Chọn drone gần nhất
- Check drone còn pin không
- Load balance giữa các drone
- Handle trường hợp không có drone available

#### Chi tiết các test:

**1-5. Test Drone Selection**
```
Test: should select nearest available drone
Ý nghĩa: Chọn drone gần nhà hàng nhất

Test: should skip busy drones
Ý nghĩa: Drone đang giao → không assign

Test: should check battery level
Ý nghĩa: Pin > 30% mới cho giao

Test: should check payload capacity
Ý nghĩa: Đơn nặng > 5kg → không assign drone nhỏ

Test: should check weather conditions
Ý nghĩa: Trời mưa to → không cho drone bay
```

**6-10. Test Assignment Logic**
```
Test: should create assignment record
Ý nghĩa: Lưu DB: order_id → drone_id

Test: should update drone status
Ý nghĩa: Drone được assign → status = busy

Test: should calculate route
Ý nghĩa: Tính đường bay: nhà hàng → khách hàng

Test: should estimate delivery time
Ý nghĩa: Distance / drone speed = ETA

Test: should send command to drone
Ý nghĩa: Gửi lệnh bay đến drone qua MQTT
```

**11-13. Test Fallback Scenarios**
```
Test: should fallback to human delivery if no drone
Ý nghĩa: Không có drone → chuyển sang xe máy giao

Test: should queue orders if all drones busy
Ý nghĩa: All drone đang giao → xếp hàng đợi

Test: should notify customer of delay
Ý nghĩa: Phải đợi drone → gửi thông báo cho khách
```

### 4.5 ORDER STATUS FLOW TESTS
**File**: server_app/__tests__/unit/services/orderStatusFlow.test.js  
**Số test**: ~10 tests  
**Mục đích**: Test state machine của order status

#### Tại sao cần test này?
Order status có quy trình chặt chẽ:
- pending → preparing → ready → delivering → delivered
- Không được nhảy bước
- Mỗi bước có side effects (gửi notification, cập nhật drone...)

#### Chi tiết các test:

**1-5. Test Status Transitions**
```
Test: should transition from pending to preparing
Ý nghĩa: Nhà hàng nhận đơn → status = preparing

Test: should not skip statuses
Ý nghĩa: Không được nhảy từ pending → delivered

Test: should require reason for cancellation
Ý nghĩa: Cancel phải có lý do

Test: should prevent status rollback
Ý nghĩa: Delivered rồi không được chuyển về preparing

Test: should validate status values
Ý nghĩa: Status lạ không có trong enum → reject
```

**6-10. Test Side Effects**
```
Test: should emit socket event on status change
Ý nghĩa: Mỗi lần đổi status → broadcast qua socket

Test: should send push notification
Ý nghĩa: Gửi notification đến app khách hàng

Test: should log status history
Ý nghĩa: Lưu log: "2025-11-05 14:30 - pending → preparing"

Test: should update analytics
Ý nghĩa: Cập nhật metrics: số đơn delivering, thời gian trung bình...

Test: should trigger webhooks
Ý nghĩa: Gọi webhook để tích hợp với hệ thống khác
```

---

## PHẦN 5: INTEGRATION TESTS

### 5.1 ORDER FLOW INTEGRATION TEST
**File**: server_app/__tests__/integration/order-flow.test.js  
**Số test**: ~8 tests  
**Mục đích**: Test toàn bộ flow tạo đơn → thanh toán → giao hàng

#### Tại sao cần test này?
Unit test chỉ test từng function riêng lẻ. Integration test xem các function hoạt động cùng nhau có ổn không:
- User tạo đơn → API lưu DB → assign drone → gửi notification
- Test với real database (test DB)
- Test với real Redis
- Test socket events

#### Chi tiết các test:

**1-3. Test Create Order Flow**
```javascript
// Test: POST /api/orders should create order
// Ý nghĩa: Gửi request tạo đơn → Check response có order_id → Check DB có record mới

test('should create order successfully', async () => {
    const orderData = {
        items: [
            { 
                product: testProduct._id, 
                quantity: 2, 
                price: 50000 
            }
        ],
        restaurant: testRestaurant._id,
        deliveryAddress: '123 Main St, Ho Chi Minh',
        paymentMethod: 'COD',
        totalAmount: 100000
    };

    const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.order).toHaveProperty('_id');
    expect(response.body.order.status).toBe('pending');
    
    // Check database
    const orderInDB = await Order.findById(response.body.order._id);
    expect(orderInDB).toBeTruthy();
    expect(orderInDB.totalAmount).toBe(100000);
});

// Test: should assign drone automatically
// Ý nghĩa: Tạo đơn xong → Check có drone_id được assign

test('should auto-assign nearest available drone', async () => {
    // ... create order ...
    
    expect(response.body.order.assignedDrone).toBeTruthy();
    expect(response.body.order.assignedDrone._id).toBe(testDrone._id.toString());
    
    // Check drone status updated
    const drone = await Drone.findById(testDrone._id);
    expect(drone.status).toBe('busy');
});
```

**4-6. Test Payment Flow**
```
Test: should create payment intent
Ý nghĩa:
- Tạo đơn xong
- Tự động tạo payment intent
- Return payment URL

Test: should update order on payment success
Ý nghĩa:
- Simulate payment callback
- Check order status = paid
- Check payment record trong DB

Test: should cancel order on payment failure
Ý nghĩa:
- Payment fail sau 15 phút
- Order status = cancelled
- Stock được hoàn lại
```

**7-8. Test Status Update Flow**
```
Test: should broadcast status via socket
Ý nghĩa:
- Update order status
- Listen socket event
- Check client nhận được event

Test: should notify all parties
Ý nghĩa:
- Update status → preparing
- Customer nhận notification
- Restaurant nhận confirmation
- Drone nhận command
```

### 5.2 PAYMENT INTEGRATION TEST
**File**: server_app/__tests__/integration/payment.test.js  
**Số test**: ~6 tests  
**Mục đích**: Test tích hợp với ZaloPay/Momo thật

#### Tại sao cần test này?
Payment gateway có sandbox environment. Test với sandbox trước khi lên production:
- Test tạo link thanh toán
- Test nhận callback
- Test verify signature
- Test refund

#### Chi tiết các test:

**1-3. Test ZaloPay Integration**
```
Test: should create ZaloPay order
Ý nghĩa:
- Call ZaloPay API sandbox
- Get payment URL
- Check response format

Test: should handle ZaloPay callback
Ý nghĩa:
- Simulate webhook từ ZaloPay
- Verify MAC signature
- Update order status

Test: should process ZaloPay refund
Ý nghĩa:
- Call refund API
- Check refund status
- Verify webhook response
```

**4-6. Test Momo Integration**
```
Test: should create Momo payment
Ý nghĩa: Tương tự ZaloPay cho Momo

Test: should handle Momo IPN
Ý nghĩa: Instant Payment Notification

Test: should query Momo transaction status
Ý nghĩa: Check trạng thái giao dịch
```

---

## PHẦN 6: E2E TESTS (Cypress)

### 6.1 USER JOURNEY E2E TEST
**File**: cypress/e2e/user-journeys.cy.js  
**Số test**: ~10 scenarios  
**Mục đích**: Test user journey từ đầu đến cuối

#### Tại sao cần test này?
E2E test giống người dùng thật sử dụng app:
- Mở browser
- Click buttons
- Điền forms
- Check kết quả hiện trên UI

#### Chi tiết các test:

**1-4. Test Complete Order Journey**
```javascript
// Scenario: User đặt hàng thành công
// E2E test with Cypress

describe('User Order Journey', () => {
    it('should complete full order flow', () => {
        // Bước 1: Mở trang chủ
        cy.visit('http://localhost:5173');
        
        // Bước 2: Thêm món vào giỏ
        cy.contains('Phở Bò').click();
        cy.contains('Add to Cart').click();
        
        // Bước 3: Checkout
        cy.get('[data-testid="cart-icon"]').click();
        cy.contains('Checkout').click();
        
        // Bước 4: Điền địa chỉ
        cy.get('input[name="address"]').type('123 Main St, HCMC');
        cy.get('input[name="phone"]').type('0901234567');
        
        // Bước 5: Chọn thanh toán COD
        cy.get('select[name="paymentMethod"]').select('COD');
        
        // Bước 6: Submit order
        cy.contains('Place Order').click();
        
        // Bước 7: Check success message
        cy.contains('Order placed successfully').should('be.visible');
        cy.get('[data-testid="order-id"]').should('exist');
    });
});
```

**5-7. Test Restaurant Workflow**
```
Scenario: Nhà hàng xử lý đơn
Bước 1: Login restaurant app
Bước 2: Xem đơn mới
Bước 3: Click "Bắt đầu nấu"
Bước 4: Click "Sẵn sàng giao"
Bước 5: Check drone được assign
```

**8-10. Test Error Scenarios**
```
Scenario: Thanh toán thất bại
Bước 1: Thêm món vào giỏ
Bước 2: Checkout với thẻ hết hạn
Bước 3: Check hiện lỗi "Thanh toán thất bại"
Bước 4: Check đơn không được tạo
```

---

## ĐIỂM NÓI CHO PRESENTATION

### Slide 1: Tổng quan
- Dự án có 139 tests tự động
- Coverage > 80% cho tất cả modules
- Chạy tests trong CI/CD pipeline
- Phát hiện lỗi sớm, tiết kiệm thời gian debug

### Slide 2: Frontend Tests
- Client app: 63 tests (giỏ hàng, đơn hàng, payment)
- Restaurant app: 55 tests (quản lý đơn, menu)
- Admin app: 8 tests (authentication, authorization)
- Dùng Vitest (nhanh hơn Jest 10x)

### Slide 3: Backend Tests
- Server app: 13 unit tests + integration tests
- Test API endpoints với real database
- Test logic phức tạp: drone assignment, payment processing
- Mock external services (ZaloPay API)

### Slide 4: Integration & E2E
- Integration tests: Test nhiều modules tương tác
- E2E tests: Test như user thật sử dụng
- Tự động chạy trên CI mỗi khi push code
- Đảm bảo mọi thứ hoạt động end-to-end

### Slide 5: Best Practices
- Test-Driven Development (TDD): Viết test trước, code sau
- Arrange-Act-Assert pattern
- Mock external dependencies
- Meaningful test descriptions
- Fast tests (< 10s cho toàn bộ suite)

### Slide 6: Benefits
- Tự tin refactor code
- Documentation sống
- Phát hiện regression bugs
- Giảm manual testing
- Improve code quality

### Câu hỏi hay gặp:
**Q: Tại sao không test 100%?**
A: 80% là sweet spot. Test 100% tốn thời gian mà không hiệu quả lắm. Tập trung test business logic quan trọng.

**Q: Tests có chạy trên CI không?**
A: Có, mỗi khi push code, GitHub Actions tự động chạy toàn bộ tests. Pass mới cho merge.

**Q: Mất bao lâu chạy hết tests?**
A: < 30 giây cho unit tests, ~2 phút cho integration + E2E.

**Q: Test có catch được bug thật không?**
A: Có, tuần trước catch được bug double-payment nhờ có test.

---

## KẾT LUẬN

Testing là phần quan trọng không thể thiếu của dự án. Với 139 tests tự động:
- Đảm bảo code quality cao
- Phát hiện bugs sớm
- Tự tin khi deploy lên production
- Dễ maintain và scale về sau

Dự án FOODFAST đã implement testing strategy toàn diện từ unit → integration → E2E, cover được hầu hết các scenarios quan trọng.

---

## PHỤ LỤC: CÁC FILE TEST TRONG PROJECT

### Frontend Tests Location
```
client_app/src/__tests__/
├── unit/
│   ├── redux/slices/
│   │   ├── cartSlice.test.js         (15 tests)
│   │   └── orderSlice.test.js        (13 tests)
│   └── services/
│       ├── priceUtils.test.js        (24 tests)
│       └── orderValidation.test.js   (11 tests)
└── integration/
    └── checkout-flow.test.js

restaurant_app/src/__tests__/
├── unit/
│   ├── redux/slices/
│   │   ├── orderSlice.test.js        (11 tests)
│   │   └── productSlice.test.js      (13 tests)
│   └── services/
│       └── helpers.test.js           (31 tests)

admin_app/src/__tests__/
└── unit/redux/slices/
    └── authSlice.test.js             (8 tests)
```

### Backend Tests Location
```
server_app/__tests__/
├── unit/
│   ├── services/
│   │   ├── payment.test.js
│   │   ├── orderValidation.test.js
│   │   ├── droneAssignment.test.js
│   │   └── orderStatusFlow.test.js
│   └── middleware/
│       └── authentication.test.js
└── integration/
    ├── order-flow.test.js
    └── payment.test.js
```

### E2E Tests Location
```
cypress/e2e/
└── user-journeys.cy.js
```

### Chạy Tests
```bash
# Frontend tests
cd client_app && npm test
cd restaurant_app && npm test
cd admin_app && npm test

# Backend tests
cd server_app && npm test

# E2E tests
npm run cypress:open

# Coverage report
npm test -- --coverage
```
