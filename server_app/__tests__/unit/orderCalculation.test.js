/**
 * 🧪 UNIT TEST: Order Calculation
 * Test tính toán đơn hàng (subtotal, discount, delivery fee, total)
 */

describe('💰 Order Calculation Utils', () => {
    /**
     * Tính subtotal của order
     */
    function calculateSubtotal(items) {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    /**
     * Tính discount từ voucher
     */
    function calculateDiscount(subtotal, voucher) {
        if (!voucher) return 0;
        
        if (voucher.discountType === 'percentage') {
            const discount = subtotal * (voucher.discountValue / 100);
            return Math.min(discount, voucher.maxDiscount || Infinity);
        }
        
        return voucher.discountValue; // fixed amount
    }

    /**
     * Tính delivery fee (15,000 VND cố định)
     */
    function calculateDeliveryFee() {
        return 15000;
    }

    /**
     * Tính total cuối cùng
     */
    function calculateTotal(subtotal, discount, deliveryFee) {
        return subtotal - discount + deliveryFee;
    }

    describe('📊 Subtotal Calculation', () => {
        test('✅ Tính subtotal đơn giản', () => {
            const items = [
                { price: 50000, quantity: 2 },
                { price: 30000, quantity: 1 }
            ];
            expect(calculateSubtotal(items)).toBe(130000);
        });

        test('✅ Tính subtotal với nhiều items', () => {
            const items = [
                { price: 25000, quantity: 3 },
                { price: 40000, quantity: 2 },
                { price: 15000, quantity: 4 }
            ];
            expect(calculateSubtotal(items)).toBe(215000);
        });

        test('✅ Tính subtotal với array rỗng', () => {
            expect(calculateSubtotal([])).toBe(0);
        });
    });

    describe('🎫 Discount Calculation', () => {
        test('✅ Discount phần trăm', () => {
            const voucher = { discountType: 'percentage', discountValue: 20 };
            const discount = calculateDiscount(100000, voucher);
            expect(discount).toBe(20000); // 20% of 100k
        });

        test('✅ Discount phần trăm có max', () => {
            const voucher = { 
                discountType: 'percentage', 
                discountValue: 50,
                maxDiscount: 30000 
            };
            const discount = calculateDiscount(100000, voucher);
            expect(discount).toBe(30000); // capped at maxDiscount
        });

        test('✅ Discount fixed amount', () => {
            const voucher = { discountType: 'fixed', discountValue: 25000 };
            const discount = calculateDiscount(100000, voucher);
            expect(discount).toBe(25000);
        });

        test('✅ Không có voucher', () => {
            expect(calculateDiscount(100000, null)).toBe(0);
            expect(calculateDiscount(100000, undefined)).toBe(0);
        });
    });

    describe('🚁 Delivery Fee', () => {
        test('✅ Delivery fee cố định 15k', () => {
            expect(calculateDeliveryFee()).toBe(15000);
        });
    });

    describe('💵 Total Calculation', () => {
        test('✅ Tính total không có discount', () => {
            const total = calculateTotal(100000, 0, 15000);
            expect(total).toBe(115000);
        });

        test('✅ Tính total có discount', () => {
            const total = calculateTotal(100000, 20000, 15000);
            expect(total).toBe(95000);
        });

        test('✅ Flow tính toán hoàn chỉnh', () => {
            const items = [
                { price: 50000, quantity: 2 }, // 100k
                { price: 50000, quantity: 2 }  // 100k
            ];
            const voucher = { discountType: 'percentage', discountValue: 10 }; // 10%
            
            const subtotal = calculateSubtotal(items); // 200k
            const discount = calculateDiscount(subtotal, voucher); // 20k
            const deliveryFee = calculateDeliveryFee(); // 15k
            const total = calculateTotal(subtotal, discount, deliveryFee); // 195k
            
            expect(subtotal).toBe(200000);
            expect(discount).toBe(20000);
            expect(deliveryFee).toBe(15000);
            expect(total).toBe(195000);
        });
    });
});
