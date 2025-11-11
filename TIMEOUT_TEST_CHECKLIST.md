# ✅ Timeout Feature Testing Checklist

## 🎯 Pre-Test Setup

- [ ] Server running: `npm run dev` (or `cd server_app && npm run dev`)
- [ ] Frontend running: Client app at http://localhost:3000
- [ ] Admin running: Admin app at http://localhost:3002
- [ ] Database connected: Check logs "✅ MongoDB Connected"
- [ ] Socket.IO ready: Check logs "✅ Socket.IO initialized"

---

## 📝 Test Scenario 1: Full Timeout Flow (45s)

### Setup
- [ ] Login to Client app (create order if needed)
- [ ] Order status = "Ready" hoặc "Picked up"
- [ ] Login to Admin app
- [ ] Find the order in Orders list

### Steps
1. **Assign Drone (Admin)**
   - [ ] Click "Gán Drone" button
   - [ ] Select an available drone
   - [ ] Confirm assignment
   - [ ] ✅ Order shows drone assigned

2. **Start Delivery (Admin)**
   - [ ] Click "Bắt đầu giao hàng" button
   - [ ] ✅ Order status → "Đang giao" (delivering)
   - [ ] ✅ Drone status → "Bận" (busy)
   - [ ] Copy Order ID for tracking

3. **Wait 5 Seconds** ⏱️
   - [ ] Start timer/count: 5... 4... 3... 2... 1...
   - [ ] Check server logs: "⏰ Order ... → waiting_for_customer"

4. **Check Countdown (Client)**
   - [ ] Go to Order Tracking page: `http://localhost:3000/order-tracking/ORDER_ID`
   - [ ] Reload page (Ctrl + R)
   - [ ] ✅ **COUNTDOWN TIMER VISIBLE!** 🎉
   - [ ] Shows "Thời gian còn lại: 0:3X"
   - [ ] Progress bar visible (blue/green)
   - [ ] Timeline shows "Chờ nhận hàng"

5. **Observe Countdown (40s)**
   - [ ] Timer counts down: 40 → 39 → 38...
   - [ ] At ~30s: Still blue
   - [ ] At ~20s: Progress bar orange 🟠
   - [ ] At ~10s: Alert warning appears
   - [ ] At ~5s: Progress bar red 🔴
   - [ ] Alert shows "KHẨN CẤP!"

6. **Timeout Occurs (at 0)**
   - [ ] Check server logs: "❌ Order ... TIMEOUT!"
   - [ ] ✅ Order status → "delivery_failed"
   - [ ] ✅ Drone status → "available"
   - [ ] Reload tracking page
   - [ ] Timeline shows "Giao hàng thất bại"
   - [ ] Countdown disappeared

### Expected Results
- ⏱️ Total time: ~45 seconds
- 📊 Order: delivering → waiting_for_customer → delivery_failed
- 🚁 Drone: busy → available
- 🎨 UI: Countdown visible, colors change, timeout message

---

## 📝 Test Scenario 2: Customer Receives (Before Timeout)

### Setup
Same as Scenario 1, steps 1-4

### Steps
1. **Wait for Countdown** (after step 4)
   - [ ] Countdown showing ~30 seconds left

2. **Confirm Delivery**
   - [ ] Click "Xác nhận đã nhận" button in UI
   - [ ] OR run: `.\test-timeout.ps1 -OrderId "ORDER_ID" -Action confirm`
   - [ ] ✅ Order status → "delivered"
   - [ ] ✅ Drone status → "available"
   - [ ] Countdown disappeared
   - [ ] Timeline shows "Đã giao"

### Expected Results
- ✅ Delivery successful before timeout
- 🚁 Drone freed up
- ⏰ Timer cancelled

---

## 📝 Test Scenario 3: Multiple Orders

### Steps
1. **Create 2 orders** (Order A, Order B)
2. **Assign different drones** to each
3. **Start delivery A** → Wait 5s → Countdown A shows
4. **Start delivery B** → Wait 5s → Countdown B shows
5. **Let Order A timeout** (45s)
6. **Confirm Order B** before timeout

### Expected Results
- [ ] Both countdowns work independently
- [ ] Order A times out → Drone A available
- [ ] Order B delivered → Drone B available
- [ ] No interference between orders

---

## 🐛 Debugging Checklist

### Countdown không hiện?

**Check Order Status:**
```powershell
# In MongoDB or check API
GET /api/orders/ORDER_ID/track
```
- [ ] `status` = "waiting_for_customer"
- [ ] `arrivedAt` has timestamp value
- [ ] Not null or undefined

**Check Browser Console:**
- [ ] Open DevTools (F12) → Console
- [ ] No JavaScript errors
- [ ] `order` object logged (if you added console.log)
- [ ] `order.arrivedAt` present

**Check Socket Connection:**
- [ ] DevTools → Network → WS tab
- [ ] Socket connected (green indicator)
- [ ] Messages flowing (order:status-updated events)

**Check Component:**
- [ ] DeliveryTimeout component mounted
- [ ] Check React DevTools
- [ ] Props: `order` passed correctly

---

### Timeout không trigger?

**Check Server Logs:**
```
Should see:
⏰ Order 673... → waiting_for_customer (40s countdown started)
... (after 40s)
❌ Order 673... TIMEOUT! Drone về trạng thái sẵn sàng
```

- [ ] Logs present
- [ ] No errors in logs
- [ ] Timer ID saved correctly

**Check Database:**
After 45 seconds:
- [ ] Order status = "delivery_failed"
- [ ] Order cancelReason = "Không gặp người nhận sau 40 giây"
- [ ] Drone status = "available"
- [ ] Drone currentOrder = null

---

### UI không update?

**Force Reload:**
- [ ] Hard reload: Ctrl + Shift + R
- [ ] Clear cache
- [ ] Close/reopen browser tab

**Check Socket Events:**
```javascript
// In browser console
socket.on('order:status-updated', (data) => {
    console.log('Status update:', data);
});
```

- [ ] Events being emitted
- [ ] Events being received
- [ ] State updating in React

---

## 📊 Performance Checklist

- [ ] Server response time < 200ms
- [ ] Countdown updates smoothly (no lag)
- [ ] Socket latency < 100ms
- [ ] No memory leaks (check DevTools Performance)
- [ ] Multiple orders don't slow down system

---

## 📸 Screenshot Checklist (For Presentation)

- [ ] Countdown timer (blue, >50%)
- [ ] Countdown timer (orange, ~20%)
- [ ] Countdown timer (red, <10%)
- [ ] Timeline with "Chờ nhận hàng"
- [ ] Timeline with "Giao hàng thất bại"
- [ ] Admin panel showing "Bắt đầu giao hàng"
- [ ] Drone status: available → busy → available
- [ ] Full flow diagram (optional)

---

## 🎬 Demo Recording Checklist

### Before Recording
- [ ] Close unnecessary apps
- [ ] Clean up browser tabs
- [ ] Prepare test data (pre-created order)
- [ ] Test audio/video
- [ ] Practice run-through (2-3 times)

### During Recording
- [ ] Explain what you're doing
- [ ] Point to important elements
- [ ] Show countdown changing colors
- [ ] Highlight key timestamps
- [ ] Show final result (timeout or delivered)

### After Recording
- [ ] Review video quality
- [ ] Check audio clarity
- [ ] Add captions if needed
- [ ] Export in good quality (1080p)

---

## ✅ Final Validation

### Code Quality
- [ ] No console.errors in browser
- [ ] No warnings in terminal
- [ ] Code follows project style
- [ ] Comments are clear

### Documentation
- [ ] TIMEOUT_QUICKSTART.md accurate
- [ ] TIMEOUT_DEMO_LOGIC.md complete
- [ ] TEST_TIMEOUT_FEATURE.md updated
- [ ] README mentions timeout feature

### Git
- [ ] Changes committed
- [ ] Meaningful commit message
- [ ] Branch: `deploy` or feature branch
- [ ] Ready to merge/push

---

## 🚀 Production Readiness (Future)

- [ ] Change timers to production values (5 min)
- [ ] Add database migrations if needed
- [ ] Update environment variables
- [ ] Add monitoring/logging
- [ ] Load testing
- [ ] Security review
- [ ] User acceptance testing

---

## 📝 Test Results Log

**Date:** _________________  
**Tester:** _________________  
**Environment:** Local / Staging / Production

| Test | Status | Notes |
|------|--------|-------|
| Scenario 1: Full Timeout | ⬜ Pass / ⬜ Fail | |
| Scenario 2: Customer Receives | ⬜ Pass / ⬜ Fail | |
| Scenario 3: Multiple Orders | ⬜ Pass / ⬜ Fail | |
| UI Countdown Display | ⬜ Pass / ⬜ Fail | |
| Socket Events | ⬜ Pass / ⬜ Fail | |
| Drone Status Reset | ⬜ Pass / ⬜ Fail | |

**Overall Result:** ⬜ PASS / ⬜ FAIL

**Issues Found:**
```
1. 
2. 
3. 
```

**Next Steps:**
```
1. 
2. 
3. 
```

---

**Created:** November 10, 2025  
**Last Updated:** November 10, 2025  
**Version:** 1.0
