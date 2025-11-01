# 🗺️ HƯỚNG DẪN TEST GEOCODING

## ✅ ĐÃ HOÀN THÀNH

### Backend Changes:
1. ✅ Tạo `geocodingService.js` - Service chuyển địa chỉ → tọa độ
2. ✅ Cập nhật `orderController.js` - Tự động geocode khi tạo đơn
3. ✅ Cập nhật `trackOrder` API - Trả về restaurant location

### Frontend Changes:
1. ✅ Cập nhật `DroneMap.jsx` - Validation và thông báo rõ ràng

---

## 🚀 CÁCH TEST

### Bước 1: Restart Server
```powershell
cd server_app
npm start
```

### Bước 2: Tạo Đơn Hàng Mới
1. Mở app khách hàng: `http://localhost:3000`
2. Đăng nhập
3. Chọn món ăn và thêm vào giỏ
4. Điền thông tin giao hàng với địa chỉ thật:

**Ví dụ địa chỉ để test:**
- `Hà Nội, Việt Nam`
- `1 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội`
- `Hồ Chí Minh, Việt Nam`
- `Đà Nẵng, Việt Nam`
- `54 Nguyễn Chí Thanh, Ba Đình, Hà Nội`

### Bước 3: Kiểm Tra Log Server
Sau khi đặt hàng, check terminal server sẽ thấy:
```
🔄 Starting geocoding for address: Hà Nội, Việt Nam
🗺️ Geocoding address: Hà Nội, Việt Nam
✅ Geocoding success: {
  address: 'Hà Nội, Việt Nam',
  coordinates: [ 105.8342, 21.0278 ],
  displayName: 'Hanoi, Vietnam',
  city: 'Hanoi',
  country: 'Vietnam'
}
✅ Geocoding completed. Coordinates: [ 105.8342, 21.0278 ]
```

### Bước 4: Kiểm Tra Map
1. Admin assign drone cho đơn hàng
2. Nhà hàng xác nhận đơn → chuẩn bị → sẵn sàng → giao hàng
3. Admin bật simulation
4. Khách hàng vào trang tracking: `http://localhost:3000/order-tracking/:orderId`
5. Bản đồ sẽ hiển thị:
   - 🏪 Marker nhà hàng (cam)
   - 📍 Marker điểm giao (xanh)
   - 🚁 Drone di chuyển (xanh dương)
   - ➖ Đường bay (line từ nhà hàng → điểm giao)

---

## 🔍 GEOCODING LOGIC

### 1. Khi tạo đơn hàng:
```javascript
// orderController.js
const deliveryCoordinates = await geocodeWithFallback(deliveryInfo.address)
// → Tự động chuyển "Hà Nội" → [105.8342, 21.0278]
```

### 2. Geocoding Service:
- Sử dụng **OpenStreetMap Nominatim API** (FREE)
- Không cần API key
- Ưu tiên tìm kiếm trong Việt Nam (`countrycodes: 'vn'`)
- Timeout: 8 giây
- Fallback: Nếu fail → dùng tọa độ thành phố lớn

### 3. Fallback Coordinates:
```javascript
{
  'Hà Nội': [105.8342, 21.0278],
  'Hồ Chí Minh': [106.6297, 10.8231],
  'Đà Nẵng': [108.2022, 16.0544],
  'Hải Phòng': [106.6881, 20.8449],
  'Cần Thơ': [105.7467, 10.0452]
}
```

---

## ⚠️ XỬ LÝ ĐƠN HÀNG CŨ

Đơn hàng tạo trước khi có geocoding sẽ hiển thị:
```
🗺️
⚠️ Không thể hiển thị bản đồ

🏪 Nhà hàng: ❌ Chưa có tọa độ
📍 Điểm giao: ❌ Chưa có tọa độ

💡 Đơn hàng này được tạo trước khi có tính năng bản đồ.
Vui lòng tạo đơn hàng mới để trải nghiệm!
```

---

## 🎯 KẾT QUẢ MONG ĐỢI

### ✅ Đơn hàng mới (có tọa độ):
- Map hiển thị đầy đủ markers
- Drone di chuyển mượt mà
- Cập nhật real-time qua Socket.IO
- Hiển thị % tiến độ, khoảng cách, thời gian

### ⚠️ Đơn hàng cũ (không có tọa độ):
- Không crash
- Hiển thị thông báo rõ ràng
- Hướng dẫn user tạo đơn mới

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Geocoding timeout"
- Kiểm tra kết nối internet
- API Nominatim có thể bị chặn (dùng VPN)
- System sẽ tự động fallback sang tọa độ mặc định

### Lỗi: "No results found"
- Địa chỉ không đủ chi tiết
- System sẽ dùng tọa độ thành phố gần nhất
- Thử địa chỉ rõ ràng hơn (ví dụ: thêm "Việt Nam")

### Map vẫn không hiển thị:
- Check browser console (F12)
- Verify order có `deliveryInfo.location.coordinates`
- Check server logs xem geocoding có chạy không

---

## 📚 API REFERENCES

### OpenStreetMap Nominatim:
- URL: `https://nominatim.openstreetmap.org/search`
- Docs: https://nominatim.org/release-docs/latest/api/Search/
- Rate limit: 1 request/second (có thể dùng cho production nhỏ)
- User-Agent required: ✅ `FoodFast-DeliveryApp/1.0`

### Alternative APIs (nếu cần):
1. **Google Maps Geocoding** (paid, rất chính xác)
2. **Mapbox Geocoding** (free tier: 100k requests/month)
3. **Here Geocoding** (free tier: 250k requests/month)

---

## 🎉 DONE!
Hệ thống đã tự động chuyển MỌI địa chỉ → tọa độ!
