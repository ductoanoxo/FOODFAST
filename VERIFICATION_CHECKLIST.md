# ✅ Checklist - Verify CI/CD Setup

## 📋 Kiểm Tra Trước Khi Push

### 1. Files Đã Tạo ✓

- [ ] `.github/workflows/docker-build-push.yml` - Updated với test jobs
- [ ] `server_app/__tests__/setup.js`
- [ ] `server_app/__tests__/helpers/testApp.js`
- [ ] `server_app/__tests__/helpers/dbHandler.js`
- [ ] `server_app/__tests__/unit/distance.test.js`
- [ ] `server_app/__tests__/unit/validation.test.js`
- [ ] `server_app/__tests__/unit/orderCalculation.test.js`
- [ ] `server_app/__tests__/integration/auth.test.js`
- [ ] `server_app/__tests__/integration/drone.test.js`
- [ ] `server_app/__tests__/integration/order.test.js`
- [ ] `server_app/__tests__/README.md`
- [ ] `server_app/jest.config.js` - Updated
- [ ] `server_app/package.json` - Updated với test scripts

### 2. Documentation ✓

- [ ] `CI_CD_WITH_TESTS.md`
- [ ] `CI_CD_SETUP_COMPLETE.md`
- [ ] `TESTS_SUMMARY.md`
- [ ] `FINAL_SUMMARY.md`
- [ ] `ADD_BADGES.md`
- [ ] `run-tests.sh`
- [ ] `run-tests.ps1`

### 3. Test Locally ✓

```bash
cd server_app

# Install dependencies
npm install

# Run all tests
npm test
```

**Expected:**
- [ ] All 72 tests pass
- [ ] Coverage report generated
- [ ] No errors in output

### 4. Verify Test Scripts ✓

```bash
# Unit tests only
npm run test:unit
```
- [ ] 31 unit tests pass
- [ ] Fast execution (< 5 seconds)

```bash
# Integration tests only (MongoDB required)
npm run test:integration
```
- [ ] 41 integration tests pass
- [ ] MongoDB connection successful

### 5. Check Workflow File ✓

Open `.github/workflows/docker-build-push.yml`:

- [ ] Has `test` job before `build-and-push`
- [ ] MongoDB service configured
- [ ] Test scripts correct (`test:unit`, `test:integration`)
- [ ] `build-and-push` has `needs: test`

### 6. Ready to Push ✓

```bash
git status
```
- [ ] All new files staged
- [ ] No unwanted files

```bash
git add .
git commit -m "feat: Add CI/CD with unit and integration tests (72 tests)"
git push origin main
```

### 7. Verify GitHub Actions ✓

After push:

- [ ] Go to GitHub → Actions tab
- [ ] New workflow run started
- [ ] Test job running first
- [ ] MongoDB container started
- [ ] Unit tests passed
- [ ] Integration tests passed
- [ ] Coverage uploaded
- [ ] Build job started (only after tests pass)
- [ ] Docker images built successfully
- [ ] Images pushed to registry

### 8. Coverage Report ✓

- [ ] Check `server_app/coverage/lcov-report/index.html`
- [ ] Coverage > 80%
- [ ] All major functions covered

## 🎯 Final Checks

### Local Testing
```bash
# Quick test
cd server_app
npm test

# Should see:
# ✓ 72 tests passing
# ✓ Coverage report
# ✓ No errors
```

### CI/CD Pipeline
```bash
# Push code
git push origin main

# Check GitHub Actions:
# ✓ Test job completes
# ✓ Build job starts
# ✓ Green checkmarks
```

### Documentation
- [ ] All `.md` files readable
- [ ] No broken links
- [ ] Code examples correct

## ✅ All Clear!

If all checkboxes are checked:
- ✅ **Setup is complete**
- ✅ **Ready for demo**
- ✅ **Ready for production**

---

## 🐛 Troubleshooting

### Tests fail locally?
```bash
# Check MongoDB running
mongosh
# or
docker run -d -p 27017:27017 mongo:7.0

# Reinstall dependencies
cd server_app
rm -rf node_modules
npm install
npm test
```

### GitHub Actions fail?
- Check workflow file syntax
- Verify MongoDB service config
- Check environment variables
- Review action logs

### Coverage too low?
- Add more tests
- Cover edge cases
- Test error handling

---

**All checkboxes checked? You're ready to go! 🚀**
