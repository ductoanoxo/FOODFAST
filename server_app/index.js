const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { errorHandler } = require('./API/Middleware/errorMiddleware');
const logger = require('./API/Utils/logger');
const path = require('path');

// Load environment variables from root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Connect to MongoDB
connectDB();

const app = express();

// ---------------------- MIDDLEWARES ---------------------- //
app.use(helmet({
    // Cho phép tài nguyên (ảnh) được nhúng từ origin khác
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // Tắt COEP để tránh chặn tài nguyên không có COEP headers
    crossOriginEmbedderPolicy: false,
}));

app.use(
    cors({
        origin: [
            'http://localhost:5173', // Client App
            'http://localhost:5174', // Restaurant App
            'http://localhost:5175', // Admin App
            'http://localhost:5176', // Drone App
            process.env.CLIENT_URL || 'http://localhost:3000',
            process.env.RESTAURANT_URL || 'http://localhost:3001',
            process.env.ADMIN_URL || 'http://localhost:3002',
            process.env.DRONE_URL || 'http://localhost:3003',
        ],
        credentials: true,
    })
);
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------------------- STATIC FILES ---------------------- //
// Cho phép truy cập ảnh tĩnh từ thư mục /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------- ROUTES ---------------------- //
app.get('/', (req, res) => {
    res.json({
        message: 'FoodFast Drone Delivery API',
        version: '1.0.0',
        status: 'running',
    });
});

app.use('/api/auth', require('./API/Routers/authRouter'));
app.use('/api/users', require('./API/Routers/userRouter'));
app.use('/api/products', require('./API/Routers/productRouter'));
app.use('/api/categories', require('./API/Routers/categoryRouter'));
app.use('/api/restaurants', require('./API/Routers/restaurantRouter'));
app.use('/api/orders', require('./API/Routers/orderRouter'));
app.use('/api/drones', require('./API/Routers/droneRouter'));
app.use('/api/payment', require('./API/Routers/paymentRouter'));
app.use('/api/reviews', require('./API/Routers/reviewRouter'));
app.use('/api/upload', require('./API/Routers/uploadRouter'));
app.use('/api/admin', require('./API/Routers/adminRouter'));
app.use('/api/dashboard', require('./API/Routers/dashboardRouter'));

// ---------------------- ERROR HANDLER ---------------------- //
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// ---------------------- SERVER START ---------------------- //
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// ---------------------- SOCKET.IO SETUP ---------------------- //
const socketService = require('./services/socketService');
const io = socketService.initialize(server);

// Make io accessible to routes
app.set('io', io);
app.set('socketService', socketService);

// ---------------------- UNHANDLED REJECTIONS ---------------------- //
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});

module.exports = { app, io, socketService };