/**
 * UNIT TEST: Input Validation
 * Chức năng: Validate dữ liệu input (email, phone, address)
 * Độ quan trọng: ⭐⭐⭐⭐ (Important - security & data integrity)
 */

// Validation utilities
const validators = {

    // Validate email
    isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    },

    // Validate Vietnamese phone number
    isValidPhone(phone) {
        if (!phone || typeof phone !== 'string') return false;

        // Vietnam phone: 10 digits, start with 0
        const phoneRegex = /^0[0-9]{9}$/;
        const cleanPhone = phone.replace(/\s|-/g, ''); // Remove spaces and dashes

        return phoneRegex.test(cleanPhone);
    },

    // Validate coordinates
    isValidCoordinates(lat, lng) {
        if (typeof lat !== 'number' || typeof lng !== 'number') return false;

        // Vietnam coordinates range
        // Lat: 8.5 to 23.5, Lng: 102.0 to 110.0
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    },

    // Validate order items
    validateOrderItems(items) {
        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('Order items must be a non-empty array');
        }

        for (const item of items) {
            if (!item.product) {
                throw new Error('Product ID is required');
            }

            if (!item.quantity || item.quantity <= 0) {
                throw new Error('Quantity must be greater than 0');
            }

            if (item.quantity > 99) {
                throw new Error('Quantity cannot exceed 99');
            }
        }

        return true;
    },

    // Validate delivery info
    validateDeliveryInfo(deliveryInfo) {
        if (!deliveryInfo || typeof deliveryInfo !== 'object') {
            throw new Error('Delivery info is required');
        }

        if (!deliveryInfo.name || deliveryInfo.name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters');
        }

        if (!this.isValidPhone(deliveryInfo.phone)) {
            throw new Error('Invalid phone number');
        }

        if (!deliveryInfo.address || deliveryInfo.address.trim().length < 10) {
            throw new Error('Address must be at least 10 characters');
        }

        return true;
    }
};

describe('✅ Input Validation - UNIT TEST', () => {

    describe('📧 Email Validation', () => {
        test('✅ ACCEPT email hợp lệ', () => {
            expect(validators.isValidEmail('user@example.com')).toBe(true);
            expect(validators.isValidEmail('test.user@gmail.com')).toBe(true);
            expect(validators.isValidEmail('admin@foodfast.vn')).toBe(true);
        });

        test('❌ REJECT email không hợp lệ', () => {
            expect(validators.isValidEmail('invalid')).toBe(false);
            expect(validators.isValidEmail('test@')).toBe(false);
            expect(validators.isValidEmail('@example.com')).toBe(false);
            expect(validators.isValidEmail('test @example.com')).toBe(false);
            expect(validators.isValidEmail('')).toBe(false);
            expect(validators.isValidEmail(null)).toBe(false);
        });
    });

    describe('📱 Phone Validation', () => {
        test('✅ ACCEPT số điện thoại VN hợp lệ', () => {
            expect(validators.isValidPhone('0901234567')).toBe(true);
            expect(validators.isValidPhone('0912345678')).toBe(true);
            expect(validators.isValidPhone('0909 123 456')).toBe(true); // With spaces
            expect(validators.isValidPhone('090-123-4567')).toBe(true); // With dashes
        });

        test('❌ REJECT số điện thoại không hợp lệ', () => {
            expect(validators.isValidPhone('123456789')).toBe(false); // < 10 digits
            expect(validators.isValidPhone('1901234567')).toBe(false); // Not start with 0
            expect(validators.isValidPhone('09012345678')).toBe(false); // > 10 digits
            expect(validators.isValidPhone('')).toBe(false);
            expect(validators.isValidPhone(null)).toBe(false);
        });
    });

    describe('🗺️ Coordinates Validation', () => {
        test('✅ ACCEPT tọa độ hợp lệ', () => {
            expect(validators.isValidCoordinates(10.762622, 106.660172)).toBe(true);
            expect(validators.isValidCoordinates(0, 0)).toBe(true);
            expect(validators.isValidCoordinates(-33.8688, 151.2093)).toBe(true); // Sydney
        });

        test('❌ REJECT tọa độ ngoài phạm vi', () => {
            expect(validators.isValidCoordinates(91, 0)).toBe(false); // Lat > 90
            expect(validators.isValidCoordinates(-91, 0)).toBe(false); // Lat < -90
            expect(validators.isValidCoordinates(0, 181)).toBe(false); // Lng > 180
            expect(validators.isValidCoordinates(0, -181)).toBe(false); // Lng < -180
        });

        test('❌ REJECT kiểu dữ liệu sai', () => {
            expect(validators.isValidCoordinates('10.762', '106.660')).toBe(false);
            expect(validators.isValidCoordinates(null, null)).toBe(false);
        });
    });

    describe('🛒 Order Items Validation', () => {
        test('✅ ACCEPT items hợp lệ', () => {
            const validItems = [
                { product: '507f1f77bcf86cd799439011', quantity: 2 },
                { product: '507f191e810c19729de860ea', quantity: 1 }
            ];

            expect(validators.validateOrderItems(validItems)).toBe(true);
        });

        test('❌ REJECT mảng rỗng', () => {
            expect(() => {
                validators.validateOrderItems([]);
            }).toThrow('Order items must be a non-empty array');
        });

        test('❌ REJECT thiếu product ID', () => {
            const invalidItems = [{ quantity: 2 }];

            expect(() => {
                validators.validateOrderItems(invalidItems);
            }).toThrow('Product ID is required');
        });

        test('❌ REJECT quantity <= 0', () => {
            const invalidItems = [
                { product: '507f1f77bcf86cd799439011', quantity: 0 }
            ];

            expect(() => {
                validators.validateOrderItems(invalidItems);
            }).toThrow('Quantity must be greater than 0');
        });

        test('❌ REJECT quantity > 99', () => {
            const invalidItems = [
                { product: '507f1f77bcf86cd799439011', quantity: 100 }
            ];

            expect(() => {
                validators.validateOrderItems(invalidItems);
            }).toThrow('Quantity cannot exceed 99');
        });
    });

    describe('📦 Delivery Info Validation', () => {
        test('✅ ACCEPT delivery info hợp lệ', () => {
            const validInfo = {
                name: 'Nguyen Van A',
                phone: '0901234567',
                address: '123 Nguyen Hue, Q1, TPHCM'
            };

            expect(validators.validateDeliveryInfo(validInfo)).toBe(true);
        });

        test('❌ REJECT tên quá ngắn', () => {
            const invalidInfo = {
                name: 'A',
                phone: '0901234567',
                address: '123 Nguyen Hue, Q1, TPHCM'
            };

            expect(() => {
                validators.validateDeliveryInfo(invalidInfo);
            }).toThrow('Name must be at least 2 characters');
        });

        test('❌ REJECT số điện thoại không hợp lệ', () => {
            const invalidInfo = {
                name: 'Nguyen Van A',
                phone: '123456',
                address: '123 Nguyen Hue, Q1, TPHCM'
            };

            expect(() => {
                validators.validateDeliveryInfo(invalidInfo);
            }).toThrow('Invalid phone number');
        });

        test('❌ REJECT địa chỉ quá ngắn', () => {
            const invalidInfo = {
                name: 'Nguyen Van A',
                phone: '0901234567',
                address: '123'
            };

            expect(() => {
                validators.validateDeliveryInfo(invalidInfo);
            }).toThrow('Address must be at least 10 characters');
        });

        test('❌ REJECT thiếu thông tin', () => {
            expect(() => {
                validators.validateDeliveryInfo(null);
            }).toThrow('Delivery info is required');
        });
    });
});