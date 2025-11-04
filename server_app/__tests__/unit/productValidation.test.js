/**
 * UNIT TEST: Product Validation
 * Test validation cho product data
 */

const { describe, it, expect } = require('@jest/globals');

// Validation functions
const validateProductName = (name) => {
    if (!name || typeof name !== 'string') return false;
    return name.trim().length >= 3 && name.trim().length <= 100;
};

const validatePrice = (price) => {
    if (typeof price !== 'number') return false;
    return price >= 0 && price <= 10000000; // Max 10 triệu VND
};

const validateCategory = (category) => {
    const validCategories = ['food', 'drink', 'snack', 'dessert', 'combo'];
    return validCategories.includes(category);
};

const validateImage = (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== 'string') return false;
    // Check if valid URL format
    try {
        new URL(imageUrl);
        return true;
    } catch {
        return false;
    }
};

const validateStock = (stock) => {
    if (typeof stock !== 'number') return false;
    return Number.isInteger(stock) && stock >= 0;
};

const validateProduct = (product) => {
    const errors = {};

    if (!validateProductName(product.name)) {
        errors.name = 'Tên sản phẩm phải từ 3-100 ký tự';
    }

    if (!validatePrice(product.price)) {
        errors.price = 'Giá phải từ 0-10,000,000 VND';
    }

    if (product.category && !validateCategory(product.category)) {
        errors.category = 'Category không hợp lệ';
    }

    if (product.image && !validateImage(product.image)) {
        errors.image = 'URL hình ảnh không hợp lệ';
    }

    if (product.stock !== undefined && !validateStock(product.stock)) {
        errors.stock = 'Số lượng phải là số nguyên >= 0';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

describe('Product Validation - Unit Tests', () => {

    describe('validateProductName', () => {
        it('should accept valid product names', () => {
            expect(validateProductName('Phở Bò')).toBe(true);
            expect(validateProductName('Cơm Tấm Sườn Bì Chả')).toBe(true);
            expect(validateProductName('Bánh Mì')).toBe(true);
        });

        it('should reject names that are too short', () => {
            expect(validateProductName('AB')).toBe(false);
            expect(validateProductName('A')).toBe(false);
        });

        it('should reject names that are too long', () => {
            const longName = 'A'.repeat(101);
            expect(validateProductName(longName)).toBe(false);
        });

        it('should reject non-string values', () => {
            expect(validateProductName(123)).toBe(false);
            expect(validateProductName(null)).toBe(false);
            expect(validateProductName(undefined)).toBe(false);
        });
    });

    describe('validatePrice', () => {
        it('should accept valid prices', () => {
            expect(validatePrice(0)).toBe(true);
            expect(validatePrice(50000)).toBe(true);
            expect(validatePrice(1000000)).toBe(true);
            expect(validatePrice(9999999)).toBe(true);
        });

        it('should reject negative prices', () => {
            expect(validatePrice(-1)).toBe(false);
            expect(validatePrice(-50000)).toBe(false);
        });

        it('should reject prices exceeding limit', () => {
            expect(validatePrice(10000001)).toBe(false);
            expect(validatePrice(50000000)).toBe(false);
        });

        it('should reject non-numeric values', () => {
            expect(validatePrice('50000')).toBe(false);
            expect(validatePrice(null)).toBe(false);
        });
    });

    describe('validateCategory', () => {
        it('should accept valid categories', () => {
            expect(validateCategory('food')).toBe(true);
            expect(validateCategory('drink')).toBe(true);
            expect(validateCategory('snack')).toBe(true);
            expect(validateCategory('dessert')).toBe(true);
            expect(validateCategory('combo')).toBe(true);
        });

        it('should reject invalid categories', () => {
            expect(validateCategory('invalid')).toBe(false);
            expect(validateCategory('FOOD')).toBe(false);
            expect(validateCategory('')).toBe(false);
        });
    });

    describe('validateImage', () => {
        it('should accept valid URLs', () => {
            expect(validateImage('https://example.com/image.jpg')).toBe(true);
            expect(validateImage('http://cdn.example.com/food/pho.png')).toBe(true);
        });

        it('should reject invalid URLs', () => {
            expect(validateImage('not-a-url')).toBe(false);
            expect(validateImage('example.com/image.jpg')).toBe(false);
            expect(validateImage('')).toBe(false);
            expect(validateImage(null)).toBe(false);
        });
    });

    describe('validateStock', () => {
        it('should accept valid stock numbers', () => {
            expect(validateStock(0)).toBe(true);
            expect(validateStock(10)).toBe(true);
            expect(validateStock(1000)).toBe(true);
        });

        it('should reject negative stock', () => {
            expect(validateStock(-1)).toBe(false);
            expect(validateStock(-10)).toBe(false);
        });

        it('should reject decimal numbers', () => {
            expect(validateStock(10.5)).toBe(false);
            expect(validateStock(1.99)).toBe(false);
        });

        it('should reject non-numeric values', () => {
            expect(validateStock('10')).toBe(false);
            expect(validateStock(null)).toBe(false);
        });
    });

    describe('validateProduct', () => {
        it('should validate complete product successfully', () => {
            const product = {
                name: 'Phở Bò Tái',
                price: 50000,
                category: 'food',
                image: 'https://example.com/pho.jpg',
                stock: 100,
            };

            const result = validateProduct(product);
            expect(result.isValid).toBe(true);
            expect(Object.keys(result.errors)).toHaveLength(0);
        });

        it('should return all validation errors', () => {
            const product = {
                name: 'AB',
                price: -1000,
                category: 'invalid',
                image: 'not-a-url',
                stock: -5,
            };

            const result = validateProduct(product);
            expect(result.isValid).toBe(false);
            expect(result.errors.name).toBeDefined();
            expect(result.errors.price).toBeDefined();
            expect(result.errors.category).toBeDefined();
            expect(result.errors.image).toBeDefined();
            expect(result.errors.stock).toBeDefined();
        });

        it('should validate minimal product (only required fields)', () => {
            const product = {
                name: 'Cơm Tấm',
                price: 35000,
            };

            const result = validateProduct(product);
            expect(result.isValid).toBe(true);
        });
    });
});