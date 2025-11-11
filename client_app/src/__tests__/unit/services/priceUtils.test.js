import { describe, it, expect } from 'vitest';
import {
    formatPrice,
    formatCurrency,
    calculateDiscount,
    calculateFinalPrice,
    formatNumber,
} from '@/services/priceUtils';

describe('Price Utilities', () => {
    describe('formatPrice', () => {
        it('should format price with VND currency', () => {
            expect(formatPrice(50000)).toMatch(/50\.000/);
            expect(formatPrice(50000)).toContain('₫');
            expect(formatPrice(1000000)).toMatch(/1\.000\.000/);
            expect(formatPrice(1000000)).toContain('₫');
            expect(formatPrice(999)).toContain('999');
            expect(formatPrice(999)).toContain('₫');
        });

        it('should handle zero price', () => {
            const result = formatPrice(0);
            expect(result).toContain('0');
            expect(result).toContain('₫');
        });

        it('should handle negative price', () => {
            const result = formatPrice(-5000);
            expect(result).toMatch(/-5\.000/);
            expect(result).toContain('₫');
        });

        it('should round decimal prices', () => {
            expect(formatPrice(50000.5)).toMatch(/50\.001/);
            expect(formatPrice(50000.4)).toMatch(/50\.000/);
        });
    });

    describe('formatCurrency', () => {
        it('should format with default VND currency', () => {
            const result = formatCurrency(100000);
            expect(result).toMatch(/100\.000/);
            expect(result).toContain('₫');
        });

        it('should format with USD currency', () => {
            const result = formatCurrency(100, 'USD', 'en-US');
            expect(result).toContain('$');
            expect(result).toContain('100');
        });

        it('should format with EUR currency', () => {
            const result = formatCurrency(100, 'EUR', 'de-DE');
            expect(result).toContain('€');
            expect(result).toContain('100');
        });
    });

    describe('calculateDiscount', () => {
        it('should calculate discount amount correctly', () => {
            expect(calculateDiscount(100000, 10)).toBe(10000);
            expect(calculateDiscount(50000, 20)).toBe(10000);
            expect(calculateDiscount(1000, 5)).toBe(50);
        });

        it('should handle 0% discount', () => {
            expect(calculateDiscount(100000, 0)).toBe(0);
        });

        it('should handle 100% discount', () => {
            expect(calculateDiscount(100000, 100)).toBe(100000);
        });

        it('should handle decimal discount percentages', () => {
            expect(calculateDiscount(100000, 12.5)).toBe(12500);
        });
    });

    describe('calculateFinalPrice', () => {
        it('should calculate final price after discount', () => {
            expect(calculateFinalPrice(100000, 10)).toBe(90000);
            expect(calculateFinalPrice(50000, 20)).toBe(40000);
            expect(calculateFinalPrice(1000, 5)).toBe(950);
        });

        it('should return original price with 0% discount', () => {
            expect(calculateFinalPrice(100000, 0)).toBe(100000);
        });

        it('should return 0 with 100% discount', () => {
            expect(calculateFinalPrice(100000, 100)).toBe(0);
        });

        it('should handle decimal prices', () => {
            expect(calculateFinalPrice(99.99, 10)).toBeCloseTo(89.991, 2);
        });
    });

    describe('formatNumber', () => {
        it('should format number with thousand separators', () => {
            expect(formatNumber(1000)).toBe('1.000');
            expect(formatNumber(1000000)).toBe('1.000.000');
            expect(formatNumber(123456789)).toBe('123.456.789');
        });

        it('should handle numbers without thousand separators', () => {
            expect(formatNumber(999)).toBe('999');
            expect(formatNumber(0)).toBe('0');
        });

        it('should handle negative numbers', () => {
            expect(formatNumber(-1000)).toBe('-1.000');
        });
    });

    describe('Edge cases', () => {
        it('should handle very large numbers', () => {
            const largeNumber = 999999999999;
            expect(formatPrice(largeNumber)).toContain('999.999.999.999');
        });

        it('should handle very small positive numbers', () => {
            const result1 = formatPrice(0.01);
            expect(result1).toContain('0');
            expect(result1).toContain('₫');

            const result2 = formatPrice(0.99);
            expect(result2).toContain('1');
            expect(result2).toContain('₫');
        });

        it('should handle discount calculations with floating point precision', () => {
            const result = calculateFinalPrice(33.33, 10);
            expect(result).toBeCloseTo(29.997, 2);
        });
    });

    describe('Input validation', () => {
        it('should handle string numbers', () => {
            const result = formatPrice('50000');
            expect(result).toMatch(/50\.000/);
            expect(result).toContain('₫');
        });

        it('should handle NaN gracefully', () => {
            const result = formatPrice(NaN);
            expect(result).toContain('NaN');
            expect(result).toContain('₫');
        });

        it('should handle undefined/null', () => {
            const result1 = formatPrice(undefined);
            expect(result1).toContain('NaN');
            expect(result1).toContain('₫');

            const result2 = formatPrice(null);
            expect(result2).toContain('0');
            expect(result2).toContain('₫');
        });
    });
});