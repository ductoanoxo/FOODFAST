const Product = require('../../../API/Models/Product');
const Promotion = require('../../../API/Models/Promotion');
const productController = require('../../../API/Controllers/productController');

jest.mock('../../../API/Models/Product');
jest.mock('../../../API/Models/Promotion');

describe('Product Controller - Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
            query: {},
            user: null,
            file: null
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('getProducts', () => {
        it('should return all available products for public access', async() => {
            const mockProducts = [{
                _id: '1',
                name: 'Pizza',
                price: 100000,
                category: { _id: 'cat1', name: 'Italian' },
                restaurant: { _id: 'rest1', name: 'Restaurant 1', image: 'img.jpg', rating: 4.5 },
                toObject: function() { return {...this }; }
            }];

            const mockFind = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockProducts)
            };

            Product.find = jest.fn().mockReturnValue(mockFind);
            Promotion.findOne = jest.fn().mockResolvedValue(null);

            await productController.getProducts(req, res, next);

            expect(Product.find).toHaveBeenCalledWith({ isAvailable: true });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                count: 1,
                data: expect.any(Array)
            });
        });

        it('should filter products by search term', async() => {
            req.query.search = 'pizza';

            const mockFind = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue([])
            };

            Product.find = jest.fn().mockReturnValue(mockFind);
            Promotion.findOne = jest.fn().mockResolvedValue(null);

            await productController.getProducts(req, res, next);

            expect(Product.find).toHaveBeenCalledWith({
                isAvailable: true,
                name: { $regex: 'pizza', $options: 'i' }
            });
        });

        it('should filter by category', async() => {
            req.query.category = 'italian';

            const mockFind = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue([])
            };

            Product.find = jest.fn().mockReturnValue(mockFind);
            Promotion.findOne = jest.fn().mockResolvedValue(null);

            await productController.getProducts(req, res, next);

            expect(Product.find).toHaveBeenCalledWith({
                isAvailable: true,
                category: 'italian'
            });
        });

        it('should filter by price range', async() => {
            req.query.minPrice = '50000';
            req.query.maxPrice = '150000';

            const mockFind = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue([])
            };

            Product.find = jest.fn().mockReturnValue(mockFind);
            Promotion.findOne = jest.fn().mockResolvedValue(null);

            await productController.getProducts(req, res, next);

            expect(Product.find).toHaveBeenCalledWith({
                isAvailable: true,
                price: { $gte: 50000, $lte: 150000 }
            });
        });

        it('should return only restaurant products for restaurant role', async() => {
            req.user = { role: 'restaurant', restaurantId: 'rest123' };

            const mockFind = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue([])
            };

            Product.find = jest.fn().mockReturnValue(mockFind);
            Promotion.findOne = jest.fn().mockResolvedValue(null);

            await productController.getProducts(req, res, next);

            expect(Product.find).toHaveBeenCalledWith({
                restaurant: 'rest123'
            });
        });
    });

    describe('getProductById', () => {
        it('should return product details for valid ID', async() => {
            req.params.id = 'product123';

            const mockProduct = {
                _id: 'product123',
                name: 'Pizza',
                price: 100000,
                category: { _id: 'cat1', name: 'Italian' },
                restaurant: { _id: 'rest1', name: 'Restaurant 1' },
                toObject: function() { return {...this }; }
            };

            const mockPopulateChain = {
                populate: jest.fn().mockResolvedValue(mockProduct)
            };

            Product.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue(mockPopulateChain)
            });

            Promotion.findOne = jest.fn().mockResolvedValue(null);

            await productController.getProductById(req, res, next);

            expect(Product.findById).toHaveBeenCalledWith('product123');
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({ name: 'Pizza' })
                })
            );
        });

        it('should return 404 for non-existent product', async() => {
            req.params.id = 'invalid123';

            const mockPopulateChain = {
                populate: jest.fn().mockResolvedValue(null)
            };

            Product.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue(mockPopulateChain)
            });

            await productController.getProductById(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.message).toContain('Product not found');
        });
    });

    describe('createProduct', () => {
        it('should create product with restaurant ID from user', async() => {
            req.user = { restaurantId: 'rest123' };
            req.body = { name: 'New Pizza', price: 120000, category: 'cat1' };

            const mockProduct = {
                _id: 'newProduct123',
                ...req.body,
                restaurant: 'rest123',
                populate: jest.fn().mockReturnThis()
            };

            Product.create = jest.fn().mockResolvedValue(mockProduct);
            await productController.createProduct(req, res, next);

            expect(Product.create).toHaveBeenCalledWith({
                name: 'New Pizza',
                price: 120000,
                category: 'cat1',
                restaurant: 'rest123'
            });
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should handle image upload from Cloudinary', async() => {
            req.user = { restaurantId: 'rest123' };
            req.body = { name: 'Pizza with Image', price: 100000 };
            req.file = { path: 'https://cloudinary.com/image.jpg' };

            const mockProduct = {
                populate: jest.fn().mockReturnThis()
            };
            Product.create = jest.fn().mockResolvedValue(mockProduct);

            await productController.createProduct(req, res, next);

            expect(Product.create).toHaveBeenCalledWith({
                name: 'Pizza with Image',
                price: 100000,
                restaurant: 'rest123',
                image: 'https://cloudinary.com/image.jpg'
            });
        });

        it('should throw error if restaurantId is missing', async() => {
            req.user = {}; // No restaurantId
            req.body = { name: 'Pizza', price: 100000 };

            await productController.createProduct(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('updateProduct', () => {
        it('should update product successfully', async() => {
            req.params.id = 'product123';
            req.user = { role: 'restaurant', restaurantId: 'rest123' };
            req.body = { name: 'Updated Pizza', price: 150000 };

            const mockProduct = {
                _id: 'product123',
                restaurant: 'rest123',
                name: 'Pizza',
                price: 100000
            };

            const updatedProduct = {
                _id: 'product123',
                name: 'Updated Pizza',
                price: 150000,
                restaurant: 'rest123'
            };

            Product.findById = jest.fn().mockResolvedValue(mockProduct);
            Product.findByIdAndUpdate = jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(updatedProduct)
                })
            });

            await productController.updateProduct(req, res, next);

            expect(Product.findByIdAndUpdate).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.any(Object)
                })
            );
        });

        it('should return 404 for non-existent product', async() => {
            req.params.id = 'invalid123';
            Product.findById = jest.fn().mockResolvedValue(null);

            await productController.updateProduct(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteProduct', () => {
        it('should delete product successfully', async() => {
            req.params.id = 'product123';
            req.user = { role: 'admin' };

            const mockProduct = {
                _id: 'product123',
                deleteOne: jest.fn().mockResolvedValue({})
            };

            Product.findById = jest.fn().mockResolvedValue(mockProduct);

            await productController.deleteProduct(req, res, next);

            expect(mockProduct.deleteOne).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {}
            });
        });

        it('should return 404 for non-existent product', async() => {
            req.params.id = 'invalid123';
            Product.findById = jest.fn().mockResolvedValue(null);

            await productController.deleteProduct(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});