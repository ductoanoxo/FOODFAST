# 🚁 DRONE DELIVERY TIMEOUT SYSTEM

## Tổng quan

Hệ thống xử lý timeout khi drone giao hàng đến nơi nhưng không gặp khách hàng.

---

## 📋 Flow Hoạt Động

```
1. Drone đang giao hàng (status: delivering)
   ↓
2. Drone đến địa điểm (status: arrived_at_location)
   ↓ (auto sau 2s)
3. Bắt đầu chờ khách (status: waiting_for_customer)
   ↓
   ├─→ Khách nhận hàng trong 5 phút
   │   → status: delivered ✅
   │
   └─→ Timeout (không gặp khách)
       → status: delivery_failed ❌
       → status: returning_to_restaurant
       → status: returned
       → Hoàn tiền (nếu đã thanh toán)
```

---

## 🛠️ Cấu Trúc Files

### 1. **Order Model** ([`server_app/API/Models/Order.js`](server_app/API/Models/Order.js ))
Thêm các status mới:
- `arrived_at_location`
- `waiting_for_customer`
- `delivery_failed`
- `returning_to_restaurant`
- `returned`

Thêm timestamps:
- `arrivedAt`
- `waitingStartedAt`
- `waitingEndedAt`
- `deliveryFailedAt`
- `returningAt`
- `returnedAt`

### 2. **Service** (`server_app/API/services/droneDeliveryTimeoutService.js`)
Logic xử lý timeout:
- `handleDroneArrived()` - Drone đến nơi
- `startWaitingForCustomer()` - Bắt đầu chờ + set timeout
- `confirmDeliveryReceived()` - Khách nhận hàng
- `handleDeliveryTimeout()` - Xử lý timeout
- `startReturningToRestaurant()` - Drone quay lại
- `handleDroneReturned()` - Đã trả lại nhà hàng

### 3. **Controller** ([`server_app/API/Controllers/droneSimulationController.js`](server_app/API/Controllers/droneSimulationController.js ))
API endpoints để test:
- `POST /api/drone-sim/arrive/:orderId`
- `POST /api/drone-sim/confirm/:orderId`
- `GET /api/drone-sim/status/:orderId`

### 4. **Test Script** (`server_app/test-drone-delivery-timeout.js`)
Script để test 2 scenarios:
- Scenario 1: Khách nhận hàng
- Scenario 2: Timeout

---

## 🚀 Cách Sử Dụng

### A. Test bằng Script

```bash
# Scenario 1: Khách nhận hàng (confirm sau 10s)
node server_app/test-drone-delivery-timeout.js 1

# Scenario 2: Timeout (không gặp khách)
node server_app/test-drone-delivery-timeout.js 2
```

### B. Test bằng API (Postman/cURL)

#### 1. Tạo Order với status 'delivering'

```bash
# Giả sử đã có order với ID: 673abc123def456789012345
# và Drone đã được assign
```

#### 2. Giả lập Drone đến nơi

```bash
POST http://localhost:5000/api/drone-sim/arrive/673abc123def456789012345

Response:
{
  "success": true,
  "message": "🚁 Drone arrived! Waiting for customer...",
  "data": {
    "order": {...},
    "waitingTimeout": "300 seconds"
  }
}
```

#### 3. Check Status

```bash
GET http://localhost:5000/api/drone-sim/status/673abc123def456789012345

Response:
{
  "success": true,
  "data": {
    "order": {
      "status": "waiting_for_customer",
      "waitingStartedAt": "2025-11-10T10:30:00.000Z"
    },
    "waiting": {
      "isActive": true,
      "timeRemaining": "280s"
    }
  }
}
```

#### 4a. Khách nhận hàng (trong 5 phút)

```bash
POST http://localhost:5000/api/drone-sim/confirm/673abc123def456789012345

Response:
{
  "success": true,
  "message": "✅ Delivery confirmed!",
  "data": {
    "order": {
      "status": "delivered",
      "deliveredAt": "2025-11-10T10:30:15.000Z"
    }
  }
}
```

#### 4b. Hoặc chờ timeout (sau 5 phút)

```bash
# Sau 5 phút tự động chuyển status
# Check lại status:

GET http://localhost:5000/api/drone-sim/status/673abc123def456789012345

Response:
{
  "success": true,
  "data": {
    "order": {
      "status": "delivery_failed",
      "deliveryFailedAt": "2025-11-10T10:35:00.000Z"
    }
  }
}
```

---

## ⚙️ Configuration

### Thời gian chờ (Timeout)

Trong file `droneDeliveryTimeoutService.js`:

```javascript
// Production: 5 phút
const WAITING_TIMEOUT = 5 * 60 * 1000; 

// Test mode: 30 giây
// const WAITING_TIMEOUT = 30 * 1000;
```

---

## 🎯 Tích hợp vào Production

### 1. Thêm routes vào `index.js`

```javascript
// server_app/index.js
const droneTimeoutRoutes = require('./API/Routers/droneDeliveryTimeoutRouter');

app.use('/api/drone-sim', droneTimeoutRoutes);
```

### 2. Socket.io Real-time Updates

Thêm vào `droneDeliveryTimeoutService.js`:

```javascript
const io = require('../socket'); // Your socket.io instance

// Trong handleDroneArrived()
io.to(`order_${orderId}`).emit('drone_arrived', {
    orderId,
    status: 'arrived_at_location',
    message: 'Drone has arrived! Please come to receive your delivery.'
});

// Trong startWaitingForCustomer()
io.to(`order_${orderId}`).emit('waiting_started', {
    orderId,
    timeRemaining: WAITING_TIMEOUT / 1000
});

// Trong confirmDeliveryReceived()
io.to(`order_${orderId}`).emit('delivery_confirmed', {
    orderId,
    status: 'delivered'
});

// Trong handleDeliveryTimeout()
io.to(`order_${orderId}`).emit('delivery_failed', {
    orderId,
    status: 'delivery_failed',
    reason: 'Customer not present'
});
```

### 3. Push Notifications

File `notificationService.js` (cần tạo):

```javascript
const admin = require('firebase-admin');

const sendPushNotification = async (fcmToken, title, message) => {
    try {
        await admin.messaging().send({
            token: fcmToken,
            notification: { title, body: message },
            data: { type: 'delivery_update' }
        });
    } catch (error) {
        console.error('Push notification error:', error);
    }
};

const sendSMS = async (phone, message) => {
    // Integrate với Twilio/Vonage/SMSAPI
    console.log(`SMS to ${phone}: ${message}`);
};

module.exports = { sendPushNotification, sendSMS };
```

---

## 📊 Database Schema Changes

### Order Model - New Fields

```javascript
{
  status: {
    enum: [
      'pending', 'confirmed', 'preparing', 'ready', 
      'picked_up', 'delivering', 
      'arrived_at_location',      // NEW
      'waiting_for_customer',     // NEW
      'delivered', 
      'delivery_failed',          // NEW
      'returning_to_restaurant',  // NEW
      'returned',                 // NEW
      'cancelled'
    ]
  },
  arrivedAt: Date,              // NEW
  waitingStartedAt: Date,       // NEW
  waitingEndedAt: Date,         // NEW
  deliveryFailedAt: Date,       // NEW
  returningAt: Date,            // NEW
  returnedAt: Date,             // NEW
  deliveryAttempts: Number      // NEW
}
```

---

## 🧪 Test Cases

### Unit Tests

Tạo file `server_app/__tests__/unit/services/droneDeliveryTimeout.test.js`:

```javascript
describe('Drone Delivery Timeout Service', () => {
  test('handleDroneArrived should update status to arrived_at_location', async () => {
    // ...
  });

  test('startWaitingForCustomer should set 5-minute timeout', async () => {
    // ...
  });

  test('confirmDeliveryReceived should cancel timeout', async () => {
    // ...
  });

  test('handleDeliveryTimeout should trigger after 5 minutes', async () => {
    // ...
  });

  test('startReturningToRestaurant should update drone location', async () => {
    // ...
  });
});
```

---

## 📱 Frontend Integration

### Client App - Track Delivery Status

```javascript
// Listen for real-time updates
socket.on('drone_arrived', (data) => {
  showNotification('Drone đã đến! Vui lòng ra nhận hàng.');
  startCountdownTimer(300); // 5 minutes
});

socket.on('waiting_started', (data) => {
  showWarning(`Còn ${data.timeRemaining}s để nhận hàng!`);
});

socket.on('delivery_confirmed', (data) => {
  showSuccess('Giao hàng thành công!');
  navigate('/order-rating');
});

socket.on('delivery_failed', (data) => {
  showError('Không gặp bạn tại địa điểm. Đơn hàng sẽ được hoàn trả.');
  navigate('/refund-status');
});
```

---

## 🔐 Security Considerations

1. **Authorization**: Chỉ cho phép admin/system trigger các endpoints simulation
2. **Rate Limiting**: Giới hạn số lần retry delivery
3. **Validation**: Validate order status trước khi trigger timeout
4. **Idempotency**: Đảm bảo không trigger timeout 2 lần cho cùng 1 order

---

## 📈 Monitoring & Logging

### Metrics cần theo dõi:

- Số đơn delivery_failed / tổng đơn
- Thời gian chờ trung bình
- Tỷ lệ khách nhận hàng trước timeout
- Số lần drone phải quay lại

### Logs:

```
[2025-11-10 10:30:00] INFO: Drone 001 arrived at order #ORD123
[2025-11-10 10:30:02] INFO: Started waiting for customer - Order #ORD123 - 300s timeout
[2025-11-10 10:30:15] INFO: Delivery confirmed - Order #ORD123
[2025-11-10 10:30:15] INFO: Timeout cancelled - Order #ORD123
```

---

## 🐛 Troubleshooting

### Timeout không chạy?
- Check `activeTimers` Map có entry không
- Check console logs
- Verify WAITING_TIMEOUT constant

### Khách confirm nhưng vẫn failed?
- Race condition: timeout trigger cùng lúc confirm
- Solution: Check order status trong `handleDeliveryTimeout()`

### Drone không quay lại?
- Check `estimatedDuration` của order
- Check drone location update logic

---

## 📝 TODO / Future Improvements

- [ ] Multi-language notifications
- [ ] SMS verification code để confirm delivery
- [ ] QR code scanning tại điểm giao hàng
- [ ] Retry delivery option (schedule lại lần giao thứ 2)
- [ ] Emergency contact customer qua phone call
- [ ] Video recording tại điểm giao hàng (proof)
- [ ] Weather-based timeout adjustment (mưa → tăng thời gian chờ)

---

## 📞 Contact & Support

Questions? Contact dev team!
