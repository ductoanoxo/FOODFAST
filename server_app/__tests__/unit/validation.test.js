/**
 * 🧪 UNIT TEST: Validation Utils
 * Test các hàm validate input (email, phone, address...)
 */

describe('✅ Input Validation Utils', () => {
    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone validation (Vietnam)
    function isValidPhone(phone) {
        const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    // Password strength
    function isStrongPassword(password) {
        return password && password.length >= 6;
    }

    // Address validation
    function isValidAddress(address) {
        return address && address.trim().length >= 10;
    }

    describe('📧 Email Validation', () => {
        test('✅ Email hợp lệ', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name@domain.co.vn')).toBe(true);
            expect(isValidEmail('admin123@gmail.com')).toBe(true);
        });

        test('❌ Email không hợp lệ', () => {
            expect(isValidEmail('invalid')).toBe(false);
            expect(isValidEmail('no@domain')).toBe(false);
            expect(isValidEmail('@example.com')).toBe(false);
            expect(isValidEmail('user@')).toBe(false);
        });
    });

    describe('📱 Phone Validation', () => {
        test('✅ Số điện thoại Việt Nam hợp lệ', () => {
            expect(isValidPhone('0909999999')).toBe(true);
            expect(isValidPhone('0123456789')).toBe(true);
            expect(isValidPhone('+84909999999')).toBe(true);
        });

        test('❌ Số điện thoại không hợp lệ', () => {
            expect(isValidPhone('123')).toBe(false);
            expect(isValidPhone('abcdefghij')).toBe(false);
            expect(isValidPhone('09099')).toBe(false);
        });

        test('✅ Số điện thoại có khoảng trắng', () => {
            expect(isValidPhone('090 999 9999')).toBe(true);
            expect(isValidPhone('0909 999 999')).toBe(true);
        });
    });

    describe('🔐 Password Validation', () => {
        test('✅ Password đủ mạnh', () => {
            expect(isStrongPassword('123456')).toBe(true);
            expect(isStrongPassword('Password123')).toBe(true);
            expect(isStrongPassword('abcdefgh')).toBe(true);
        });

        test('❌ Password quá yếu', () => {
            expect(isStrongPassword('12345')).toBe(false);
            expect(isStrongPassword('abc')).toBe(false);
            expect(isStrongPassword('')).toBe(false);
        });
    });

    describe('📍 Address Validation', () => {
        test('✅ Địa chỉ hợp lệ', () => {
            expect(isValidAddress('123 Nguyen Hue, District 1, HCMC')).toBe(true);
            expect(isValidAddress('456 Le Loi Street')).toBe(true);
        });

        test('❌ Địa chỉ không hợp lệ', () => {
            expect(isValidAddress('123')).toBe(false);
            expect(isValidAddress('')).toBe(false);
            expect(isValidAddress('   ')).toBe(false);
        });
    });
});
