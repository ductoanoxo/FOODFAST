# 📁 PROJECT STRUCTURE - FOODFAST DRONE DELIVERY

## Cấu trúc tổng quan

```
FOODFAST-DRONE-DELIVERY/
│
├── 📱 client_app/                    # React App - Khách hàng (Port 3000)
│   ├── public/
│   ├── src/
│   │   ├── api/                      # API integration layer
│   │   │   ├── axios.js              # Axios config + interceptors
│   │   │   ├── authAPI.js            # Auth endpoints
│   │   │   ├── productAPI.js         # Product endpoints
│   │   │   ├── restaurantAPI.js      # Restaurant endpoints
│   │   │   ├── orderAPI.js           # Order endpoints
│   │   │   └── paymentAPI.js         # Payment endpoints
│   │   │
│   │   ├── components/               # Reusable components
│   │   │   ├── Layout/
│   │   │   │   ├── MainLayout.jsx    # Main layout with Header/Footer
│   │   │   │   ├── Header.jsx        # Navigation header
│   │   │   │   ├── Header.css
│   │   │   │   ├── Footer.jsx        # Footer
│   │   │   │   ├── Footer.css
│   │   │   │   └── AuthLayout.jsx    # Layout for login/register
│   │   │   │
│   │   │   ├── Product/
│   │   │   │   ├── ProductCard.jsx   # Product display card
│   │   │   │   ├── ProductCard.css
│   │   │   │   ├── ProductFilter.jsx # Filter sidebar
│   │   │   │   └── ProductFilter.css
│   │   │   │
│   │   │   ├── Restaurant/
│   │   │   │   ├── RestaurantCard.jsx
│   │   │   │   └── RestaurantCard.css
│   │   │   │
│   │   │   └── Route/
│   │   │       └── ProtectedRoute.jsx # Route protection
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   ├── Home/
│   │   │   │   ├── HomePage.jsx      # Landing page
│   │   │   │   └── HomePage.css
│   │   │   │
│   │   │   ├── Auth/
│   │   │   │   ├── LoginPage.jsx     # Login form
│   │   │   │   ├── LoginPage.css
│   │   │   │   ├── RegisterPage.jsx  # Register form
│   │   │   │   └── RegisterPage.css
│   │   │   │
│   │   │   ├── Menu/
│   │   │   │   ├── MenuPage.jsx      # Menu browsing
│   │   │   │   └── MenuPage.css
│   │   │   │
│   │   │   ├── Store/
│   │   │   │   ├── StorePage.jsx     # Restaurant listing
│   │   │   │   └── StorePage.css
│   │   │   │
│   │   │   ├── Product/
│   │   │   │   ├── ProductDetailPage.jsx  # Product detail
│   │   │   │   └── ProductDetailPage.css
│   │   │   │
│   │   │   ├── Cart/
│   │   │   │   ├── CartPage.jsx      # Shopping cart
│   │   │   │   └── CartPage.css
│   │   │   │
│   │   │   ├── Checkout/
│   │   │   │   ├── CheckoutPage.jsx  # Checkout flow
│   │   │   │   └── CheckoutPage.css
│   │   │   │
│   │   │   ├── OrderTracking/
│   │   │   │   ├── OrderTrackingPage.jsx  # Real-time tracking
│   │   │   │   └── OrderTrackingPage.css
│   │   │   │
│   │   │   ├── Profile/
│   │   │   │   ├── ProfilePage.jsx   # User profile
│   │   │   │   ├── ProfilePage.css
│   │   │   │   ├── OrderHistoryPage.jsx  # Order history
│   │   │   │   └── OrderHistoryPage.css
│   │   │   │
│   │   │   └── NotFound/
│   │   │       └── NotFoundPage.jsx  # 404 page
│   │   │
│   │   ├── redux/                    # State management
│   │   │   ├── store.js              # Redux store config
│   │   │   └── slices/
│   │   │       ├── authSlice.js      # Auth state
│   │   │       ├── cartSlice.js      # Cart state
│   │   │       ├── productSlice.js   # Product state
│   │   │       └── orderSlice.js     # Order state
│   │   │
│   │   ├── App.jsx                   # Main App component
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Global styles
│   │
│   ├── index.html                    # HTML entry
│   ├── package.json                  # Dependencies
│   ├── vite.config.js                # Vite config
│   ├── Dockerfile                    # Docker image
│   └── nginx.conf                    # Nginx config
│
├── 🍴 restaurant_app/                # React App - Nhà hàng (Port 3001)
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout/
│   │   │       └── MainLayout.jsx    # Dashboard layout
│   │   │
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   │   └── LoginPage.jsx
│   │   │   ├── Dashboard/
│   │   │   │   └── DashboardPage.jsx # Stats dashboard
│   │   │   ├── Orders/
│   │   │   │   └── OrdersPage.jsx    # Order management
│   │   │   ├── Menu/
│   │   │   │   └── MenuPage.jsx      # Menu CRUD
│   │   │   └── Profile/
│   │   │       └── ProfilePage.jsx
│   │   │
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       └── authSlice.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── 👨‍💼 admin_app/                      # React App - Admin (Port 3002)
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout/
│   │   │       └── MainLayout.jsx    # Admin panel layout
│   │   │
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   │   └── LoginPage.jsx
│   │   │   ├── Dashboard/
│   │   │   │   └── DashboardPage.jsx # System overview
│   │   │   ├── Users/
│   │   │   │   └── UsersPage.jsx     # User management
│   │   │   ├── Restaurants/
│   │   │   │   └── RestaurantsPage.jsx  # Restaurant approval
│   │   │   ├── Orders/
│   │   │   │   └── OrdersPage.jsx    # Order monitoring
│   │   │   └── Drones/
│   │   │       └── DronesPage.jsx    # Drone fleet
│   │   │
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       └── authSlice.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── 🚁 drone_manage/                   # React App - Drone (Port 3003)
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout/
│   │   │       └── MainLayout.jsx    # Drone dashboard
│   │   │
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   │   └── LoginPage.jsx
│   │   │   ├── Map/
│   │   │   │   └── MapPage.jsx       # Leaflet map
│   │   │   ├── Drones/
│   │   │   │   └── DronesPage.jsx    # Drone list
│   │   │   └── Missions/
│   │   │       └── MissionsPage.jsx  # Mission management
│   │   │
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       └── droneSlice.js     # Drone state
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── 🖥️  server_app/                     # Node.js Backend (Port 5000)
│   ├── API/
│   │   ├── Controllers/              # Request handlers
│   │   │   ├── authController.js     # Auth logic (register, login)
│   │   │   ├── productController.js  # Product CRUD
│   │   │   └── orderController.js    # Order management
│   │   │
│   │   ├── Middleware/               # Express middleware
│   │   │   ├── authMiddleware.js     # JWT verification
│   │   │   ├── asyncHandler.js       # Async wrapper
│   │   │   └── errorMiddleware.js    # Error handling
│   │   │
│   │   ├── Models/                   # Mongoose schemas
│   │   │   ├── User.js               # User model
│   │   │   ├── Restaurant.js         # Restaurant model
│   │   │   ├── Product.js            # Product model
│   │   │   ├── Category.js           # Category model
│   │   │   ├── Order.js              # Order model
│   │   │   └── Drone.js              # Drone model
│   │   │
│   │   ├── Routers/                  # Route definitions
│   │   │   ├── authRouter.js         # /api/auth/*
│   │   │   ├── productRouter.js      # /api/products/*
│   │   │   ├── orderRouter.js        # /api/orders/*
│   │   │   ├── restaurantRouter.js   # /api/restaurants/*
│   │   │   ├── categoryRouter.js     # /api/categories/*
│   │   │   ├── userRouter.js         # /api/users/* (admin)
│   │   │   ├── droneRouter.js        # /api/drones/*
│   │   │   ├── paymentRouter.js      # /api/payment/* (placeholder)
│   │   │   ├── reviewRouter.js       # /api/reviews/* (placeholder)
│   │   │   └── uploadRouter.js       # /api/upload/* (placeholder)
│   │   │
│   │   └── Utils/                    # Utility functions
│   │       └── logger.js             # Winston logger
│   │
│   ├── config/                       # Configuration
│   │   └── db.js                     # MongoDB connection
│   │
│   ├── logs/                         # Log files (auto-generated)
│   │   ├── error.log
│   │   └── combined.log
│   │
│   ├── uploads/                      # Upload directory (auto-generated)
│   │
│   ├── index.js                      # Express server entry
│   ├── seed.js                       # Data seeding script ⭐
│   ├── package.json                  # Dependencies
│   ├── Dockerfile                    # Docker image
│   └── .gitignore                    # Git ignore
│
├── 📄 Root Files
│   ├── .env                          # Environment variables
│   ├── .gitignore                    # Git ignore (root)
│   ├── docker-compose.yml            # Docker orchestration
│   ├── package.json                  # Root scripts
│   ├── README.md                     # Main documentation
│   ├── SETUP_GUIDE.md                # Installation guide
│   ├── TODO.md                       # Task tracking
│   ├── PROJECT_COMPLETE.md           # Completion summary ⭐
│   ├── QUICKSTART.md                 # Quick start guide ⭐
│   └── STRUCTURE.md                  # This file ⭐
│
└── Total Files: 140+                 # All source files
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

**This is the complete structure of FOODFAST DRONE DELIVERY! 🎉**
