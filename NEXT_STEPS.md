# 🚀 HƯỚNG DẪN NHANH - CI/CD ĐÃ SẴN SÀNG!

## ✅ CÁC BƯỚC TIẾP THEO

### Bước 1: Commit và Push

```bash
git add .
git commit -m "ci: complete CI/CD setup with 6 workflows"
git push origin kiet
```

### Bước 2: Tạo Pull Request

1. Mở GitHub repository: https://github.com/ductoanoxo/FOODFAST
2. Click "Pull requests" → "New pull request"
3. Chọn base: `main`, compare: `kiet`
4. Click "Create pull request"
5. Đợi workflows chạy (tự động)

### Bước 3: Cấu Hình GitHub (Quan Trọng!)

#### A. Bật Permissions cho Actions

```
Settings → Actions → General → Workflow permissions
```
Chọn:
- ✅ Read and write permissions
- ✅ Allow GitHub Actions to create and approve pull requests

#### B. Bật Container Registry

```
Settings → Packages
```
Đảm bảo:
- ✅ Packages linked to repository

### Bước 4: Xem Kết Quả

```
Repository → Actions tab
```

Bạn sẽ thấy workflows đang chạy:
- 🔄 CI - Test and Lint
- 🔄 Docker Build and Push
- 🔄 Code Quality
- 🔄 Pull Request Checks

## 📦 CÁC WORKFLOWS ĐÃ TẠO

| Workflow | Chức Năng | Khi Nào Chạy |
|----------|-----------|--------------|
| **CI Test** | Test code, security scan | Mỗi push/PR |
| **Docker Build** | Build & push images | Mỗi push/PR |
| **Code Quality** | ESLint, coverage, audit | Mỗi push/PR |
| **E2E Tests** | Cypress tests | Push/PR/Daily |
| **PR Checks** | Validate PR | Khi tạo PR |
| **Deploy** | Deploy production | Release/Manual |

## 🐳 DOCKER IMAGES

Sau khi push, Docker images sẽ được build tự động:

```
ghcr.io/ductoanoxo/foodfast-server:kiet
ghcr.io/ductoanoxo/foodfast-client:kiet
ghcr.io/ductoanoxo/foodfast-restaurant:kiet
ghcr.io/ductoanoxo/foodfast-admin:kiet
ghcr.io/ductoanoxo/foodfast-drone:kiet
```

## 📊 KIỂM TRA TRẠNG THÁI

### Xem Workflow Logs
```
Actions → Chọn workflow run → View logs
```

### Xem Build Artifacts
```
Actions → Chọn workflow run → Artifacts
```

### Xem Docker Images
```
Repository → Packages (bên phải)
```

## 🎯 QUY ƯỚC COMMIT

Sử dụng conventional commits:

```
feat: thêm tính năng mới
fix: sửa lỗi
docs: cập nhật tài liệu
ci: thay đổi CI/CD
test: thêm tests
refactor: refactor code
```

## 🔧 TROUBLESHOOTING

### Nếu workflows không chạy:
1. Check Actions có bật: `Settings → Actions`
2. Verify permissions đã cấu hình đúng

### Nếu Docker push thất bại:
1. Kiểm tra package permissions
2. Đảm bảo GITHUB_TOKEN có quyền write

### Nếu tests thất bại:
1. Xem logs chi tiết
2. Chạy tests locally: `npm test`

## 📚 TÀI LIỆU

- `CICD_SETUP_COMPLETE_VI.md` - Tổng quan chi tiết
- `.github/CI_CD_DOCUMENTATION.md` - Tài liệu đầy đủ
- `.github/CI_CD_QUICK_REFERENCE.md` - Quick reference

## ✨ HOÀN TẤT!

Bạn đã có:
✅ 6 GitHub Actions workflows
✅ Automated testing
✅ Automated Docker builds
✅ Automated security scanning
✅ Automated dependency updates
✅ Automated deployment

**Chỉ cần push code và mọi thứ tự động! 🚀**

---

Có câu hỏi? Xem tài liệu chi tiết hoặc tạo issue!
