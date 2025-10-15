# 🛠️ FIX: Drone Map Display Issues

## 🐛 Vấn đề

Khi thêm drone mới:
1. Drone không hiển thị đúng trên map
2. Chỉ hiển thị drone mới thêm, các drone cũ biến mất
3. Tọa độ bị sai khi tạo drone mới

## 🔍 Nguyên nhân

### 1. Backend Issue - Thiếu `currentLocation` khi tạo drone
- Khi tạo drone mới, chỉ set `homeLocation`, không set `currentLocation`
- Model Drone có default `currentLocation.coordinates = [0, 0]` (tọa độ không hợp lệ)
- FleetMap component filter drones có `currentLocation` để hiển thị trên map

### 2. Frontend Issue - Không sync realtime
- FleetMap không lắng nghe event `drone:created` 
- Khi tạo drone mới, FleetMap không tự động refresh
- Socket service thiếu handler cho drone CRUD events

## ✅ Giải pháp

### 1. Backend Fixes

#### `server_app/API/Controllers/droneController.js`
```javascript
// Trong createDrone function
const createDrone = asyncHandler(async (req, res) => {
    // ✅ Set currentLocation = homeLocation nếu không được cung cấp
    if (req.body.homeLocation && !req.body.currentLocation) {
        req.body.currentLocation = {
            type: 'Point',
            coordinates: req.body.homeLocation.coordinates
        }
    }

    const drone = await Drone.create(req.body)

    // ✅ Emit socket event để notify admins
    const io = req.app.get('io')
    if (io) {
        io.to('admin-room').emit('drone:created', {
            drone: drone,
            timestamp: new Date(),
        })
    }

    res.status(201).json({
        success: true,
        data: drone,
    })
})

// Trong updateDrone function
const updateDrone = asyncHandler(async (req, res) => {
    // ... existing code ...

    // ✅ Emit socket event khi update
    const io = req.app.get('io')
    if (io) {
        io.to('admin-room').emit('drone:updated', {
            drone: drone,
            timestamp: new Date(),
        })
    }

    res.json({
        success: true,
        data: drone,
    })
})
```

#### `server_app/API/Models/Drone.js`
```javascript
currentLocation: {
    type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
    },
    coordinates: {
        type: [Number],
        required: false, // ✅ Không bắt buộc, sẽ được set khi create
    },
},
```

### 2. Frontend Fixes

#### `admin_app/src/services/socketService.js`
```javascript
// ✅ Thêm event handlers mới
onDroneCreated(callback) {
    if (this.socket) {
        this.socket.on('drone:created', callback);
    }
}

onDroneUpdated(callback) {
    if (this.socket) {
        this.socket.on('drone:updated', callback);
    }
}
```

#### `admin_app/src/pages/Fleet/FleetMap.jsx`
```javascript
const initializeSocket = () => {
    // ... existing code ...

    // ✅ Lắng nghe drone created event
    socketService.onDroneCreated((data) => {
        console.log('New drone created:', data);
        message.success(`🚁 New drone added: ${data.drone?.name || 'Unknown'}`);
        fetchData(); // Refresh để lấy drone mới
    });

    // ✅ Lắng nghe drone updated event
    socketService.onDroneUpdated((data) => {
        console.log('Drone updated:', data);
        fetchData(); // Refresh để lấy dữ liệu mới
    });
};

// ✅ Cleanup khi unmount
return () => {
    clearInterval(interval);
    socketService.off('fleet:status');
    socketService.off('fleet:location-update');
    socketService.off('drone:online');
    socketService.off('drone:offline');
    socketService.off('drone:created');
    socketService.off('drone:updated');
};
```

## 🧪 Testing

### 1. Test tạo drone mới
```bash
# 1. Mở Admin App và vào Fleet Map
http://localhost:3002/fleet

# 2. Mở Drones Page
http://localhost:3002/drones

# 3. Click "Thêm Drone Mới"
- Nhập thông tin drone
- Nhập tọa độ hợp lệ (ví dụ: lat=10.7731, lng=106.6947)
- Click "Thêm"

# 4. Kiểm tra
✅ Drone xuất hiện trên FleetMap ngay lập tức
✅ Tọa độ hiển thị đúng trên map
✅ Các drone cũ vẫn hiển thị
✅ Thông báo "New drone added" xuất hiện
```

### 2. Kiểm tra seed data
```bash
# Chạy seed
npm run seed

# Verify
- 3 drones nên hiển thị trên map:
  - Drone Alpha (106.6947, 10.7731)
  - Drone Beta (106.7006, 10.7756)
  - Drone Gamma (106.6811, 10.7543)
```

### 3. Kiểm tra realtime sync
```bash
# 1. Mở 2 tab Admin App
Tab 1: Fleet Map
Tab 2: Drones Page

# 2. Ở Tab 2, tạo drone mới
# 3. Kiểm tra Tab 1
✅ Drone mới xuất hiện ngay lập tức không cần refresh
```

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────┐
│ Admin tạo drone mới trong DronesPage               │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ POST /api/drones với:                               │
│ {                                                    │
│   name: "Drone Delta",                              │
│   homeLocation: {                                   │
│     type: "Point",                                  │
│     coordinates: [106.7, 10.8]                      │
│   }                                                  │
│ }                                                    │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ droneController.createDrone()                       │
│ - Set currentLocation = homeLocation                │
│ - Create drone in MongoDB                           │
│ - Emit 'drone:created' to 'admin-room'            │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ Socket.IO broadcasts to all admin clients          │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ FleetMap component receives 'drone:created'        │
│ - Shows notification message                        │
│ - Calls fetchData() to refresh drone list          │
│ - Map updates with new drone marker                │
└─────────────────────────────────────────────────────┘
```

## 🎯 Kết quả

✅ Drone mới hiển thị đúng tọa độ trên map
✅ Tất cả drones (cũ + mới) đều hiển thị
✅ Realtime sync giữa các admin clients
✅ Không cần refresh page manually
✅ Thông báo rõ ràng cho user

## 🔧 Các files đã sửa

1. `server_app/API/Controllers/droneController.js` - Thêm logic set currentLocation và emit events
2. `server_app/API/Models/Drone.js` - Sửa currentLocation.coordinates thành optional
3. `admin_app/src/services/socketService.js` - Thêm onDroneCreated/Updated handlers
4. `admin_app/src/pages/Fleet/FleetMap.jsx` - Lắng nghe và xử lý drone events

## 📝 Lưu ý

- Khi tạo drone mới, **PHẢI** nhập tọa độ hợp lệ (lat: -90 đến 90, lng: -180 đến 180)
- Tọa độ trong MongoDB lưu theo format [longitude, latitude] (lng first!)
- Leaflet map sử dụng format [latitude, longitude] (lat first!)
- FleetMap chỉ hiển thị drones có `currentLocation.coordinates` hợp lệ

## 🚀 Next Steps

1. Thêm validation tọa độ ở frontend form
2. Thêm map picker để chọn vị trí drone bằng click trên map
3. Thêm bulk import drones từ CSV
4. Thêm filter/search drones trên FleetMap
