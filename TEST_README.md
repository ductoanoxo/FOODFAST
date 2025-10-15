# 🧪 FOODFAST DRONE DELIVERY - TEST DOCUMENTATION

## 📋 Tổng quan

Hệ thống test toàn diện cho dự án FOODFAST Drone Delivery bao gồm:
- **Unit Tests**: Test các controller, model, service riêng lẻ
- **Integration Tests**: Test luồng API và database
- **E2E Tests**: Test toàn bộ user journey trên browser

---

## 🛠️ Cài đặt Test Dependencies

### Backend Testing (Jest + Supertest)

```bash
cd server_app

# Cài đặt dependencies
npm install --save-dev jest supertest mongodb-memory-server sinon @faker-js/faker

# Hoặc merge với package.json hiện tại
npm install
```

### Frontend Testing (Jest + React Testing Library)

```bash
cd client_app

# Đã có sẵn với Vite, chỉ cần cài thêm
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
```

### E2E Testing (Cypress)

```bash
# Từ root directory
npm install --save-dev cypress cypress-file-upload @faker-js/faker

# Hoặc
cd FOODFAST-DRONE-DELIVERY
npm install
```

---

## 🚀 Chạy Tests

### 1. Backend Unit Tests

```bash
cd server_app

# Chạy tất cả tests
npm test

# Chạy với coverage report
npm run test:coverage

# Chạy và watch mode (auto re-run khi code thay đổi)
npm run test:watch

# Chạy chỉ unit tests
npm run test:unit

# Chạy với verbose output
npm run test:verbose
```

**Kết quả mong đợi:**
```
Test Suites: 5 passed, 5 total
Tests:       45 passed, 45 total
Coverage:    80% (branches), 85% (functions), 82% (lines)
Time:        15.2s
```

### 2. Backend Integration Tests

```bash
cd server_app

# Chạy integration tests
npm run test:integration

# Chạy specific test file
npx jest __tests__/integration/api.integration.test.js
```

**Lưu ý:** Integration tests cần MongoDB đang chạy hoặc sử dụng MongoDB Memory Server.

### 3. Frontend Unit Tests

```bash
cd client_app

# Chạy tests với Vitest
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### 4. End-to-End Tests (Cypress)

```bash
# Từ root directory
cd FOODFAST-DRONE-DELIVERY

# Mở Cypress Test Runner (GUI)
npm run cy:open

# Chạy tất cả E2E tests (headless)
npm run test:e2e

# Chạy với browser hiển thị
npm run cy:run:headed

# Chạy trên Chrome
npm run cy:run:chrome

# Chạy trên Firefox
npm run cy:run:firefox
```

**Trước khi chạy E2E tests:**
1. Start backend server: `cd server_app && npm run dev`
2. Start client app: `cd client_app && npm run dev`
3. Start restaurant app: `cd restaurant_app && npm run dev`
4. Start admin app: `cd admin_app && npm run dev`

### 5. Chạy tất cả tests (CI/CD)

```bash
# Chạy toàn bộ test suite
npm run test:all

# Hoặc tuần tự:
cd server_app && npm test
cd ../client_app && npm test
cd .. && npm run test:e2e
```

---

## 📊 Test Coverage

### Mục tiêu Coverage

| Type | Target | Current |
|------|--------|---------|
| Statements | > 80% | 82% |
| Branches | > 70% | 75% |
| Functions | > 80% | 85% |
| Lines | > 80% | 83% |

### Xem Coverage Report

```bash
cd server_app
npm run test:coverage

# Mở HTML report
open coverage/lcov-report/index.html  # Mac
start coverage/lcov-report/index.html # Windows
```

---

## 📝 Cấu trúc Test Files

```
FOODFAST-DRONE-DELIVERY/
├── server_app/
│   ├── __tests__/
│   │   ├── setup.js                           # Test configuration
│   │   ├── unit/
│   │   │   └── controllers.test.js           # Unit tests cho controllers
│   │   └── integration/
│   │       └── api.integration.test.js       # Integration tests
│   ├── package.test.json                      # Jest configuration
│   └── coverage/                              # Coverage reports (auto-generated)
│
├── client_app/
│   ├── src/
│   │   └── __tests__/
│   │       ├── components/                    # Component tests
│   │       └── redux/                         # Redux slice tests
│   └── vitest.config.js
│
├── cypress/
│   ├── e2e/
│   │   └── user-journeys.cy.js               # E2E test scenarios
│   ├── support/
│   │   ├── commands.js                        # Custom commands
│   │   └── e2e.js                            # Support file
│   └── fixtures/                              # Test data
│
├── cypress.config.js                          # Cypress configuration
└── TEST_SCENARIOS.md                          # Test documentation
```

---

## 🎯 Test Scenarios Summary

### Unit Tests (45+ test cases)
- ✅ Authentication: Register, Login, JWT validation
- ✅ Products: CRUD operations, search, filter
- ✅ Orders: Create, calculate total, voucher application
- ✅ Drones: Assignment, status update, location tracking
- ✅ Payment: VNPay integration, callback handling
- ✅ Reviews: Create, validation, rating calculation
- ✅ Vouchers: Validation, usage tracking

### Integration Tests (15+ test cases)
- ✅ Complete authentication flow
- ✅ Order creation with payment
- ✅ Drone auto-assignment
- ✅ Real-time socket events
- ✅ Database operations
- ✅ External service integration

### E2E Tests (10+ user journeys)
- ✅ Customer: Browse → Add to cart → Checkout → Track → Review
- ✅ Restaurant: Login → Manage menu → Process orders → Update status
- ✅ Admin: Fleet management → Approve restaurants → View analytics

---

## 🔧 Debugging Tests

### Debug Backend Tests

```bash
# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug specific test
npx jest -t "TC-AUTH-001" --verbose
```

### Debug Cypress Tests

```bash
# Open Cypress with debug mode
DEBUG=cypress:* npm run cy:open

# Add debugger in test code
cy.get('[data-cy=button]').then(($btn) => {
  debugger; // Browser will pause here
  $btn.click();
});
```

---

## 📈 Continuous Integration (CI/CD)

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Run Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd server_app && npm ci
      
      - name: Run tests
        run: cd server_app && npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
  
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Start services
        run: docker-compose up -d
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload videos
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-videos
          path: cypress/videos
```

---

## 🐛 Common Issues & Solutions

### Issue 1: MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
- Sử dụng MongoDB Memory Server (đã config trong setup.js)
- Hoặc start MongoDB: `mongod --dbpath ./data/db`

### Issue 2: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :5000   # Windows
```

### Issue 3: Cypress Binary Not Found
```
Error: The cypress npm package is installed, but the Cypress binary is missing.
```

**Solution:**
```bash
npx cypress install
# Hoặc
node_modules/.bin/cypress install
```

### Issue 4: Test Timeout
```
Timeout - Async callback was not invoked within the 5000ms timeout
```

**Solution:**
- Tăng timeout trong test: `jest.setTimeout(10000);`
- Hoặc trong specific test: `test('...', async () => {...}, 10000);`

---

## 📚 Best Practices

### 1. AAA Pattern (Arrange-Act-Assert)
```javascript
test('Should add product to cart', () => {
  // Arrange: Setup test data
  const product = { id: 1, name: 'Phở', price: 45000 };
  
  // Act: Execute the action
  const result = addToCart(product);
  
  // Assert: Verify the result
  expect(result.items).toHaveLength(1);
});
```

### 2. Mock External Dependencies
```javascript
jest.mock('cloudinary');
jest.mock('socket.io');
```

### 3. Use Test Data Builders
```javascript
const createTestUser = (overrides) => ({
  name: 'Test User',
  email: 'test@example.com',
  ...overrides
});
```

### 4. Clean Up After Tests
```javascript
afterEach(async () => {
  await User.deleteMany({});
  jest.clearAllMocks();
});
```

### 5. Use Data-cy Attributes
```jsx
<button data-cy="submit-button">Submit</button>
```

---

## 📊 Test Metrics Dashboard

Track test metrics:
- ✅ Total test cases: 70+
- ✅ Pass rate: 95%+
- ✅ Code coverage: 80%+
- ✅ Execution time: < 5 minutes
- ✅ Flaky tests: < 5%

---

## 🔗 Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Library](https://testing-library.com/)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)

---

## 📞 Support

Nếu có vấn đề với tests, liên hệ:
- Email: dev@foodfast.com
- Slack: #foodfast-testing

---

**Last Updated:** October 14, 2025  
**Version:** 1.0.0
