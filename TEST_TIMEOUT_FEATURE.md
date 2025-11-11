# 🧪 Hướng dẫn Test Drone Delivery Timeout Feature

## 📋 Tóm tắt Feature
- Khi drone đến nơi → Khách có **5 phút** để nhận hàng
- Countdown timer hiển thị thời gian còn lại
- Nếu hết giờ → Drone tự động bay về nhà hàng

---

## 🎯 Cách Test (3 Phương pháp)

### **Phương pháp 1: Để drone tự bay đến** (Chậm - ~5-10 phút)

1. **Tạo đơn hàng mới** từ Client App
2. **Nhà hàng xác nhận** và chọn "Sẵn sàng giao"
3. **Admin gán drone** cho đơn hàng
4. **Chờ drone simulation tự bay** đến điểm giao hàng
5. Khi drone đến → Status tự chuyển: `delivering` → `arrived_at_location` → `waiting_for_customer`
6. **Lúc này sẽ thấy countdown timer** ⏰

---

### **Phương pháp 2: Dùng API Simulate (NHANH - 2 giây)** ⚡ **ĐỀ XUẤT**

#### Bước 1: Lấy Order ID
```bash
# Tạo đơn hàng → Copy Order ID từ UI
# Ví dụ: ORD1762789673300345
```

#### Bước 2: Gọi API simulate drone arrival
```bash
# Thay YOUR_ORDER_ID bằng order ID thật
POST http://localhost:5000/api/drone-sim/arrive/YOUR_ORDER_ID

# Ví dụ:
POST http://localhost:5000/api/drone-sim/arrive/673094a8eb0e2e85a44e5678
```

**Hoặc dùng curl:**
```powershell
curl -X POST http://localhost:5000/api/drone-sim/arrive/673094a8eb0e2e85a44e5678
```

#### Bước 3: Reload trang Order Tracking
- Sau 2 giây, status sẽ chuyển sang `waiting_for_customer`
- **Countdown timer xuất hiện!** 🎉

---

### **Phương pháp 3: Dùng script test tự động** (Full Flow)

```bash
cd server_app
node test-drone-delivery-timeout.js
```

Script này sẽ:
1. Tạo đơn hàng test
2. Gán drone
3. Simulate drone đến nơi
4. Chờ timeout hoặc confirm delivery

---

## 🧩 Chi tiết UI Components

### **Timeline hiển thị:**
- 📦 **Đặt hàng** → Pending
- ✅ **Đã xác nhận** → Confirmed  
- 👨‍🍳 **Đang chuẩn bị** → Preparing
- 🚀 **Sẵn sàng giao** → Ready
- 🚁 **Đang giao** → Delivering
- ⏰ **Chờ nhận hàng** → `waiting_for_customer` ← **HIỆN COUNTDOWN**
- ✅ **Giao thành công** → Delivered

### **Nếu timeout:**
- ❌ **Giao thất bại** → `delivery_failed`
- 🔙 **Đang hoàn trả** → `returning_to_restaurant`
- 📦 **Đã hoàn về** → `returned`

---

## 🎨 Countdown Timer Features

### Colors:
- **🔵 Xanh** (>50% thời gian còn lại): Bình thường
- **🟠 Cam** (>20% thời gian còn lại): Cảnh báo
- **🔴 Đỏ** (<20% thời gian còn lại): Khẩn cấp!

### Messages:
```jsx
> 50%: "Vui lòng ra ngoài nhận hàng"
> 20%: "Thời gian sắp hết! Vui lòng nhanh chóng nhận hàng"
< 20%: "KHẨN CẤP! Chỉ còn ít giây!"
```

---

## 🔍 Kiểm tra logs

### Backend logs:
```bash
cd server_app
npm run dev
```

Xem logs:
```
⏳ Started waiting for customer - Order 673094a8... - 300s timeout
⏰ Timeout for order 673094a8... - Customer not present
```

### Frontend socket events:
Mở DevTools Console → Tab "Network" → Filter "ws" → Xem messages:
```json
{
  "event": "order:status-updated",
  "data": {
    "orderId": "673094a8...",
    "status": "waiting_for_customer",
    "arrivedAt": "2025-11-10T10:30:00.000Z"
  }
}
```

---

## ⚠️ Troubleshooting

### **Không thấy countdown:**
1. ✅ Check order status phải là `waiting_for_customer`
2. ✅ Check `order.arrivedAt` có giá trị (không null)
3. ✅ Reload trang sau khi gọi API simulate
4. ✅ Mở DevTools Console → Xem errors

### **Status không chuyển:**
1. Check backend có chạy không: `http://localhost:5000/api/health`
2. Check socket.io connected: DevTools → Network → WS
3. Check logs backend có errors không

### **Timer không đếm:**
1. Check `order.arrivedAt` format đúng ISO 8601
2. Check component `DeliveryTimeout` được render
3. Mở Console → Xem `remaining` value updates

---

## 📝 Test Cases

### TC1: Drone đến → Timer hiện
- **Input:** Order status = `delivering`
- **Action:** Call `/api/drone-sim/arrive/:orderId`
- **Expected:** 
  - Status → `waiting_for_customer` sau 2s
  - Countdown timer xuất hiện
  - Progress bar = 100% (xanh)

### TC2: Countdown giảm dần
- **Input:** Timer đang chạy
- **Action:** Chờ 1 phút
- **Expected:**
  - Time còn lại giảm từ 5:00 → 4:00
  - Progress giảm từ 100% → 80%

### TC3: Timeout xảy ra
- **Input:** Timer = 0
- **Action:** Chờ hết 5 phút
- **Expected:**
  - Status → `delivery_failed`
  - Timeline hiện "Giao hàng thất bại"
  - Countdown biến mất

### TC4: Khách nhận hàng trước timeout
- **Input:** Timer đang chạy (còn 3 phút)
- **Action:** Call `/api/drone-sim/confirm/:orderId`
- **Expected:**
  - Status → `delivered`
  - Countdown biến mất
  - Timeline hiện "Đã giao"

---

## 🎬 Demo Script (Cho presentation)

```bash
# 1. Khởi động server
cd server_app && npm run dev

# 2. Khởi động client  
cd client_app && npm run dev

# 3. Login → Tạo đơn hàng → Copy Order ID

# 4. Simulate drone arrival
curl -X POST http://localhost:5000/api/drone-sim/arrive/YOUR_ORDER_ID

# 5. Reload trang order tracking → Thấy countdown! ⏰

# 6. (Optional) Test timeout - chờ 5 phút
# Hoặc test confirm delivery:
curl -X POST http://localhost:5000/api/drone-sim/confirm/YOUR_ORDER_ID
```

---

## 📊 Thời gian chờ timeout

- **Production:** 5 phút (300 giây)
- **Test mode:** Có thể thay đổi trong `droneDeliveryTimeoutService.js`:
  ```javascript
  // Line 17-18:
  const WAITING_TIMEOUT = 30 * 1000; // 30 giây (test mode)
  ```

---

## 🚀 Quick Start (TL;DR)

```bash
# 1. Backend
cd server_app
npm run dev

# 2. Frontend (terminal mới)
cd client_app  
npm run dev

# 3. Tạo đơn hàng → Gán drone → Status = delivering

# 4. Test nhanh:
curl -X POST http://localhost:5000/api/drone-sim/arrive/YOUR_ORDER_ID

# 5. Reload trang → Thấy countdown timer! ⏰
```

**🎉 Xong! Giờ bạn sẽ thấy countdown timer trong phần theo dõi đơn hàng!**
