/**
 * INTEGRATION TEST: Promotions (public endpoints)
 * - GET /api/promotions/active/:restaurantId
 * - GET /api/promotions/products/:restaurantId
 * Uses in-memory MongoDB
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createTestApp = require('../helpers/testApp');

const Promotion = require('../../API/Models/Promotion');
const Product = require('../../API/Models/Product');
const Restaurant = require('../../API/Models/Restaurant');
const Category = require('../../API/Models/Category');

const app = createTestApp();

let mongod;

describe('🎫 PROMOTIONS - INTEGRATION', () => {
    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        await mongoose.connect(uri, { autoCreate: true });
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongod.stop();
    });

    afterEach(async () => {
        // Clean DB
        const collections = Object.keys(mongoose.connection.collections);
        for (const collName of collections) {
            await mongoose.connection.collections[collName].deleteMany();
        }
    });

    test('✅ GET active promotions and products with promotions', async () => {
        // Create restaurant, category, product, promotion
        const restaurant = await Restaurant.create({
            name: 'Test R',
            owner: new mongoose.Types.ObjectId(),
            email: 'rest@test.local',
            phone: '0900000000',
            address: '123 Test St'
        });
        const category = await Category.create({ name: 'Food' });

        await Product.create({
            name: 'Promo Product',
            price: 200000,
            restaurant: restaurant._id,
            category: category._id
        });

        const now = new Date();
        const later = new Date(now.getTime() + 1000 * 60 * 60 * 24);

        await Promotion.create({
            restaurant: restaurant._id,
            name: 'Test Promo',
            discountPercent: 20,
            category: category._id,
            startDate: now,
            endDate: later,
            isActive: true
        });

        // Call active promotions endpoint
        const resActive = await request(app)
            .get(`/api/promotions/active/${restaurant._id}`)
            .expect(200);

        expect(resActive.body.success).toBe(true);
        expect(resActive.body.data).toHaveLength(1);

        // Call products with promotions endpoint
        const resProducts = await request(app)
            .get(`/api/promotions/products/${restaurant._id}`)
            .expect(200);

        expect(resProducts.body.success).toBe(true);
        expect(resProducts.body.data).toHaveLength(1);
        const returned = resProducts.body.data[0];
        expect(returned.promotion).toBeDefined();
        expect(returned.promotion.discountPercent).toBe(20);
        // Price should be reduced
        expect(returned.price).toBe(Math.round(200000 - (200000 * 20) / 100));
    });
});
