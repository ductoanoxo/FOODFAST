# 🔗 INTEGRATION TEST - GIẢI THÍCH CHI TIẾT

## 📚 INTEGRATION TEST LÀ GÌ?

**Integration Test** = Test nhiều modules/components làm việc **CÙNG NHAU**

### So sánh với Unit Test:

| | **UNIT TEST** 🧩 | **INTEGRATION TEST** 🔗 |
|---|---|---|
| **Test gì?** | 1 function độc lập | Nhiều modules tương tác |
| **Database** | Mock/Fake | Real Test Database |
| **API Calls** | Mock | Real HTTP Requests |
| **Socket.IO** | Mock | Real Socket Connection |
| **Mục đích** | Verify logic đúng | Verify modules hoạt động cùng nhau |
| **Tốc độ** | Rất nhanh ⚡ (ms) | Chậm hơn 🐌 (seconds) |
| **Ví dụ** | Test function `calculateDistance()` | Test API `POST /api/orders` → DB → Response |

---

## 🎯 VÍ DỤ CỤ THỂ

### ❌ UNIT TEST (Mock DB)
```javascript
// Test chỉ 1 function, mock database
test('createDrone function works', async () => {
    Drone.create.mockResolvedValue({ name: 'D1' }); // Mock DB
    
    const result = await createDrone({ name: 'D1' });
    
    expect(result.name).toBe('D1');
});
// ✅ KHÔNG connect DB thật
// ⚡ Chạy cực nhanh
```

### ✅ INTEGRATION TEST (Real DB + API)
```javascript
// Test toàn bộ flow: HTTP Request → Router → Controller → DB → Response
test('POST /api/drones creates drone in database', async () => {
    const response = await request(app)
        .post('/api/drones')
        .send({ name: 'D1', model: 'DJI' })
        .expect(201);
    
    expect(response.body.data.name).toBe('D1');
    
    // Verify data thật trong DB
    const droneInDB = await Drone.findOne({ name: 'D1' });
    expect(droneInDB).toBeTruthy();
});
// ✅ Connect DB thật
// ✅ Call API endpoint thật
// ✅ Verify data lưu vào DB
```

---

## 🏗️ KIẾN TRÚC INTEGRATION TEST

```
┌─────────────────────────────────────────┐
│  HTTP REQUEST (Supertest)               │
│  POST /api/orders                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  EXPRESS ROUTER                         │
│  /api/orders → orderRouter              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  MIDDLEWARE                             │
│  - Authentication (JWT verify)          │
│  - Validation                           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  CONTROLLER                             │
│  orderController.createOrder()          │
│  - Validate items                       │
│  - Calculate total                      │
│  - Apply voucher                        │
│  - Assign drone                         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  DATABASE (MongoDB)                     │
│  - Save Order                           │
│  - Update Drone status                  │
│  - Create VoucherUsage                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  HTTP RESPONSE                          │
│  { success: true, data: {...} }         │
└─────────────────────────────────────────┘
```

**➡️ Integration Test kiểm tra TOÀN BỘ flow này hoạt động đúng!**

---

## 🎮 CHUẨN BỊ TRƯỚC KHI VIẾT TESTS

### 1. **Test Database**
Dùng **MongoDB Memory Server** - In-memory database cho testing:
- ✅ Nhanh hơn real MongoDB
- ✅ Tự động reset sau mỗi test
- ✅ Không ảnh hưởng DB production

### 2. **Test Data (Fixtures)**
Tạo data mẫu để test:
```javascript
const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '0901234567'
};

const testDrone = {
    name: 'Drone-001',
    model: 'DJI Mavic',
    status: 'available',
    battery: 100
};
```

### 3. **Cleanup**
Xóa data sau mỗi test để đảm bảo tests độc lập:
```javascript
afterEach(async () => {
    await Order.deleteMany({});
    await Drone.deleteMany({});
});
```

---

## 📋 INTEGRATION TESTS CHO DỰ ÁN FOODFAST

### Sẽ test 5 flows QUAN TRỌNG NHẤT:

1. **🚁 Drone Management**
   - GET /api/drones - Lấy danh sách drones
   - POST /api/drones - Tạo drone mới
   - PUT /api/drones/:id - Cập nhật drone
   - PATCH /api/drones/:id/status - Đổi trạng thái

2. **📦 Order Flow**
   - POST /api/orders - Tạo đơn hàng
   - GET /api/orders/:id - Lấy chi tiết đơn
   - PUT /api/orders/:id/status - Cập nhật trạng thái
   - Assign drone tự động

3. **🔐 Authentication**
   - POST /api/auth/register - Đăng ký
   - POST /api/auth/login - Đăng nhập
   - Verify JWT token

4. **🎫 Voucher Application**
   - Áp dụng voucher vào order
   - Validate voucher rules
   - Tạo VoucherUsage

5. **🗺️ Location & Distance**
   - Tìm drone gần nhất
   - Tính distance và ETA

---

## 🔧 TOOLS SỬ DỤNG

### **Supertest**
HTTP assertions - Gọi API endpoints
```javascript
const response = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${token}`)
    .send(orderData)
    .expect(201);
```

### **MongoDB Memory Server**
In-memory database cho testing
```javascript
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = await MongoMemoryServer.create();
const uri = mongod.getUri();
await mongoose.connect(uri);
```

### **Jest**
Test runner & assertions
```javascript
expect(response.body.data.status).toBe('pending');
```

---

## 💡 LỢI ÍCH CỦA INTEGRATION TESTS

✅ **Bắt lỗi tích hợp:**  
Unit test có thể pass nhưng modules không hoạt động cùng nhau

✅ **Test real scenarios:**  
Giống với cách user thực sự dùng hệ thống

✅ **Database validation:**  
Đảm bảo data thật sự lưu đúng vào DB

✅ **API contract testing:**  
Verify request/response format đúng

✅ **Confidence cao:**  
Đảm bảo hệ thống hoạt động end-to-end

---

## 🎯 KẾT LUẬN

**Unit Test** → Test từng viên gạch  
**Integration Test** → Test tòa nhà được xây từ các viên gạch

**Cần cả hai để đảm bảo chất lượng code!**

---

Bây giờ tôi sẽ viết Integration Tests cho các chức năng chính! 🚀
