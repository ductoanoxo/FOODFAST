import { describe, it, expect, beforeEach } from 'vitest';
import orderReducer, {
    fetchOrders,
    updateOrderStatus,
    clearError,
    setCurrentOrder,
    updateOrderInList,
} from '@/redux/slices/orderSlice';

describe('Restaurant orderSlice', () => {
    let initialState;

    beforeEach(() => {
        initialState = {
            orders: [],
            currentOrder: null,
            stats: {
                total: 0,
                pending: 0,
                preparing: 0,
                delivering: 0,
                completed: 0,
            },
            loading: false,
            error: null,
        };
    });

    describe('reducers', () => {
        it('should handle clearError', () => {
            const stateWithError = {...initialState, error: 'Test error' };
            const newState = orderReducer(stateWithError, clearError());
            expect(newState.error).toBeNull();
        });

        it('should handle setCurrentOrder', () => {
            const order = { _id: '1', orderNumber: 'ORD001' };
            const newState = orderReducer(initialState, setCurrentOrder(order));
            expect(newState.currentOrder).toEqual(order);
        });

        it('should handle updateOrderInList - order exists', () => {
            const stateWithOrders = {
                ...initialState,
                orders: [
                    { _id: '1', status: 'pending' },
                    { _id: '2', status: 'pending' },
                ],
            };
            const updatedOrder = { _id: '1', status: 'confirmed' };
            const newState = orderReducer(stateWithOrders, updateOrderInList(updatedOrder));
            expect(newState.orders[0]).toEqual(updatedOrder);
            expect(newState.orders[1]).toEqual({ _id: '2', status: 'pending' });
        });

        it('should handle updateOrderInList - order does not exist', () => {
            const stateWithOrders = {
                ...initialState,
                orders: [{ _id: '1', status: 'pending' }],
            };
            const updatedOrder = { _id: '999', status: 'confirmed' };
            const newState = orderReducer(stateWithOrders, updateOrderInList(updatedOrder));
            expect(newState.orders).toHaveLength(1);
            expect(newState.orders[0]._id).toBe('1');
        });
    });

    describe('fetchOrders async thunk', () => {
        it('should handle fetchOrders.pending', () => {
            const action = { type: fetchOrders.pending.type };
            const newState = orderReducer(initialState, action);
            expect(newState.loading).toBe(true);
            expect(newState.error).toBeNull();
        });

        it('should handle fetchOrders.fulfilled', () => {
            const orders = [
                { _id: '1', status: 'pending' },
                { _id: '2', status: 'preparing' },
                { _id: '3', status: 'delivering' },
                { _id: '4', status: 'delivered' },
            ];
            const action = {
                type: fetchOrders.fulfilled.type,
                payload: { data: orders },
            };
            const newState = orderReducer(initialState, action);

            expect(newState.loading).toBe(false);
            expect(newState.orders).toEqual(orders);
            expect(newState.stats.total).toBe(4);
            expect(newState.stats.pending).toBe(1);
            expect(newState.stats.preparing).toBe(1);
            expect(newState.stats.delivering).toBe(1);
            expect(newState.stats.completed).toBe(1);
        });

        it('should handle fetchOrders.fulfilled with completed status', () => {
            const orders = [
                { _id: '1', status: 'completed' },
                { _id: '2', status: 'delivered' },
            ];
            const action = {
                type: fetchOrders.fulfilled.type,
                payload: { data: orders },
            };
            const newState = orderReducer(initialState, action);

            expect(newState.stats.completed).toBe(2); // Both completed and delivered count
        });

        it('should handle fetchOrders.rejected', () => {
            const action = {
                type: fetchOrders.rejected.type,
                payload: 'Failed to fetch orders',
            };
            const newState = orderReducer(initialState, action);

            expect(newState.loading).toBe(false);
            expect(newState.error).toBe('Failed to fetch orders');
        });
    });

    describe('updateOrderStatus async thunk', () => {
        it('should handle updateOrderStatus.pending', () => {
            const action = { type: updateOrderStatus.pending.type };
            const newState = orderReducer(initialState, action);
            expect(newState.loading).toBe(true);
            expect(newState.error).toBeNull();
        });

        it('should handle updateOrderStatus.fulfilled', () => {
            const stateWithOrders = {
                ...initialState,
                orders: [
                    { _id: '1', status: 'pending' },
                    { _id: '2', status: 'pending' },
                ],
            };
            const updatedOrder = { _id: '1', status: 'confirmed' };
            const action = {
                type: updateOrderStatus.fulfilled.type,
                payload: { data: updatedOrder },
            };
            const newState = orderReducer(stateWithOrders, action);

            expect(newState.loading).toBe(false);
            expect(newState.orders[0].status).toBe('confirmed');
        });

        it('should handle updateOrderStatus.rejected', () => {
            const action = {
                type: updateOrderStatus.rejected.type,
                payload: 'Failed to update order',
            };
            const newState = orderReducer(initialState, action);

            expect(newState.loading).toBe(false);
            expect(newState.error).toBe('Failed to update order');
        });
    });
});