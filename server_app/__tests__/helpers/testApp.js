/**
 * Test Helper: Create Express App for Testing
 * Không initialize Socket.IO để tránh lỗi trong tests
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('../../API/Middleware/errorMiddleware');

// Import routers
const droneRouter = require('../../API/Routers/droneRouter');
const orderRouter = require('../../API/Routers/orderRouter');
const authRouter = require('../../API/Routers/authRouter');
const userRouter = require('../../API/Routers/userRouter');
const productRouter = require('../../API/Routers/productRouter');
const paymentRouter = require('../../API/Routers/paymentRouter');
const promotionRouter = require('../../API/Routers/promotionRouter');
const restaurantRouter = require('../../API/Routers/restaurantRouter');

function createTestApp() {
    const app = express();

    // Middlewares
    app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    // Routes
    app.use('/api/drones', droneRouter);
    app.use('/api/orders', orderRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/users', userRouter);
    app.use('/api/products', productRouter);
    app.use('/api/promotions', promotionRouter);
    app.use('/api/payment', paymentRouter);
    app.use('/api/restaurants', restaurantRouter);

    // Error handler
    app.use(errorHandler);

    return app;
}

module.exports = createTestApp;