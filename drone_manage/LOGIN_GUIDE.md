# 🔐 Hướng dẫn đăng nhập Drone Management App

## ✅ Tài khoản đăng nhập

Sau khi chạy `npm run seed`, bạn có thể sử dụng các tài khoản sau để đăng nhập vào Drone Management System:

### 👨‍✈️ Drone Operator (Khuyến nghị)
```
Email: dronemanager@example.com
Password: 123456
```

### 👨‍✈️ Drone Operator (Phụ)
```
Email: drone@foodfast.com
Password: drone123
```

### 👑 Admin (Full Access)
```
Email: admin@foodfast.com
Password: admin123
```

## 🚀 Cách sử dụng

1. **Khởi động server backend:**
   ```bash
   cd server_app
   npm start
   ```

2. **Khởi động Drone Management App:**
   ```bash
   cd drone_manage
   npm run dev
   ```

3. **Truy cập:**
   - Mở trình duyệt: `http://localhost:3003`
   - Đăng nhập với một trong các tài khoản trên

## ⚠️ Lưu ý

- Chỉ các tài khoản có role `drone_operator` hoặc `admin` mới có thể đăng nhập vào Drone Management System
- Nếu đăng nhập thất bại, hãy đảm bảo:
  - ✅ Server backend đang chạy tại `http://localhost:5000`
  - ✅ Đã chạy `npm run seed` để tạo tài khoản
  - ✅ Email và password chính xác
  - ✅ File `.env` trong `drone_manage` đã được tạo

## 🔄 Reset tài khoản

Nếu cần reset tài khoản, chạy lại seed:
```bash
npm run seed
```

## 📝 Kiểm tra tài khoản

Bạn có thể kiểm tra API login bằng curl:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dronemanager@example.com","password":"123456"}'
```

Nếu thành công, bạn sẽ nhận được response với:
```json
{
  "success": true,
  "user": {
    "role": "drone_operator",
    ...
  },
  "token": "..."
}
```
