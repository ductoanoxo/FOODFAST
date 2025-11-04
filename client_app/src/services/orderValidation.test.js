import { describe, it, expect } from 'vitest';

/**
 * UNIT TEST: Order Form Validation
 * Test validation cho form đặt hàng
 */

// Validation functions
export const validatePhone = (phone) => {
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(phone);
};

export const validateAddress = (address) => {
    if (!address) return false;
    return address.trim().length >= 10;
};

export const validateDeliveryCoordinates = (coordinates) => {
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
        return false;
    }

    // Vietnam coordinates range
    const isValidLat = coordinates.lat >= 8.0 && coordinates.lat <= 23.5;
    const isValidLng = coordinates.lng >= 102.0 && coordinates.lng <= 110.0;

    return isValidLat && isValidLng;
};

export const validateName = (name) => {
    if (!name) return false;
    return name.trim().length >= 2;
};

export const validateOrderForm = (formData) => {
    const errors = {};

    if (!validateName(formData.name)) {
        errors.name = 'Tên phải có ít nhất 2 ký tự';
    }

    if (!validatePhone(formData.phone)) {
        errors.phone = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)';
    }

    if (!validateAddress(formData.address)) {
        errors.address = 'Địa chỉ phải có ít nhất 10 ký tự';
    }

    if (!validateDeliveryCoordinates(formData.deliveryLocation)) {
        errors.deliveryLocation = 'Vị trí giao hàng không hợp lệ';
    }

    if (!formData.paymentMethod) {
        errors.paymentMethod = 'Vui lòng chọn phương thức thanh toán';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

describe('Order Form Validation - Unit Tests', () => {

    describe('validatePhone', () => {
        it('should accept valid Vietnamese phone number', () => {
            expect(validatePhone('0912345678')).toBe(true);
            expect(validatePhone('0987654321')).toBe(true);
            expect(validatePhone('0123456789')).toBe(true);
        });

        it('should reject invalid phone numbers', () => {
            expect(validatePhone('123456789')).toBe(false); // Không bắt đầu bằng 0
            expect(validatePhone('091234567')).toBe(false); // Chỉ 9 số
            expect(validatePhone('09123456789')).toBe(false); // 11 số
            expect(validatePhone('0912-345-678')).toBe(false); // Có ký tự đặc biệt
            expect(validatePhone(null)).toBe(false);
            expect(validatePhone('')).toBe(false);
        });
    });

    describe('validateAddress', () => {
        it('should accept valid address', () => {
            expect(validateAddress('123 Nguyễn Huệ, Q1')).toBe(true);
            expect(validateAddress('456 Lê Lợi, Quận 1, TP.HCM')).toBe(true);
        });

        it('should reject invalid address', () => {
            expect(validateAddress('123 Q1')).toBe(false); // Quá ngắn
            expect(validateAddress('   ')).toBe(false); // Chỉ có spaces
            expect(validateAddress(null)).toBe(false);
            expect(validateAddress('')).toBe(false);
        });
    });

    describe('validateDeliveryCoordinates', () => {
        it('should accept valid Vietnam coordinates', () => {
            // TP.HCM
            expect(validateDeliveryCoordinates({
                lat: 10.8231,
                lng: 106.6297
            })).toBe(true);

            // Hà Nội
            expect(validateDeliveryCoordinates({
                lat: 21.0285,
                lng: 105.8542
            })).toBe(true);

            // Đà Nẵng
            expect(validateDeliveryCoordinates({
                lat: 16.0544,
                lng: 108.2022
            })).toBe(true);
        });

        it('should reject invalid coordinates', () => {
            // Outside Vietnam
            expect(validateDeliveryCoordinates({
                lat: 50.0,
                lng: 106.0
            })).toBe(false);

            // Missing lat
            expect(validateDeliveryCoordinates({
                lng: 106.6297
            })).toBe(false);

            // Missing lng
            expect(validateDeliveryCoordinates({
                lat: 10.8231
            })).toBe(false);

            // Null
            expect(validateDeliveryCoordinates(null)).toBe(false);
        });
    });

    describe('validateName', () => {
        it('should accept valid name', () => {
            expect(validateName('Nguyễn Văn A')).toBe(true);
            expect(validateName('AB')).toBe(true);
        });

        it('should reject invalid name', () => {
            expect(validateName('A')).toBe(false); // Quá ngắn
            expect(validateName('  ')).toBe(false); // Chỉ có spaces
            expect(validateName(null)).toBe(false);
            expect(validateName('')).toBe(false);
        });
    });

    describe('validateOrderForm', () => {
        it('should validate complete form correctly', () => {
            const validForm = {
                name: 'Nguyễn Văn A',
                phone: '0912345678',
                address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
                deliveryLocation: { lat: 10.8231, lng: 106.6297 },
                paymentMethod: 'COD',
            };

            const result = validateOrderForm(validForm);

            expect(result.isValid).toBe(true);
            expect(Object.keys(result.errors)).toHaveLength(0);
        });

        it('should return all validation errors', () => {
            const invalidForm = {
                name: 'A',
                phone: '123',
                address: '123',
                deliveryLocation: { lat: 50, lng: 200 },
                paymentMethod: null,
            };

            const result = validateOrderForm(invalidForm);

            expect(result.isValid).toBe(false);
            expect(result.errors.name).toBeDefined();
            expect(result.errors.phone).toBeDefined();
            expect(result.errors.address).toBeDefined();
            expect(result.errors.deliveryLocation).toBeDefined();
            expect(result.errors.paymentMethod).toBeDefined();
        });

        it('should return specific error messages', () => {
            const invalidForm = {
                name: '',
                phone: '123',
                address: '',
                deliveryLocation: null,
                paymentMethod: null,
            };

            const result = validateOrderForm(invalidForm);

            expect(result.errors.name).toBe('Tên phải có ít nhất 2 ký tự');
            expect(result.errors.phone).toBe('Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)');
            expect(result.errors.address).toBe('Địa chỉ phải có ít nhất 10 ký tự');
            expect(result.errors.deliveryLocation).toBe('Vị trí giao hàng không hợp lệ');
            expect(result.errors.paymentMethod).toBe('Vui lòng chọn phương thức thanh toán');
        });
    });
});