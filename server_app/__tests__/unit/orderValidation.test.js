const { describe, it, expect } = require('@jest/globals');

/**
 * UNIT TEST: Order Validation
 * Test validation logic cho order creation
 */

// Mock validation functions
const validateCustomerInfo = (customerInfo) => {
    const errors = [];

    if (!customerInfo.name || customerInfo.name.trim().length < 2) {
        errors.push('Tên phải có ít nhất 2 ký tự');
    }

    if (!customerInfo.phone || !/^0\d{9}$/.test(customerInfo.phone)) {
        errors.push('Số điện thoại không hợp lệ (phải là 10 số, bắt đầu bằng 0)');
    }

    if (!customerInfo.address || customerInfo.address.trim().length < 10) {
        errors.push('Địa chỉ phải có ít nhất 10 ký tự');
    }

    return errors;
};

const validateOrderItems = (items) => {
    const errors = [];

    if (!items || items.length === 0) {
        errors.push('Đơn hàng phải có ít nhất 1 món');
    }

    items.forEach((item, index) => {
        if (!item.productId) {
            errors.push(`Item ${index + 1}: Thiếu productId`);
        }
        if (!item.quantity || item.quantity <= 0) {
            errors.push(`Item ${index + 1}: Số lượng phải lớn hơn 0`);
        }
        if (item.quantity > 99) {
            errors.push(`Item ${index + 1}: Số lượng không được vượt quá 99`);
        }
    });

    return errors;
};

const validateDeliveryCoordinates = (coordinates) => {
    const errors = [];

    if (!coordinates || !coordinates.lat || !coordinates.lng) {
        errors.push('Thiếu tọa độ giao hàng');
    }

    // Vietnam coordinates range
    if (coordinates.lat < 8.0 || coordinates.lat > 23.5) {
        errors.push('Vĩ độ nằm ngoài phạm vi Việt Nam');
    }

    if (coordinates.lng < 102.0 || coordinates.lng > 110.0) {
        errors.push('Kinh độ nằm ngoài phạm vi Việt Nam');
    }

    return errors;
};

describe('Order Validation - Unit Tests', () => {

    describe('validateCustomerInfo', () => {
        it('should accept valid customer info', () => {
            const validInfo = {
                name: 'Nguyễn Văn A',
                phone: '0912345678',
                address: '123 Nguyễn Huệ, Quận 1, TP.HCM'
            };

            const errors = validateCustomerInfo(validInfo);
            expect(errors).toHaveLength(0);
        });

        it('should reject name too short', () => {
            const invalidInfo = {
                name: 'A',
                phone: '0912345678',
                address: '123 Nguyễn Huệ, Q1'
            };

            const errors = validateCustomerInfo(invalidInfo);
            expect(errors).toContain('Tên phải có ít nhất 2 ký tự');
        });

        it('should reject invalid phone number', () => {
            const invalidInfo = {
                name: 'Nguyễn Văn A',
                phone: '123456', // Quá ngắn
                address: '123 Nguyễn Huệ, Q1'
            };

            const errors = validateCustomerInfo(invalidInfo);
            expect(errors).toContain('Số điện thoại không hợp lệ (phải là 10 số, bắt đầu bằng 0)');
        });

        it('should reject address too short', () => {
            const invalidInfo = {
                name: 'Nguyễn Văn A',
                phone: '0912345678',
                address: '123 Q1' // Quá ngắn
            };

            const errors = validateCustomerInfo(invalidInfo);
            expect(errors).toContain('Địa chỉ phải có ít nhất 10 ký tự');
        });
    });

    describe('validateOrderItems', () => {
        it('should accept valid order items', () => {
            const validItems = [
                { productId: 'prod1', quantity: 2 },
                { productId: 'prod2', quantity: 1 }
            ];

            const errors = validateOrderItems(validItems);
            expect(errors).toHaveLength(0);
        });

        it('should reject empty order', () => {
            const errors = validateOrderItems([]);
            expect(errors).toContain('Đơn hàng phải có ít nhất 1 món');
        });

        it('should reject item without productId', () => {
            const invalidItems = [
                { quantity: 2 } // Missing productId
            ];

            const errors = validateOrderItems(invalidItems);
            expect(errors).toContain('Item 1: Thiếu productId');
        });

        it('should reject item with zero quantity', () => {
            const invalidItems = [
                { productId: 'prod1', quantity: 0 }
            ];

            const errors = validateOrderItems(invalidItems);
            expect(errors).toContain('Item 1: Số lượng phải lớn hơn 0');
        });

        it('should reject item with quantity over 99', () => {
            const invalidItems = [
                { productId: 'prod1', quantity: 100 }
            ];

            const errors = validateOrderItems(invalidItems);
            expect(errors).toContain('Item 1: Số lượng không được vượt quá 99');
        });
    });

    describe('validateDeliveryCoordinates', () => {
        it('should accept valid Vietnam coordinates', () => {
            const validCoords = {
                lat: 10.8231, // TP.HCM
                lng: 106.6297
            };

            const errors = validateDeliveryCoordinates(validCoords);
            expect(errors).toHaveLength(0);
        });

        it('should reject coordinates outside Vietnam', () => {
            const invalidCoords = {
                lat: 50.0, // Quá xa về phía Bắc
                lng: 106.0
            };

            const errors = validateDeliveryCoordinates(invalidCoords);
            expect(errors).toContain('Vĩ độ nằm ngoài phạm vi Việt Nam');
        });

        it('should reject missing coordinates', () => {
            const invalidCoords = {
                lat: null,
                lng: null
            };

            const errors = validateDeliveryCoordinates(invalidCoords);
            expect(errors).toContain('Thiếu tọa độ giao hàng');
        });
    });
});

// Export for use in actual code
module.exports = {
    validateCustomerInfo,
    validateOrderItems,
    validateDeliveryCoordinates
};