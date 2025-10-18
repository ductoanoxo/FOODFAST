# 📁 PROJECT STRUCTURE - FOODFAST DRONE DELIVERY

## Cấu trúc tổng quan

```
FOODFAST-DRONE-DELIVERY/
│
├── 📱 client_app/                    # React App - Khách hàng (Port 3000)
│   ├── dist/                         # Build output (auto-generated)
│   ├── public/
│   │   └── clear-cache.html          # Cache clearing utility
│   ├── src/
│   │   ├── api/                      # API integration layer
│   │   │   ├── axios.js              # Axios config + interceptors
│   │   │   ├── authAPI.js            # Auth endpoints
│   │   │   ├── index.js              # API exports
│   │   │   ├── orderAPI.js           # Order endpoints
│   │   │   ├── paymentAPI.js         # Payment endpoints
│   │   │   ├── productAPI.js         # Product endpoints
│   │   │   ├── restaurantAPI.js      # Restaurant endpoints
│   │   │   ├── reviewAPI.js          # Review endpoints
│   │   │   └── voucherAPI.js         # Voucher endpoints
│   │   │
│   │   ├── components/               # Reusable components
│   │   │   ├── Layout/
│   │   │   │   ├── AuthLayout.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Footer.css
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Header.css
│   │   │   │   └── MainLayout.jsx
│   │   │   ├── Product/
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── ProductCard.css
│   │   │   │   ├── ProductFilter.jsx
│   │   │   │   └── ProductFilter.css
│   │   │   ├── Restaurant/
│   │   │   │   ├── RestaurantCard.jsx
│   │   │   │   └── RestaurantCard.css
│   │   │   ├── Route/
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   └── VoucherSelector/
│   │   │       ├── VoucherSelector.jsx
│   │   │       └── VoucherSelector.css
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   ├── Auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── LoginPage.css
│   │   │   │   ├── RegisterPage.jsx
│   │   │   │   └── RegisterPage.css
│   │   │   ├── Cart/
│   │   │   │   ├── CartPage.jsx
│   │   │   │   └── CartPage.css
│   │   │   ├── Categories/
│   │   │   │   ├── CategoriesPage.jsx
│   │   │   │   └── CategoriesPage.css
│   │   │   ├── Checkout/
│   │   │   │   ├── CheckoutPage.jsx
│   │   │   │   └── CheckoutPage.css
│   │   │   ├── Home/
│   │   │   │   ├── HomePage.jsx
│   │   │   │   └── HomePage.css
│   │   │   ├── Menu/
│   │   │   │   ├── MenuPage.jsx
│   │   │   │   └── MenuPage.css
│   │   │   ├── NotFound/
│   │   │   │   └── NotFoundPage.jsx
│   │   │   ├── OrderTracking/
│   │   │   │   ├── OrderTrackingPage.jsx
│   │   │   │   └── OrderTrackingPage.css
│   │   │   ├── Payment/
│   │   │   │   ├── PaymentPage.jsx
│   │   │   │   └── PaymentPage.css
│   │   │   ├── Product/
│   │   │   │   ├── ProductDetailPage.jsx
│   │   │   │   └── ProductDetailPage.css
│   │   │   ├── Profile/
│   │   │   │   ├── OrderHistoryPage.jsx
│   │   │   │   ├── OrderHistoryPage.css
│   │   │   │   ├── ProfilePage.jsx
│   │   │   │   └── ProfilePage.css
│   │   │   └── Store/
│   │   │       ├── StorePage.jsx
│   │   │       └── StorePage.css
│   │   │
│   │   ├── redux/                    # State management
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       ├── cartSlice.js
│   │   │       ├── orderSlice.js
│   │   │       └── productSlice.js
│   │   │
│   │   ├── services/
│   │   │   └── socketService.js      # Socket.IO client
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── Dockerfile
│   ├── index.html
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
│
├── 🍴 restaurant_app/                # React App - Nhà hàng (Port 3001)
│   ├── dist/                         # Build output (auto-generated)
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js
│   │   │   ├── authAPI.js
│   │   │   ├── orderAPI.js
│   │   │   └── productAPI.js
│   │   ├── components/
│   │   │   └── Layout/
│   │   │       └── MainLayout.jsx
│   │   ├── constants/
│   │   │   └── orderStatus.js
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   │   └── LoginPage.jsx
│   │   │   ├── Dashboard/
│   │   │   │   └── DashboardPage.jsx
│   │   │   ├── Menu/
│   │   │   │   └── MenuPage.jsx
│   │   │   ├── Orders/
│   │   │   │   └── OrdersPage.jsx
│   │   │   └── Profile/
│   │   │       └── ProfilePage.jsx
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       └── authSlice.js
│   │   ├── utils/
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── README.md
│   ├── READ_ME_FIRST.md
│   ├── START_HERE.md
│   ├── USER_GUIDE.md
│   └── vite.config.js
│
├── 👨‍💼 admin_app/                      # React App - Admin (Port 3002)
│   ├── src/
│   │   ├── api/
│   │   │   ├── adminAPI.js           # Admin-specific APIs
│   │   │   ├── authAPI.js
│   │   │   ├── axios.js
│   │   │   ├── dashboardAPI.js
│   │   │   ├── droneAPI.js           # Drone CRUD ⭐
│   │   │   ├── orderAPI.js
│   │   │   ├── restaurantAPI.js
│   │   │   └── userAPI.js
│   │   ├── components/
│   │   │   ├── Alerts/
│   │   │   │   └── AlertList.jsx
│   │   │   └── Layout/
│   │   │       └── MainLayout.jsx
│   │   ├── pages/
│   │   │   ├── Assignment/
│   │   │   │   └── AssignmentDashboard.jsx
│   │   │   ├── Auth/
│   │   │   │   └── LoginPage.jsx
│   │   │   ├── Dashboard/
│   │   │   │   └── DashboardPage.jsx
│   │   │   ├── Drones/
│   │   │   │   ├── DronesPage.jsx    # Drone CRUD UI ⭐
│   │   │   │   └── DronesPage.css
│   │   │   ├── Fleet/
│   │   │   │   ├── FleetMap.jsx      # Fleet map with realtime ⭐
│   │   │   │   └── FleetMap.css
│   │   │   ├── Orders/
│   │   │   │   └── OrdersPage.jsx
│   │   │   ├── Restaurants/
│   │   │   │   └── RestaurantsPage.jsx
│   │   │   └── Users/
│   │   │       └── UsersPage.jsx
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       └── authSlice.js
│   │   ├── services/
│   │   │   └── socketService.js      # Socket.IO with drone events ⭐
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── Dockerfile
│   ├── index.html
│   ├── jsconfig.json
│   ├── package.json
│   └── vite.config.js
│
├── 🚁 drone_manage/                   # React App - Drone Management (Port 3003)
│   ├── public/
│   │   └── clear-cache.html
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js
│   │   │   ├── authAPI.js
│   │   │   ├── droneAPI.js
│   │   │   └── orderAPI.js
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   └── MainLayout.jsx
│   │   │   └── Map/
│   │   │       └── MapController.jsx
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   │   └── LoginPage.jsx
│   │   │   ├── Drones/
│   │   │   │   └── DronesPage.jsx
│   │   │   ├── Map/
│   │   │   │   └── MapPage.jsx
│   │   │   └── Missions/
│   │   │       └── MissionsPage.jsx
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       └── droneSlice.js
│   │   ├── utils/
│   │   │   └── socketService.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env
│   ├── .env.example
│   ├── Dockerfile
│   ├── index.html
│   ├── LOGIN_GUIDE.md
│   ├── package.json
│   ├── README.md
│   └── vite.config.js
│
├── 🖥️  server_app/                     # Node.js Backend (Port 5000)
│   ├── API/
│   │   ├── Controllers/
│   │   │   ├── adminController.js    # Admin operations
│   │   │   ├── authController.js
│   │   │   ├── categoryController.js
│   │   │   ├── droneController.js    # Drone CRUD with socket ⭐
│   │   │   ├── orderController.js
│   │   │   ├── productController.js
│   │   │   ├── promotionController.js
│   │   │   ├── restaurantController.js
│   │   │   ├── reviewController.js
│   │   │   ├── userController.js
│   │   │   └── voucherController.js
│   │   │
│   │   ├── Middleware/
│   │   │   ├── asyncHandler.js
│   │   │   ├── authMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   │
│   │   ├── Models/
│   │   │   ├── Category.js
│   │   │   ├── Drone.js              # Drone schema ⭐
│   │   │   ├── Order.js
│   │   │   ├── Product.js
│   │   │   ├── Promotion.js
│   │   │   ├── PromoUsage.js
│   │   │   ├── Restaurant.js
│   │   │   ├── Review.js
│   │   │   ├── User.js
│   │   │   ├── Voucher.js
│   │   │   └── VoucherUsage.js
│   │   │
│   │   ├── Routers/
│   │   │   ├── adminRouter.js
│   │   │   ├── authRouter.js
│   │   │   ├── categoryRouter.js
│   │   │   ├── droneRouter.js
│   │   │   ├── orderRouter.js
│   │   │   ├── productRouter.js
│   │   │   ├── promotionRouter.js
│   │   │   ├── restaurantRouter.js
│   │   │   ├── reviewRouter.js
│   │   │   ├── userRouter.js
│   │   │   └── voucherRouter.js
│   │   │
│   │   └── Utils/
│   │       └── logger.js
│   │
│   ├── __tests__/                    # Test files
│   │   ├── setup.js
│   │   ├── integration/
│   │   └── unit/
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── logs/                         # Auto-generated logs
│   ├── services/
│   │   └── socketService.js          # Socket.IO server ⭐
│   ├── uploads/                      # Auto-generated uploads
│   │
│   ├── check-drone-status.js         # Utility script
│   ├── Dockerfile
│   ├── fix-stuck-drones.js           # Utility script
│   ├── index.js                      # Server entry point
│   ├── package.json
│   ├── package.test.json
│   ├── seed.js                       # Data seeding ⭐
│   └── test-order.js                 # Test script
│
├── 🧪 cypress/                        # E2E Testing
│   └── e2e/
│       └── user-journeys.cy.js
│
├── 📄 Root Files
│   ├── .env
│   ├── .gitignore
│   ├── API_DOCUMENTATION.md          # API docs
│   ├── API_TESTING.md                # API testing guide
│   ├── cypress.config.js
│   ├── cypress.package.json
│   ├── docker-compose.yml
│   ├── DRONE_CRUD_IMPLEMENTATION.md  # Drone CRUD docs ⭐
│   ├── DRONE_CRUD_SUMMARY.md         # Drone summary ⭐
│   ├── DRONE_MAP_FIX.md              # Map fix docs ⭐
│   ├── DRONE_USER_GUIDE.md           # User guide ⭐
│   ├── FULL_IMPLEMENTATION.md
│   ├── install.ps1
│   ├── package.json
│   ├── PROJECT_COMPLETE.md
│   ├── QUICKSTART.md
│   ├── README.md
│   ├── seed.ps1
│   ├── setup.ps1
│   ├── SETUP_GUIDE.md
│   ├── start.ps1
│   ├── START_HERE.md
│   └── STRUCTURE.md                  # This file
│
└── Total Files: 200+                 # All source files (excluding node_modules)
```

---

## 📊 File Count Breakdown

| App | Files | Lines of Code |
|-----|-------|---------------|
| **Client App** | 60+ | ~4,000 |
| **Restaurant App** | 15 | ~800 |
| **Admin App** | 16 | ~900 |
| **Drone Management** | 15 | ~900 |
| **Server App** | 35+ | ~2,500 |
| **Root Config** | 10 | ~500 |
| **TOTAL** | **140+** | **~9,600** |

---

## 🎯 Key Files to Understand

### Client App
- `src/App.jsx` - Routing setup
- `src/redux/store.js` - State configuration
- `src/api/axios.js` - API client setup
- `src/pages/Home/HomePage.jsx` - Landing page
- `src/pages/Cart/CartPage.jsx` - Cart logic
- `src/pages/Checkout/CheckoutPage.jsx` - Checkout flow

### Server App
- `index.js` - Express + Socket.io setup
- `config/db.js` - MongoDB connection
- `API/Models/User.js` - User schema + authentication
- `API/Controllers/authController.js` - JWT logic
- `API/Middleware/authMiddleware.js` - Route protection
- `seed.js` - Database seeding ⭐

---

## 🔌 Integration Points

### Frontend → Backend
```javascript
// client_app/src/api/axios.js
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { Authorization: `Bearer ${token}` }
})
```

### Socket.io Connection
```javascript
// client_app
const socket = io('http://localhost:5000')
socket.on('order-status-updated', handleUpdate)
```

### Redux Store
```javascript
// All apps use similar structure
const store = configureStore({
  reducer: {
    auth: authReducer,
    // app-specific reducers
  }
})
```

---

## 📦 Dependencies Summary

### Frontend (All 4 apps)
- `react` + `react-dom` - UI library
- `react-router-dom` - Routing
- `@reduxjs/toolkit` + `react-redux` - State
- `antd` + `@ant-design/icons` - UI components
- `axios` - HTTP client
- `socket.io-client` - WebSocket (client_app, drone_manage)
- `react-leaflet` + `leaflet` - Maps (drone_manage only)
- `recharts` - Charts (restaurant_app, admin_app)
- `vite` - Build tool

### Backend (server_app)
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `socket.io` - WebSocket server
- `jsonwebtoken` - JWT auth
- `bcryptjs` - Password hashing
- `cors` - CORS middleware
- `helmet` - Security headers
- `morgan` - HTTP logger
- `winston` - Application logger
- `dotenv` - Environment variables
- `express-validator` - Input validation
- `multer` - File uploads
- `nodemailer` - Email
- `node-cron` - Task scheduling

---

## 🚀 Script Commands

### Root (`package.json`)
```json
{
  "install-all": "Install all 5 apps",
  "dev": "Run all apps concurrently",
  "dev:client": "Run client app",
  "dev:restaurant": "Run restaurant app",
  "dev:admin": "Run admin app",
  "dev:drone": "Run drone app",
  "dev:server": "Run backend",
  "seed": "Seed database"
}
```

### Individual Apps
```json
{
  "dev": "vite --port XXXX",
  "build": "vite build",
  "preview": "vite preview"
}
```

### Server App
```json
{
  "start": "node index.js",
  "dev": "nodemon index.js",
  "seed": "node seed.js"
}
```

---

## 🎨 Styling Approach

### CSS Modules
Each component has its own CSS file:
```
HomePage.jsx
HomePage.css  ← Scoped styles
```

### Global Styles
- `index.css` - Reset + global styles
- Ant Design theme customization in `main.jsx`

### Color Themes
- Client: `#1890ff` (Blue)
- Restaurant: `#1890ff` (Blue)
- Admin: `#ff4d4f` (Red)
- Drone: `#52c41a` (Green)

---

## 📁 Auto-generated Directories

These folders are created automatically:
```
server_app/
├── logs/           # Winston log files
├── uploads/        # Multer uploaded files
└── node_modules/   # Dependencies

client_app/dist/    # Vite build output
```

**Note**: All auto-generated folders are in `.gitignore`

---

## ✅ Complete Feature Matrix

| Feature | Client | Restaurant | Admin | Drone | Server |
|---------|--------|------------|-------|-------|--------|
| Authentication | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ | ✅ | - |
| Product Listing | ✅ | - | - | - | ✅ |
| Cart Management | ✅ | - | - | - | - |
| Order Management | ✅ | ✅ | ✅ | - | ✅ |
| Real-time Updates | ✅ | - | - | ✅ | ✅ |
| Map Integration | - | - | - | ✅ | - |
| User Management | - | - | ✅ | - | ✅ |
| Restaurant CRUD | - | ✅ | ✅ | - | ✅ |
| Drone Tracking | - | - | ✅ | ✅ | ✅ |

---

---

## 🆕 RECENT CHANGES (Drone CRUD & Realtime)

The repository has recent updates that enhance Drone management and realtime synchronization. Additions and changes are summarized below (excluding node_modules).

- Backend (server_app):
  - `API/Controllers/droneController.js`
    - Create: sets `currentLocation` from `homeLocation` if not provided; emits `drone:created` socket event to `admin-room`.
    - Update: emits `drone:updated` socket event after successful update.
    - Delete: prevents deletion when `currentOrder` exists; deletes drone and emits `drone:deleted` to `admin-room`.
  - `API/Models/Drone.js` updated so `currentLocation.coordinates` is optional (backend sets it on create).

- Frontend (admin_app):
  - `src/pages/Drones/DronesPage.jsx` — added Edit & Delete UI, edit modal, delete confirmation, and handlers (`handleEditDrone`, `handleDelete`, `showEditModal`).
  - `src/services/socketService.js` — added `onDroneCreated`, `onDroneUpdated`, `onDroneDeleted` handlers.
  - `src/pages/Fleet/FleetMap.jsx` — listens for `drone:created`, `drone:updated`, `drone:deleted` and refreshes markers via `fetchData()`; converts coordinates for Leaflet rendering (lat,lng).

- Realtime behaviour:
  - Socket events are authenticated via JWT and broadcast to `admin-room` so all admin clients stay synchronized.
  - Fleet Map auto-fits bounds to available drone markers on refresh.

### Notes for maintainers

- Coordinate conventions: MongoDB stores coordinates as `[lng, lat]`; Leaflet expects `[lat, lng]`. Ensure proper conversion when rendering markers.
- Validation: frontend forms validate lat/lng ranges and serial formats; backend validates and prevents destructive actions (e.g., deleting assigned drones).
- Files added/modified (high-level): `DRONE_MAP_FIX.md`, `DRONE_CRUD_IMPLEMENTATION.md`, `DRONE_USER_GUIDE.md`, controller and frontend files as listed above.

---

**This is the complete structure of FOODFAST DRONE DELIVERY! 🎉**
