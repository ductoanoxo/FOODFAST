# 🧪 FOODFAST DRONE DELIVERY - TEST SCENARIOS

## 📋 Mục lục
1. [Unit Tests](#1-unit-tests)
2. [Integration Tests](#2-integration-tests)
3. [End-to-End Tests](#3-end-to-end-tests)
4. [Performance Tests](#4-performance-tests)
5. [Security Tests](#5-security-tests)
6. [Test Data Setup](#6-test-data-setup)

---

## 1. UNIT TESTS

### 1.1. Backend Unit Tests (Server App)

#### 1.1.1. Authentication Controller Tests
```javascript
// Test file: server_app/__tests__/controllers/authController.test.js

describe('Authentication Controller', () => {
  
  test('TC-AUTH-001: Đăng ký thành công với thông tin hợp lệ', async () => {
    // Input: name, email, password, phone, role
    // Expected: Status 201, return user object & token
  });

  test('TC-AUTH-002: Đăng ký thất bại - Email đã tồn tại', async () => {
    // Input: Email đã có trong database
    // Expected: Status 400, error message
  });

  test('TC-AUTH-003: Đăng ký thất bại - Thiếu thông tin bắt buộc', async () => {
    // Input: Missing required fields
    // Expected: Status 400, validation errors
  });

  test('TC-AUTH-004: Đăng nhập thành công với credentials đúng', async () => {
    // Input: email, password
    // Expected: Status 200, return user & token
  });

  test('TC-AUTH-005: Đăng nhập thất bại - Sai mật khẩu', async () => {
    // Input: Correct email, wrong password
    // Expected: Status 401, error message
  });

  test('TC-AUTH-006: Đăng nhập thất bại - Email không tồn tại', async () => {
    // Input: Non-existent email
    // Expected: Status 404, error message
  });

  test('TC-AUTH-007: Lấy thông tin user hiện tại thành công', async () => {
    // Input: Valid JWT token
    // Expected: Status 200, return user info
  });

  test('TC-AUTH-008: Lấy thông tin thất bại - Token không hợp lệ', async () => {
    // Input: Invalid/expired token
    // Expected: Status 401, error message
  });

  test('TC-AUTH-009: Mật khẩu được mã hóa bcrypt khi lưu', async () => {
    // Verify: Password is hashed before saving to DB
  });

  test('TC-AUTH-010: JWT token có thời hạn hợp lệ', async () => {
    // Verify: Token expiration time is correct
  });
});
```

#### 1.1.2. Product Controller Tests
```javascript
describe('Product Controller', () => {
  
  test('TC-PROD-001: Lấy danh sách sản phẩm với pagination', async () => {
    // Input: page=1, limit=20
    // Expected: Return 20 products, pagination info
  });

  test('TC-PROD-002: Tìm kiếm sản phẩm theo tên', async () => {
    // Input: search="phở"
    // Expected: Return products matching search term
  });

  test('TC-PROD-003: Lọc sản phẩm theo category', async () => {
    // Input: category_id
    // Expected: Return products of that category
  });

  test('TC-PROD-004: Lọc sản phẩm theo khoảng giá', async () => {
    // Input: minPrice=10000, maxPrice=50000
    // Expected: Return products in price range
  });

  test('TC-PROD-005: Tạo sản phẩm mới thành công (Restaurant)', async () => {
    // Input: Product data with valid restaurant token
    // Expected: Status 201, return created product
  });

  test('TC-PROD-006: Tạo sản phẩm thất bại - Không có quyền', async () => {
    // Input: Customer token trying to create product
    // Expected: Status 403, forbidden error
  });

  test('TC-PROD-007: Cập nhật sản phẩm thành công', async () => {
    // Input: Updated product data
    // Expected: Status 200, return updated product
  });

  test('TC-PROD-008: Xóa sản phẩm thành công', async () => {
    // Input: Product ID
    // Expected: Status 200, success message
  });

  test('TC-PROD-009: Lấy chi tiết sản phẩm kèm reviews', async () => {
    // Input: Product ID
    // Expected: Return product with reviews & rating
  });

  test('TC-PROD-010: Validation giá sản phẩm phải > 0', async () => {
    // Input: Product with price = -1000
    // Expected: Validation error
  });
});
```

#### 1.1.3. Order Controller Tests
```javascript
describe('Order Controller', () => {
  
  test('TC-ORDER-001: Tạo đơn hàng mới thành công', async () => {
    // Input: Cart items, delivery address, payment method
    // Expected: Status 201, return order with status "pending"
  });

  test('TC-ORDER-002: Tạo đơn thất bại - Giỏ hàng trống', async () => {
    // Input: Empty items array
    // Expected: Status 400, error message
  });

  test('TC-ORDER-003: Tạo đơn thất bại - Sản phẩm không tồn tại', async () => {
    // Input: Invalid product ID in items
    // Expected: Status 404, error message
  });

  test('TC-ORDER-004: Tính tổng tiền đơn hàng chính xác', async () => {
    // Verify: totalAmount = sum(items) + deliveryFee - discount
  });

  test('TC-ORDER-005: Áp dụng voucher giảm giá thành công', async () => {
    // Input: Valid voucher code
    // Expected: Discount applied correctly
  });

  test('TC-ORDER-006: Áp dụng voucher thất bại - Hết hạn', async () => {
    // Input: Expired voucher
    // Expected: Status 400, error message
  });

  test('TC-ORDER-007: Cập nhật trạng thái đơn hàng (Restaurant)', async () => {
    // Input: orderId, newStatus="preparing"
    // Expected: Status updated successfully
  });

  test('TC-ORDER-008: Lấy lịch sử đơn hàng của customer', async () => {
    // Input: Customer token
    // Expected: Return all orders of that customer
  });

  test('TC-ORDER-009: Lấy đơn hàng của restaurant', async () => {
    // Input: Restaurant token
    // Expected: Return orders from that restaurant
  });

  test('TC-ORDER-010: Hủy đơn hàng khi status = "pending"', async () => {
    // Input: Order with pending status
    // Expected: Status changed to "cancelled"
  });

  test('TC-ORDER-011: Không thể hủy đơn khi đang giao', async () => {
    // Input: Order with status="delivering"
    // Expected: Status 400, cannot cancel
  });
});
```

#### 1.1.4. Drone Controller Tests
```javascript
describe('Drone Controller', () => {
  
  test('TC-DRONE-001: Lấy danh sách tất cả drone', async () => {
    // Expected: Return all drones with status
  });

  test('TC-DRONE-002: Lấy danh sách drone available', async () => {
    // Expected: Return only drones with status="available"
  });

  test('TC-DRONE-003: Tạo drone mới (Admin)', async () => {
    // Input: Drone data
    // Expected: Status 201, return created drone
  });

  test('TC-DRONE-004: Cập nhật vị trí drone', async () => {
    // Input: Drone ID, new location {lat, lng}
    // Expected: Location updated successfully
  });

  test('TC-DRONE-005: Cập nhật trạng thái battery', async () => {
    // Input: Drone ID, battery percentage
    // Expected: Battery updated successfully
  });

  test('TC-DRONE-006: Gán drone cho đơn hàng', async () => {
    // Input: Order ID, Drone ID
    // Expected: Drone assigned, status="busy"
  });

  test('TC-DRONE-007: Không gán drone khi battery < 20%', async () => {
    // Input: Drone with low battery
    // Expected: Status 400, error message
  });

  test('TC-DRONE-008: Giải phóng drone sau khi giao xong', async () => {
    // Input: Drone ID
    // Expected: Status changed to "available"
  });

  test('TC-DRONE-009: Kiểm tra drone stuck (>30 phút)', async () => {
    // Verify: Detect stuck drones
  });

  test('TC-DRONE-010: Tự động gán drone gần nhất', async () => {
    // Input: Order location
    // Expected: Assign nearest available drone
  });
});
```

#### 1.1.5. Payment Controller Tests
```javascript
describe('Payment Controller', () => {
  
  test('TC-PAY-001: Tạo payment URL VNPay thành công', async () => {
    // Input: Order ID, amount
    // Expected: Return VNPay payment URL
  });

  test('TC-PAY-002: Verify VNPay callback signature', async () => {
    // Input: VNPay return params
    // Expected: Signature valid, payment confirmed
  });

  test('TC-PAY-003: Cập nhật trạng thái thanh toán thành công', async () => {
    // Input: Valid payment response
    // Expected: Order paymentStatus = "paid"
  });

  test('TC-PAY-004: Xử lý thanh toán thất bại', async () => {
    // Input: Failed payment response
    // Expected: Order paymentStatus = "failed"
  });

  test('TC-PAY-005: Thanh toán COD không cần VNPay', async () => {
    // Input: paymentMethod = "COD"
    // Expected: Order created without payment URL
  });
});
```

#### 1.1.6. Review Controller Tests
```javascript
describe('Review Controller', () => {
  
  test('TC-REV-001: Tạo review thành công sau khi giao hàng', async () => {
    // Input: Product ID, rating, comment
    // Expected: Status 201, return created review
  });

  test('TC-REV-002: Không thể review nếu chưa mua', async () => {
    // Input: Customer hasn't ordered this product
    // Expected: Status 403, error message
  });

  test('TC-REV-003: Validation rating từ 1-5', async () => {
    // Input: Rating = 6
    // Expected: Validation error
  });

  test('TC-REV-004: Cập nhật average rating của sản phẩm', async () => {
    // Verify: Product rating recalculated after new review
  });

  test('TC-REV-005: Lấy danh sách review của sản phẩm', async () => {
    // Input: Product ID
    // Expected: Return all reviews with pagination
  });
});
```

#### 1.1.7. Voucher Controller Tests
```javascript
describe('Voucher Controller', () => {
  
  test('TC-VOUCH-001: Kiểm tra voucher hợp lệ', async () => {
    // Input: Voucher code
    // Expected: Return voucher info if valid
  });

  test('TC-VOUCH-002: Voucher không hợp lệ - Hết hạn', async () => {
    // Input: Expired voucher code
    // Expected: Status 400, error message
  });

  test('TC-VOUCH-003: Voucher không hợp lệ - Đã hết lượt', async () => {
    // Input: Voucher with usageCount >= maxUsage
    // Expected: Status 400, error message
  });

  test('TC-VOUCH-004: Áp dụng voucher và tăng usageCount', async () => {
    // Verify: usageCount incremented after use
  });

  test('TC-VOUCH-005: Tạo voucher mới (Admin)', async () => {
    // Input: Voucher data
    // Expected: Status 201, return created voucher
  });
});
```

### 1.2. Frontend Unit Tests

#### 1.2.1. Redux Slice Tests
```javascript
// Test file: client_app/src/__tests__/redux/authSlice.test.js

describe('Auth Slice', () => {
  
  test('TC-REDUX-001: setUser action stores user data', () => {
    // Verify: User data saved in state
  });

  test('TC-REDUX-002: logout action clears user data', () => {
    // Verify: State reset to initial
  });

  test('TC-REDUX-003: setToken stores JWT token', () => {
    // Verify: Token saved correctly
  });
});

// Test file: client_app/src/__tests__/redux/cartSlice.test.js

describe('Cart Slice', () => {
  
  test('TC-CART-001: addToCart adds product to cart', () => {
    // Verify: Product added with quantity
  });

  test('TC-CART-002: addToCart increases quantity if exists', () => {
    // Verify: Quantity incremented
  });

  test('TC-CART-003: removeFromCart removes product', () => {
    // Verify: Product removed from cart
  });

  test('TC-CART-004: updateQuantity changes item quantity', () => {
    // Verify: Quantity updated correctly
  });

  test('TC-CART-005: clearCart empties the cart', () => {
    // Verify: Cart array is empty
  });

  test('TC-CART-006: calculateTotal computes correct total', () => {
    // Verify: Total = sum(price * quantity)
  });
});
```

#### 1.2.2. Component Tests
```javascript
// Test file: client_app/src/__tests__/components/ProductCard.test.jsx

describe('ProductCard Component', () => {
  
  test('TC-COMP-001: Render product name và price', () => {
    // Verify: Product info displayed correctly
  });

  test('TC-COMP-002: Add to cart button triggers action', () => {
    // Verify: Click button calls addToCart
  });

  test('TC-COMP-003: Show discount badge nếu có giảm giá', () => {
    // Verify: Discount label displayed
  });
});
```

---

## 2. INTEGRATION TESTS

### 2.1. API Integration Tests

#### 2.1.1. Authentication Flow
```javascript
describe('Authentication Integration', () => {
  
  test('TC-INT-001: Complete registration và login flow', async () => {
    // 1. Register new user
    // 2. Verify email stored in DB
    // 3. Login with credentials
    // 4. Verify token received
    // 5. Access protected route with token
  });

  test('TC-INT-002: Token refresh flow', async () => {
    // 1. Login
    // 2. Wait for token near expiry
    // 3. Refresh token
    // 4. Verify new token works
  });
});
```

#### 2.1.2. Order Creation Flow
```javascript
describe('Order Creation Integration', () => {
  
  test('TC-INT-003: Complete order flow từ cart đến payment', async () => {
    // 1. Customer adds products to cart
    // 2. Apply voucher
    // 3. Create order
    // 4. Generate VNPay URL
    // 5. Simulate payment callback
    // 6. Verify order status updated
    // 7. Verify drone auto-assigned
  });

  test('TC-INT-004: Order flow với COD payment', async () => {
    // 1. Create order with COD
    // 2. Verify no payment URL generated
    // 3. Verify order created successfully
  });
});
```

#### 2.1.3. Drone Assignment Flow
```javascript
describe('Drone Assignment Integration', () => {
  
  test('TC-INT-005: Auto-assign drone khi order confirmed', async () => {
    // 1. Create order
    // 2. Confirm payment
    // 3. Verify drone auto-assigned
    // 4. Verify drone status = "busy"
    // 5. Verify order status = "assigned"
  });

  test('TC-INT-006: Drone complete delivery flow', async () => {
    // 1. Assign drone to order
    // 2. Update status to "delivering"
    // 3. Update drone location periodically
    // 4. Mark as "delivered"
    // 5. Verify drone status = "available"
  });
});
```

#### 2.1.4. Real-time Socket Integration
```javascript
describe('Socket.io Integration', () => {
  
  test('TC-INT-007: Order update broadcast to customer', async () => {
    // 1. Customer connects to socket
    // 2. Restaurant updates order status
    // 3. Verify customer receives event
  });

  test('TC-INT-008: Drone location broadcast to admin', async () => {
    // 1. Admin connects to socket
    // 2. Drone updates location
    // 3. Verify admin receives update
  });

  test('TC-INT-009: New order notification to restaurant', async () => {
    // 1. Restaurant connects to socket
    // 2. Customer creates order
    // 3. Verify restaurant receives notification
  });
});
```

### 2.2. Database Integration Tests

```javascript
describe('Database Operations', () => {
  
  test('TC-DB-001: Transaction rollback on error', async () => {
    // Verify: DB changes rolled back if error occurs
  });

  test('TC-DB-002: Cascade delete relationships', async () => {
    // Verify: Related documents deleted
  });

  test('TC-DB-003: Index performance on large dataset', async () => {
    // Verify: Query time acceptable with indexes
  });

  test('TC-DB-004: Geospatial query finds nearest drone', async () => {
    // Verify: $near query returns closest drones
  });
});
```

---

## 3. END-TO-END TESTS

### 3.1. Customer Journey

```javascript
describe('E2E: Customer Complete Journey', () => {
  
  test('TC-E2E-001: Customer đặt hàng thành công end-to-end', async () => {
    // 1. Open homepage
    // 2. Register/Login
    // 3. Browse products
    // 4. Search for "phở"
    // 5. View product detail
    // 6. Add to cart
    // 7. Go to cart page
    // 8. Apply voucher
    // 9. Proceed to checkout
    // 10. Fill delivery address
    // 11. Select payment method
    // 12. Complete payment
    // 13. View order tracking
    // 14. Receive delivery
    // 15. Write review
  });

  test('TC-E2E-002: Customer track order real-time', async () => {
    // 1. Customer creates order
    // 2. Open tracking page
    // 3. Verify order status updates
    // 4. Verify drone location updates on map
    // 5. Receive delivery notification
  });

  test('TC-E2E-003: Customer cancel order', async () => {
    // 1. Customer creates order
    // 2. Go to order history
    // 3. Cancel order (if status = pending)
    // 4. Verify status changed
    // 5. Verify refund processed (if paid)
  });
});
```

### 3.2. Restaurant Journey

```javascript
describe('E2E: Restaurant Management', () => {
  
  test('TC-E2E-004: Restaurant quản lý menu', async () => {
    // 1. Restaurant login
    // 2. Go to menu page
    // 3. Add new product
    // 4. Upload image
    // 5. Set price & category
    // 6. Save product
    // 7. Edit product
    // 8. Delete product
  });

  test('TC-E2E-005: Restaurant xử lý đơn hàng', async () => {
    // 1. Restaurant login
    // 2. Receive new order notification
    // 3. View order details
    // 4. Accept order
    // 5. Update status to "preparing"
    // 6. Update to "ready"
    // 7. Wait for drone pickup
    // 8. Confirm picked up
  });

  test('TC-E2E-006: Restaurant tạo promotion', async () => {
    // 1. Go to promotions page
    // 2. Create new promotion
    // 3. Set discount percentage
    // 4. Set start/end date
    // 5. Apply to products
    // 6. Activate promotion
  });
});
```

### 3.3. Admin Journey

```javascript
describe('E2E: Admin Operations', () => {
  
  test('TC-E2E-007: Admin quản lý drone fleet', async () => {
    // 1. Admin login
    // 2. Go to fleet map
    // 3. View all drones real-time
    // 4. Add new drone
    // 5. Assign drone to order manually
    // 6. Monitor drone battery
    // 7. Mark drone for maintenance
  });

  test('TC-E2E-008: Admin approve restaurant', async () => {
    // 1. Go to restaurants page
    // 2. View pending approvals
    // 3. Review restaurant info
    // 4. Approve/Reject restaurant
    // 5. Verify status updated
  });

  test('TC-E2E-009: Admin view analytics dashboard', async () => {
    // 1. Go to dashboard
    // 2. View total orders
    // 3. View revenue charts
    // 4. View active drones
    // 5. Export reports
  });
});
```

---

## 4. PERFORMANCE TESTS

```javascript
describe('Performance Tests', () => {
  
  test('TC-PERF-001: API response time < 200ms', async () => {
    // Measure: GET /api/products response time
  });

  test('TC-PERF-002: Homepage load time < 3s', async () => {
    // Measure: Full page load including assets
  });

  test('TC-PERF-003: Handle 100 concurrent orders', async () => {
    // Verify: System handles load without errors
  });

  test('TC-PERF-004: Database query optimization', async () => {
    // Verify: Complex queries < 100ms
  });

  test('TC-PERF-005: Socket connections scalability', async () => {
    // Verify: Handle 1000+ concurrent socket connections
  });

  test('TC-PERF-006: Image upload time < 5s', async () => {
    // Measure: Upload to Cloudinary time
  });
});
```

---

## 5. SECURITY TESTS

```javascript
describe('Security Tests', () => {
  
  test('TC-SEC-001: SQL Injection prevention', async () => {
    // Input: Malicious SQL in query params
    // Expected: Query sanitized, no injection
  });

  test('TC-SEC-002: XSS prevention', async () => {
    // Input: Script tags in product name
    // Expected: Script escaped, not executed
  });

  test('TC-SEC-003: CSRF token validation', async () => {
    // Verify: CSRF protection on state-changing requests
  });

  test('TC-SEC-004: JWT token expiration', async () => {
    // Verify: Expired token rejected
  });

  test('TC-SEC-005: Password hashing strength', async () => {
    // Verify: Bcrypt with 10+ rounds
  });

  test('TC-SEC-006: Rate limiting on API', async () => {
    // Verify: Requests throttled after limit
  });

  test('TC-SEC-007: HTTPS enforcement', async () => {
    // Verify: HTTP redirects to HTTPS
  });

  test('TC-SEC-008: Authorization checks', async () => {
    // Verify: Customer cannot access admin routes
  });

  test('TC-SEC-009: File upload validation', async () => {
    // Verify: Only allowed file types accepted
  });

  test('TC-SEC-010: Sensitive data not exposed', async () => {
    // Verify: Password not returned in API responses
  });
});
```

---

## 6. TEST DATA SETUP

### 6.1. Test Users
```javascript
const TEST_USERS = {
  customer: {
    email: 'customer.test@foodfast.com',
    password: 'Test123!@#',
    role: 'customer'
  },
  restaurant: {
    email: 'restaurant.test@foodfast.com',
    password: 'Test123!@#',
    role: 'restaurant'
  },
  admin: {
    email: 'admin.test@foodfast.com',
    password: 'Test123!@#',
    role: 'admin'
  },
  drone_operator: {
    email: 'operator.test@foodfast.com',
    password: 'Test123!@#',
    role: 'drone_operator'
  }
};
```

### 6.2. Test Products
```javascript
const TEST_PRODUCTS = [
  {
    name: 'Phở Bò Test',
    price: 45000,
    category: 'food',
    restaurant: 'test_restaurant_id',
    stock: 100
  },
  {
    name: 'Bún Chả Test',
    price: 40000,
    category: 'food',
    restaurant: 'test_restaurant_id',
    stock: 50
  }
];
```

### 6.3. Test Orders
```javascript
const TEST_ORDER = {
  customer: 'test_customer_id',
  items: [
    { product: 'test_product_id', quantity: 2, price: 45000 }
  ],
  deliveryAddress: {
    street: '123 Test Street',
    city: 'Hanoi',
    coordinates: { lat: 21.0285, lng: 105.8542 }
  },
  paymentMethod: 'VNPay',
  totalAmount: 90000
};
```

### 6.4. Test Drones
```javascript
const TEST_DRONES = [
  {
    code: 'DRONE-TEST-001',
    status: 'available',
    battery: 100,
    location: { lat: 21.0285, lng: 105.8542 }
  },
  {
    code: 'DRONE-TEST-002',
    status: 'busy',
    battery: 75,
    location: { lat: 21.0300, lng: 105.8550 }
  }
];
```

---

## 📝 Test Execution Plan

### Phase 1: Unit Tests (Week 1-2)
- [ ] Backend Controllers (7 controllers)
- [ ] Backend Models validation
- [ ] Frontend Redux slices
- [ ] Frontend Components

### Phase 2: Integration Tests (Week 3)
- [ ] API endpoints
- [ ] Database operations
- [ ] Socket.io events
- [ ] External services (VNPay, Cloudinary)

### Phase 3: E2E Tests (Week 4)
- [ ] Customer flows
- [ ] Restaurant flows
- [ ] Admin flows

### Phase 4: Non-functional Tests (Week 5)
- [ ] Performance tests
- [ ] Security tests
- [ ] Load tests

---

## 🛠️ Test Tools & Frameworks

### Backend Testing
- **Jest** - Test framework
- **Supertest** - API testing
- **MongoDB Memory Server** - In-memory database
- **Sinon** - Mocking

### Frontend Testing
- **Jest** - Test framework
- **React Testing Library** - Component testing
- **MSW (Mock Service Worker)** - API mocking

### E2E Testing
- **Cypress** or **Playwright** - Browser automation
- **Faker.js** - Test data generation

### Performance Testing
- **Artillery** - Load testing
- **Lighthouse** - Performance metrics

---

## 📊 Test Coverage Goals

- **Unit Tests**: > 80% code coverage
- **Integration Tests**: All critical paths covered
- **E2E Tests**: All user journeys covered
- **Overall Coverage**: > 70%

---

## 🚀 Running Tests

```bash
# Backend tests
cd server_app
npm test                    # Run all tests
npm run test:unit          # Run unit tests only
npm run test:integration   # Run integration tests
npm run test:coverage      # Generate coverage report

# Frontend tests
cd client_app
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Generate coverage report

# E2E tests
npm run test:e2e           # Run E2E tests
npm run test:e2e:headed    # Run with browser visible
```

---

**Document Version**: 1.0  
**Last Updated**: October 14, 2025  
**Author**: Software Testing Team
