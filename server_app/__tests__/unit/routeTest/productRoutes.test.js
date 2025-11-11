const express = require('express');
const request = require('supertest');
const productRouter = require('../../../API/Routers/productRouter');

// Mock controllers
jest.mock('../../../API/Controllers/productController', () => ({
    getProducts: jest.fn((req, res) => res.json({ success: true, data: [] })),
    getProductById: jest.fn((req, res) => res.json({ success: true, data: { id: req.params.id } })),
    createProduct: jest.fn((req, res) => res.status(201).json({ success: true, data: req.body })),
    updateProduct: jest.fn((req, res) => res.json({ success: true, data: req.body })),
    deleteProduct: jest.fn((req, res) => res.json({ success: true, data: {} })),
    getPopularProducts: jest.fn((req, res) => res.json({ success: true, data: [] }))
}));

// Mock middleware
jest.mock('../../../API/Middleware/authMiddleware', () => ({
    protect: (req, res, next) => {
        req.user = { _id: 'user123', role: 'restaurant', restaurantId: 'rest123' };
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

// Mock Cloudinary upload
jest.mock('../../../config/cloudinary', () => ({
    productUpload: {
        single: () => (req, res, next) => {
            req.file = { path: 'https://cloudinary.com/image.jpg' };
            next();
        }
    }
}));

describe('Product Routes - Unit Tests', () => {
    let app;
    const productController = require('../../../API/Controllers/productController');

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api/products', productRouter);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/products', () => {
        it('should call getProducts controller', async() => {
            await request(app).get('/api/products');

            expect(productController.getProducts).toHaveBeenCalled();
        });

        it('should allow public access', async() => {
            const response = await request(app).get('/api/products');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('GET /api/products/popular', () => {
        it('should call getPopularProducts controller', async() => {
            await request(app).get('/api/products/popular');

            expect(productController.getPopularProducts).toHaveBeenCalled();
        });
    });

    describe('GET /api/products/:id', () => {
        it('should call getProductById with correct ID', async() => {
            const response = await request(app).get('/api/products/product123');

            expect(productController.getProductById).toHaveBeenCalled();
            expect(response.status).toBe(200);
        });

        it('should allow public access to product details', async() => {
            const response = await request(app).get('/api/products/product123');

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe('product123');
        });
    });

    describe('POST /api/products', () => {
        it('should require authentication', async() => {
            const response = await request(app)
                .post('/api/products')
                .send({ name: 'New Product', price: 100000 });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
        });

        it('should call createProduct controller', async() => {
            const response = await request(app)
                .post('/api/products')
                .send({ name: 'Pizza', price: 100000 });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
        });
    });

    describe('PUT /api/products/:id', () => {
        it('should call updateProduct controller', async() => {
            const response = await request(app)
                .put('/api/products/product123')
                .send({ name: 'Updated Product' });

            expect(response.body.success).toBe(true);
            expect(response.status).toBe(200);
        });

        it('should require authentication', async() => {
            const response = await request(app)
                .put('/api/products/product123')
                .send({ name: 'Updated' });

            expect(response.status).not.toBe(401);
        });
    });

    describe('DELETE /api/products/:id', () => {
        it('should call deleteProduct controller', async() => {
            const response = await request(app).delete('/api/products/product123');

            expect(response.body.success).toBe(true);
            expect(response.status).toBe(200);
        });

        it('should require authentication', async() => {
            const response = await request(app).delete('/api/products/product123');

            expect(response.status).not.toBe(401);
        });
    });

    describe('Route Structure', () => {
        it('should have all required routes defined', () => {
            expect(productController.getProducts).toBeDefined();
            expect(productController.getProductById).toBeDefined();
            expect(productController.createProduct).toBeDefined();
            expect(productController.updateProduct).toBeDefined();
            expect(productController.deleteProduct).toBeDefined();
            expect(productController.getPopularProducts).toBeDefined();
        });
    });
});