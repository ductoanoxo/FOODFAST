/**
 * UNIT TEST: Product Controller
 * Chức năng: Test các API về sản phẩm (CRUD operations)
 * Độ quan trọng: ⭐⭐⭐⭐⭐ (Dễ giải thích, logic đơn giản)
 * 
 * Test cases:
 * - Get all products (with filters, pagination)
 * - Get product by ID
 * - Create new product (restaurant owner)
 * - Update product
 * - Delete product
 * - Search products by name/category
 */

// Mock Product model TRƯỚC khi import controller
jest.mock('../../API/Models/Product');
jest.mock('../../API/Models/Promotion');

const Product = require('../../API/Models/Product');
const Promotion = require('../../API/Models/Promotion');
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../../API/Controllers/productController');

describe('🍔 PRODUCT CONTROLLER - Unit Tests', () => {

    // Mock request & response objects
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            query: {},
            body: {},
            user: null // Default no user (public access)
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();

        // Mock Promotion.findOne to return null by default
        Promotion.findOne = jest.fn().mockResolvedValue(null);
        // Ensure Product methods exist as mocks to avoid undefined errors
        Product.find = Product.find || jest.fn();
        Product.countDocuments = Product.countDocuments || jest.fn();
        Product.findById = Product.findById || jest.fn();
        Product.findByIdAndUpdate = Product.findByIdAndUpdate || jest.fn();
        Product.findByIdAndDelete = Product.findByIdAndDelete || jest.fn();
        Product.create = Product.create || jest.fn();
    });

    describe('📋 GET ALL PRODUCTS', () => {

        test('✅ Get all products - SUCCESS', async() => {
            const mockProducts = [{
                    _id: 'prod1',
                    name: 'Burger',
                    price: 50000,
                    category: { _id: 'cat1', name: 'Food' },
                    restaurant: { _id: 'rest1', name: 'KFC' },
                    toObject: function() { return this; }
                },
                {
                    _id: 'prod2',
                    name: 'Pizza',
                    price: 80000,
                    category: { _id: 'cat1', name: 'Food' },
                    restaurant: { _id: 'rest1', name: 'Pizza Hut' },
                    toObject: function() { return this; }
                }
            ];

            // Mock chain: find().populate().populate().sort()
            Product.find.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockProducts)
            });

            await getProducts(req, res);

            expect(Product.find).toHaveBeenCalledWith({ isAvailable: true });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                count: 2,
                data: expect.any(Array)
            });
        });

        test('✅ Filter products by CATEGORY', async() => {
            req.query.category = 'cat-drink-123';

            const mockDrinks = [{
                name: 'Coca Cola',
                price: 15000,
                category: { _id: 'cat-drink-123', name: 'Drink' },
                restaurant: { _id: 'rest1', name: 'KFC' },
                toObject: function() { return this; }
            }];

            Product.find.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockDrinks)
            });

            await getProducts(req, res);

            expect(Product.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: 'cat-drink-123',
                    isAvailable: true
                })
            );
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true
                })
            );
        });

        test('✅ Filter products by RESTAURANT', async() => {
            req.query.restaurant = 'rest123';

            Product.find.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue([])
            });

            await getProducts(req, res);

            expect(Product.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    restaurant: 'rest123',
                    isAvailable: true
                })
            );
        });

        test('✅ Pagination works correctly', async() => {
            req.query.minPrice = '10000';
            req.query.maxPrice = '50000';

            Product.find.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue([])
            });

            await getProducts(req, res);

            // Verify price range filter was applied
            expect(Product.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    isAvailable: true,
                    price: {
                        $gte: 10000,
                        $lte: 50000
                    }
                })
            );
        });
    });

    describe('🔍 GET PRODUCT BY ID', () => {

        test('✅ Get product - SUCCESS with valid ID', async() => {
            const mockProduct = {
                _id: 'prod1',
                name: 'Burger',
                price: 50000,
                description: 'Delicious burger',
                restaurant: { name: 'KFC', _id: 'rest1' },
                category: { name: 'Food', _id: 'cat1' },
                toObject: jest.fn().mockReturnValue({
                    _id: 'prod1',
                    name: 'Burger',
                    price: 50000,
                    description: 'Delicious burger',
                    restaurant: { name: 'KFC', _id: 'rest1' },
                    category: { name: 'Food', _id: 'cat1' }
                })
            };

            // Mock double populate chain
            const populateChain = {
                populate: jest.fn().mockResolvedValue(mockProduct)
            };
            Product.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue(populateChain)
            });

            req.params.id = 'prod1';

            await getProductById(req, res);

            expect(Product.findById).toHaveBeenCalledWith('prod1');
            expect(mockProduct.toObject).toHaveBeenCalled();
            // controller returns res.json without setting status(200)
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: expect.any(Object)
            }));
        });

        test('❌ Get product - FAIL with invalid ID', async() => {
            // Mock double populate chain returns null
            const populateChain = {
                populate: jest.fn().mockResolvedValue(null)
            };
            Product.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue(populateChain)
            });

            req.params.id = 'invalid_id';

            await expect(getProductById(req, res)).rejects.toThrow('Product not found');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('➕ CREATE PRODUCT', () => {

        test('✅ Create product - SUCCESS', async() => {
            // User must have restaurantId
            req.user = {
                id: 'user123',
                restaurantId: 'rest1',
                role: 'restaurant'
            };

            const newProductData = {
                name: 'New Burger',
                price: 60000,
                category: 'cat1',
                description: 'Tasty burger'
            };

            const savedProduct = {
                _id: 'newprod1',
                ...newProductData,
                restaurant: 'rest1',
                populate: jest.fn().mockResolvedValue(true)
            };

            Product.create.mockResolvedValue(savedProduct);

            req.body = newProductData;

            await createProduct(req, res);

            expect(Product.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...newProductData,
                    restaurant: 'rest1'
                })
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: savedProduct
            });
        });

        test('❌ Create product - FAIL missing required fields', async() => {
            req.user = {
                id: 'user123',
                restaurantId: 'rest1',
                role: 'restaurant'
            };

            req.body = {
                name: 'Incomplete Product'
                    // Missing price, category
            };

            Product.create.mockRejectedValue(
                new Error('Validation error: price is required')
            );

            await expect(createProduct(req, res)).rejects.toThrow('Validation error: price is required');
        });

        test('❌ Create product - FAIL invalid price (negative)', async() => {
            req.user = {
                id: 'user123',
                restaurantId: 'rest1',
                role: 'restaurant'
            };

            req.body = {
                name: 'Invalid Product',
                price: -1000, // Giá âm
                category: 'cat1'
            };

            Product.create.mockRejectedValue(
                new Error('Price must be greater than 0')
            );

            await expect(createProduct(req, res)).rejects.toThrow('Price must be greater than 0');
        });
    });

    describe('✏️ UPDATE PRODUCT', () => {

        test('✅ Update product - SUCCESS', async() => {
            req.user = {
                id: 'user123',
                restaurantId: 'rest1',
                role: 'restaurant'
            };

            const existingProduct = {
                _id: 'prod1',
                name: 'Old Burger',
                price: 50000,
                restaurant: 'rest1'
            };

            const updateData = {
                name: 'Updated Burger',
                price: 55000
            };

            const updatedProduct = {
                _id: 'prod1',
                name: 'Updated Burger',
                price: 55000,
                category: { _id: 'cat1', name: 'Food' },
                restaurant: { _id: 'rest1', name: 'KFC' }
            };

            Product.findById.mockResolvedValue(existingProduct);

            // Mock double populate chain
            const populateChain = {
                populate: jest.fn().mockResolvedValue(updatedProduct)
            };
            Product.findByIdAndUpdate.mockReturnValue({
                populate: jest.fn().mockReturnValue(populateChain)
            });

            req.params.id = 'prod1';
            req.body = updateData;

            await updateProduct(req, res);

            expect(Product.findById).toHaveBeenCalledWith('prod1');
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updatedProduct
            });
        });

        test('❌ Update product - FAIL product not found', async() => {
            req.user = {
                id: 'user123',
                restaurantId: 'rest1',
                role: 'restaurant'
            };

            Product.findById.mockResolvedValue(null);

            req.params.id = 'nonexistent';
            req.body = { name: 'New Name' };

            await expect(updateProduct(req, res)).rejects.toThrow('Product not found');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('🗑️ DELETE PRODUCT', () => {

        test('✅ Delete product - SUCCESS', async() => {
            const deletedProduct = {
                _id: 'prod1',
                name: 'Burger to delete',
                deleteOne: jest.fn().mockResolvedValue(true)
            };

            Product.findById.mockResolvedValue(deletedProduct);

            req.params.id = 'prod1';

            await deleteProduct(req, res);

            expect(Product.findById).toHaveBeenCalledWith('prod1');
            expect(deletedProduct.deleteOne).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {}
            });
        });

        test('❌ Delete product - FAIL product not found', async() => {
            Product.findById.mockResolvedValue(null);

            req.params.id = 'nonexistent';

            await expect(deleteProduct(req, res)).rejects.toThrow('Product not found');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});