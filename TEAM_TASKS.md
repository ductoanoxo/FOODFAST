# 📋 PHÂN CHIA NHIỆM VỤ TEAM - FOODFAST DRONE DELIVERY

## 👥 CẤU TRÚC TEAM (2 NGƯỜI)

### 🔵 **MEMBER 1 (Full-stack)** - Phụ trách Customer Journey & Restaurant Management
### 🔴 **MEMBER 2 (Full-stack)** - Phụ trách Order Processing & Admin Management

**Mỗi người làm cả Frontend + Backend của feature mình phụ trách!**

---

## 🔵 MEMBER 1 - NHIỆM VỤ THEO LUỒNG CHỨC NĂNG

**Trách nhiệm:** Customer Experience Flow + Restaurant Management Flow

---

## 📦 FEATURE 1: PRODUCT BROWSING & DISCOVERY (Week 1)

### **Frontend - Client App**

#### 1.1 HomePage (Port 3000) ⭐ Priority High
- [ ] **Hero Banner** với carousel
- [ ] **Popular Products Section** - Hiển thị 8 món phổ biến
- [ ] **Featured Restaurants Section** - Hiển thị 6 nhà hàng nổi bật
- [ ] **Category Quick Links** - Icon grid các categories
- [ ] **How It Works Section** - 3 steps (Order → Drone → Delivered)
- [ ] **App Features Section** - Fast delivery, Safe, Tracked
- [ ] Loading states & skeleton loaders
- [ ] Mobile responsive

📁 Files: 
- `client_app/src/pages/Home/HomePage.jsx`
- `client_app/src/pages/Home/HomePage.css`

#### 1.2 MenuPage (Port 3000) ⭐ Priority High
- [ ] **Product Grid** với cards
- [ ] **Filter Panel:**
  - Category filter (checkboxes)
  - Price range slider
  - Rating filter
  - Restaurant filter
- [ ] **Search Bar** với debounce
- [ ] **Sort Dropdown** (Price low→high, high→low, Rating, Popularity)
- [ ] **Pagination** (20 products per page)
- [ ] **Add to Cart Button** với animation
- [ ] Empty state khi không có sản phẩm

📁 Files:
- `client_app/src/pages/Menu/MenuPage.jsx`
- `client_app/src/components/Product/ProductFilter.jsx`
- `client_app/src/components/Product/ProductCard.jsx`

#### 1.3 StorePage (Port 3000)
- [ ] **Restaurant Grid** với cards
- [ ] **Search Bar** tìm nhà hàng
- [ ] **Filter:** Cuisine type, Rating, Delivery time
- [ ] **Restaurant Card:** Logo, Name, Cuisine, Rating, Delivery time
- [ ] Click vào card → Redirect to MenuPage filtered by restaurant

📁 Files:
- `client_app/src/pages/Store/StorePage.jsx`
- `client_app/src/components/Restaurant/RestaurantCard.jsx`

#### 1.4 ProductDetailPage (Port 3000) ⭐ Priority High
- [ ] **Product Images** (main image + thumbnails)
- [ ] **Product Info:** Name, Price, Description, Rating
- [ ] **Restaurant Info Card** (clickable)
- [ ] **Quantity Selector** (+ / - buttons)
- [ ] **Add to Cart Button** với validation
- [ ] **Reviews Section:**
  - Star rating distribution
  - User reviews list
  - Pagination for reviews
- [ ] **Similar Products** carousel

📁 Files:
- `client_app/src/pages/Product/ProductDetailPage.jsx`
- `client_app/src/pages/Product/ProductDetailPage.css`

### **Backend - Server API**

#### 1.5 Product APIs ⭐ Priority High
- [ ] `GET /api/products` - Get all products
  - Query params: category, restaurant, search, minPrice, maxPrice, sort, limit, page
  - Response: products array + pagination
- [ ] `GET /api/products/:id` - Get product details
  - Populate: category, restaurant
  - Include: reviews
- [ ] `GET /api/products/popular` - Get popular products
  - Sort by: rating × totalReviews
  - Limit: 10
- [ ] `GET /api/products/search?q=keyword` - Search products
  - Search in: name, description
  - Case-insensitive

📁 Files:
- `server_app/API/Controllers/productController.js`
- `server_app/API/Routes/productRoutes.js`

#### 1.6 Category APIs
- [ ] `GET /api/categories` - Get all categories
  - Include: productCount for each category
- [ ] `GET /api/categories/:id/products` - Get products by category
  - Pagination supported

📁 Files:
- `server_app/API/Controllers/categoryController.js`
- `server_app/API/Routes/categoryRoutes.js`

#### 1.7 Restaurant APIs (READ only)
- [ ] `GET /api/restaurants` - Get all restaurants
  - Query params: search, cuisine, rating, isOpen, limit, page
- [ ] `GET /api/restaurants/:id` - Get restaurant details
  - Include: full menu, reviews
- [ ] `GET /api/restaurants/:id/menu` - Get restaurant menu
  - Return: products of this restaurant
- [ ] `GET /api/restaurants/nearby?lat=...&lng=...` - Get nearby restaurants
  - Use: MongoDB geospatial queries
  - Sort by: distance

📁 Files:
- `server_app/API/Controllers/restaurantController.js`
- `server_app/API/Routes/restaurantRoutes.js`

**Testing:**
- [ ] Test all endpoints với Postman
- [ ] Verify pagination works correctly
- [ ] Test search với Vietnamese characters
- [ ] Test geospatial queries

---

## 🛒 FEATURE 2: SHOPPING CART & CHECKOUT (Week 2)

### **Frontend - Client App**

#### 2.1 CartPage (Port 3000) ⭐ Priority Critical
- [ ] **Cart Items List:**
  - Product image, name, price
  - Quantity controls (+/-)
  - Remove button (trash icon)
  - Subtotal per item
- [ ] **Cart Summary Card:**
  - Subtotal
  - Delivery fee (calculated based on distance)
  - Discount (if coupon applied)
  - Total
- [ ] **Coupon Input** với Apply button
- [ ] **Checkout Button** (disabled if cart empty)
- [ ] **Empty Cart State** với "Continue Shopping" button
- [ ] Update cart in Redux store
- [ ] Persist cart to localStorage

📁 Files:
- `client_app/src/pages/Cart/CartPage.jsx`
- `client_app/src/redux/slices/cartSlice.js`

#### 2.2 CheckoutPage (Port 3000) ⭐ Priority Critical
- [ ] **Step 1: Delivery Address**
  - Form: Street, Ward, District, City
  - Leaflet Map để pick location
  - Current location button (Geolocation API)
  - Save address to profile (checkbox)
- [ ] **Step 2: Order Summary**
  - Review cart items
  - Edit cart button → back to cart
- [ ] **Step 3: Payment Method**
  - Radio buttons: Cash, Card, E-wallet
  - Payment info form (if card/e-wallet)
- [ ] **Order Summary Card** (sticky):
  - Items count
  - Subtotal
  - Delivery fee (calculated by distance)
  - Estimated delivery time
  - Total
- [ ] **Place Order Button:**
  - Validation: address, payment method
  - Loading state during order creation
  - Success → Redirect to tracking page
  - Error → Show toast notification
- [ ] Calculate delivery fee & time based on distance
- [ ] Integrate Leaflet for map

📁 Files:
- `client_app/src/pages/Checkout/CheckoutPage.jsx`
- `client_app/src/pages/Checkout/CheckoutPage.css`

### **Backend - Server API**

#### 2.3 Order Creation API ⭐ Priority Critical
- [ ] `POST /api/orders` - Create new order
  - **Validate:**
    - Items: product exists, stock available, price matches
    - Delivery address: coordinates valid
    - User: authenticated
  - **Calculate:**
    - Subtotal (sum of item prices × quantities)
    - Delivery fee (based on distance)
    - Total
    - Estimated delivery time
  - **Process:**
    - Reduce product stock
    - Find & assign available drone (nearest to restaurant)
    - Create order with status: "pending"
    - Update drone status: "busy"
  - **Emit Socket Event:** `orderCreated` to restaurant
  - **Return:** Order object with assigned drone

📁 Files:
- `server_app/API/Controllers/orderController.js`
- `server_app/API/Routes/orderRoutes.js`
- `server_app/API/Services/orderService.js`

#### 2.4 Drone Assignment Logic ⭐
- [ ] **Service: `assignDroneToOrder(order)`**
  - Find available drones:
    - status = 'available'
    - batteryLevel >= 30%
    - maxWeight >= order total weight
    - Within range of restaurant
  - Calculate distance from drone to restaurant
  - Select nearest drone
  - Update drone:
    - status = 'busy'
    - currentOrder = order._id
  - Return assigned drone

📁 Files:
- `server_app/API/Services/droneService.js`

**Testing:**
- [ ] Test order creation with valid data
- [ ] Test validation errors (out of stock, invalid address)
- [ ] Test drone assignment (available drones)
- [ ] Test drone assignment (no drones available)
- [ ] Verify stock reduction

---

## 🍴 FEATURE 3: RESTAURANT MANAGEMENT (Week 3)

### **Frontend - Restaurant App**

#### 3.1 Restaurant Dashboard (Port 3001) ⭐
- [ ] **Stats Cards:**
  - Today's orders
  - Today's revenue
  - Pending orders
  - Average rating
- [ ] **Revenue Chart:**
  - Line chart (last 7 days)
  - Bar chart option
- [ ] **Top Selling Products** (today)
- [ ] **Recent Orders** (last 10)
- [ ] **Order Status Breakdown** (pie chart)

📁 Files:
- `restaurant_app/src/pages/Dashboard/DashboardPage.jsx`

#### 3.2 Order Management (Port 3001) ⭐ Priority High
- [ ] **Tabs for Order Status:**
  - Pending (new orders)
  - Preparing (accepted orders)
  - Ready (ready for pickup)
  - Completed (delivered)
  - Cancelled
- [ ] **Order List:**
  - Order number, customer name, time
  - Items summary
  - Total amount
  - Actions: Accept/Reject (pending), Mark Ready (preparing)
- [ ] **Order Detail Modal:**
  - Full order info
  - Customer contact
  - Delivery address
  - Items list
  - Status timeline
- [ ] **Real-time Updates:**
  - Socket.io: Listen to `orderCreated`
  - Sound notification for new orders
  - Badge count for pending orders
- [ ] **Actions:**
  - Accept order → status: "confirmed" → auto: "preparing"
  - Reject order → status: "cancelled"
  - Mark Ready → status: "ready" → notify drone

📁 Files:
- `restaurant_app/src/pages/Order/OrderManagementPage.jsx`
- `restaurant_app/src/components/Order/OrderCard.jsx`
- `restaurant_app/src/components/Order/OrderDetailModal.jsx`

#### 3.3 Product Management (Port 3001) ⭐
- [ ] **Product List:**
  - Table with: Image, Name, Category, Price, Stock, Status
  - Actions: Edit, Delete, Toggle availability
- [ ] **Add Product Modal:**
  - Form: Name, Description, Price, Category, Stock
  - Image upload (to cloud or base64)
  - Validation
- [ ] **Edit Product Modal:**
  - Pre-filled form
  - Update product
- [ ] **Filters:** Category, Availability, Stock status

📁 Files:
- `restaurant_app/src/pages/Product/ProductManagementPage.jsx`
- `restaurant_app/src/components/Product/ProductForm.jsx`

#### 3.4 Restaurant Info (Port 3001)
- [ ] **Restaurant Profile Form:**
  - Name, Description, Phone, Email
  - Address
  - Logo upload
  - Banner image upload
  - Opening hours
  - Cuisine types (multi-select)
- [ ] Save button → Update restaurant

📁 Files:
- `restaurant_app/src/pages/Restaurant/RestaurantInfoPage.jsx`

### **Backend - Server API**

#### 3.5 Restaurant Order APIs ⭐
- [ ] `GET /api/orders/restaurant/:restaurantId` - Get restaurant orders
  - Query params: status, date, limit, page
  - Return: orders array + pagination
- [ ] `PUT /api/orders/:id/status` - Update order status
  - **Allowed transitions:**
    - pending → confirmed (by restaurant)
    - confirmed → preparing (auto after 1 min)
    - preparing → ready (by restaurant)
    - ready → delivering (by system when drone picks up)
    - delivering → delivered (by drone)
    - any → cancelled (by admin/restaurant)
  - **Emit Socket Event:** `orderUpdate` to customer
  - Validate: Only restaurant owner can update their orders

📁 Files:
- `server_app/API/Controllers/orderController.js` (add methods)

#### 3.6 Product Management APIs ⭐
- [ ] `POST /api/products` - Create product
  - Auth: Restaurant only
  - Validate: restaurant matches authenticated user
  - Upload image (if provided)
- [ ] `PUT /api/products/:id` - Update product
  - Auth: Restaurant only (owner)
  - Partial update allowed
- [ ] `DELETE /api/products/:id` - Delete product
  - Auth: Restaurant only (owner)
  - Soft delete (isDeleted = true) or hard delete
- [ ] `GET /api/products/restaurant/:restaurantId` - Get restaurant products
  - For restaurant dashboard

📁 Files:
- `server_app/API/Controllers/productController.js` (add methods)

#### 3.7 Restaurant Update API
- [ ] `PUT /api/restaurants/:id` - Update restaurant info
  - Auth: Restaurant owner only
  - Fields: name, description, openingHours, cuisine, images
  - Validate: user owns this restaurant

📁 Files:
- `server_app/API/Controllers/restaurantController.js` (add method)

#### 3.8 Socket.io - Restaurant Events ⭐
- [ ] **Setup Socket.io in server:**
  - `io.on('connection')` handler
  - Authentication middleware
- [ ] **Event: `orderCreated`**
  - Emit to restaurant room when new order
  - Payload: order object
- [ ] **Event: `orderUpdate`**
  - Emit to customer room when status changes
  - Payload: orderId, status, timestamp

📁 Files:
- `server_app/index.js` (Socket.io setup)
- `server_app/API/socket/socketHandler.js`

**Testing:**
- [ ] Test restaurant can view their orders
- [ ] Test order status transitions
- [ ] Test Socket events fire correctly
- [ ] Test product CRUD operations
- [ ] Test authorization (restaurant can only manage their own data)

---

## 🎨 FEATURE 4: UI/UX POLISH & PROFILE (Week 4)

### **Frontend - Client App**

#### 4.1 Profile Page (Port 3000)
- [ ] **User Info Section:**
  - Avatar (upload)
  - Name, Email, Phone
  - Edit button → Form
- [ ] **Saved Addresses:**
  - List of addresses
  - Add/Edit/Delete address
  - Set default address
- [ ] **Change Password Form**
- [ ] **Preferences:**
  - Notifications (email, push)
  - Language

📁 Files:
- `client_app/src/pages/Profile/ProfilePage.jsx`

#### 4.2 Order History Page (Port 3000)
- [ ] **Order List:**
  - Table/Cards: Order number, Date, Items, Total, Status
  - Filter by status
  - Search by order number
- [ ] **Order Detail:**
  - Click order → Show full details
  - Re-order button (add items to cart)
- [ ] Pagination

📁 Files:
- `client_app/src/pages/Profile/OrderHistoryPage.jsx`

#### 4.3 UI Enhancements (All Client Pages)
- [ ] **Loading States:**
  - Skeleton loaders for data fetching
  - Spinner for actions (add to cart, place order)
- [ ] **Error Handling:**
  - Toast notifications (react-toastify)
  - Error boundaries
  - Retry buttons
- [ ] **Animations:**
  - Page transitions
  - Hover effects
  - Add to cart animation
- [ ] **Mobile Responsive:**
  - Test all pages on mobile
  - Adjust layouts
  - Touch-friendly buttons

#### 4.4 Navigation & Footer
- [ ] **Header/Navbar:**
  - Logo
  - Menu links (Home, Menu, Stores, Track Order)
  - Search bar (global)
  - Cart icon with badge
  - User menu (Profile, Orders, Logout)
- [ ] **Footer:**
  - Links (About, Contact, Terms, Privacy)
  - Social media icons
  - Copyright

📁 Files:
- `client_app/src/components/Layout/MainLayout.jsx`
- `client_app/src/components/Layout/Header.jsx`
- `client_app/src/components/Layout/Footer.jsx`

### **Backend - Server API**

#### 4.5 User Profile APIs
- [ ] `GET /api/users/profile` - Get current user profile
  - Auth required
- [ ] `PUT /api/users/profile` - Update user profile
  - Fields: name, phone, avatar
  - Validate input
- [ ] `PUT /api/users/change-password` - Change password
  - Validate: old password correct
  - Hash new password
- [ ] `POST /api/users/addresses` - Add address
- [ ] `PUT /api/users/addresses/:id` - Update address
- [ ] `DELETE /api/users/addresses/:id` - Delete address

📁 Files:
- `server_app/API/Controllers/userController.js`
- `server_app/API/Routes/userRoutes.js`

#### 4.6 Order History API
- [ ] `GET /api/orders/user/:userId` - Get user order history
  - Query params: status, startDate, endDate, limit, page
  - Sort: newest first
  - Populate: restaurant, items.product

📁 Files:
- `server_app/API/Controllers/orderController.js` (already covered in Feature 2)

**Testing:**
- [ ] Test profile CRUD operations
- [ ] Test order history with filters
- [ ] Test all pages on different screen sizes
- [ ] Cross-browser testing (Chrome, Firefox, Edge)

---

## 🔴 MEMBER 2 - NHIỆM VỤ THEO LUỒNG CHỨC NĂNG

**Trách nhiệm:** Order Tracking & Delivery Flow + Admin Management Flow

---

## 🚁 FEATURE 5: ORDER TRACKING & REAL-TIME DELIVERY (Week 1-2)

### **Frontend - Client App**

#### 5.1 OrderTrackingPage (Port 3000) ⭐ Priority Critical
- [ ] **Order Info Card:**
  - Order number
  - Restaurant name & address
  - Delivery address
  - Items summary
  - Total amount
  - Payment status
- [ ] **Status Timeline:**
  - Pending → Confirmed → Preparing → Ready → Delivering → Delivered
  - Visual progress bar
  - Timestamp for each status
  - Current status highlighted
- [ ] **Leaflet Map:**
  - Restaurant location (marker)
  - Customer location (marker)
  - Drone location (animated marker) - **REAL-TIME**
  - Route polyline (restaurant → customer)
  - Auto-center map on drone
- [ ] **Drone Info Card:**
  - Drone name & model
  - Current battery level (progress bar)
  - ETA (Estimated Time of Arrival)
  - Distance remaining
- [ ] **Real-time Updates via Socket.io:**
  - Listen to `orderUpdate` event → Update status
  - Listen to `droneLocationUpdate` event → Update map marker
  - Update ETA dynamically
- [ ] **Actions:**
  - Cancel order button (if status = pending/confirmed)
  - Contact restaurant button
  - Report issue button
- [ ] **Polling Fallback:** If socket disconnects, poll API every 5s

📁 Files:
- `client_app/src/pages/OrderTracking/OrderTrackingPage.jsx`
- `client_app/src/pages/OrderTracking/OrderTrackingPage.css`
- `client_app/src/components/Map/DroneMap.jsx`

### **Backend - Server API**

#### 5.2 Order Tracking API ⭐
- [ ] `GET /api/orders/:id` - Get order details
  - **Return:**
    - Full order info
    - Restaurant details
    - Customer details
    - Items with product info
    - Drone info (if assigned):
      - name, model, currentLocation, batteryLevel
    - Status history with timestamps
    - ETA calculation
  - Auth: Customer (owner) or Restaurant (owner) or Admin

📁 Files:
- `server_app/API/Controllers/orderController.js` (add method)

#### 5.3 Drone Simulation Service ⭐ Priority Critical
**Mô phỏng drone di chuyển thực tế**

- [ ] **Service: `startDroneSimulation(orderId, droneId)`**
  - Get order & drone from DB
  - Calculate route:
    - Phase 1: Drone home → Restaurant
    - Phase 2: Restaurant → Customer
  - **Loop (every 2-3 seconds):**
    - Move drone slightly along route
    - Update drone.currentLocation in DB
    - Decrease battery (0.5% per update)
    - Calculate distance remaining
    - Calculate ETA
    - **Emit Socket Event:** `droneLocationUpdate` with:
      - droneId, orderId, location, batteryLevel, ETA
  - **When reached restaurant:**
    - Wait 30 seconds (restaurant prepares order)
    - Update order status: "ready" → "delivering"
    - Emit `orderUpdate` event
  - **When reached customer:**
    - Update order status: "delivered"
    - Update drone status: "available"
    - Update drone: totalFlights++, totalDistance += distance
    - Emit `orderUpdate` event
    - Stop simulation
  - **Handle errors:**
    - Low battery (< 20%) → Return to home, reassign another drone
    - Order cancelled → Stop simulation, drone back to home

📁 Files:
- `server_app/API/Services/droneSimulation.js`

#### 5.4 Socket.io Implementation ⭐ Priority Critical
- [ ] **Setup Socket.io Server:**
  - Install `socket.io`
  - Initialize in `index.js`
  - Authentication middleware (verify JWT from handshake)
- [ ] **Rooms:**
  - `customer-{userId}` - Customer rooms
  - `restaurant-{restaurantId}` - Restaurant rooms
  - `admin` - Admin room
  - `drone-{droneId}` - Drone operator rooms
- [ ] **Events to Emit:**
  - `orderCreated` → Restaurant room (new order notification)
  - `orderUpdate` → Customer room (status changed)
  - `droneLocationUpdate` → Customer room (real-time location)
  - `droneStatusUpdate` → Admin room (drone status changed)
- [ ] **Events to Listen:**
  - `joinRoom` → Join user to appropriate room
  - `leaveRoom` → Leave room
  - `ping` → Keep connection alive

📁 Files:
- `server_app/index.js` (Socket.io setup)
- `server_app/API/socket/socketHandler.js`
- `server_app/API/socket/middleware/auth.js`

#### 5.5 Background Jobs ⭐
- [ ] **Job: Start simulation when order status = "ready"**
  - Listen to order status changes
  - Trigger `startDroneSimulation(orderId, droneId)`
- [ ] **Job: Return drones to home**
  - After delivery, move drone back to homeLocation (simulation)
- [ ] **Scheduler:** Use `node-cron` or `bull` for job queue

📁 Files:
- `server_app/API/jobs/droneJobs.js`

**Testing:**
- [ ] Test Socket connection & authentication
- [ ] Test drone simulation (full journey)
- [ ] Test order status updates via Socket
- [ ] Test multiple concurrent deliveries
- [ ] Test low battery scenario
- [ ] Test order cancellation during delivery

---

## 🎛️ FEATURE 6: ADMIN DASHBOARD & MANAGEMENT (Week 2-3)

### **Frontend - Admin App**

#### 6.1 Admin Dashboard (Port 3002) ⭐
- [ ] **Stats Cards (Top Row):**
  - Total Users (badge: new today)
  - Total Orders (badge: active now)
  - Total Revenue (badge: today's revenue)
  - Active Drones (badge: charging)
- [ ] **Revenue Chart:**
  - Line chart: Last 30 days
  - Toggle: Day / Week / Month view
- [ ] **Orders Chart:**
  - Bar chart: Orders by status
- [ ] **Recent Activities:**
  - Timeline of recent events (orders, registrations, etc.)
- [ ] **System Status:**
  - Server uptime
  - Database status
  - Socket.io status
- [ ] **Real-time Updates:**
  - Auto-refresh stats every 30s
  - Socket updates for new orders/users

📁 Files:
- `admin_app/src/pages/Dashboard/DashboardPage.jsx`

#### 6.2 User Management (Port 3002)
- [ ] **Users Table:**
  - Columns: Avatar, Name, Email, Role, Status, Registered, Actions
  - Filter: Role (Customer, Restaurant, Drone Operator, Admin)
  - Search: Name or Email
  - Pagination
- [ ] **Actions:**
  - View Details (modal)
  - Edit User (modal)
  - Block/Unblock User
  - Delete User (with confirmation)
- [ ] **Create User:**
  - Modal form
  - Fields: Name, Email, Password, Role, Phone
  - Validation

📁 Files:
- `admin_app/src/pages/User/UserManagementPage.jsx`
- `admin_app/src/components/User/UserTable.jsx`
- `admin_app/src/components/User/UserFormModal.jsx`

#### 6.3 Restaurant Management (Port 3002)
- [ ] **Restaurants Table:**
  - Columns: Logo, Name, Cuisine, Rating, Orders, Status, Actions
  - Filter: Status (Active/Inactive), Cuisine
  - Search: Name
- [ ] **Actions:**
  - View Details → Restaurant profile + stats
  - Approve/Reject (for pending restaurants)
  - Activate/Deactivate
  - View Orders
  - View Products
- [ ] **Restaurant Detail Page:**
  - Full info
  - Stats: Total orders, Revenue, Average rating
  - Products list
  - Recent orders

📁 Files:
- `admin_app/src/pages/Restaurant/RestaurantManagementPage.jsx`
- `admin_app/src/pages/Restaurant/RestaurantDetailPage.jsx`

#### 6.4 Order Management (Port 3002)
- [ ] **Orders Table:**
  - Columns: Order #, Customer, Restaurant, Items, Total, Status, Date, Actions
  - Filter: Status, Date range, Restaurant
  - Search: Order number or Customer name
  - Pagination
- [ ] **Actions:**
  - View Details (modal) → Full order info + tracking
  - Track Order → Open map view
  - Cancel Order (with reason)
  - Refund Order
- [ ] **Order Analytics:**
  - Charts: Orders by status, by time, by restaurant
  - Export to CSV

📁 Files:
- `admin_app/src/pages/Order/OrderManagementPage.jsx`
- `admin_app/src/components/Order/OrderTable.jsx`
- `admin_app/src/components/Order/OrderDetailModal.jsx`

#### 6.5 Drone Management (Port 3002) 🚁 Priority High
- [ ] **Drones List:**
  - Cards or Table view
  - Info: Name, Model, Status, Battery, Current Order, Location
  - Color-coded by status:
    - Available (green)
    - Busy (blue)
    - Charging (yellow)
    - Maintenance (orange)
    - Offline (red)
- [ ] **Real-time Map View:**
  - Leaflet map showing all drones
  - Markers colored by status
  - Click marker → Drone info popup
  - Show current route (if delivering)
  - Auto-refresh locations (Socket.io)
- [ ] **Drone Detail Modal:**
  - Full specs
  - Flight history
  - Performance stats: Total flights, Total distance, Avg delivery time
  - Maintenance log
  - Current status & battery
- [ ] **Actions:**
  - Add New Drone (form modal)
  - Edit Drone (form modal)
  - Set Maintenance (status → maintenance)
  - Retire Drone (soft delete)
  - View Flight History
  - Manual Location Update (for testing)
- [ ] **Drone Analytics:**
  - Chart: Flights per drone
  - Chart: Battery usage
  - Table: Performance comparison

📁 Files:
- `admin_app/src/pages/Drone/DroneManagementPage.jsx`
- `admin_app/src/components/Drone/DroneCard.jsx`
- `admin_app/src/components/Drone/DroneMap.jsx`
- `admin_app/src/components/Drone/DroneFormModal.jsx`
- `admin_app/src/components/Drone/DroneDetailModal.jsx`

### **Backend - Server API**

#### 6.6 Admin Statistics APIs ⭐
- [ ] `GET /api/admin/stats/overview` - Dashboard stats
  - **Return:**
    - totalUsers, newUsersToday
    - totalOrders, activeOrders, todayOrders
    - totalRevenue, todayRevenue
    - totalDrones, activeDrones, chargingDrones
    - averageDeliveryTime
    - orderStatusBreakdown: { pending: X, confirmed: Y, ... }
  - Auth: Admin only

- [ ] `GET /api/admin/stats/revenue?period=day|week|month` - Revenue analytics
  - Return: Array of { date, revenue, orders }
  - Group by day/week/month

- [ ] `GET /api/admin/stats/orders` - Order analytics
  - Orders by status (pie chart data)
  - Orders by restaurant (bar chart data)
  - Peak hours (line chart data)

📁 Files:
- `server_app/API/Controllers/adminController.js`
- `server_app/API/Routes/adminRoutes.js`

#### 6.7 User Management APIs (Admin)
- [ ] `GET /api/admin/users?role=...&status=...&page=...` - Get all users
  - Query params: role, status, search, limit, page
  - Return: users array + pagination
  - Auth: Admin only

- [ ] `POST /api/admin/users` - Create user
  - Fields: name, email, password, role, phone
  - Auth: Admin only

- [ ] `PUT /api/admin/users/:id` - Update user
  - Fields: name, email, role, status
  - Auth: Admin only

- [ ] `DELETE /api/admin/users/:id` - Delete user
  - Soft delete (isDeleted = true)
  - Auth: Admin only

- [ ] `PUT /api/admin/users/:id/block` - Block user
- [ ] `PUT /api/admin/users/:id/unblock` - Unblock user

📁 Files:
- `server_app/API/Controllers/userController.js` (admin methods)

#### 6.8 Restaurant Management APIs (Admin)
- [ ] `GET /api/admin/restaurants?status=...` - Get all restaurants
- [ ] `PUT /api/admin/restaurants/:id/approve` - Approve restaurant
- [ ] `PUT /api/admin/restaurants/:id/reject` - Reject restaurant
- [ ] `PUT /api/admin/restaurants/:id/activate` - Activate
- [ ] `PUT /api/admin/restaurants/:id/deactivate` - Deactivate
- [ ] `GET /api/admin/restaurants/:id/stats` - Restaurant statistics
  - Total orders, Revenue, Rating, Popular products

📁 Files:
- `server_app/API/Controllers/restaurantController.js` (admin methods)

#### 6.9 Drone Management APIs (Admin) 🚁
- [ ] `GET /api/admin/drones?status=...` - Get all drones
  - Query params: status, limit
  - Include: currentOrder info, currentLocation
  - Auth: Admin only

- [ ] `POST /api/admin/drones` - Create drone
  - Fields: name, serialNumber, model, homeLocation, maxRange, maxWeight, speed
  - Validation: serialNumber unique
  - Auth: Admin only

- [ ] `PUT /api/admin/drones/:id` - Update drone
  - Fields: name, model, status, batteryLevel, homeLocation, specs
  - Auth: Admin only

- [ ] `DELETE /api/admin/drones/:id` - Delete drone
  - Check: Not assigned to active order
  - Soft delete
  - Auth: Admin only

- [ ] `GET /api/admin/drones/:id/history` - Flight history
  - Return: Array of completed orders with this drone
  - Include: date, distance, duration, order info

- [ ] `PUT /api/admin/drones/:id/maintenance` - Set maintenance
  - status → maintenance
  - Release from current order (if any)

- [ ] `GET /api/admin/drones/analytics` - Drone analytics
  - Flights per drone
  - Battery usage stats
  - Performance comparison

📁 Files:
- `server_app/API/Controllers/droneController.js`
- `server_app/API/Routes/droneRoutes.js`

#### 6.10 Order Management APIs (Admin)
- [ ] `GET /api/admin/orders?status=...&date=...` - Get all orders
  - Full access to all orders
  - Advanced filters
  - Auth: Admin only

- [ ] `PUT /api/admin/orders/:id/cancel` - Cancel order
  - Reason required
  - Refund (if paid)
  - Release drone
  - Restore stock
  - Auth: Admin only

- [ ] `POST /api/admin/orders/:id/refund` - Refund order
  - Mark as refunded
  - Create refund record

📁 Files:
- `server_app/API/Controllers/orderController.js` (admin methods)

**Testing:**
- [ ] Test all admin APIs with admin token
- [ ] Test authorization (non-admin cannot access)
- [ ] Test drone CRUD operations
- [ ] Test user & restaurant management
- [ ] Test statistics calculations
- [ ] Test real-time drone map updates

---

## 🎮 FEATURE 7: DRONE OPERATOR APP (Week 3-4)

### **Frontend - Drone App**

#### 7.1 Drone Dashboard (Port 3003) 🚁
- [ ] **Current Drone Status Card:**
  - Drone name, model, serial number
  - Battery level (progress bar with color)
  - Status badge
  - Current location (coordinates)
  - Last updated timestamp
- [ ] **Active Mission Card:**
  - Order number
  - Restaurant name & address
  - Customer address
  - Items summary
  - Pickup time / Delivery time
  - Distance remaining
  - ETA
  - Current phase (Going to restaurant / Delivering to customer)
- [ ] **Map View:**
  - Leaflet map
  - Restaurant marker
  - Customer marker
  - Drone current location marker
  - Route polyline
  - Auto-center on drone
- [ ] **Real-time Updates:**
  - Socket.io: Listen to drone location updates
  - Auto-refresh every 2-3 seconds
- [ ] **Quick Stats:**
  - Today's deliveries
  - Total distance today
  - Average delivery time
  - Battery usage

📁 Files:
- `drone_app/src/pages/Dashboard/DroneDashboardPage.jsx`

#### 7.2 Mission Management (Port 3003) 🚁
- [ ] **Mission List:**
  - Assigned missions (orders)
  - Columns: Order #, Restaurant, Customer, Distance, Status, Actions
  - Filter: Status (Pending, In Progress, Completed)
- [ ] **Mission Actions:**
  - Accept Mission (if status = assigned)
  - Start Delivery (manual trigger simulation)
  - Complete Mission (mark delivered)
  - Report Issue (form)
- [ ] **Mission Detail:**
  - Full order info
  - Route map
  - Status timeline
  - Customer contact (call button)

📁 Files:
- `drone_app/src/pages/Mission/MissionPage.jsx`
- `drone_app/src/components/Mission/MissionCard.jsx`

#### 7.3 Drone Simulation Control (Port 3003) 🚁 Testing
- [ ] **Manual Control Panel:**
  - Speed slider (km/h)
  - Direction buttons (N, S, E, W)
  - Start/Stop simulation button
  - Reset to home button
- [ ] **Battery Simulation:**
  - Battery drain rate slider
  - Charge button (instant 100%)
- [ ] **Status Controls:**
  - Set Available
  - Set Maintenance
  - Set Charging
  - Set Offline
- [ ] **Location Override:**
  - Input lat/lng
  - Update button
  - Or click on map

📁 Files:
- `drone_app/src/pages/Simulation/SimulationPage.jsx`

#### 7.4 Flight History (Port 3003)
- [ ] **History List:**
  - Table: Date, Order #, Route, Distance, Duration, Battery Used
  - Pagination
- [ ] **Statistics:**
  - Total flights
  - Total distance
  - Average duration
  - Chart: Flights over time

📁 Files:
- `drone_app/src/pages/History/FlightHistoryPage.jsx`

### **Backend - Server API**

#### 7.5 Drone Operator APIs 🚁
- [ ] `GET /api/drone/missions` - Get assigned missions
  - Return: Orders where drone = current drone
  - Filter: status
  - Auth: Drone operator only

- [ ] `PUT /api/drone/missions/:id/accept` - Accept mission
  - Update order: drone confirmed
  - Auth: Drone operator

- [ ] `PUT /api/drone/missions/:id/complete` - Complete mission
  - Update order status: delivered
  - Update drone status: available
  - Auth: Drone operator

- [ ] `GET /api/drone/status` - Get current drone status
  - Return: Drone object with current location, battery, etc.
  - Auth: Drone operator

- [ ] `PUT /api/drone/location` - Update drone location (manual)
  - For testing/simulation control
  - Update drone.currentLocation
  - Emit Socket event
  - Auth: Drone operator

- [ ] `PUT /api/drone/status` - Update drone status
  - Change status (available, charging, maintenance)
  - Auth: Drone operator

- [ ] `GET /api/drone/history` - Get flight history
  - Return: Completed orders
  - Auth: Drone operator

📁 Files:
- `server_app/API/Controllers/droneController.js` (operator methods)

**Testing:**
- [ ] Test drone operator authentication
- [ ] Test mission assignment
- [ ] Test manual location updates
- [ ] Test simulation controls
- [ ] Test Socket events from drone app

---

## 📊 TIMELINE TỔNG THỂ (4 WEEKS)

### **Week 1:**
- 🔵 **Member 1**: Feature 1 (Product Browsing) - Frontend + Backend
  - Client pages: HomePage, MenuPage, StorePage, ProductDetailPage
  - APIs: Products, Categories, Restaurants (READ)
  
- 🔴 **Member 2**: Feature 5 Part 1 (Order Tracking) - Setup
  - OrderTrackingPage UI
  - Socket.io setup (both server & client)
  - Drone simulation service (basic structure)

### **Week 2:**
- 🔵 **Member 1**: Feature 2 (Cart & Checkout) - Frontend + Backend
  - CartPage, CheckoutPage
  - Order creation API
  - Drone assignment logic
  
- 🔴 **Member 2**: Feature 5 Part 2 (Delivery Simulation) - Complete
  - Complete drone simulation service
  - Real-time tracking with Socket.io
  - Testing full delivery flow

### **Week 3:**
- 🔵 **Member 1**: Feature 3 (Restaurant Management) - Frontend + Backend
  - Restaurant App: Dashboard, Orders, Products, Info
  - Restaurant APIs: Orders, Products, Update
  - Socket.io: Restaurant events
  
- 🔴 **Member 2**: Feature 6 (Admin Dashboard) - Frontend + Backend
  - Admin App: Dashboard, Users, Restaurants, Orders, Drones
  - Admin APIs: Statistics, User/Restaurant/Drone management

### **Week 4:**
- 🔵 **Member 1**: Feature 4 (Profile & Polish) - Frontend + Backend
  - ProfilePage, OrderHistoryPage
  - User profile APIs
  - UI/UX improvements, animations, responsive
  
- 🔴 **Member 2**: Feature 7 (Drone App) - Frontend + Backend
  - Drone App: Dashboard, Missions, Simulation, History
  - Drone operator APIs
  - Testing & bug fixes

---

## 🔄 LUỒNG CODE & WORKFLOW

### **Git Workflow:**

```bash
# Member 1 - Branch structure
main
├── feature/client-product-browsing
├── feature/client-cart-checkout
├── feature/api-products
├── feature/api-orders
├── feature/restaurant-management
└── feature/client-profile

# Member 2 - Branch structure
main
├── feature/order-tracking-ui
├── feature/socket-io-setup
├── feature/drone-simulation
├── feature/admin-dashboard
├── feature/admin-drone-management
└── feature/drone-app
```

### **Daily Workflow:**

**Sáng (9:00 AM):**
- [ ] Standup 15 phút: Báo cáo tiến độ, kế hoạch, blockers
- [ ] Sync code từ main: `git checkout main && git pull && git checkout feature/...`
- [ ] Review PRs của nhau (nếu có)

**Trong ngày:**
- [ ] Code feature của mình
- [ ] Commit thường xuyên (mỗi 1-2 giờ)
- [ ] Test trên local
- [ ] Push lên branch

**Chiều (5:00 PM):**
- [ ] Commit & push tất cả code
- [ ] Tạo PR nếu feature hoàn thành
- [ ] Review code của người còn lại
- [ ] Update task status

### **Tránh Conflict:**

✅ **Member 1 chủ yếu code trong:**
- `client_app/` (HomePage, MenuPage, CartPage, CheckoutPage, ProfilePage)
- `restaurant_app/` (All pages)
- `server_app/API/Controllers/productController.js`
- `server_app/API/Controllers/restaurantController.js`
- `server_app/API/Controllers/orderController.js` (order creation only)

✅ **Member 2 chủ yếu code trong:**
- `client_app/src/pages/OrderTracking/` (OrderTrackingPage only)
- `admin_app/` (All pages)
- `drone_app/` (All pages)
- `server_app/API/Services/droneSimulation.js`
- `server_app/API/socket/`
- `server_app/API/Controllers/droneController.js`
- `server_app/API/Controllers/adminController.js`

⚠️ **Files dùng chung (sync trước khi sửa):**
- `.env`
- `package.json` (root & apps)
- `server_app/index.js` (Socket.io setup - Member 2 owns)
- `server_app/API/Controllers/orderController.js` (Member 1: create, Member 2: tracking)

### **Communication Protocol:**

**Khi sửa shared files:**
1. Thông báo trong group chat: "Mình sẽ sửa file X, check xem bạn có đang sửa không?"
2. Đợi confirm
3. Sửa file
4. Commit & push ngay
5. Thông báo: "Done, bạn pull về nhé"

**Khi cần data từ API của người khác:**
1. Check API documentation
2. Nếu chưa có, request: "Mình cần API X với format Y, bạn làm được không?"
3. Mock data tạm trong frontend
4. Integrate thật khi API ready

---

## 🎯 PRIORITIES (Làm theo thứ tự)

### **CRITICAL (Phải có - Week 1-2):**
1. ✅ Auth system (Login/Register) - Already done
2. 🔵 Product browsing (HomePage, MenuPage, ProductDetailPage) - Member 1
3. 🔵 Cart & Checkout - Member 1
4. 🔵 Order creation API - Member 1
5. 🔴 Order tracking UI - Member 2
6. 🔴 Socket.io setup - Member 2
7. 🔴 Drone simulation - Member 2

### **HIGH (Nên có - Week 2-3):**
8. 🔵 Restaurant order management - Member 1
9. 🔴 Admin drone management - Member 2
10. 🔴 Admin dashboard - Member 2
11. 🔵 Restaurant product management - Member 1

### **MEDIUM (Tốt nếu có - Week 3-4):**
12. 🔵 User profile & order history - Member 1
13. 🔴 Drone operator app - Member 2
14. 🔵🔴 UI/UX polish - Both
15. 🔴 Admin statistics - Member 2

### **LOW (Optional - If time permits):**
16. Payment integration (mock is OK)
17. Reviews & ratings
18. Notifications (email/push)
19. Advanced analytics
20. Loyalty program

---

## 📝 CHECKLIST TRƯỚC KHI BẮT ĐẦU

### Member 1:
- [ ] Đọc API Documentation (biết format request/response)
- [ ] Setup Leaflet maps cho CheckoutPage
- [ ] Understand Redux store structure (cart, auth, etc.)
- [ ] Install dev tools: React DevTools, Redux DevTools
- [ ] Prepare mock data for testing
- [ ] Test existing APIs với Postman

### Member 2:
- [ ] Đọc Socket.io documentation
- [ ] Understand MongoDB geospatial queries
- [ ] Setup Socket.io testing tool (socket.io-client-tool)
- [ ] Design drone simulation algorithm
- [ ] Plan database indexes
- [ ] Setup admin authentication

---

## 📞 COMMUNICATION

### **Daily Standup (15 phút - 9:00 AM):**
**Template:**
- ✅ Hôm qua làm được gì?
- 🎯 Hôm nay sẽ làm gì?
- ⚠️ Có vấn đề gì cần hỗ trợ?
- 🔄 Có conflicts/dependencies với người còn lại không?

### **Tools:**
- **Git**: Source control
- **Discord/Slack/Zalo**: Quick communication
- **Trello/Notion**: Task tracking
- **Postman**: API testing & sharing
- **Loom**: Screen recording for bug reports

### **Code Review Guidelines:**
- Review trong 2 giờ sau khi PR được tạo
- Comment constructive, friendly
- Approve nếu OK, Request changes nếu có issues
- Test code trước khi approve

---

## 🐛 TESTING CHECKLIST

### Member 1 Test:
- [ ] **Product browsing:**
  - Products load correctly
  - Filters work (category, price, rating)
  - Search works
  - Pagination works
- [ ] **Cart:**
  - Add to cart works
  - Quantity controls work
  - Remove from cart works
  - Total calculated correctly
  - Cart persists (localStorage)
- [ ] **Checkout:**
  - Address form validation
  - Map location picker works
  - Order creation succeeds
  - Redirect to tracking after success
  - Error handling (out of stock, etc.)
- [ ] **Restaurant App:**
  - Order notifications work (Socket.io)
  - Order status updates work
  - Product CRUD operations work

### Member 2 Test:
- [ ] **Order tracking:**
  - Order details load correctly
  - Map displays correctly
  - Drone marker updates in real-time (Socket.io)
  - Status timeline updates
  - ETA calculation correct
- [ ] **Drone simulation:**
  - Drone moves along route
  - Battery decreases
  - Order status updates automatically
  - Socket events fire correctly
  - Multiple drones work concurrently
- [ ] **Admin App:**
  - Statistics display correctly
  - User/Restaurant/Drone CRUD works
  - Authorization works (admin only)
  - Real-time updates work
- [ ] **Socket.io:**
  - Connection established
  - Events received in correct rooms
  - Reconnection works after disconnect
  - Authentication works

### Both Test Together:
- [ ] **End-to-end flow:**
  1. Customer browses products
  2. Adds to cart
  3. Checks out
  4. Order created, drone assigned
  5. Restaurant receives notification
  6. Restaurant accepts & prepares
  7. Drone simulation starts
  8. Customer tracks in real-time
  9. Order delivered
  10. All statuses updated correctly
- [ ] **Cross-browser:** Chrome, Firefox, Edge
- [ ] **Responsive:** Mobile, Tablet, Desktop
- [ ] **Performance:** Page load < 3s, API response < 500ms

---

## 🎉 SUCCESS CRITERIA

Dự án hoàn thành khi:
- ✅ Khách hàng có thể đặt hàng thành công
- ✅ Nhà hàng nhận được thông báo real-time và quản lý được đơn hàng
- ✅ Drone được assign tự động khi đơn hàng ready
- ✅ Real-time tracking hoạt động mượt mà với Socket.io
- ✅ Drone simulation mô phỏng di chuyển thực tế
- ✅ Admin quản lý được toàn bộ hệ thống (users, restaurants, drones, orders)
- ✅ Drone operator app hiển thị missions và status
- ✅ Không có major bugs
- ✅ Code clean, có comments cho logic phức tạp
- ✅ Git history rõ ràng với meaningful commits
- ✅ APIs có error handling đầy đủ
- ✅ UI responsive trên mobile/tablet/desktop

---

## 💡 PRO TIPS

### Cho Member 1 (Customer Journey):
1. **Mock data first:** Tạo mock data trong frontend để code UI trước, integrate API sau
2. **Redux early:** Setup Redux store sớm cho cart, auth
3. **Component reuse:** Tạo reusable components (ProductCard, Button, Input)
4. **Loading states:** Luôn có loading state cho mọi async operation
5. **Form validation:** Use Ant Design Form validation hoặc Formik
6. **Responsive first:** Code mobile-first, scale up to desktop

### Cho Member 2 (Tracking & Admin):
1. **Socket.io testing:** Test Socket riêng trước khi integrate vào app
2. **Drone algorithm:** Vẽ diagram trước khi code simulation
3. **Error handling:** Try-catch cho tất cả async operations
4. **Database indexes:** Index các fields thường query (status, location, etc.)
5. **Background jobs:** Use proper job queue (bull) cho production
6. **Admin security:** Double-check authorization cho tất cả admin APIs
7. **Performance:** Pagination cho tất cả list APIs

### Cho cả 2:
1. **Communication > Code:** Thông báo sớm khi có blockers
2. **Test early:** Đừng đợi đến cuối mới test
3. **Git commits:** Commit nhỏ, thường xuyên, meaningful messages
4. **Code review:** Review nghiêm túc, học từ code của nhau
5. **Ask questions:** Không hiểu thì hỏi, đừng tự suy đoán
6. **Document:** Comment cho code phức tạp, update README
7. **Celebrate wins:** Mỗi feature xong thì celebrate 🎉

---

**Remember:** 
- 🔵 Member 1 = Customer Experience Expert
- 🔴 Member 2 = Delivery & Admin Expert
- 💪 Together = Full-stack Dream Team!

**Good luck! Liên hệ nhau thường xuyên, sync code mỗi ngày!** 🚀


##### 1. **Trang Chủ (HomePage)** ✅ (Đã có cấu trúc)
- [ ] Hoàn thiện Hero Banner với carousel
- [ ] Hiển thị danh sách món ăn phổ biến
- [ ] Hiển thị danh sách nhà hàng nổi bật
- [ ] Tích hợp real-time tracking preview
- [ ] Responsive design cho mobile

📁 Files: `client_app/src/pages/Home/HomePage.jsx`, `HomePage.css`

##### 2. **Trang Menu (MenuPage)** ⭐ Priority High
- [ ] Filter sản phẩm theo category
- [ ] Search sản phẩm theo tên
- [ ] Sort sản phẩm (giá, rating, popularity)
- [ ] Pagination hoặc infinite scroll
- [ ] Add to cart animation
- [ ] Xử lý empty state khi không có sản phẩm

📁 Files: `client_app/src/pages/Menu/MenuPage.jsx`
📁 Components: `client_app/src/components/Product/ProductFilter.jsx`

##### 3. **Chi Tiết Sản Phẩm (ProductDetailPage)** ⭐ Priority High
- [ ] Hiển thị đầy đủ thông tin sản phẩm
- [ ] Image zoom/gallery
- [ ] Chọn số lượng sản phẩm
- [ ] Add to cart với validation
- [ ] Hiển thị thông tin nhà hàng
- [ ] Sản phẩm tương tự
- [ ] Reviews & ratings section

📁 Files: `client_app/src/pages/Product/ProductDetailPage.jsx`

##### 4. **Giỏ Hàng (CartPage)** ⭐ Priority High
- [ ] Hiển thị danh sách sản phẩm trong giỏ
- [ ] Tăng/giảm số lượng sản phẩm
- [ ] Xóa sản phẩm khỏi giỏ
- [ ] Tính tổng tiền (subtotal + shipping + discount)
- [ ] Apply mã giảm giá
- [ ] Empty cart state
- [ ] Redirect to checkout button

📁 Files: `client_app/src/pages/Cart/CartPage.jsx`
📁 Redux: `client_app/src/redux/slices/cartSlice.js`

##### 5. **Thanh Toán (CheckoutPage)** ⭐ Priority High
- [ ] Form nhập địa chỉ giao hàng (với validation)
- [ ] Tích hợp Leaflet map để chọn địa chỉ
- [ ] Hiển thị khoảng cách & thời gian giao hàng dự kiến
- [ ] Chọn phương thức thanh toán
- [ ] Tổng kết đơn hàng
- [ ] Xử lý đặt hàng (POST /api/orders)
- [ ] Redirect to tracking page sau khi đặt hàng thành công

📁 Files: `client_app/src/pages/Checkout/CheckoutPage.jsx`
📁 API: `client_app/src/api/orderAPI.js`

#### **Sprint 2: Advanced Features (Week 3)**

##### 6. **Theo Dõi Đơn Hàng (OrderTrackingPage)** 🚁 Priority Critical
- [ ] Hiển thị thông tin đơn hàng
- [ ] Leaflet map với real-time drone location
- [ ] Socket.io: Lắng nghe event `orderUpdate`, `droneLocationUpdate`
- [ ] Timeline hiển thị trạng thái đơn hàng
- [ ] ETA (Estimated Time Arrival)
- [ ] Thông tin drone (tên, model, battery)
- [ ] Animation cho drone icon trên map

📁 Files: `client_app/src/pages/OrderTracking/OrderTrackingPage.jsx`
📁 Socket: Tích hợp Socket.io client

##### 7. **Trang Nhà Hàng (StorePage)**
- [ ] Danh sách tất cả nhà hàng
- [ ] Search nhà hàng theo tên
- [ ] Filter theo cuisine type
- [ ] Card hiển thị: image, name, rating, delivery time
- [ ] Click vào card để xem menu nhà hàng

📁 Files: `client_app/src/pages/Store/StorePage.jsx`

##### 8. **Profile & Order History**
- [ ] **ProfilePage**: Hiển thị & chỉnh sửa thông tin user
- [ ] **OrderHistoryPage**: Danh sách đơn hàng đã đặt
- [ ] Filter đơn hàng theo trạng thái
- [ ] Xem chi tiết đơn hàng cũ
- [ ] Re-order feature

📁 Files: `client_app/src/pages/Profile/ProfilePage.jsx`, `OrderHistoryPage.jsx`

#### **Sprint 3: Polish & Optimization (Week 4)**

##### 9. **Components & UX Improvements**
- [ ] Loading states cho tất cả pages
- [ ] Error boundaries
- [ ] Toast notifications (react-toastify)
- [ ] Skeleton loaders
- [ ] Animation transitions
- [ ] Mobile responsive hoàn chỉnh

📁 Components: `client_app/src/components/`

##### 10. **Testing & Bug Fixes**
- [ ] Test toàn bộ user flow: Browse → Add to Cart → Checkout → Track
- [ ] Fix UI bugs
- [ ] Performance optimization
- [ ] Cross-browser testing

---

### **B. RESTAURANT APP (Port 3001)** - 30% công việc

#### **Sprint 1: Restaurant Dashboard (Week 2-3)**

##### 1. **Dashboard Tổng Quan** ⭐
- [ ] Statistics: Tổng đơn hàng, doanh thu, sản phẩm bán chạy
- [ ] Charts: Doanh thu theo ngày/tuần/tháng
- [ ] Đơn hàng đang xử lý (real-time)

📁 Files: `restaurant_app/src/pages/Dashboard/DashboardPage.jsx`

##### 2. **Quản Lý Đơn Hàng** ⭐ Priority High
- [ ] Danh sách đơn hàng theo trạng thái (pending, preparing, ready, delivered)
- [ ] Accept/Reject order
- [ ] Cập nhật trạng thái đơn hàng (preparing → ready)
- [ ] Socket.io: Nhận đơn hàng mới real-time
- [ ] Sound notification khi có đơn mới

📁 Files: `restaurant_app/src/pages/Order/OrderManagementPage.jsx`
📁 API: `restaurant_app/src/api/orderAPI.js`

##### 3. **Quản Lý Sản Phẩm** ⭐
- [ ] Danh sách sản phẩm của nhà hàng
- [ ] Thêm/Sửa/Xóa sản phẩm
- [ ] Upload ảnh sản phẩm
- [ ] Cập nhật stock, giá, status (available/out of stock)
- [ ] Category management

📁 Files: `restaurant_app/src/pages/Product/ProductManagementPage.jsx`

##### 4. **Thông Tin Nhà Hàng**
- [ ] Chỉnh sửa thông tin nhà hàng
- [ ] Upload logo/banner
- [ ] Cập nhật giờ mở cửa
- [ ] Địa chỉ & contact info

📁 Files: `restaurant_app/src/pages/Restaurant/RestaurantInfoPage.jsx`

---

## 🔴 MEMBER 2 - NHIỆM VỤ CHI TIẾT

### **A. SERVER API (Port 5000)** - 50% công việc

#### **Sprint 1: API Endpoints (Week 1-2)**

##### 1. **Product APIs** ⭐ Priority High
- [ ] `GET /api/products` - Lấy danh sách sản phẩm (với filter, sort, pagination)
- [ ] `GET /api/products/:id` - Chi tiết sản phẩm
- [ ] `GET /api/products/popular` - Sản phẩm phổ biến
- [ ] `GET /api/products/search?q=...` - Search sản phẩm
- [ ] `POST /api/products` - Tạo sản phẩm mới (Restaurant only)
- [ ] `PUT /api/products/:id` - Cập nhật sản phẩm (Restaurant only)
- [ ] `DELETE /api/products/:id` - Xóa sản phẩm (Restaurant only)

📁 Files: `server_app/API/Controllers/productController.js`
📁 Routes: `server_app/API/Routes/productRoutes.js`

##### 2. **Order APIs** ⭐ Priority Critical
- [ ] `POST /api/orders` - Tạo đơn hàng mới
  - Validate stock
  - Calculate delivery fee
  - Assign drone tự động (find available drone)
  - Create order & emit socket event
- [ ] `GET /api/orders/:id` - Chi tiết đơn hàng
- [ ] `GET /api/orders/user/:userId` - Lịch sử đơn hàng của user
- [ ] `GET /api/orders/restaurant/:restaurantId` - Đơn hàng của nhà hàng
- [ ] `PUT /api/orders/:id/status` - Cập nhật trạng thái đơn hàng
  - Restaurant: pending → preparing → ready
  - System: ready → delivering → delivered
  - Emit socket event khi update

📁 Files: `server_app/API/Controllers/orderController.js`
📁 Routes: `server_app/API/Routes/orderRoutes.js`

##### 3. **Restaurant APIs**
- [ ] `GET /api/restaurants` - Danh sách nhà hàng
- [ ] `GET /api/restaurants/:id` - Chi tiết nhà hàng
- [ ] `GET /api/restaurants/:id/menu` - Menu nhà hàng
- [ ] `GET /api/restaurants/nearby?lat=...&lng=...` - Nhà hàng gần user
- [ ] `PUT /api/restaurants/:id` - Cập nhật thông tin nhà hàng

📁 Files: `server_app/API/Controllers/restaurantController.js`

##### 4. **Category APIs**
- [ ] `GET /api/categories` - Danh sách categories
- [ ] `GET /api/categories/:id/products` - Sản phẩm theo category

📁 Files: `server_app/API/Controllers/categoryController.js`

##### 5. **Payment APIs**
- [ ] `POST /api/payments/create` - Tạo payment intent
- [ ] `POST /api/payments/verify` - Verify payment
- [ ] Mock payment hoặc tích hợp VNPay/Momo

📁 Files: `server_app/API/Controllers/paymentController.js`

#### **Sprint 2: Real-time Features (Week 2-3)**

##### 6. **Socket.io Implementation** 🚁 Priority Critical
- [ ] Setup Socket.io server trong `index.js`
- [ ] **Events cần emit:**
  - `orderCreated` - Khi có đơn hàng mới → Restaurant App
  - `orderUpdate` - Khi status đổi → Client App
  - `droneLocationUpdate` - Real-time vị trí drone → Client App
  - `droneStatusUpdate` - Status drone thay đổi → Admin/Drone App
- [ ] **Events cần listen:**
  - `updateOrderStatus` - Từ Restaurant/Admin App
  - `updateDroneLocation` - Từ Drone App (simulation)
- [ ] Authentication cho socket connection

📁 Files: `server_app/index.js`, `server_app/API/socket/socketHandler.js`

##### 7. **Drone Assignment Logic** 🚁
- [ ] Thuật toán chọn drone:
  - Drone available (status = 'available')
  - Drone có battery > 30%
  - Drone gần nhà hàng nhất
  - Drone có maxWeight >= order weight
- [ ] Cập nhật drone status khi assign order
- [ ] Release drone khi hoàn thành delivery

📁 Files: `server_app/API/Services/droneService.js`

##### 8. **Drone Simulation Service** 🚁
- [ ] Service mô phỏng di chuyển drone:
  - Tính route từ restaurant → customer
  - Di chuyển drone theo route (emit location mỗi 2-3 giây)
  - Cập nhật battery level
  - Cập nhật order status tự động
- [ ] Background job chạy cho mỗi delivery đang active

📁 Files: `server_app/API/Services/droneSimulation.js`

#### **Sprint 3: Advanced Features (Week 3-4)**

##### 9. **Statistics & Reports APIs**
- [ ] `GET /api/stats/overview` - Dashboard admin
- [ ] `GET /api/stats/restaurant/:id` - Dashboard restaurant
- [ ] `GET /api/stats/revenue` - Doanh thu theo thời gian

📁 Files: `server_app/API/Controllers/statsController.js`

##### 10. **Notification System**
- [ ] Email notifications (NodeMailer)
- [ ] Push notifications (optional)
- [ ] In-app notifications

📁 Files: `server_app/API/Services/notificationService.js`

---

### **B. ADMIN APP (Port 3002)** - 30% công việc

#### **Sprint 1: Admin Dashboard (Week 2-3)**

##### 1. **Dashboard Tổng Quan** ⭐
- [ ] Statistics cards: Users, Orders, Revenue, Active Drones
- [ ] Charts: Revenue, Orders, Popular products
- [ ] Recent activities
- [ ] Real-time metrics

📁 Files: `admin_app/src/pages/Dashboard/DashboardPage.jsx`

##### 2. **Quản Lý Người Dùng**
- [ ] Danh sách users (Customer, Restaurant, Drone Operator)
- [ ] Filter by role
- [ ] View user details
- [ ] Block/Unblock user
- [ ] Create new user

📁 Files: `admin_app/src/pages/User/UserManagementPage.jsx`

##### 3. **Quản Lý Nhà Hàng**
- [ ] Approve/Reject nhà hàng mới
- [ ] Danh sách nhà hàng
- [ ] Active/Inactive restaurant
- [ ] View restaurant details & stats

📁 Files: `admin_app/src/pages/Restaurant/RestaurantManagementPage.jsx`

##### 4. **Quản Lý Đơn Hàng**
- [ ] Danh sách tất cả đơn hàng
- [ ] Filter theo status, date, restaurant
- [ ] View order details
- [ ] Cancel order (nếu cần)

📁 Files: `admin_app/src/pages/Order/OrderManagementPage.jsx`

##### 5. **Quản Lý Drone** 🚁
- [ ] Danh sách drones
- [ ] Thêm/Sửa/Xóa drone
- [ ] View drone status & location (real-time map)
- [ ] Drone maintenance schedule
- [ ] Drone performance stats

📁 Files: `admin_app/src/pages/Drone/DroneManagementPage.jsx`

---

### **C. DRONE APP (Port 3003)** - 20% công việc

#### **Sprint 1: Drone Operator Interface (Week 3-4)**

##### 1. **Drone Status Dashboard** 🚁
- [ ] Current drone info (battery, status, location)
- [ ] Real-time map với vị trí drone
- [ ] Active mission details
- [ ] Flight history

📁 Files: `drone_app/src/pages/Dashboard/DroneDashboardPage.jsx`

##### 2. **Mission Management** 🚁
- [ ] Danh sách missions (orders) assigned
- [ ] Accept/Decline mission
- [ ] Start delivery
- [ ] Complete delivery
- [ ] Emergency landing button

📁 Files: `drone_app/src/pages/Mission/MissionPage.jsx`

##### 3. **Drone Simulation Control** 🚁 (For Testing)
- [ ] Manual control để test
- [ ] Start/Stop simulation
- [ ] Speed control
- [ ] Battery simulation

📁 Files: `drone_app/src/pages/Simulation/SimulationPage.jsx`

---

## 📊 TIMELINE TỔNG THỂ (4 WEEKS)

### **Week 1:**
- 🔵 Member 1: Client App - HomePage, MenuPage, ProductDetailPage, CartPage
- 🔴 Member 2: Server API - Product, Restaurant, Category APIs

### **Week 2:**
- 🔵 Member 1: Client App - CheckoutPage, OrderTrackingPage (UI only)
- 🔴 Member 2: Server API - Order APIs, Socket.io setup, Drone assignment

### **Week 3:**
- 🔵 Member 1: Restaurant App - Dashboard, Order Management, Product Management
- 🔴 Member 2: Admin App - Dashboard, User/Restaurant/Drone Management, Drone Simulation

### **Week 4:**
- 🔵 Member 1: Tích hợp Socket.io Client, Testing, UI Polish
- 🔴 Member 2: Drone App, Advanced features, Testing, Bug fixes

---

## 🔄 LUỒNG CODE & WORKFLOW

### **Git Workflow:**

```bash
# Member 1 - Branch structure
main
├── feature/client-homepage
├── feature/client-menu
├── feature/client-cart
├── feature/client-checkout
├── feature/client-tracking
├── feature/restaurant-dashboard
└── feature/restaurant-orders

# Member 2 - Branch structure
main
├── feature/api-products
├── feature/api-orders
├── feature/api-socket
├── feature/api-drone-assignment
├── feature/admin-dashboard
├── feature/admin-drone-management
└── feature/drone-app
```

### **Quy Trình Làm Việc:**

1. **Tạo branch mới từ main:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/ten-feature
   ```

2. **Code & commit thường xuyên:**
   ```bash
   git add .
   git commit -m "feat: mô tả tính năng"
   git push origin feature/ten-feature
   ```

3. **Tạo Pull Request lên main:**
   - Người còn lại review code
   - Resolve conflicts (nếu có)
   - Merge vào main

4. **Sync code định kỳ (mỗi ngày):**
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/your-branch
   git merge main
   ```

### **Tránh Conflict:**

✅ **Member 1 chủ yếu làm việc trong:**
- `client_app/`
- `restaurant_app/`

✅ **Member 2 chủ yếu làm việc trong:**
- `server_app/`
- `admin_app/`
- `drone_app/`

⚠️ **Files dùng chung (cần sync):**
- `.env` - Thông báo trước khi sửa
- `package.json` (root) - Merge carefully
- API contracts - Thống nhất trước khi code

---

## 📝 CHECKLIST TRƯỚC KHI BẮT ĐẦU

### Member 1:
- [ ] Đọc kỹ API documentation của Member 2
- [ ] Setup Socket.io client library
- [ ] Cài đặt Leaflet cho maps
- [ ] Hiểu Redux store structure
- [ ] Test API endpoints với Postman/Thunder Client

### Member 2:
- [ ] Thiết kế database schema chi tiết
- [ ] Viết API documentation (endpoints, request/response)
- [ ] Setup Socket.io server
- [ ] Test drone assignment algorithm
- [ ] Chuẩn bị mock data cho testing

---

## 🎯 PRIORITIES (Làm theo thứ tự)

### **CRITICAL (Phải có):**
1. Auth system (Login/Register) - ✅ Đã có
2. Product listing & detail - 🔵 Member 1
3. Cart & Checkout - 🔵 Member 1
4. Order APIs - 🔴 Member 2
5. Order tracking with real-time - 🔵🔴 Cả 2
6. Restaurant order management - 🔵 Member 1
7. Admin drone management - 🔴 Member 2

### **HIGH (Nên có):**
8. Drone simulation - 🔴 Member 2
9. Socket.io real-time updates - 🔴 Member 2
10. Payment integration - 🔴 Member 2
11. Statistics dashboard - 🔵🔴 Cả 2

### **MEDIUM (Tốt nếu có):**
12. Notifications - 🔴 Member 2
13. Reviews & ratings - 🔵 Member 1
14. Advanced filters - 🔵 Member 1

### **LOW (Optional):**
15. Chat support
16. Loyalty program
17. Recommendations AI

---

## 📞 COMMUNICATION

### **Daily Standup (15 phút):**
- Hôm qua làm gì?
- Hôm nay sẽ làm gì?
- Có vấn đề gì cần hỗ trợ?

### **Tools:**
- **Git**: Source control
- **Discord/Slack**: Communication
- **Trello/Notion**: Task management
- **Postman**: API testing
- **Figma**: Design reference (nếu có)

---

## 🐛 TESTING CHECKLIST

### Member 1 Test:
- [ ] Responsive trên mobile/tablet/desktop
- [ ] Form validation
- [ ] Loading states
- [ ] Error handling
- [ ] Browser compatibility (Chrome, Firefox, Edge)

### Member 2 Test:
- [ ] API response time < 200ms
- [ ] Error responses đúng format
- [ ] Socket events fire correctly
- [ ] Database queries optimized
- [ ] Authentication & authorization

---

## 🎉 SUCCESS CRITERIA

Dự án hoàn thành khi:
- ✅ User có thể đặt hàng thành công
- ✅ Restaurant nhận đơn và cập nhật status
- ✅ Drone được assign tự động
- ✅ Real-time tracking hoạt động
- ✅ Admin quản lý được toàn bộ hệ thống
- ✅ Không có major bugs
- ✅ Code clean, có comments
- ✅ Git history rõ ràng

---

**Good luck! 🚀 Liên hệ nhau thường xuyên để tránh conflict và bugs!**
