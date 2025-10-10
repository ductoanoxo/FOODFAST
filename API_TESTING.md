# 🧪 API TESTING GUIDE

Hướng dẫn test API endpoints với cURL hoặc Postman

## 🔐 Authentication

### 1. Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "0901234567",
    "address": "123 Test St, HCM City"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@foodfast.com",
    "password": "user123"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "user@foodfast.com",
    "role": "user"
  }
}
```

### 3. Get Profile (Protected)
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🍕 Products

### 1. Get All Products
```bash
# Basic
curl http://localhost:5000/api/products

# With filters
curl "http://localhost:5000/api/products?category=CATEGORY_ID&minPrice=20000&maxPrice=100000&sort=-price"
```

### 2. Get Product by ID
```bash
curl http://localhost:5000/api/products/PRODUCT_ID
```

### 3. Create Product (Restaurant/Admin)
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bánh mì thịt",
    "description": "Bánh mì thịt ngon",
    "price": 25000,
    "category": "CATEGORY_ID",
    "restaurant": "RESTAURANT_ID",
    "stock": 100
  }'
```

### 4. Update Product
```bash
curl -X PUT http://localhost:5000/api/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 30000,
    "stock": 50
  }'
```

### 5. Delete Product
```bash
curl -X DELETE http://localhost:5000/api/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📦 Orders

### 1. Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product": "PRODUCT_ID_1",
        "quantity": 2,
        "price": 45000
      },
      {
        "product": "PRODUCT_ID_2",
        "quantity": 1,
        "price": 50000
      }
    ],
    "restaurant": "RESTAURANT_ID",
    "deliveryAddress": {
      "street": "123 Test St",
      "ward": "Ward 1",
      "district": "District 1",
      "city": "HCM City"
    },
    "paymentMethod": "cash",
    "note": "Không hành"
  }'
```

### 2. Get User Orders
```bash
curl http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Order by ID
```bash
curl http://localhost:5000/api/orders/ORDER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Update Order Status (Restaurant/Admin)
```bash
curl -X PUT http://localhost:5000/api/orders/ORDER_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'
```

**Status values:**
- `pending` - Chờ xác nhận
- `confirmed` - Đã xác nhận
- `preparing` - Đang chuẩn bị
- `ready` - Sẵn sàng giao
- `delivering` - Đang giao
- `delivered` - Đã giao
- `cancelled` - Đã hủy

---

## 🏪 Restaurants

### 1. Get All Restaurants
```bash
curl http://localhost:5000/api/restaurants
```

### 2. Get Restaurant by ID
```bash
curl http://localhost:5000/api/restaurants/RESTAURANT_ID
```

### 3. Get Nearby Restaurants (Geospatial)
```bash
curl "http://localhost:5000/api/restaurants/nearby?lng=106.6297&lat=10.8231&maxDistance=5000"
```

### 4. Create Restaurant (Admin)
```bash
curl -X POST http://localhost:5000/api/restaurants \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bún Bò Huế",
    "description": "Bún bò Huế chính gốc",
    "address": "456 Test St, HCM City",
    "phone": "0281234567",
    "email": "bunbo@restaurant.com",
    "location": {
      "type": "Point",
      "coordinates": [106.6947, 10.7731]
    },
    "owner": "USER_ID"
  }'
```

---

## 🚁 Drones

### 1. Get All Drones
```bash
curl http://localhost:5000/api/drones \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Get Drone by ID
```bash
curl http://localhost:5000/api/drones/DRONE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Create Drone (Admin)
```bash
curl -X POST http://localhost:5000/api/drones \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "droneCode": "DRONE-004",
    "model": "DJI Phantom 4",
    "maxPayload": 5,
    "batteryLevel": 100,
    "status": "available",
    "currentLocation": {
      "type": "Point",
      "coordinates": [106.6947, 10.7731]
    }
  }'
```

### 4. Update Drone Location
```bash
curl -X PUT http://localhost:5000/api/drones/DRONE_ID/location \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "coordinates": [106.7000, 10.7800]
  }'
```

### 5. Update Drone Status
```bash
curl -X PUT http://localhost:5000/api/drones/DRONE_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "busy",
    "batteryLevel": 75
  }'
```

---

## 📂 Categories

### Get All Categories
```bash
curl http://localhost:5000/api/categories
```

---

## 👥 Users (Admin Only)

### 1. Get All Users
```bash
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 2. Get User by ID
```bash
curl http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 3. Update User
```bash
curl -X PUT http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "restaurant",
    "isActive": true
  }'
```

### 4. Delete User
```bash
curl -X DELETE http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 📋 Postman Collection

### Setup Postman Environment

**Variables:**
```
base_url: http://localhost:5000/api
token: (leave empty, will be set after login)
user_token: (token from user@foodfast.com)
admin_token: (token from admin@foodfast.com)
restaurant_token: (token from restaurant@foodfast.com)
```

### Collection Structure

```
FOODFAST API
├── Auth
│   ├── Register
│   ├── Login (User)
│   ├── Login (Admin)
│   └── Get Profile
├── Products
│   ├── Get All Products
│   ├── Get Product by ID
│   ├── Create Product
│   ├── Update Product
│   └── Delete Product
├── Orders
│   ├── Create Order
│   ├── Get My Orders
│   ├── Get Order by ID
│   └── Update Order Status
├── Restaurants
│   ├── Get All Restaurants
│   ├── Get Restaurant by ID
│   ├── Get Nearby Restaurants
│   └── Create Restaurant
├── Drones
│   ├── Get All Drones
│   ├── Get Drone by ID
│   ├── Update Location
│   └── Update Status
├── Categories
│   └── Get All Categories
└── Users (Admin)
    ├── Get All Users
    ├── Get User by ID
    ├── Update User
    └── Delete User
```

---

## 🧪 Testing Flow

### 1. User Registration & Order Flow
```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","phone":"0901234567"}'

# 2. Login (save token)
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' \
  | jq -r '.token')

# 3. Get products
curl http://localhost:5000/api/products

# 4. Create order
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"product":"PRODUCT_ID","quantity":2,"price":45000}],
    "restaurant": "RESTAURANT_ID",
    "deliveryAddress": {"street":"Test St","city":"HCM"},
    "paymentMethod": "cash"
  }'

# 5. Get my orders
curl http://localhost:5000/api/orders \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Restaurant Order Management
```bash
# 1. Login as restaurant
REST_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"restaurant@foodfast.com","password":"restaurant123"}' \
  | jq -r '.token')

# 2. Get restaurant orders
curl http://localhost:5000/api/orders \
  -H "Authorization: Bearer $REST_TOKEN"

# 3. Update order status
curl -X PUT http://localhost:5000/api/orders/ORDER_ID/status \
  -H "Authorization: Bearer $REST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed"}'
```

### 3. Admin Management
```bash
# 1. Login as admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@foodfast.com","password":"admin123"}' \
  | jq -r '.token')

# 2. Get all users
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Get all restaurants
curl http://localhost:5000/api/restaurants \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 4. Get all orders
curl http://localhost:5000/api/orders \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 🔌 Socket.io Testing

### Using socket.io-client

```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:5000');

// Join order tracking room
socket.emit('join-order-room', 'ORDER_ID');

// Listen for order updates
socket.on('order-status-updated', (data) => {
  console.log('Order updated:', data);
});

// Join drone tracking room
socket.emit('join-drone-room', 'DRONE_ID');

// Listen for drone location updates
socket.on('drone-location-updated', (data) => {
  console.log('Drone location:', data);
});
```

### Using Browser Console

```javascript
// Open browser console at http://localhost:3000
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');
  
  // Join room
  socket.emit('join-order-room', 'YOUR_ORDER_ID');
});

socket.on('order-status-updated', (data) => {
  console.log('Order updated:', data);
});
```

---

## 📊 Response Examples

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error"
}
```

### Pagination Response
```json
{
  "success": true,
  "count": 50,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  },
  "data": [ ... ]
}
```

---

## ⚠️ Common Errors

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```
**Solution**: Include `Authorization: Bearer TOKEN` header

### 403 Forbidden
```json
{
  "success": false,
  "message": "User role 'user' is not authorized"
}
```
**Solution**: Use account with correct role (admin, restaurant)

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```
**Solution**: Check ID exists in database

---

## 🎯 Testing Checklist

- [ ] User registration works
- [ ] User login returns token
- [ ] Protected routes require authentication
- [ ] Products can be filtered and sorted
- [ ] Orders can be created
- [ ] Order status can be updated
- [ ] Socket.io events are emitted
- [ ] Geospatial queries work
- [ ] Role-based authorization works
- [ ] Error handling returns proper messages

---

**Happy Testing! 🧪**
