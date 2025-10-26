/**
 * 🧪 TEST APP HELPER
 * Tạo Express app instance cho integration tests
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');

// Import routers
const authRouter = require('../../API/Routers/authRouter');
const droneRouter = require('../../API/Routers/droneRouter');
const orderRouter = require('../../API/Routers/orderRouter');
const restaurantRouter = require('../../API/Routers/restaurantRouter');

function createTestApp() {
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(compression());

    // Routes
    app.use('/api/auth', authRouter);
    app.use('/api/drones', droneRouter);
    app.use('/api/orders', orderRouter);
    app.use('/api/restaurants', restaurantRouter);

    // Error handling
    app.use((err, req, res, next) => {
        console.error('Test app error:', err);
        res.status(err.status || 500).json({
            success: false,
            message: err.message || 'Internal server error'
        });
    });

    return app;
}

module.exports = { createTestApp };
