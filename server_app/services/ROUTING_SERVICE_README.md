# 🗺️ Routing Service - Tính Khoảng Cách Thực Tế

## 📝 Tổng Quan

Service này tính khoảng cách giao hàng theo **đường đi thực tế** trên đường phố, thay vì đường chim bay (Haversine). Điều này giúp tính phí vận chuyển **chính xác hơn** và **công bằng hơn** cho khách hàng.

## 🚀 Công Nghệ Sử Dụng

### OSRM (Open Source Routing Machine)
- **API**: `https://router.project-osrm.org`
- **Miễn phí**: Không cần API key
- **Tính năng**:
  - Tính khoảng cách theo đường đi thực tế (routing distance)
  - Ước tính thời gian di chuyển
  - Cung cấp route geometry (GeoJSON) để vẽ trên bản đồ

### Fallback Strategy
Nếu OSRM API không khả dụng, hệ thống tự động fallback:

1. **Level 1 - OSRM Routing** ✅ (Ưu tiên)
   - Khoảng cách: Theo đường phố thực tế
   - Độ chính xác: Cao nhất
   - Method: `'routing'`

2. **Level 2 - Haversine + Adjustment Factor** ⚠️
   - Khoảng cách: Đường thẳng × 1.35 (hệ số thành phố)
   - Độ chính xác: Khá tốt
   - Method: `'haversine_adjusted'`

3. **Level 3 - Haversine Pure** ❌ (Cuối cùng)
   - Khoảng cách: Đường thẳng × 1.3 (hệ số tối thiểu)
   - Độ chính xác: Thấp
   - Method: `'haversine_fallback'`

## 📊 So Sánh Kết Quả

### Test Case: Hà Nội (Hoàn Kiếm → Đống Đa)

```
Tọa độ xuất phát: 21.0285, 105.8542
Tọa độ đích: 21.0389, 105.827

┌─────────────────────────┬──────────────┬────────────┬──────────────┐
│ Phương pháp             │ Khoảng cách  │ Thời gian  │ Phí ship     │
├─────────────────────────┼──────────────┼────────────┼──────────────┤
│ Đường thẳng (Haversine) │ 3.05 km      │ N/A        │ 25,000₫      │
│ OSRM Routing            │ 4.32 km      │ 8 phút     │ 30,000₫      │
│ Chênh lệch              │ +1.27 km     │            │ +5,000₫      │
│                         │ (+41.5%)     │            │ (+20%)       │
└─────────────────────────┴──────────────┴────────────┴──────────────┘
```

### Kết Luận
- Đường đi thực tế **dài hơn 30-50%** so với đường thẳng
- Phí ship tính theo routing **công bằng hơn** cho cả khách hàng và nhà hàng
- Thời gian giao hàng **chính xác hơn**

## 💻 Cách Sử Dụng

### Backend - Order Controller

```javascript
const { getDistanceWithFallback } = require('../../services/routingService');

// Tính khoảng cách thực tế
const routingInfo = await getDistanceWithFallback(restLat, restLon, userLat, userLon);

console.log(routingInfo);
// {
//   distance: 4.32,           // km
//   duration: 8,              // phút
//   method: 'routing',        // 'routing' | 'haversine_adjusted' | 'haversine_fallback'
//   route: {
//     geometry: {...},        // GeoJSON LineString
//     legs: [...]
//   }
// }
```

### Frontend - Hiển Thị Map

```jsx
// CheckoutPage.jsx
const response = await orderAPI.calculateDeliveryFee({
  restaurantId,
  userAddress
});

console.log(response.data);
// {
//   deliveryFee: 30000,
//   distance: "4.32",
//   estimatedDuration: 8,
//   routingMethod: "routing",
//   routeGeometry: { type: "LineString", coordinates: [...] }
// }

// DroneMap.jsx - Vẽ route thực tế
if (order?.routeGeometry?.coordinates) {
  routePath = order.routeGeometry.coordinates.map(coord => [coord[1], coord[0]]);
}
```

## 🎯 Lợi Ích

### Cho Khách Hàng
- ✅ Phí ship **công bằng** theo khoảng cách thực tế
- ✅ Thời gian giao hàng **chính xác**
- ✅ Xem được **lộ trình thực tế** trên bản đồ

### Cho Nhà Hàng
- ✅ Tính phí **chính xác** hơn
- ✅ Tránh tranh cãi về phí vận chuyển
- ✅ Tăng độ tin cậy của hệ thống

### Cho Hệ Thống
- ✅ Miễn phí (sử dụng OSRM public API)
- ✅ Có fallback đảm bảo luôn hoạt động
- ✅ Có thể scale lên self-hosted OSRM nếu cần

## 🔧 Cấu Hình Nâng Cao

### Thay Đổi Hệ Số Điều Chỉnh

File: `server_app/services/routingService.js`

```javascript
// Hệ số điều chỉnh khi OSRM fail
const CITY_FACTOR = 1.35;  // Thành phố (30-40% dài hơn)
const SUBURB_FACTOR = 1.25; // Ngoại thành (20-30% dài hơn)
const RURAL_FACTOR = 1.15;  // Nông thôn (10-20% dài hơn)
```

### Self-Hosted OSRM (Production)

Để có hiệu suất tốt hơn và không bị giới hạn rate limit:

```bash
# Tải dữ liệu bản đồ Việt Nam
wget http://download.geofabrik.de/asia/vietnam-latest.osm.pbf

# Build OSRM
docker run -t -v $(pwd):/data osrm/osrm-backend osrm-extract -p /opt/car.lua /data/vietnam-latest.osm.pbf
docker run -t -v $(pwd):/data osrm/osrm-backend osrm-partition /data/vietnam-latest.osrm
docker run -t -v $(pwd):/data osrm/osrm-backend osrm-customize /data/vietnam-latest.osrm

# Run OSRM server
docker run -t -i -p 5000:5000 -v $(pwd):/data osrm/osrm-backend osrm-routed --algorithm mld /data/vietnam-latest.osrm
```

Sau đó cập nhật URL trong `routingService.js`:
```javascript
const url = `http://localhost:5000/route/v1/driving/${lon1},${lat1};${lon2},${lat2}`;
```

## 📈 Performance

- **OSRM API Response Time**: ~100-300ms
- **Fallback Haversine**: <1ms
- **Total Processing Time**: ~500ms (bao gồm geocoding)

## 🐛 Troubleshooting

### Lỗi: "Routing API failed"
- **Nguyên nhân**: OSRM server không khả dụng hoặc timeout
- **Giải pháp**: Hệ thống tự động fallback sang Haversine + điều chỉnh

### Lỗi: "No route found"
- **Nguyên nhân**: Không tìm được đường đi giữa 2 điểm (vd: đảo xa)
- **Giải pháp**: Fallback sang Haversine

### Khoảng cách khác biệt lớn
- **Bình thường**: Routing có thể dài hơn 30-50% so với đường thẳng
- **Kiểm tra**: Log `routingMethod` để xem phương pháp nào được dùng

## 📚 Tài Liệu Tham Khảo

- [OSRM Documentation](http://project-osrm.org/docs/v5.24.0/api/)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [GeoJSON Specification](https://geojson.org/)

## ✅ Checklist Triển Khai

- [x] Backend: Routing service
- [x] Backend: Order controller integration
- [x] Backend: Calculate fee API
- [x] Frontend: CheckoutPage hiển thị thông tin routing
- [x] Frontend: DroneMap vẽ route thực tế
- [x] Test: So sánh Haversine vs OSRM
- [ ] Production: Self-hosted OSRM (optional)
- [ ] Monitoring: Log routing performance

---

**Cập nhật**: 06/11/2025
**Phiên bản**: 1.0.0
**Tác giả**: FOODFAST Team
