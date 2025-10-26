# 🧪 Testing Guide

## 📚 Tổng Quan

Dự án có **2 loại tests**:
- **Unit Tests**: Test các hàm logic độc lập (không cần DB/API)
- **Integration Tests**: Test toàn bộ API flow với database thật

## 🚀 Chạy Tests

### Chạy tất cả tests
```bash
npm test
```

### Chạy chỉ Unit Tests (nhanh)
```bash
npm run test:unit
```

### Chạy chỉ Integration Tests (cần MongoDB)
```bash
npm run test:integration
```

### Chạy tests với watch mode (tự động rerun khi code thay đổi)
```bash
npm run test:watch
```

### Chạy tests cho CI/CD
```bash
npm run test:ci
```

## 📁 Cấu Trúc Tests

```
server_app/
├── __tests__/
│   ├── setup.js                    # Jest setup file
│   ├── helpers/
│   │   ├── testApp.js             # Express app for testing
│   │   └── dbHandler.js           # MongoDB handler
│   ├── unit/                      # Unit tests (không cần DB)
│   │   ├── distance.test.js       # Tính khoảng cách GPS
│   │   ├── validation.test.js     # Validate input
│   │   └── orderCalculation.test.js # Tính toán order
│   └── integration/               # Integration tests (cần DB)
│       ├── auth.test.js          # Auth API
│       ├── drone.test.js         # Drone API
│       └── order.test.js         # Order API
└── jest.config.js                # Jest configuration
```

## 📊 Unit Tests

### Distance Calculation (4 tests)
```javascript
✅ Tính khoảng cách giữa 2 điểm chính xác
✅ Khoảng cách giữa 2 điểm trùng nhau = 0
✅ Tính khoảng cách ngắn (< 1km)
✅ Khoảng cách đối xứng (A->B = B->A)
```

### Validation Utils (17 tests)
```javascript
📧 Email Validation
✅ Email hợp lệ
❌ Email không hợp lệ

📱 Phone Validation
✅ Số điện thoại Việt Nam hợp lệ
❌ Số điện thoại không hợp lệ

🔐 Password Validation
✅ Password đủ mạnh
❌ Password quá yếu

📍 Address Validation
✅ Địa chỉ hợp lệ
❌ Địa chỉ không hợp lệ
```

### Order Calculation (10 tests)
```javascript
✅ Tính subtotal
✅ Discount phần trăm
✅ Discount fixed amount
✅ Delivery fee
✅ Total calculation
```

## 🔗 Integration Tests

### Auth API (14 tests)
```javascript
POST /api/auth/register
✅ Đăng ký user mới thành công
❌ Email đã tồn tại
❌ Thiếu thông tin required

POST /api/auth/login
✅ Đăng nhập thành công
❌ Sai password
❌ Email không tồn tại
```

### Drone API (15 tests)
```javascript
GET /api/drones
✅ Lấy tất cả drones
✅ Filter by status
✅ Filter by battery level

POST /api/drones
✅ Tạo drone mới
❌ DroneId đã tồn tại

PATCH /api/drones/:id
✅ Update status
✅ Update battery

DELETE /api/drones/:id
✅ Xóa thành công
❌ Drone không tồn tại
```

### Order API (12 tests)
```javascript
POST /api/orders
✅ Tạo order không voucher
✅ Áp dụng voucher percentage
✅ Áp dụng voucher fixed
❌ Voucher không đủ điều kiện
❌ Voucher hết lượt

GET /api/orders
✅ Lấy danh sách orders
✅ Filter by status
```

## 🛠️ Requirements

### Local Development
- Node.js >= 18
- MongoDB running on localhost:27017
- npm packages installed

### CI/CD (GitHub Actions)
- MongoDB service container
- Environment variables:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `CLOUDINARY_*`

## 📈 Coverage

Tests sẽ tạo coverage report trong thư mục `coverage/`:
- `coverage/lcov-report/index.html` - HTML report (mở bằng browser)
- `coverage/coverage-final.json` - JSON report for CI/CD
- Terminal output - Text summary

## 🎯 Best Practices

1. **Unit Tests**: Nhanh, test logic thuần
   - Không mock database
   - Không call API
   - Test 1 function cụ thể

2. **Integration Tests**: Chậm hơn, test toàn bộ flow
   - Real database
   - Real HTTP requests
   - Test end-to-end scenarios

3. **Test Naming**: Descriptive với emoji
   - ✅ cho test cases thành công
   - ❌ cho test cases error handling

4. **Database Cleanup**: Integration tests tự động clear DB sau mỗi test

## 🐛 Troubleshooting

### Tests fail với "MongoError"
```bash
# Đảm bảo MongoDB đang chạy
mongod --version

# Hoặc dùng Docker
docker run -d -p 27017:27017 mongo:7.0
```

### Tests timeout
```bash
# Tăng timeout trong jest.config.js
testTimeout: 60000
```

### Cannot find module
```bash
# Cài lại dependencies
npm ci
```

## 📝 Thêm Tests Mới

### Unit Test Example
```javascript
// __tests__/unit/myFunction.test.js
describe('My Function', () => {
    test('✅ should work correctly', () => {
        const result = myFunction(input);
        expect(result).toBe(expected);
    });
});
```

### Integration Test Example
```javascript
// __tests__/integration/myApi.test.js
const request = require('supertest');
const { createTestApp } = require('../helpers/testApp');
const dbHandler = require('../helpers/dbHandler');

const app = createTestApp();

describe('My API', () => {
    beforeAll(async () => {
        await dbHandler.connect();
    });

    afterEach(async () => {
        await dbHandler.clearDatabase();
    });

    afterAll(async () => {
        await dbHandler.closeDatabase();
    });

    test('✅ should return 200', async () => {
        const response = await request(app)
            .get('/api/my-endpoint')
            .expect(200);
        
        expect(response.body.success).toBe(true);
    });
});
```

## 🎓 Tài Liệu Tham Khảo

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)

---

**Happy Testing! 🚀**
