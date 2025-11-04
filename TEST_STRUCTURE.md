# 📂 Test Structure - FOODFAST Project

## 🎯 Tổ chức Tests

Tất cả tests đã được tổ chức lại theo cấu trúc thống nhất:

```
<app>/src/__tests__/
├── unit/                    # Unit tests (test từng function/component riêng lẻ)
│   ├── redux/slices/       # Tests cho Redux slices
│   ├── services/           # Tests cho utility services
│   └── utils/              # Tests cho helper functions
└── integration/            # Integration tests (test luồng nghiệp vụ)
    └── *.integration.test.js
```

---

## 📦 CLIENT_APP (Customer App)

### Unit Tests: **63 tests** ✅
```
src/__tests__/unit/
├── redux/slices/
│   ├── cartSlice.test.js              # 15 tests - Cart management
│   └── orderSlice.test.js             # 13 tests - Order state
├── services/
│   ├── orderValidation.test.js        # 11 tests - Validation logic
│   └── priceUtils.test.js             # 24 tests - Price calculations
```

### Integration Tests: **1 test**
```
src/__tests__/integration/
└── checkout-order.integration.test.jsx # E2E checkout flow
```

### Chạy tests:
```bash
cd client_app
npm run test:unit                # Chạy unit tests
npm run test:integration         # Chạy integration tests
npm test                         # Chạy tất cả (watch mode)
```

---

## 🍴 RESTAURANT_APP (Restaurant Management)

### Unit Tests: **55 tests** ✅
```
src/__tests__/unit/
├── redux/slices/
│   ├── orderSlice.test.js             # 11 tests - Order management
│   └── productSlice.test.js           # 13 tests - Product CRUD
└── utils/
    └── helpers.test.js                 # 31 tests - Utility functions
```

### Integration Tests: **1 test**
```
src/__tests__/integration/
└── order-management.integration.test.js # Restaurant order workflow
```

### Chạy tests:
```bash
cd restaurant_app
npm run test:unit                # Chạy unit tests
npm run test:integration         # Chạy integration tests
npm test                         # Chạy tất cả (watch mode)
```

---

## 👨‍💼 ADMIN_APP (Admin Dashboard)

### Unit Tests: **8 tests** ✅
```
src/__tests__/unit/
└── redux/slices/
    └── authSlice.test.js              # 8 tests - Authentication
```

### Chạy tests:
```bash
cd admin_app
npm run test:unit                # Chạy unit tests
npm test                         # Chạy tất cả (watch mode)
```

---

## 🚁 DRONE_MANAGE (Drone Control)

⚠️ Chưa có tests (sẽ thêm sau)

---

## ⚙️ Configuration Files

### 1. `vitest.config.js` (Unit Tests)
```javascript
export default defineConfig({
    test: {
        include: ['src/__tests__/unit/**/*.test.{js,jsx}'],
        exclude: ['node_modules', 'dist', 'src/__tests__/integration/**'],
    }
});
```

### 2. `vitest.integration.config.js` (Integration Tests)
```javascript
export default defineConfig({
    test: {
        include: ['src/__tests__/integration/**/*.test.{js,jsx}'],
        exclude: ['node_modules', 'dist', 'src/__tests__/unit/**'],
        testTimeout: 15000, // Integration tests cần timeout lâu hơn
    }
});
```

---

## 📊 Test Results Summary

| App | Unit Tests | Integration Tests | Total | Status |
|-----|-----------|------------------|-------|--------|
| **client_app** | 63 | 1 | 64 | ✅ Pass |
| **restaurant_app** | 55 | 1 | 56 | ✅ Pass |
| **admin_app** | 8 | 0 | 8 | ✅ Pass |
| **drone_manage** | 0 | 0 | 0 | ⚠️ Pending |
| **TOTAL** | **126** | **2** | **128** | ✅ |

---

## 🎨 Import Paths

Tất cả tests sử dụng **alias paths** thay vì relative paths:

```javascript
// ✅ ĐÚNG - Sử dụng alias
import cartReducer from '@/redux/slices/cartSlice';
import { formatPrice } from '@/services/priceUtils';

// ❌ SAI - Đừng dùng relative path
import cartReducer from './cartSlice';
import { formatPrice } from '../../../services/priceUtils';
```

**Lợi ích:**
- ✅ Không bị lỗi khi di chuyển file
- ✅ Code sạch hơn, dễ đọc
- ✅ Tránh path hell (`../../../../../../`)

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow
```yaml
test-client-apps:
  strategy:
    matrix:
      app:
        - client_app
        - restaurant_app
        - admin_app
        - drone_manage

  steps:
    - name: Run unit tests
      run: npm run test:unit
      
    - name: Run integration tests
      run: npm run test:integration
```

---

## 📝 Best Practices

### 1. **Unit Tests** (`__tests__/unit/`)
- ✅ Test từng function riêng lẻ
- ✅ Mock dependencies (API calls, localStorage)
- ✅ Fast execution (<100ms per test)
- ✅ Coverage: Redux slices, utils, services

### 2. **Integration Tests** (`__tests__/integration/`)
- ✅ Test user workflows (E2E scenarios)
- ✅ Test component interactions
- ✅ Minimal mocking (test real behavior)
- ✅ Longer timeout (15s)

### 3. **Test Naming Convention**
```
<Component/Function>.test.js      # Unit test
<Feature>.integration.test.js     # Integration test
```

---

## 🔧 Troubleshooting

### Lỗi: "Cannot find module"
**Nguyên nhân:** Import path không đúng  
**Giải pháp:** Dùng `@/` alias thay vì `./`

### Lỗi: "webidl-conversions"
**Nguyên nhân:** Vitest compatibility issue  
**Giải pháp:** Đã config `test.globals: true` trong vitest.config.js

### Tests không chạy
**Kiểm tra:**
1. File có đúng naming: `*.test.js` hoặc `*.test.jsx`
2. File nằm trong `__tests__/unit/` hoặc `__tests__/integration/`
3. Config file đúng: `vitest.config.js` cho unit, `vitest.integration.config.js` cho integration

---

## 📈 Next Steps

- [ ] Thêm tests cho `drone_manage` app
- [ ] Tăng coverage lên 80%+ 
- [ ] Thêm E2E tests với Cypress
- [ ] Setup coverage reports trên CI/CD

---

**Last Updated:** November 4, 2025  
**Total Tests:** 128 (126 unit + 2 integration)  
**Status:** ✅ All Passing
