# 🧪 CI Test Workflow - Documentation

## 📋 Tổng Quan

File `ci-test.yml` là workflow riêng biệt dành cho **testing và quality assurance**, chạy độc lập với Docker build pipeline.

## 🎯 Mục Đích

Workflow này tập trung vào:
- ✅ Chạy **Unit Tests** (nhanh, không cần DB)
- ✅ Chạy **Integration Tests** (với MongoDB)
- ✅ Build và lint **Frontend Apps**
- ✅ **Security scanning** với Trivy
- ✅ Tổng hợp kết quả tests

## 🏗️ Workflow Structure

```yaml
ci-test.yml
├── Job 1: Unit Tests (Server)
│   ├── Setup Node.js 20
│   ├── Install dependencies
│   ├── Run unit tests (31 tests)
│   └── Upload coverage
│
├── Job 2: Integration Tests (Server)
│   ├── Setup MongoDB container
│   ├── Setup Node.js 20
│   ├── Install dependencies
│   ├── Run integration tests (41 tests)
│   └── Upload coverage
│
├── Job 3: Frontend Apps Build & Lint
│   ├── Matrix: 4 apps (client, restaurant, admin, drone)
│   ├── Install dependencies
│   ├── Run ESLint
│   ├── Build app
│   └── Upload artifacts
│
├── Job 4: Security Scan
│   ├── Run Trivy scanner
│   └── Upload SARIF results
│
└── Job 5: Test Summary
    └── Check all jobs status
```

## ⚡ Triggers

Workflow chạy khi:
```yaml
on:
  push:
    branches: [main, develop, DUCTOAN, kiet]
  pull_request:
    branches: [main, develop]
```

## 📊 Jobs Chi Tiết

### Job 1: Unit Tests
**Runtime**: ~2-5 seconds
**Purpose**: Test logic functions (không cần database)

```bash
Tests:
  ✓ Distance Calculation (4 tests)
  ✓ Input Validation (17 tests)
  ✓ Order Calculation (10 tests)
Total: 31 tests
```

**Script**: `npm run test:unit`

### Job 2: Integration Tests
**Runtime**: ~10-15 seconds
**Purpose**: Test APIs với MongoDB thật

```bash
Services:
  - MongoDB 7.0 container
  - Port: 27017
  - Credentials: admin/admin123

Tests:
  ✓ Auth API (14 tests)
  ✓ Drone API (15 tests)
  ✓ Order API (12 tests)
Total: 41 tests
```

**Script**: `npm run test:integration`

**Environment Variables**:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Test JWT secret
- `CLOUDINARY_*`: Test Cloudinary credentials

### Job 3: Frontend Apps Build & Lint
**Runtime**: ~30-60 seconds per app
**Purpose**: Verify frontend apps build successfully

**Apps**:
- `client_app` - Customer app
- `restaurant_app` - Restaurant management
- `admin_app` - Admin dashboard
- `drone_manage` - Drone control

**Steps**:
1. Install dependencies (`npm ci`)
2. Run ESLint (`npm run lint`)
3. Build app (`npm run build`)
4. Upload artifacts (dist folder)

### Job 4: Security Scan
**Runtime**: ~20-30 seconds
**Purpose**: Scan for security vulnerabilities

**Tool**: Trivy
**Severity**: CRITICAL, HIGH
**Output**: SARIF format → GitHub Security tab

### Job 5: Test Summary
**Runtime**: ~5 seconds
**Purpose**: Tổng hợp kết quả

**Output Example**:
```
============================================
📊 CI/CD Test Summary
============================================

✅ Unit Tests: success
✅ Integration Tests: success
✅ Frontend Builds: success

============================================
🎉 All tests passed!
```

## 🔄 So Sánh với Docker Build Pipeline

| Feature | ci-test.yml | docker-build-push.yml |
|---------|-------------|----------------------|
| **Purpose** | Testing & QA | Build & Deploy |
| **Unit Tests** | ✅ Separate job | ✅ Combined job |
| **Integration Tests** | ✅ Separate job | ✅ Combined job |
| **Frontend Build** | ✅ Yes (4 apps) | ❌ No |
| **Security Scan** | ✅ Trivy | ❌ No |
| **Docker Build** | ❌ No | ✅ Yes (5 images) |
| **Docker Push** | ❌ No | ✅ Yes (ghcr.io) |
| **Artifacts** | Build files | Docker images |

## ✅ Lợi Ích

### 1. Tách Biệt Concerns
- Testing riêng biệt với build/deploy
- Dễ debug khi có lỗi
- Chạy nhanh hơn (parallel jobs)

### 2. Coverage Tốt Hơn
- Frontend builds được test
- Security scanning
- Detailed test reports

### 3. Flexible Triggers
- Có thể chạy tests mà không build Docker
- PR checks không cần build images
- Fast feedback loop

## 🎯 Best Practices

### 1. Job Dependencies
```yaml
# Unit tests chạy độc lập (nhanh)
unit-tests:
  runs-on: ubuntu-latest

# Integration tests chạy parallel với unit tests
integration-tests:
  runs-on: ubuntu-latest

# Summary job chờ tất cả jobs khác
test-summary:
  needs: [unit-tests, integration-tests, test-client-apps]
```

### 2. Fail Fast
```yaml
strategy:
  fail-fast: false  # Continue testing other apps if one fails
```

### 3. Coverage Upload
```yaml
- uses: codecov/codecov-action@v3
  if: always()  # Upload even if tests fail
  with:
    flags: unittests
    fail_ci_if_error: false  # Don't fail CI if upload fails
```

## 📈 Monitoring

### GitHub Actions Tab
1. Go to repository → Actions
2. Click "CI - Test and Lint"
3. View recent runs

### Checks per Push
- ✅ Unit Tests status
- ✅ Integration Tests status
- ✅ Frontend Builds (4x)
- ✅ Security Scan
- ✅ Overall Summary

### Coverage Reports
- Uploaded to Codecov
- View at: `codecov.io/gh/ductoanoxo/FOODFAST`

## 🐛 Troubleshooting

### Unit Tests Fail
```bash
# Check locally
cd server_app
npm run test:unit

# Common issues:
- Missing dependencies
- Incorrect test syntax
- Logic errors
```

### Integration Tests Fail
```bash
# Check MongoDB connection
nc -z localhost 27017

# Check environment variables
echo $MONGODB_URI

# Common issues:
- MongoDB not ready
- Wrong connection string
- Missing environment variables
```

### Frontend Build Fail
```bash
# Check locally
cd client_app  # or restaurant_app, etc.
npm run build

# Common issues:
- ESLint errors
- Missing dependencies
- Build configuration errors
```

### Security Scan Issues
- Check Trivy action version
- Verify SARIF upload permissions
- Review security alerts in GitHub Security tab

## 🔧 Customization

### Add More Tests
```yaml
- name: Run E2E Tests
  run: npm run test:e2e
```

### Change Node Version
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'  # Change to 18, 20, 22, etc.
```

### Add Frontend Tests
```yaml
- name: Run Frontend Tests
  working-directory: ./${{ matrix.app }}
  run: npm run test || echo "No tests configured"
```

## 📚 Related Files

- `.github/workflows/ci-test.yml` - This workflow
- `.github/workflows/docker-build-push.yml` - Docker build pipeline
- `server_app/__tests__/` - Test files
- `server_app/jest.config.js` - Jest configuration

## 🎓 Summary

**ci-test.yml** là workflow **testing-focused**:
- ✅ 72 automated tests (31 unit + 41 integration)
- ✅ 4 frontend apps build verification
- ✅ Security vulnerability scanning
- ✅ Comprehensive quality checks

**Complementary to docker-build-push.yml** which focuses on building and deploying Docker images.

---

**Together they provide complete CI/CD coverage! 🚀**
