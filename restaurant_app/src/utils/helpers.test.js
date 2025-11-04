import { describe, it, expect } from 'vitest';
import {
    formatCurrency,
    validateEmail,
    validatePhone,
    truncateText,
    getInitials,
    calculatePercentage,
    formatFileSize,
    isValidImageType,
} from './helpers';

describe('Restaurant helpers', () => {
    describe('formatCurrency', () => {
        it('should format number to VND currency', () => {
            expect(formatCurrency(50000)).toMatch(/50\.?000/);
            expect(formatCurrency(50000)).toContain('₫');
        });

        it('should handle zero', () => {
            expect(formatCurrency(0)).toMatch(/0/);
        });

        it('should handle large numbers', () => {
            expect(formatCurrency(1000000)).toMatch(/1\.?000\.?000/);
        });

        it('should handle decimal numbers', () => {
            expect(formatCurrency(50500.5)).toMatch(/50\.?50[01]/);
        });
    });

    describe('validateEmail', () => {
        it('should validate correct email', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name@domain.co.vn')).toBe(true);
        });

        it('should reject invalid email', () => {
            expect(validateEmail('invalid')).toBe(false);
            expect(validateEmail('test@')).toBe(false);
            expect(validateEmail('@domain.com')).toBe(false);
            expect(validateEmail('test space@domain.com')).toBe(false);
        });

        it('should handle empty input', () => {
            expect(validateEmail('')).toBe(false);
            expect(validateEmail(null)).toBe(false);
            expect(validateEmail(undefined)).toBe(false);
        });
    });

    describe('validatePhone', () => {
        it('should validate correct 10-digit phone', () => {
            expect(validatePhone('0987654321')).toBe(true);
        });

        it('should validate correct 11-digit phone', () => {
            expect(validatePhone('09876543210')).toBe(true);
        });

        it('should reject invalid phone', () => {
            expect(validatePhone('123')).toBe(false);
            expect(validatePhone('098765432')).toBe(false); // 9 digits
            expect(validatePhone('098765432100')).toBe(false); // 12 digits
            expect(validatePhone('098765432a')).toBe(false); // Contains letter
        });

        it('should handle empty input', () => {
            expect(validatePhone('')).toBe(false);
            expect(validatePhone(null)).toBe(false);
            expect(validatePhone(undefined)).toBe(false);
        });
    });

    describe('truncateText', () => {
        it('should truncate long text', () => {
            const longText = 'This is a very long text that should be truncated';
            expect(truncateText(longText, 20)).toBe('This is a very long ...');
        });

        it('should not truncate short text', () => {
            expect(truncateText('Short text', 50)).toBe('Short text');
        });

        it('should handle exact length', () => {
            expect(truncateText('12345', 5)).toBe('12345');
        });

        it('should handle empty text', () => {
            expect(truncateText('', 10)).toBe('');
            expect(truncateText(null, 10)).toBe('');
            expect(truncateText(undefined, 10)).toBe('');
        });

        it('should use default max length', () => {
            const text = 'a'.repeat(60);
            const result = truncateText(text);
            expect(result.length).toBe(53); // 50 + '...'
        });
    });

    describe('getInitials', () => {
        it('should get initials from full name', () => {
            expect(getInitials('John Doe')).toBe('JD');
            expect(getInitials('Jane Mary Smith')).toBe('JM'); // Only takes first 2 initials
        });

        it('should get initial from single name', () => {
            expect(getInitials('John')).toBe('J');
        });

        it('should handle empty name', () => {
            expect(getInitials('')).toBe('?');
            expect(getInitials(null)).toBe('?');
            expect(getInitials(undefined)).toBe('?');
        });

        it('should handle names with multiple spaces', () => {
            expect(getInitials('John  Doe')).toBe('JD');
        });
    });

    describe('calculatePercentage', () => {
        it('should calculate percentage correctly', () => {
            expect(calculatePercentage(50, 100)).toBe('50.0');
            expect(calculatePercentage(1, 3)).toBe('33.3');
        });

        it('should handle zero total', () => {
            expect(calculatePercentage(10, 0)).toBe(0);
        });

        it('should handle null/undefined total', () => {
            expect(calculatePercentage(10, null)).toBe(0);
            expect(calculatePercentage(10, undefined)).toBe(0);
        });

        it('should round to one decimal place', () => {
            expect(calculatePercentage(2, 3)).toBe('66.7');
        });
    });

    describe('formatFileSize', () => {
        it('should format bytes', () => {
            expect(formatFileSize(0)).toBe('0 Bytes');
            expect(formatFileSize(500)).toBe('500 Bytes');
        });

        it('should format kilobytes', () => {
            expect(formatFileSize(1024)).toBe('1 KB');
            expect(formatFileSize(2048)).toBe('2 KB');
        });

        it('should format megabytes', () => {
            expect(formatFileSize(1048576)).toBe('1 MB');
            expect(formatFileSize(5242880)).toBe('5 MB');
        });

        it('should format gigabytes', () => {
            expect(formatFileSize(1073741824)).toBe('1 GB');
        });
    });

    describe('isValidImageType', () => {
        it('should validate correct image types', () => {
            expect(isValidImageType('image/jpeg')).toBe(true);
            expect(isValidImageType('image/png')).toBe(true);
            expect(isValidImageType('image/gif')).toBe(true);
            expect(isValidImageType('image/webp')).toBe(true);
        });

        it('should reject invalid image types', () => {
            expect(isValidImageType('image/svg+xml')).toBe(false);
            expect(isValidImageType('application/pdf')).toBe(false);
            expect(isValidImageType('text/plain')).toBe(false);
            expect(isValidImageType('video/mp4')).toBe(false);
        });

        it('should handle empty input', () => {
            expect(isValidImageType('')).toBe(false);
            expect(isValidImageType(null)).toBe(false);
            expect(isValidImageType(undefined)).toBe(false);
        });
    });
});