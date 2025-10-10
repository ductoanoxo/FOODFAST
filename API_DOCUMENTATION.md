# 🔌 API DOCUMENTATION - FOODFAST DRONE DELIVERY

## Base URL
```
http://localhost:5000/api
```

---

## 🔐 AUTHENTICATION

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Nguyen Van A",
  "email": "user@example.com",
  "password": "password123",
  "phone": "0901234567",
  "role": "customer" // customer | restaurant | drone_operator | admin
}

Response: 201 Created
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "Nguyen Van A",
      "email": "user@example.com",
      "role": "customer"
    },
    "token": "jwt_token_here"
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": { user object }
}
```

---

## 🍕 PRODUCTS

### Get All Products
```http
GET /api/products?category=...&restaurant=...&sort=price&limit=20&page=1
Authorization: Bearer {token} (optional)

Query Parameters:
- category: string (optional) - Filter by category ID
- restaurant: string (optional) - Filter by restaurant ID
- search: string (optional) - Search by name
- minPrice: number (optional)
- maxPrice: number (optional)
- sort: string (optional) - price | -price | rating | -rating | name
- limit: number (default: 20)
- page: number (default: 1)

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Phở Bò",
      "description": "Phở bò truyền thống Hà Nội",
      "price": 45000,
      "image": "https://...",
      "category": {
        "_id": "...",
        "name": "Món Việt"
      },
      "restaurant": {
        "_id": "...",
        "name": "Phở Gia Truyền",
        "rating": 4.5
      },
      "stock": 50,
      "rating": 4.7,
      "totalReviews": 234,
      "isAvailable": true
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 5,
    "limit": 20
  }
}
```

### Get Product by ID
```http
GET /api/products/:id
Authorization: Bearer {token} (optional)

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Phở Bò",
    "description": "...",
    "price": 45000,
    "restaurant": { full restaurant object },
    "category": { full category object },
    "reviews": [
      {
        "user": { name, avatar },
        "rating": 5,
        "comment": "Ngon lắm!",
        "createdAt": "..."
      }
    ],
    ...
  }
}
```

### Get Popular Products
```http
GET /api/products/popular?limit=10

Response: 200 OK
{
  "success": true,
  "data": [ products sorted by rating & totalReviews ]
}
```

### Search Products
```http
GET /api/products/search?q=pho&limit=20

Response: 200 OK
{
  "success": true,
  "data": [ matched products ]
}
```

### Create Product (Restaurant Only)
```http
POST /api/products
Authorization: Bearer {restaurant_token}
Content-Type: application/json

{
  "name": "Bún Chả",
  "description": "Bún chả Hà Nội",
  "price": 40000,
  "category": "category_id",
  "restaurant": "restaurant_id",
  "image": "https://...",
  "stock": 30
}

Response: 201 Created
{
  "success": true,
  "message": "Product created successfully",
  "data": { product }
}
```

### Update Product (Restaurant Only)
```http
PUT /api/products/:id
Authorization: Bearer {restaurant_token}
Content-Type: application/json

{
  "price": 50000,
  "stock": 20,
  "isAvailable": false
}

Response: 200 OK
{
  "success": true,
  "message": "Product updated successfully",
  "data": { updated product }
}
```

### Delete Product (Restaurant Only)
```http
DELETE /api/products/:id
Authorization: Bearer {restaurant_token}

Response: 200 OK
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 🏪 RESTAURANTS

### Get All Restaurants
```http
GET /api/restaurants?limit=20&page=1

Query Parameters:
- search: string (optional)
- cuisine: string (optional)
- rating: number (optional) - minimum rating
- isOpen: boolean (optional)
- limit: number (default: 20)
- page: number (default: 1)

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Phở Gia Truyền",
      "description": "...",
      "address": "123 Nguyen Hue, Q1, HCM",
      "phone": "0901234567",
      "email": "pho@gmail.com",
      "image": "https://...",
      "cuisine": ["Vietnamese", "Noodles"],
      "rating": 4.5,
      "totalReviews": 567,
      "deliveryTime": "20-30 phút",
      "isOpen": true,
      "location": {
        "type": "Point",
        "coordinates": [106.6947, 10.7731]
      }
    }
  ],
  "pagination": { ... }
}
```

### Get Restaurant by ID
```http
GET /api/restaurants/:id

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Phở Gia Truyền",
    "description": "...",
    "openingHours": "08:00 - 22:00",
    "menu": [ array of products ],
    ...
  }
}
```

### Get Restaurant Menu
```http
GET /api/restaurants/:id/menu

Response: 200 OK
{
  "success": true,
  "data": [ products of this restaurant ]
}
```

### Get Nearby Restaurants
```http
GET /api/restaurants/nearby?lat=10.7731&lng=106.6947&maxDistance=5000

Query Parameters:
- lat: number (required) - Latitude
- lng: number (required) - Longitude
- maxDistance: number (optional, default: 10000) - Distance in meters

Response: 200 OK
{
  "success": true,
  "data": [
    {
      restaurant object with additional field:
      "distance": 1234 // meters
    }
  ]
}
```

### Update Restaurant (Restaurant Owner Only)
```http
PUT /api/restaurants/:id
Authorization: Bearer {restaurant_token}
Content-Type: application/json

{
  "name": "New Name",
  "description": "...",
  "openingHours": "07:00 - 23:00"
}

Response: 200 OK
{
  "success": true,
  "data": { updated restaurant }
}
```

---

## 📦 ORDERS

### Create Order
```http
POST /api/orders
Authorization: Bearer {customer_token}
Content-Type: application/json

{
  "items": [
    {
      "product": "product_id",
      "quantity": 2,
      "price": 45000
    }
  ],
  "restaurant": "restaurant_id",
  "deliveryAddress": {
    "street": "123 Nguyen Hue",
    "ward": "Ben Nghe",
    "district": "Quan 1",
    "city": "Ho Chi Minh",
    "coordinates": [106.7006, 10.7756]
  },
  "paymentMethod": "cash", // cash | card | e-wallet
  "note": "Không hành"
}

Response: 201 Created
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "order_id",
    "orderNumber": "ORD-20250110-001",
    "customer": { ... },
    "restaurant": { ... },
    "items": [ ... ],
    "subtotal": 90000,
    "deliveryFee": 15000,
    "total": 105000,
    "status": "pending",
    "drone": null, // will be assigned
    "estimatedDeliveryTime": 25, // minutes
    "createdAt": "2025-10-10T10:30:00.000Z"
  }
}
```

### Get Order by ID
```http
GET /api/orders/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "...",
    "orderNumber": "ORD-20250110-001",
    "customer": { name, phone, email },
    "restaurant": { name, address, phone },
    "items": [
      {
        "product": { name, image, price },
        "quantity": 2,
        "price": 45000,
        "subtotal": 90000
      }
    ],
    "subtotal": 90000,
    "deliveryFee": 15000,
    "total": 105000,
    "status": "delivering",
    "statusHistory": [
      { status: "pending", timestamp: "..." },
      { status: "confirmed", timestamp: "..." },
      { status: "preparing", timestamp: "..." },
      { status: "ready", timestamp: "..." },
      { status: "delivering", timestamp: "..." }
    ],
    "drone": {
      "name": "Drone Alpha",
      "model": "DJI Mavic 3",
      "currentLocation": {
        "type": "Point",
        "coordinates": [106.7006, 10.7756]
      },
      "batteryLevel": 85
    },
    "deliveryAddress": { ... },
    "estimatedDeliveryTime": "2025-10-10T11:00:00.000Z",
    "actualDeliveryTime": null,
    "paymentMethod": "cash",
    "isPaid": false,
    "note": "Không hành"
  }
}
```

### Get User Orders
```http
GET /api/orders/user/:userId?status=...&limit=20&page=1
Authorization: Bearer {customer_token}

Query Parameters:
- status: string (optional) - pending | confirmed | preparing | ready | delivering | delivered | cancelled
- limit: number (default: 20)
- page: number (default: 1)

Response: 200 OK
{
  "success": true,
  "data": [ array of orders ],
  "pagination": { ... }
}
```

### Get Restaurant Orders
```http
GET /api/orders/restaurant/:restaurantId?status=...
Authorization: Bearer {restaurant_token}

Response: 200 OK
{
  "success": true,
  "data": [ array of orders ]
}
```

### Update Order Status
```http
PUT /api/orders/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "preparing", // next status in workflow
  "note": "Optional note"
}

Response: 200 OK
{
  "success": true,
  "message": "Order status updated",
  "data": { updated order }
}

// Socket event emitted:
socket.emit('orderUpdate', {
  orderId: "...",
  status: "preparing",
  timestamp: "..."
})
```

### Cancel Order
```http
PUT /api/orders/:id/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Changed mind"
}

Response: 200 OK
{
  "success": true,
  "message": "Order cancelled",
  "data": { cancelled order }
}
```

---

## 📂 CATEGORIES

### Get All Categories
```http
GET /api/categories

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Món Việt",
      "slug": "mon-viet",
      "description": "...",
      "image": "https://...",
      "productCount": 45
    }
  ]
}
```

### Get Products by Category
```http
GET /api/categories/:id/products?limit=20&page=1

Response: 200 OK
{
  "success": true,
  "data": [ products in this category ],
  "pagination": { ... }
}
```

---

## 🚁 DRONES

### Get All Drones (Admin Only)
```http
GET /api/drones?status=...&limit=50
Authorization: Bearer {admin_token}

Query Parameters:
- status: string (optional) - available | busy | charging | maintenance | offline
- limit: number (default: 50)

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Drone Alpha",
      "serialNumber": "DRONE-001",
      "model": "DJI Mavic 3",
      "status": "busy",
      "batteryLevel": 75,
      "currentLocation": {
        "type": "Point",
        "coordinates": [106.6947, 10.7731]
      },
      "homeLocation": {
        "type": "Point",
        "coordinates": [106.6947, 10.7731]
      },
      "currentOrder": "order_id",
      "maxRange": 10, // km
      "maxWeight": 5, // kg
      "speed": 60, // km/h
      "totalFlights": 234,
      "totalDistance": 1234.5, // km
      "lastMaintenanceDate": "...",
      "nextMaintenanceDate": "...",
      "isActive": true
    }
  ]
}
```

### Get Drone by ID
```http
GET /api/drones/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": { drone object with full details }
}
```

### Create Drone (Admin Only)
```http
POST /api/drones
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Drone Delta",
  "serialNumber": "DRONE-004",
  "model": "DJI Air 3",
  "homeLocation": {
    "type": "Point",
    "coordinates": [106.6947, 10.7731]
  },
  "maxRange": 15,
  "maxWeight": 6,
  "speed": 70
}

Response: 201 Created
{
  "success": true,
  "data": { created drone }
}
```

### Update Drone (Admin Only)
```http
PUT /api/drones/:id
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "maintenance",
  "batteryLevel": 100,
  "currentLocation": { ... }
}

Response: 200 OK
{
  "success": true,
  "data": { updated drone }
}

// Socket event emitted:
socket.emit('droneStatusUpdate', {
  droneId: "...",
  status: "maintenance",
  batteryLevel: 100
})
```

### Update Drone Location (Drone App)
```http
PUT /api/drones/:id/location
Authorization: Bearer {drone_operator_token}
Content-Type: application/json

{
  "coordinates": [106.7006, 10.7756],
  "batteryLevel": 70
}

Response: 200 OK
{
  "success": true,
  "data": { updated drone }
}

// Socket event emitted:
socket.emit('droneLocationUpdate', {
  droneId: "...",
  orderId: "...",
  location: {
    type: "Point",
    coordinates: [106.7006, 10.7756]
  },
  batteryLevel: 70,
  timestamp: "..."
})
```

### Delete Drone (Admin Only)
```http
DELETE /api/drones/:id
Authorization: Bearer {admin_token}

Response: 200 OK
{
  "success": true,
  "message": "Drone deleted"
}
```

---

## 💳 PAYMENTS

### Create Payment
```http
POST /api/payments/create
Authorization: Bearer {customer_token}
Content-Type: application/json

{
  "orderId": "order_id",
  "amount": 105000,
  "method": "card" // card | e-wallet | cash
}

Response: 200 OK
{
  "success": true,
  "data": {
    "paymentId": "...",
    "orderId": "...",
    "amount": 105000,
    "method": "card",
    "status": "pending",
    "paymentUrl": "https://..." // for online payment
  }
}
```

### Verify Payment
```http
POST /api/payments/verify
Content-Type: application/json

{
  "paymentId": "...",
  "transactionId": "...", // from payment gateway
  "status": "success"
}

Response: 200 OK
{
  "success": true,
  "message": "Payment verified",
  "data": { payment object }
}
```

---

## 📊 STATISTICS (Admin Only)

### Get Overview Stats
```http
GET /api/stats/overview?startDate=...&endDate=...
Authorization: Bearer {admin_token}

Response: 200 OK
{
  "success": true,
  "data": {
    "totalUsers": 1234,
    "totalOrders": 5678,
    "totalRevenue": 123456789,
    "totalDrones": 10,
    "activeDrones": 7,
    "todayOrders": 89,
    "todayRevenue": 12345000,
    "averageDeliveryTime": 23, // minutes
    "orderStatusBreakdown": {
      "pending": 5,
      "confirmed": 3,
      "preparing": 8,
      "ready": 2,
      "delivering": 4,
      "delivered": 67,
      "cancelled": 0
    },
    "popularProducts": [ ... ],
    "revenueByDay": [
      { date: "2025-10-10", revenue: 1234000, orders: 45 }
    ]
  }
}
```

### Get Restaurant Stats
```http
GET /api/stats/restaurant/:restaurantId?startDate=...&endDate=...
Authorization: Bearer {restaurant_token}

Response: 200 OK
{
  "success": true,
  "data": {
    "totalOrders": 234,
    "totalRevenue": 12345000,
    "averageOrderValue": 52777,
    "topSellingProducts": [ ... ],
    "ordersByStatus": { ... },
    "revenueByDay": [ ... ]
  }
}
```

---

## 🔌 SOCKET.IO EVENTS

### Client → Server

#### Join Room
```javascript
socket.emit('joinRoom', {
  userId: 'user_id',
  role: 'customer' // customer | restaurant | admin | drone_operator
})
```

#### Update Order Status (Restaurant/Admin)
```javascript
socket.emit('updateOrderStatus', {
  orderId: 'order_id',
  status: 'preparing'
})
```

#### Update Drone Location (Drone App)
```javascript
socket.emit('updateDroneLocation', {
  droneId: 'drone_id',
  location: {
    type: 'Point',
    coordinates: [106.7006, 10.7756]
  },
  batteryLevel: 75
})
```

### Server → Client

#### Order Created (to Restaurant)
```javascript
socket.on('orderCreated', (data) => {
  // data: { order object }
  // Show notification in restaurant app
})
```

#### Order Updated (to Customer)
```javascript
socket.on('orderUpdate', (data) => {
  // data: { orderId, status, timestamp }
  // Update UI in client app
})
```

#### Drone Location Update (to Customer)
```javascript
socket.on('droneLocationUpdate', (data) => {
  // data: {
  //   droneId,
  //   orderId,
  //   location: { type, coordinates },
  //   batteryLevel,
  //   timestamp
  // }
  // Update map marker in tracking page
})
```

#### Drone Status Update (to Admin)
```javascript
socket.on('droneStatusUpdate', (data) => {
  // data: { droneId, status, batteryLevel }
  // Update drone list in admin app
})
```

---

## ❌ ERROR RESPONSES

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "message": "Error message here",
    "statusCode": 400,
    "details": [ /* optional validation errors */ ]
  }
}
```

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., email already exists)
- `500` - Internal Server Error

---

## 🔒 AUTHORIZATION RULES

### Roles:
- **customer**: Đặt hàng, xem orders của mình, track delivery
- **restaurant**: Xem & quản lý orders của nhà hàng, quản lý sản phẩm
- **drone_operator**: Xem missions, cập nhật drone location
- **admin**: Full access tất cả endpoints

### Protected Endpoints:
- Tất cả `/api/orders/*` yêu cầu authentication
- `/api/products` (POST/PUT/DELETE) yêu cầu role `restaurant`
- `/api/drones/*` yêu cầu role `admin` hoặc `drone_operator`
- `/api/stats/*` yêu cầu role `admin` hoặc `restaurant`

---

## 📝 NOTES FOR IMPLEMENTATION

### Priority Order:
1. Auth endpoints (✅ Already implemented)
2. Product & Restaurant READ endpoints (for browsing)
3. Order CREATE endpoint (for checkout)
4. Order UPDATE endpoint (for status changes)
5. Socket.io basic setup
6. Drone assignment logic
7. Real-time tracking
8. Statistics endpoints

### Testing:
- Use Postman/Thunder Client collection
- Test all endpoints with different roles
- Verify socket events fire correctly
- Load test with multiple concurrent orders

### Performance:
- Index database fields: `email`, `category`, `restaurant`, `status`, `location`
- Cache frequently accessed data (categories, popular products)
- Optimize queries with `.populate()` carefully
- Limit response payload size

---

**Last Updated:** October 10, 2025
**Version:** 1.0.0
