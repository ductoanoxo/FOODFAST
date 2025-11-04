/**
 * UNIT TEST: Restaurant Validation
 * Test validation cho restaurant data
 */

const { describe, it, expect } = require('@jest/globals');

// Validation functions
const validateRestaurantName = (name) => {
    if (!name || typeof name !== 'string') return false;
    return name.trim().length >= 3 && name.trim().length <= 100;
};

const validateLocation = (location) => {
    if (!location || !location.coordinates) return false;
    const [lng, lat] = location.coordinates;

    // Vietnam coordinates range
    const isValidLat = lat >= 8.0 && lat <= 23.5;
    const isValidLng = lng >= 102.0 && lng <= 110.0;

    return isValidLat && isValidLng;
};

const validatePhone = (phone) => {
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(phone);
};

const validateOpeningHours = (hours) => {
    if (!hours || !hours.open || !hours.close) return false;

    // Check format HH:MM (accept both 8:00 and 08:00)
    const timeRegex = /^([0-9]|[0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(hours.open) || !timeRegex.test(hours.close)) return false;

    // Check valid hour range (0-23)
    const [openHour] = hours.open.split(':');
    const [closeHour] = hours.close.split(':');
    return parseInt(openHour) <= 23 && parseInt(closeHour) <= 23;
};

const validateRestaurant = (restaurant) => {
    const errors = {};

    if (!validateRestaurantName(restaurant.name)) {
        errors.name = 'Tên nhà hàng phải từ 3-100 ký tự';
    }

    if (!validateLocation(restaurant.location)) {
        errors.location = 'Vị trí không hợp lệ (phải trong phạm vi Việt Nam)';
    }

    if (restaurant.phone && !validatePhone(restaurant.phone)) {
        errors.phone = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)';
    }

    if (restaurant.openingHours && !validateOpeningHours(restaurant.openingHours)) {
        errors.openingHours = 'Giờ mở cửa không hợp lệ (HH:MM)';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

describe('Restaurant Validation - Unit Tests', () => {

    describe('validateRestaurantName', () => {
        it('should accept valid restaurant names', () => {
            expect(validateRestaurantName('Nhà hàng Phở 24')).toBe(true);
            expect(validateRestaurantName('Quán Cơm Tấm Sài Gòn')).toBe(true);
        });

        it('should reject names that are too short', () => {
            expect(validateRestaurantName('AB')).toBe(false);
        });

        it('should reject invalid names', () => {
            expect(validateRestaurantName('')).toBe(false);
            expect(validateRestaurantName(null)).toBe(false);
        });
    });

    describe('validateLocation', () => {
        it('should accept valid Vietnam locations', () => {
            // TP.HCM
            expect(validateLocation({
                type: 'Point',
                coordinates: [106.6297, 10.8231]
            })).toBe(true);

            // Hà Nội
            expect(validateLocation({
                type: 'Point',
                coordinates: [105.8542, 21.0285]
            })).toBe(true);
        });

        it('should reject locations outside Vietnam', () => {
            expect(validateLocation({
                type: 'Point',
                coordinates: [0, 0] // Atlantic Ocean
            })).toBe(false);

            expect(validateLocation({
                type: 'Point',
                coordinates: [150, 50] // Russia
            })).toBe(false);
        });

        it('should reject invalid location format', () => {
            expect(validateLocation(null)).toBe(false);
            expect(validateLocation({})).toBe(false);
        });
    });

    describe('validatePhone', () => {
        it('should accept valid Vietnamese phone numbers', () => {
            expect(validatePhone('0912345678')).toBe(true);
            expect(validatePhone('0987654321')).toBe(true);
        });

        it('should reject invalid phone numbers', () => {
            expect(validatePhone('123456789')).toBe(false);
            expect(validatePhone('09123456789')).toBe(false);
            expect(validatePhone('+84912345678')).toBe(false);
        });
    });

    describe('validateOpeningHours', () => {
        it('should accept valid opening hours', () => {
            expect(validateOpeningHours({ open: '08:00', close: '22:00' })).toBe(true);
            expect(validateOpeningHours({ open: '06:30', close: '23:30' })).toBe(true);
        });

        it('should reject invalid time formats', () => {
            // Missing close time
            expect(validateOpeningHours({ open: '08:00' })).toBe(false);

            // Invalid hour (>23)
            expect(validateOpeningHours({ open: '08:00', close: '25:00' })).toBe(false);

            // Invalid minute (>59)
            expect(validateOpeningHours({ open: '08:00', close: '22:70' })).toBe(false);
        });
    });

    describe('validateRestaurant', () => {
        it('should validate complete restaurant successfully', () => {
            const restaurant = {
                name: 'Nhà hàng Phở Việt',
                location: {
                    type: 'Point',
                    coordinates: [106.6297, 10.8231]
                },
                phone: '0912345678',
                openingHours: {
                    open: '08:00',
                    close: '22:00'
                }
            };

            const result = validateRestaurant(restaurant);
            expect(result.isValid).toBe(true);
            expect(Object.keys(result.errors)).toHaveLength(0);
        });

        it('should return multiple validation errors', () => {
            const restaurant = {
                name: 'AB',
                location: {
                    type: 'Point',
                    coordinates: [0, 0]
                },
                phone: '123',
                openingHours: {
                    open: '08:00',
                    close: '25:00' // Invalid hour
                }
            };

            const result = validateRestaurant(restaurant);
            expect(result.isValid).toBe(false);
            expect(result.errors.name).toBeDefined();
            expect(result.errors.location).toBeDefined();
            expect(result.errors.phone).toBeDefined();
            expect(result.errors.openingHours).toBeDefined();
        });
    });
});