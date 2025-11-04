import { describe, it, expect, beforeEach } from 'vitest';
import orderReducer, {
    setOrders,
    setCurrentOrder,
    setLoading,
    setError,
    setTrackingData,
    updateOrderStatus,
} from '@/redux/slices/orderSlice';

/**
 * UNIT TEST: Order Slice
 * Test Redux order management
 */

describe('Order Slice - Unit Tests', () => {
    let initialState;

    beforeEach(() => {
        initialState = {
            orders: [],
            currentOrder: null,
            loading: false,
            error: null,
            trackingData: null,
        };
    });

    describe('setOrders', () => {
        it('should set orders list', () => {
            const mockOrders = [
                { _id: '1', status: 'pending', totalAmount: 100000 },
                { _id: '2', status: 'delivered', totalAmount: 150000 },
            ];

            const state = orderReducer(initialState, setOrders(mockOrders));

            expect(state.orders).toHaveLength(2);
            expect(state.orders).toEqual(mockOrders);
        });
    });

    describe('setCurrentOrder', () => {
        it('should set current order', () => {
            const mockOrder = {
                _id: '1',
                status: 'pending',
                items: [{ productId: 'prod1', quantity: 2 }],
                totalAmount: 100000,
            };

            const state = orderReducer(initialState, setCurrentOrder(mockOrder));

            expect(state.currentOrder).toEqual(mockOrder);
            expect(state.currentOrder._id).toBe('1');
        });
    });

    describe('setLoading', () => {
        it('should set loading to true', () => {
            const state = orderReducer(initialState, setLoading(true));
            expect(state.loading).toBe(true);
        });

        it('should set loading to false', () => {
            const stateWithLoading = {...initialState, loading: true };
            const state = orderReducer(stateWithLoading, setLoading(false));
            expect(state.loading).toBe(false);
        });
    });

    describe('setError', () => {
        it('should set error message', () => {
            const errorMessage = 'Failed to create order';
            const state = orderReducer(initialState, setError(errorMessage));

            expect(state.error).toBe(errorMessage);
        });

        it('should clear error', () => {
            const stateWithError = {...initialState, error: 'Some error' };
            const state = orderReducer(stateWithError, setError(null));

            expect(state.error).toBeNull();
        });
    });

    describe('setTrackingData', () => {
        it('should set tracking data', () => {
            const trackingData = {
                orderId: '1',
                droneLocation: { lat: 10.8231, lng: 106.6297 },
                estimatedTime: 15,
            };

            const state = orderReducer(initialState, setTrackingData(trackingData));

            expect(state.trackingData).toEqual(trackingData);
            expect(state.trackingData.orderId).toBe('1');
        });
    });

    describe('updateOrderStatus', () => {
        it('should update order status in orders list', () => {
            const stateWithOrders = {
                ...initialState,
                orders: [
                    { _id: '1', status: 'pending', totalAmount: 100000 },
                    { _id: '2', status: 'confirmed', totalAmount: 150000 },
                ],
            };

            const state = orderReducer(
                stateWithOrders,
                updateOrderStatus({ orderId: '1', status: 'confirmed' })
            );

            expect(state.orders[0].status).toBe('confirmed');
            expect(state.orders[1].status).toBe('confirmed'); // Unchanged
        });

        it('should update current order status', () => {
            const stateWithCurrentOrder = {
                ...initialState,
                currentOrder: { _id: '1', status: 'pending', totalAmount: 100000 },
            };

            const state = orderReducer(
                stateWithCurrentOrder,
                updateOrderStatus({ orderId: '1', status: 'preparing' })
            );

            expect(state.currentOrder.status).toBe('preparing');
        });

        it('should update both orders list and current order', () => {
            const stateWithBoth = {
                ...initialState,
                orders: [
                    { _id: '1', status: 'pending', totalAmount: 100000 },
                ],
                currentOrder: { _id: '1', status: 'pending', totalAmount: 100000 },
            };

            const state = orderReducer(
                stateWithBoth,
                updateOrderStatus({ orderId: '1', status: 'delivering' })
            );

            expect(state.orders[0].status).toBe('delivering');
            expect(state.currentOrder.status).toBe('delivering');
        });

        it('should not update if order not found', () => {
            const stateWithOrders = {
                ...initialState,
                orders: [
                    { _id: '1', status: 'pending', totalAmount: 100000 },
                ],
            };

            const state = orderReducer(
                stateWithOrders,
                updateOrderStatus({ orderId: '999', status: 'confirmed' })
            );

            expect(state.orders[0].status).toBe('pending'); // Unchanged
        });
    });

    describe('Complex scenarios', () => {
        it('should handle multiple status updates', () => {
            let state = {...initialState };

            // Create order
            const mockOrder = { _id: '1', status: 'pending', totalAmount: 100000 };
            state = orderReducer(state, setCurrentOrder(mockOrder));

            // Update to confirmed
            state = orderReducer(state, updateOrderStatus({ orderId: '1', status: 'confirmed' }));
            expect(state.currentOrder.status).toBe('confirmed');

            // Update to preparing
            state = orderReducer(state, updateOrderStatus({ orderId: '1', status: 'preparing' }));
            expect(state.currentOrder.status).toBe('preparing');

            // Update to delivering
            state = orderReducer(state, updateOrderStatus({ orderId: '1', status: 'delivering' }));
            expect(state.currentOrder.status).toBe('delivering');

            // Update to delivered
            state = orderReducer(state, updateOrderStatus({ orderId: '1', status: 'delivered' }));
            expect(state.currentOrder.status).toBe('delivered');
        });

        it('should handle loading and error states during order creation', () => {
            let state = {...initialState };

            // Start loading
            state = orderReducer(state, setLoading(true));
            expect(state.loading).toBe(true);
            expect(state.error).toBeNull();

            // Error occurred
            state = orderReducer(state, setError('Network error'));
            expect(state.error).toBe('Network error');

            // Stop loading
            state = orderReducer(state, setLoading(false));
            expect(state.loading).toBe(false);

            // Clear error
            state = orderReducer(state, setError(null));
            expect(state.error).toBeNull();
        });
    });
});