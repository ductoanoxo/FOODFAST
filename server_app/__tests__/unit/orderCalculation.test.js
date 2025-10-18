/**
 * UNIT TEST: Order Calculation (Voucher & Total)
 * Chức năng: Tính tổng tiền đơn hàng với voucher
 * Độ quan trọng: ⭐⭐⭐⭐⭐ (Critical - payment calculation)
 */

// Business logic: Calculate order total with voucher
function calculateOrderTotal(subtotal, deliveryFee, voucher = null) {
    if (subtotal < 0 || deliveryFee < 0) {
        throw new Error('Invalid amount');
    }

    let discountAmount = 0;

    if (voucher) {
        // Validate voucher
        if (!voucher.isActive) {
            throw new Error('Voucher is not active');
        }

        const now = new Date();
        if (now < new Date(voucher.startDate) || now > new Date(voucher.endDate)) {
            throw new Error('Voucher has expired');
        }

        // Check min order
        if (subtotal < voucher.minOrder) {
            throw new Error(`Minimum order is ${voucher.minOrder} VND`);
        }

        // Calculate discount
        if (voucher.discountType === 'percentage') {
            discountAmount = (subtotal * voucher.discountValue) / 100;

            // Apply max discount if exists
            if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
                discountAmount = voucher.maxDiscount;
            }
        } else if (voucher.discountType === 'fixed') {
            discountAmount = voucher.discountValue;
        }
    }

    const total = subtotal + deliveryFee - discountAmount;

    return {
        subtotal,
        deliveryFee,
        discountAmount,
        total: Math.max(0, total) // Không âm
    };
}

describe('💰 Order Calculation - UNIT TEST', () => {

    test('✅ Tính ĐÚNG tổng tiền KHÔNG CÓ voucher', () => {
        const result = calculateOrderTotal(100000, 15000);

        expect(result.subtotal).toBe(100000);
        expect(result.deliveryFee).toBe(15000);
        expect(result.discountAmount).toBe(0);
        expect(result.total).toBe(115000);
    });

    test('✅ Áp dụng voucher PHẦN TRĂM', () => {
        const voucher = {
            isActive: true,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            discountType: 'percentage',
            discountValue: 20, // 20%
            minOrder: 50000,
            maxDiscount: null
        };

        const result = calculateOrderTotal(100000, 15000, voucher);

        expect(result.discountAmount).toBe(20000); // 20% of 100k
        expect(result.total).toBe(95000); // 100k + 15k - 20k
    });

    test('✅ Áp dụng voucher PHẦN TRĂM với MAX DISCOUNT', () => {
        const voucher = {
            isActive: true,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            discountType: 'percentage',
            discountValue: 50, // 50%
            minOrder: 50000,
            maxDiscount: 30000 // Max giảm 30k
        };

        const result = calculateOrderTotal(200000, 15000, voucher);

        // 50% of 200k = 100k, nhưng max là 30k
        expect(result.discountAmount).toBe(30000);
        expect(result.total).toBe(185000); // 200k + 15k - 30k
    });

    test('✅ Áp dụng voucher FIXED (giảm cố định)', () => {
        const voucher = {
            isActive: true,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            discountType: 'fixed',
            discountValue: 25000, // Giảm 25k
            minOrder: 100000
        };

        const result = calculateOrderTotal(150000, 15000, voucher);

        expect(result.discountAmount).toBe(25000);
        expect(result.total).toBe(140000); // 150k + 15k - 25k
    });

    test('❌ REJECT voucher HẾT HẠN', () => {
        const expiredVoucher = {
            isActive: true,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'), // Đã hết hạn
            discountType: 'percentage',
            discountValue: 20,
            minOrder: 0
        };

        expect(() => {
            calculateOrderTotal(100000, 15000, expiredVoucher);
        }).toThrow('Voucher has expired');
    });

    test('❌ REJECT voucher CHƯA BẮT ĐẦU', () => {
        const futureVoucher = {
            isActive: true,
            startDate: new Date('2026-01-01'), // Chưa đến ngày
            endDate: new Date('2026-12-31'),
            discountType: 'percentage',
            discountValue: 20,
            minOrder: 0
        };

        expect(() => {
            calculateOrderTotal(100000, 15000, futureVoucher);
        }).toThrow('Voucher has expired');
    });

    test('❌ REJECT khi ĐƠN HÀNG < MIN ORDER', () => {
        const voucher = {
            isActive: true,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            discountType: 'percentage',
            discountValue: 20,
            minOrder: 200000 // Tối thiểu 200k
        };

        expect(() => {
            calculateOrderTotal(100000, 15000, voucher); // Chỉ 100k
        }).toThrow('Minimum order is 200000 VND');
    });

    test('❌ REJECT voucher KHÔNG ACTIVE', () => {
        const inactiveVoucher = {
            isActive: false, // Bị vô hiệu hóa
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            discountType: 'percentage',
            discountValue: 20,
            minOrder: 0
        };

        expect(() => {
            calculateOrderTotal(100000, 15000, inactiveVoucher);
        }).toThrow('Voucher is not active');
    });

    test('✅ KHÔNG ÂM khi discount > subtotal', () => {
        const voucher = {
            isActive: true,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            discountType: 'fixed',
            discountValue: 200000, // Giảm 200k
            minOrder: 0
        };

        const result = calculateOrderTotal(50000, 15000, voucher);

        // 50k + 15k - 200k = -135k => clamp to 0
        expect(result.total).toBe(0);
    });

    test('❌ REJECT giá trị âm', () => {
        expect(() => {
            calculateOrderTotal(-100, 15000);
        }).toThrow('Invalid amount');

        expect(() => {
            calculateOrderTotal(100000, -15000);
        }).toThrow('Invalid amount');
    });
});