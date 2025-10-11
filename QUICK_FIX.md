# 🚨 GIẢI PHÁP NHANH - Lỗi Đăng Nhập

## ❌ Lỗi gặp phải:
```
Cannot read properties of undefined (reading 'user')
Error: Not authorized, user not found
```

## ✅ GIẢI PHÁP (Chọn 1 trong 3)

### 🔥 Cách 1: Dùng Console (NHANH NHẤT - 10 giây)

1. Mở trang web: http://localhost:3000
2. Nhấn **F12** để mở Console
3. Copy và chạy lệnh này:

```javascript
localStorage.clear()
sessionStorage.clear()
window.location.href = '/login'
```

4. Đăng nhập lại:
   - Email: `user@foodfast.com`
   - Password: `user123`

---

### 🌐 Cách 2: Dùng Trang Clear Cache

1. Truy cập: http://localhost:3000/clear-cache.html
2. Click nút **"Xóa Cache & Đăng nhập lại"**
3. Đăng nhập với:
   - Email: `user@foodfast.com`  
   - Password: `user123`

---

### 🕵️ Cách 3: Dùng DevTools (Thủ công)

1. Nhấn **F12**
2. Vào tab **Application** (Chrome) hoặc **Storage** (Firefox)
3. Click **Local Storage** → **http://localhost:3000**
4. Xóa tất cả keys:
   - `token`
   - `user`
   - `persist:root`
   - `pendingOrderId`
5. Refresh trang (**F5**)
6. Đăng nhập lại

---

## 🎯 Tại sao phải làm vậy?

Sau khi chạy `npm run seed`:
- ✅ Database tạo users mới với ID mới
- ❌ Token cũ trong localStorage vẫn trỏ đến user ID cũ (không tồn tại)
- ❌ Server reject token → Lỗi "user not found"

**Giải pháp:** Xóa token cũ và đăng nhập lại để lấy token mới!

---

## 📝 Tài khoản sau khi seed:

```
👤 User (Khách hàng)
   Email: user@foodfast.com
   Password: user123

🛡️ Admin (Quản trị)
   Email: admin@foodfast.com
   Password: admin123

🏪 Restaurant (Nhà hàng)
   Email: restaurant@foodfast.com
   Password: restaurant123

🚁 Drone (Vận hành)
   Email: drone@foodfast.com
   Password: drone123
```

---

## 🔄 Quy trình đúng khi seed:

```bash
# Bước 1: Seed database
npm run seed

# Bước 2: Clear browser cache (Console F12)
localStorage.clear()

# Bước 3: Đăng nhập lại
# → Truy cập /login và đăng nhập
```

---

## ✅ Đã sửa các lỗi:

1. ✅ Sửa `LoginPage.jsx` - response.user thay vì response.data.user
2. ✅ Sửa `RegisterPage.jsx` - response.user thay vì response.data.user  
3. ✅ Sửa `authController.js` - Thống nhất response format
4. ✅ Sửa `orderController.js` - Thêm validation deliveryInfo
5. ✅ Tạo `clear-cache.html` - Tool xóa cache dễ dàng
6. ✅ Cập nhật axios interceptor - Auto logout khi 401

---

**Sau khi clear cache, bạn sẽ đăng nhập được ngay!** 🎉

Made with ❤️ by FOODFAST Team
