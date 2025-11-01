/**
 * UNIT TEST: Promotion Controller
 * Tests: getActivePromotions, createPromotion (date validation), getProductsWithPromotions
 */

// Mock models BEFORE importing controller
jest.mock('../../API/Models/Promotion');
jest.mock('../../API/Models/Product');
jest.mock('../../API/Models/Restaurant');

const Promotion = require('../../API/Models/Promotion');
const Product = require('../../API/Models/Product');
const Restaurant = require('../../API/Models/Restaurant');

const {
    getPromotions,
    getActivePromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotionStatus,
    getProductsWithPromotions,
} = require('../../API/Controllers/promotionController');

describe('🎯 PROMOTION CONTROLLER - Unit Tests', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = { params: {}, body: {}, user: null, query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        // Default mocks
        Promotion.find = Promotion.find || jest.fn();
        Promotion.findOne = Promotion.findOne || jest.fn();
        Promotion.create = Promotion.create || jest.fn();
        Promotion.findOneAndDelete = Promotion.findOneAndDelete || jest.fn();

        Product.find = Product.find || jest.fn();
        Restaurant.findOne = Restaurant.findOne || jest.fn();
    });

    test('✅ getActivePromotions returns active promotions', async () => {
        const restaurantId = 'rest1';
        const mockPromo = {
            _id: 'promo1',
            name: 'Sale 10% ',
            discountPercent: 10,
            category: { _id: 'cat1', name: 'Food' }
        };

        // Mock chain: Promotion.find().populate()
        Promotion.find.mockReturnValue({
            populate: jest.fn().mockResolvedValue([mockPromo])
        });

        req.params.restaurantId = restaurantId;

        await getActivePromotions(req, res);

        expect(Promotion.find).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.any(Array) }));
    });

    test('✅ createPromotion - validation: endDate must be after startDate', async () => {
        req.user = { _id: 'user1' };
        // Restaurant found
        Restaurant.findOne.mockResolvedValue({ _id: 'rest1' });

        req.body = {
            name: 'Bad Promo',
            discountPercent: 20,
            category: 'cat1',
            startDate: '2025-12-31',
            endDate: '2025-01-01'
        };

        await createPromotion(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    test('✅ getProductsWithPromotions applies promotion to matching category products', async () => {
        const restaurantId = 'rest1';
        req.params.restaurantId = restaurantId;

        const now = new Date();

        const promo = {
            _id: 'promo1',
            category: { toString: () => 'cat1' },
            discountPercent: 10,
            name: '10% off'
        };

        const productDoc = {
            _id: 'prod1',
            price: 100000,
            category: { _id: 'cat1' },
            toObject: function() { return { _id: this._id, price: this.price, category: this.category }; }
        };

        // Mock chain: Promotion.find(). (no populate needed here) and Product.find().populate()
        Promotion.find.mockReturnValue({
            // In controller getProductsWithPromotions, Promotion.find is called without populate
            then: undefined
        });
        // Simpler: make Promotion.find resolve directly
        Promotion.find.mockResolvedValue([promo]);

        Product.find.mockReturnValue({
            populate: jest.fn().mockResolvedValue([productDoc])
        });

        await getProductsWithPromotions(req, res);

        expect(Promotion.find).toHaveBeenCalled();
        expect(Product.find).toHaveBeenCalledWith({ restaurant: restaurantId });
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.any(Array) }));

        const returned = res.json.mock.calls[0][0].data[0];
        // Final price should be reduced by 10%
        expect(returned.promotion).toBeDefined();
        expect(returned.price).toBe(Math.round(100000 - (100000 * 10) / 100));
    });
});
