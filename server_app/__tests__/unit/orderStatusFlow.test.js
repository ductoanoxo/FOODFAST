const { describe, it, expect } = require('@jest/globals');

/**
 * UNIT TEST: Order Status Flow
 * Test transitions giữa các trạng thái order
 */

const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    DELIVERING: 'delivering',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

// Valid status transitions
const VALID_TRANSITIONS = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['delivering'],
    delivering: ['delivered'],
    delivered: [],
    cancelled: []
};

const canTransitionTo = (currentStatus, newStatus) => {
    if (!VALID_TRANSITIONS[currentStatus]) {
        throw new Error(`Trạng thái không hợp lệ: ${currentStatus}`);
    }

    return VALID_TRANSITIONS[currentStatus].includes(newStatus);
};

const updateOrderStatus = (order, newStatus) => {
    if (!canTransitionTo(order.status, newStatus)) {
        throw new Error(`Không thể chuyển từ ${order.status} sang ${newStatus}`);
    }

    return {
        ...order,
        status: newStatus,
        updatedAt: new Date()
    };
};

describe('Order Status Flow - Unit Tests', () => {

    describe('Status Transitions', () => {
        it('should allow pending → confirmed', () => {
            const order = { id: '1', status: ORDER_STATUS.PENDING };
            const result = canTransitionTo(order.status, ORDER_STATUS.CONFIRMED);
            expect(result).toBe(true);
        });

        it('should allow confirmed → preparing', () => {
            const order = { id: '1', status: ORDER_STATUS.CONFIRMED };
            const result = canTransitionTo(order.status, ORDER_STATUS.PREPARING);
            expect(result).toBe(true);
        });

        it('should allow preparing → ready', () => {
            const order = { id: '1', status: ORDER_STATUS.PREPARING };
            const result = canTransitionTo(order.status, ORDER_STATUS.READY);
            expect(result).toBe(true);
        });

        it('should allow ready → delivering', () => {
            const order = { id: '1', status: ORDER_STATUS.READY };
            const result = canTransitionTo(order.status, ORDER_STATUS.DELIVERING);
            expect(result).toBe(true);
        });

        it('should allow delivering → delivered', () => {
            const order = { id: '1', status: ORDER_STATUS.DELIVERING };
            const result = canTransitionTo(order.status, ORDER_STATUS.DELIVERED);
            expect(result).toBe(true);
        });
    });

    describe('Invalid Transitions', () => {
        it('should NOT allow pending → delivering (skip steps)', () => {
            const order = { id: '1', status: ORDER_STATUS.PENDING };
            const result = canTransitionTo(order.status, ORDER_STATUS.DELIVERING);
            expect(result).toBe(false);
        });

        it('should NOT allow delivered → preparing (backward)', () => {
            const order = { id: '1', status: ORDER_STATUS.DELIVERED };
            const result = canTransitionTo(order.status, ORDER_STATUS.PREPARING);
            expect(result).toBe(false);
        });

        it('should NOT allow cancelled → confirmed (after cancellation)', () => {
            const order = { id: '1', status: ORDER_STATUS.CANCELLED };
            const result = canTransitionTo(order.status, ORDER_STATUS.CONFIRMED);
            expect(result).toBe(false);
        });
    });

    describe('updateOrderStatus', () => {
        it('should update status successfully', () => {
            const order = {
                id: '1',
                status: ORDER_STATUS.PENDING,
                createdAt: new Date()
            };

            const updated = updateOrderStatus(order, ORDER_STATUS.CONFIRMED);

            expect(updated.status).toBe(ORDER_STATUS.CONFIRMED);
            expect(updated.updatedAt).toBeDefined();
        });

        it('should throw error for invalid transition', () => {
            const order = {
                id: '1',
                status: ORDER_STATUS.PENDING
            };

            expect(() => {
                updateOrderStatus(order, ORDER_STATUS.DELIVERING);
            }).toThrow('Không thể chuyển từ pending sang delivering');
        });

        it('should allow cancellation from any active status', () => {
            const statuses = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING];

            statuses.forEach(status => {
                const result = canTransitionTo(status, ORDER_STATUS.CANCELLED);
                expect(result).toBe(true);
            });
        });

        it('should NOT allow status change after delivered', () => {
            const validTransitions = VALID_TRANSITIONS[ORDER_STATUS.DELIVERED];

            expect(validTransitions).toHaveLength(0);
        });
    });
});

module.exports = {
    ORDER_STATUS,
    canTransitionTo,
    updateOrderStatus
};