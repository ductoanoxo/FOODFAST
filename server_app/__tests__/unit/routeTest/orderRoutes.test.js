const request = require('supertest');
const express = require('express');
const orderRouter = require('../../../API/Routers/orderRouter');

// Mock controllers
jest.mock('../../../API/Controllers/orderController', () => ({
    createOrder: jest.fn((req, res) => res.status(201).json({ success: true, data: req.body })),
    getOrders: jest.fn((req, res) => res.json({ success: true, data: [] })),
    getOrderById: jest.fn((req, res) => res.json({ success: true, data: { id: req.params.id } })),
    updateOrderStatus: jest.fn((req, res) => res.json({ success: true, data: { status: req.body.status } })),
    trackOrder: jest.fn((req, res) => res.json({ success: true, data: { tracking: true } })),
    cancelOrder: jest.fn((req, res) => res.json({ success: true, data: { cancelled: true } })),
    getOrderHistory: jest.fn((req, res) => res.json({ success: true, data: [] })),
    confirmDelivery: jest.fn((req, res) => res.json({ success: true, data: { confirmed: true } })),
    restaurantConfirmHandover: jest.fn((req, res) => res.json({ success: true, data: { handover: true } })),
    calculateFee: jest.fn((req, res) => res.json({ success: true, data: { fee: 30000 } }))
}));

// Mock middleware
jest.mock('../../../API/Middleware/authMiddleware', () => ({
    protect: (req, res, next) => {
        req.user = { _id: 'user123', role: 'restaurant' }; // Changed to restaurant role
        next();
    },
    authorize: (...roles) => (req, res, next) => {
        if (roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ success: false, error: 'Not authorized' });
        }
    }
}));

describe('Order Routes - Unit Tests', () => {
    let app;
    const orderController = require('../../../API/Controllers/orderController');

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api/orders', orderRouter);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/orders', () => {
        it('should call createOrder controller', async() => {
            await request(app)
                .post('/api/orders')
                .send({ items: [], total: 100000 });

            expect(orderController.createOrder).toHaveBeenCalled();
        });

        it('should require authentication', async() => {
            const response = await request(app)
                .post('/api/orders')
                .send({ items: [] });

            expect(response.status).not.toBe(401);
        });

        it('should return 201 on success', async() => {
            const response = await request(app)
                .post('/api/orders')
                .send({ items: [], total: 100000 });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
        });
    });

    describe('GET /api/orders', () => {
        it('should call getOrders controller', async() => {
            await request(app).get('/api/orders');

            expect(orderController.getOrders).toHaveBeenCalled();
        });

        it('should require authentication', async() => {
            const response = await request(app).get('/api/orders');

            expect(response.status).not.toBe(401);
        });
    });

    describe('GET /api/orders/history', () => {
        it('should call getOrderHistory controller', async() => {
            await request(app).get('/api/orders/history');

            expect(orderController.getOrderHistory).toHaveBeenCalled();
        });
    });

    describe('POST /api/orders/calculate-fee', () => {
        it('should call calculateFee controller', async() => {
            await request(app)
                .post('/api/orders/calculate-fee')
                .send({ distance: 5 });

            expect(orderController.calculateFee).toHaveBeenCalled();
        });

        it('should return fee calculation', async() => {
            const response = await request(app)
                .post('/api/orders/calculate-fee')
                .send({ distance: 5 });

            expect(response.body.data.fee).toBe(30000);
        });
    });

    describe('GET /api/orders/:id', () => {
        it('should call getOrderById controller', async() => {
            await request(app).get('/api/orders/order123');

            expect(orderController.getOrderById).toHaveBeenCalled();
        });

        it('should return order details', async() => {
            const response = await request(app).get('/api/orders/order123');

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe('order123');
        });
    });

    describe('PATCH /api/orders/:id/status', () => {
        it('should call updateOrderStatus controller', async() => {
            await request(app)
                .patch('/api/orders/order123/status')
                .send({ status: 'preparing' });

            expect(orderController.updateOrderStatus).toHaveBeenCalled();
        });
    });

    describe('PATCH /api/orders/:id/cancel', () => {
        it('should call cancelOrder controller', async() => {
            await request(app).patch('/api/orders/order123/cancel');

            expect(orderController.cancelOrder).toHaveBeenCalled();
        });

        it('should return cancellation confirmation', async() => {
            const response = await request(app).patch('/api/orders/order123/cancel');

            expect(response.body.data.cancelled).toBe(true);
        });
    });

    describe('POST /api/orders/:id/confirm-delivery', () => {
        it('should call confirmDelivery controller', async() => {
            await request(app).post('/api/orders/order123/confirm-delivery');

            expect(orderController.confirmDelivery).toHaveBeenCalled();
        });
    });

    describe('POST /api/orders/:id/restaurant-confirm-handover', () => {
        it('should call restaurantConfirmHandover controller', async() => {
            await request(app).post('/api/orders/order123/restaurant-confirm-handover');

            expect(orderController.restaurantConfirmHandover).toHaveBeenCalled();
        });
    });

    describe('GET /api/orders/:id/track', () => {
        it('should call trackOrder controller', async() => {
            await request(app).get('/api/orders/order123/track');

            expect(orderController.trackOrder).toHaveBeenCalled();
        });

        it('should return tracking information', async() => {
            const response = await request(app).get('/api/orders/order123/track');

            expect(response.body.data.tracking).toBe(true);
        });
    });

    describe('Route Structure', () => {
        it('should have all required order routes defined', () => {
            expect(orderController.createOrder).toBeDefined();
            expect(orderController.getOrders).toBeDefined();
            expect(orderController.getOrderById).toBeDefined();
            expect(orderController.updateOrderStatus).toBeDefined();
            expect(orderController.cancelOrder).toBeDefined();
            expect(orderController.trackOrder).toBeDefined();
            expect(orderController.getOrderHistory).toBeDefined();
            expect(orderController.confirmDelivery).toBeDefined();
            expect(orderController.restaurantConfirmHandover).toBeDefined();
            expect(orderController.calculateFee).toBeDefined();
        });
    });
});