/**
 * Format price to Vietnamese currency format
 * @param {number} price - Price to format
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
};

/**
 * Format price with custom options
 * @param {number} price - Price to format
 * @param {string} currency - Currency code (default: VND)
 * @param {string} locale - Locale code (default: vi-VN)
 * @returns {string} - Formatted price string
 */
export const formatCurrency = (price, currency = 'VND', locale = 'vi-VN') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
    }).format(price);
};

/**
 * Parse formatted price back to number
 * @param {string} formattedPrice - Formatted price string
 * @returns {number} - Parsed number
 */
export const parsePrice = (formattedPrice) => {
    return parseFloat(formattedPrice.replace(/[^0-9,-]/g, '').replace(',', '.'));
};

/**
 * Calculate discount amount
 * @param {number} originalPrice - Original price
 * @param {number} discountPercent - Discount percentage
 * @returns {number} - Discount amount
 */
export const calculateDiscount = (originalPrice, discountPercent) => {
    return originalPrice * (discountPercent / 100);
};

/**
 * Calculate final price after discount
 * @param {number} originalPrice - Original price
 * @param {number} discountPercent - Discount percentage
 * @returns {number} - Final price
 */
export const calculateFinalPrice = (originalPrice, discountPercent) => {
    return originalPrice - calculateDiscount(originalPrice, discountPercent);
};

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
export const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
};