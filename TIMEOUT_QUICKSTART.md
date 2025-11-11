# ⚡ QUICK START: Test Timeout Feature Ngay

## 🎯 Mục tiêu
Xem countdown timer 40 giây trong vòng 10 giây!

## 📋 DEMO LOGIC MỚI (Đơn giản hơn!)

```
Admin bấm "Giao hàng"
        ↓
Status: delivering
        ↓
    Đợi 5 giây  ⏱️
        ↓
Status: waiting_for_customer ← HIỆN COUNTDOWN 40 GIÂY! ⏰
        ↓
    Đợi 40 giây
        ↓
Nếu KHÔNG nhận hàng:
├─ Status: delivery_failed ❌
└─ Drone → available ✅ (sẵn sàng nhận đơn mới)
```

---

## 📝 Bước 1: Chuẩn bị

### 1.1 Chạy Backend
```powershell
cd server_app
npm run dev
```

Chờ đến khi thấy:
```
✅ Server running on port 5000
✅ MongoDB Connected
✅ Socket.IO ready
```

### 1.2 Chạy Frontend (Terminal mới)
```powershell
cd client_app
npm run dev
```

Browser tự mở: `http://localhost:5173`

---

## 🚀 Bước 2: Tạo Đơn Hàng Test

### 2.1 Login vào Client App
- Email: `testuser@example.com` (hoặc tạo account mới)
- Password: `password123`

### 2.2 Tạo đơn hàng
1. Chọn nhà hàng
2. Thêm món vào giỏ
3. Checkout → Đặt hàng
4. **QUAN TRỌNG:** Copy Order ID từ URL hoặc trang Order Tracking
   - Ví dụ: `ORD1762789673300345` hoặc `673094a8eb0e2e85a44e5678`

---

## 🚀 Bước 3: Test Feature

### ✅ **KHÔNG CẦN gọi API nữa!** 

Chỉ cần:
1. **Admin bấm nút "Bắt đầu giao hàng"** (Start Delivery)
2. **Đợi 5 giây** ⏱️
3. **Reload trang Order Tracking** 
4. **THẤY COUNTDOWN 40 GIÂY!** 🎉

### Hoặc dùng script (optional):
```powershell
# Chỉ cần nếu muốn test manual
.\test-timeout.ps1 -OrderId "YOUR_ORDER_ID"
```

---

## 👀 Bước 4: Xem Kết Quả

### 4.1 Sau 5 giây
Status tự động chuyển: `delivering` → `waiting_for_customer`

### 4.2 Reload trang Order Tracking (hoặc tự động update qua Socket)
```
http://localhost:5173/order-tracking/YOUR_ORDER_ID
```

### 4.3 BẠN SẼ THẤY:

#### ⏰ **Countdown Timer 40 giây:**
```
🚁 Drone đã đến nơi - Đang chờ bạn nhận hàng
⏰ Vui lòng ra ngoài nhận hàng trong 40 giây!

┌─────────────────────────────────────┐
│ Thời gian còn lại: 0:38            │
│ ████████████████████░░░ 95%        │ ← Progress bar xanh
│ ℹ️ Vui lòng ra ngoài nhận hàng     │
└─────────────────────────────────────┘
```

### 4.4 Sau 40 giây (nếu không nhận):
- ❌ Status → `delivery_failed`
- 🚁 Drone → `available` (sẵn sàng giao đơn mới!)
- 📋 Timeline hiện "Giao hàng thất bại"

---

## 🧪 Bước 5: Test Thêm (Optional)

### Test 1: Confirm Delivery (Khách nhận hàng)
Bấm nút "Xác nhận đã nhận" trong UI hoặc:
```powershell
.\test-timeout.ps1 -OrderId "YOUR_ORDER_ID" -Action confirm
```

**Kết quả:**
- ✅ Status → `delivered`
- 🎉 Countdown biến mất
- 📋 Timeline hiện "Đã giao"
- 🚁 Drone → `available`

### Test 2: Để Timeout (Chờ 40 giây - NHANH!)
**Không làm gì, chỉ đợi 40 giây...**

**Kết quả sau 40 giây:**
- ❌ Status → `delivery_failed`
- � Drone → `available` ← **QUAN TRỌNG: Drone sẵn sàng giao đơn mới!**
- 📋 Timeline hiện "Giao hàng thất bại"
- 💬 Lý do: "Không gặp người nhận sau 40 giây"

---

## 🎨 Chi Tiết UI

### Countdown Colors:
- **>50% thời gian:** 🔵 Xanh (Bình thường)
- **>20% thời gian:** 🟠 Cam (Cảnh báo)
- **<20% thời gian:** 🔴 Đỏ (Khẩn cấp!)

### Messages:
```
> 50%: "Vui lòng ra ngoài nhận hàng"
> 20%: "Thời gian sắp hết! Vui lòng nhanh chóng nhận hàng"
< 20%: "KHẨN CẤP! Chỉ còn ít giây!"
```

---

## 🐛 Troubleshooting

### Không thấy countdown?

#### 1. Check Order Status
Mở Console (F12) → Xem `order` object:
```javascript
console.log(order.status);  // Phải là 'waiting_for_customer'
console.log(order.arrivedAt); // Phải có giá trị, không null
```

#### 2. Check Backend Logs
Terminal `server_app`:
```
⏳ Started waiting for customer - Order 673094a8... - 300s timeout
```

#### 3. Check Socket Connection
DevTools → Network → WS → Xem messages:
```json
{
  "event": "order:status-updated",
  "data": {
    "status": "waiting_for_customer",
    "arrivedAt": "2025-11-10T..."
  }
}
```

#### 4. Hard Reload
Ctrl + Shift + R (xóa cache)

---

## 🎬 Video Demo Script (Cho presentation) - SIÊU NHANH!

### Slide 1: Intro (10s)
> "Giờ chúng ta sẽ demo tính năng timeout khi drone giao hàng - CHỈ MẤT 50 GIÂY!"

### Slide 2: Gán drone & Bắt đầu giao (15s)
> "Admin gán drone cho đơn hàng..."
> "Bấm 'Bắt đầu giao hàng'..."
> "Status chuyển sang Delivering"

### Slide 3: Đợi 5 giây (5s)
> "Sau 5 giây, drone tự động đến nơi..."
> (count down: 5... 4... 3... 2... 1...)

### Slide 4: Countdown xuất hiện! (10s)
> "Và đây! 🎉 Countdown 40 giây!"
> (Point to timer, progress bar)
> "Khách có 40 giây để nhận hàng"

### Slide 5: Timeout demo (10s - hoặc skip)
> "Nếu hết giờ... drone tự động về trạng thái sẵn sàng"
> "Có thể nhận đơn mới ngay!"

**Total: ~50 giây (< 1 phút)** ⚡

---

## 📸 Screenshots Checklist

- [ ] Countdown timer (xanh - >50%)
- [ ] Countdown timer (cam - >20%)
- [ ] Countdown timer (đỏ - <20%)
- [ ] Timeline với "Chờ nhận hàng"
- [ ] Timeline với "Giao thất bại"
- [ ] Timeline với "Đang hoàn trả"
- [ ] Timeline với "Đã hoàn về"
- [ ] DroneMap với marker tại địa điểm

---

## ⚡ TL;DR (Quá lười đọc)

```powershell
# 1. Start backend + frontend
npm run dev

# 2. Admin app (http://localhost:3002)
#    - Gán drone cho đơn hàng
#    - Bấm "Bắt đầu giao hàng"

# 3. Đợi 5 giây ⏱️

# 4. Reload trang order tracking → THẤY COUNTDOWN 40 GIÂY! 🎉

# 5. Đợi 40 giây → Timeout → Drone available ✅
```

**SIÊU ĐƠN GIẢN! Không cần gọi API, không cần script!** ⚡✨

---

## 📊 Timeline Flow

```
Time    Status                  Action
─────────────────────────────────────────────────────
0:00    delivering              Admin bấm "Giao hàng"
0:05    waiting_for_customer    ⏰ COUNTDOWN 40s BẮT ĐẦU!
0:45    delivery_failed         ❌ Timeout! Drone → available
```

---

## 🎯 Key Features

- ⚡ **Demo siêu nhanh**: 5s + 40s = 45 giây total
- 🎨 **UI real-time**: Countdown tự động update
- 🚁 **Drone tái sử dụng**: Tự động available sau timeout
- 📱 **Socket.io**: Real-time updates không cần reload
- 🎨 **Color coding**: Xanh → Cam → Đỏ theo thời gian

**Perfect cho presentation!** 🎤✨
