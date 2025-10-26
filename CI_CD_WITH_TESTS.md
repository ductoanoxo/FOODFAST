# 🚀 CI/CD Pipeline với Unit Tests & Integration Tests

## 📋 Tổng Quan

CI/CD pipeline này sẽ:
1. ✅ **Chạy Unit Tests** - Test các hàm logic (nhanh, không cần DB)
2. ✅ **Chạy Integration Tests** - Test API với MongoDB thật
3. ✅ **Build Docker Images** - Chỉ build nếu tests pass
4. ✅ **Push to Registry** - Push images lên GitHub Container Registry
5. ✅ **Upload Coverage** - Báo cáo test coverage

## 🏗️ Pipeline Architecture

```
┌─────────────────────────────────────────────────────────┐
│  1. TEST JOB                                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Setup MongoDB Service Container                 │  │
│  │  ↓                                               │  │
│  │  Install Dependencies (npm ci)                   │  │
│  │  ↓                                               │  │
│  │  Run Unit Tests (fast, no DB)                   │  │
│  │  ↓                                               │  │
│  │  Run Integration Tests (with MongoDB)           │  │
│  │  ↓                                               │  │
│  │  Upload Coverage Report                         │  │
│  └──────────────────────────────────────────────────┘  │
│                       ↓                                  │
│              ✅ Tests Passed                            │
│                       ↓                                  │
│  2. BUILD & PUSH JOB (only if tests pass)              │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Build Docker Images (5 services)                │  │
│  │  ↓                                               │  │
│  │  Push to GitHub Container Registry              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 📊 Tests Coverage

### Unit Tests (Nhanh - ~2 giây)
- 📏 Distance Calculation (4 tests)
- ✅ Input Validation (17 tests)
- 💰 Order Calculation (10 tests)
- **Total: ~31 unit tests**

### Integration Tests (Chậm - ~10-15 giây)
- 🔐 Auth API (14 tests)
- 🚁 Drone API (15 tests)
- 📦 Order API (12 tests)
- **Total: ~41 integration tests**

### Tổng Cộng: ~72 tests

## 🔧 Workflow Configuration

### File Location
```
.github/workflows/docker-build-push.yml
```

### Triggers
Pipeline chạy khi:
- ✅ Push code lên `main`, `develop`, `DUCTOAN`, `kiet`
- ✅ Tạo tag mới (v*)
- ✅ Tạo Pull Request vào `main` hoặc `develop`

### Jobs

#### Job 1: Test
```yaml
test:
  runs-on: ubuntu-latest
  services:
    mongodb:
      image: mongo:7.0
      ports: 27017:27017
  steps:
    - Checkout code
    - Setup Node.js 20
    - Install dependencies
    - Run unit tests
    - Run integration tests
    - Upload coverage
```

**Environment Variables:**
- `NODE_ENV=test`
- `MONGODB_URI=mongodb://admin:admin123@localhost:27017/foodfast_test`
- `JWT_SECRET=test-secret-key`
- `CLOUDINARY_*=test`

#### Job 2: Build & Push
```yaml
build-and-push:
  needs: test  # Only runs if test passes
  runs-on: ubuntu-latest
  strategy:
    matrix:
      - client_app
      - restaurant_app
      - admin_app
      - drone_manage
      - server_app
  steps:
    - Build Docker image
    - Push to ghcr.io
```

## 🎯 NPM Scripts

Thêm vào `server_app/package.json`:

```json
{
  "scripts": {
    "test": "jest --verbose --coverage",
    "test:unit": "jest --testPathPattern=__tests__/unit --verbose --coverage",
    "test:integration": "jest --testPathPattern=__tests__/integration --verbose --coverage --runInBand",
    "test:watch": "jest --watch",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

**Giải thích:**
- `test:unit` - Chỉ chạy unit tests trong thư mục `__tests__/unit`
- `test:integration` - Chỉ chạy integration tests, `--runInBand` để chạy tuần tự (tránh race condition với DB)
- `test:ci` - Optimized cho CI/CD với `--ci` flag và giới hạn workers

## 📁 Test Structure

```
server_app/
├── __tests__/
│   ├── setup.js                 # Global setup
│   ├── helpers/
│   │   ├── testApp.js          # Express app for tests
│   │   └── dbHandler.js        # MongoDB handler
│   ├── unit/                   # Unit tests (no DB)
│   │   ├── distance.test.js
│   │   ├── validation.test.js
│   │   └── orderCalculation.test.js
│   └── integration/            # Integration tests (with DB)
│       ├── auth.test.js
│       ├── drone.test.js
│       └── order.test.js
└── jest.config.js
```

## 🔍 Test Examples

### Unit Test Example
```javascript
// __tests__/unit/validation.test.js
test('✅ Email hợp lệ', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
});

test('❌ Email không hợp lệ', () => {
    expect(isValidEmail('invalid')).toBe(false);
});
```

### Integration Test Example
```javascript
// __tests__/integration/order.test.js
test('✅ Tạo order với voucher percentage', async () => {
    const voucher = await Voucher.create({
        code: 'DISCOUNT20',
        discountValue: 20
    });

    const response = await request(app)
        .post('/api/orders')
        .send({ voucherCode: 'DISCOUNT20', ... })
        .expect(201);

    expect(response.body.data.discountAmount).toBe(40000);
});
```

## 🚦 Pipeline Flow

### 1. Code Push
```bash
git add .
git commit -m "Add feature"
git push origin main
```

### 2. GitHub Actions Triggered
```
✓ Checkout code
✓ Setup Node.js 20
✓ npm ci (install dependencies)
```

### 3. Unit Tests Run
```
⚡ Running unit tests...
  ✓ Distance calculation (4 tests)
  ✓ Validation (17 tests)
  ✓ Order calculation (10 tests)
✅ Unit tests passed in 2.3s
```

### 4. Integration Tests Run
```
🗄️  MongoDB container ready
⚡ Running integration tests...
  ✓ Auth API (14 tests)
  ✓ Drone API (15 tests)
  ✓ Order API (12 tests)
✅ Integration tests passed in 14.8s
```

### 5. Coverage Upload
```
📊 Uploading coverage to Codecov...
✅ Coverage: 85.4%
```

### 6. Build Docker Images (only if tests pass)
```
🐳 Building images...
  ✓ client_app
  ✓ restaurant_app
  ✓ admin_app
  ✓ drone_manage
  ✓ server_app
✅ All images built successfully
```

### 7. Push to Registry
```
📦 Pushing to ghcr.io...
✅ All images pushed
```

## 🛡️ Benefits

### 1. Quality Assurance
- ✅ Không build nếu tests fail
- ✅ Phát hiện bugs sớm
- ✅ Tránh deploy code lỗi

### 2. Confidence
- ✅ Yên tâm merge code
- ✅ Biết code hoạt động đúng
- ✅ Safe refactoring

### 3. Documentation
- ✅ Tests = Living documentation
- ✅ Show how code works
- ✅ Examples for new developers

### 4. Professional
- ✅ Industry standard practice
- ✅ Good impression với reviewers
- ✅ Portfolio quality

## 📈 Coverage Reports

### Local
```bash
cd server_app
npm test
# Coverage report: coverage/lcov-report/index.html
```

### CI/CD
- Tự động upload lên Codecov
- Badge hiển thị trên README
- Track coverage over time

## 🐛 Troubleshooting

### Tests fail với MongoDB connection error
**Solution:**
```yaml
# Đảm bảo MongoDB service container được setup đúng
services:
  mongodb:
    image: mongo:7.0
    env:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
    options: >-
      --health-cmd "mongosh --eval 'db.adminCommand({ping: 1})'"
```

### Tests timeout trong CI/CD
**Solution:**
```javascript
// jest.config.js
testTimeout: 30000  // Tăng timeout lên 30s
```

### Cannot find module errors
**Solution:**
```yaml
# Dùng npm ci thay vì npm install
- run: npm ci
```

## 🎓 Best Practices

### 1. Keep Tests Fast
- ✅ Unit tests < 5ms mỗi test
- ✅ Integration tests < 500ms mỗi test
- ✅ Total runtime < 30s

### 2. Test Isolation
- ✅ Clear DB sau mỗi test
- ✅ Không depend vào test khác
- ✅ Independent và repeatable

### 3. Meaningful Names
- ✅ Dùng emoji để dễ đọc
- ✅ Describe what test does
- ✅ Include expected result

### 4. Coverage Goals
- 🎯 Unit tests: 90%+
- 🎯 Integration tests: 70%+
- 🎯 Overall: 80%+

## 🔗 Related Files

- `.github/workflows/docker-build-push.yml` - Pipeline config
- `server_app/package.json` - NPM scripts
- `server_app/jest.config.js` - Jest config
- `server_app/__tests__/` - All test files

## 📚 Documentation

- [Testing Guide](../server_app/__tests__/README.md)
- [Unit Tests Guide](../UNIT_TESTS_GUIDE.md)
- [Integration Tests Guide](../INTEGRATION_TESTS_GUIDE.md)

---

## ✅ Checklist

Để setup CI/CD với tests:

- [ ] Tạo thư mục `__tests__/` với unit và integration tests
- [ ] Cấu hình `jest.config.js`
- [ ] Thêm npm scripts vào `package.json`
- [ ] Tạo `.github/workflows/docker-build-push.yml`
- [ ] Setup MongoDB service container
- [ ] Configure environment variables
- [ ] Test locally trước khi push
- [ ] Push code và verify pipeline chạy

---

**"Tests = Confidence = Better Code Quality!"** 🚀

**CI/CD = Automated Testing + Deployment!** 🎯
