import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import orderReducer, { fetchOrders, updateOrderStatus } from '../../redux/slices/orderSlice';
import productReducer, { fetchProducts } from '../../redux/slices/productSlice';

// Mock the API modules
vi.mock('../../api/orderAPI', () => ({
    getRestaurantOrders: vi.fn(),
    updateOrderStatus: vi.fn(),
}));

vi.mock('../../api/productAPI', () => ({
    getRestaurantProducts: vi.fn(),
}));

describe('Restaurant App - Order Management Integration Test', () => {
    let store;
    let mockOrderAPI;
    let mockProductAPI;

    beforeEach(async() => {
        // Create a real Redux store with actual reducers
        store = configureStore({
            reducer: {
                orders: orderReducer,
                products: productReducer,
            },
        });

        // Import mocked APIs
        mockOrderAPI = await
        import ('../../api/orderAPI');
        mockProductAPI = await
        import ('../../api/productAPI');

        vi.clearAllMocks();
    });

    it('Complete restaurant workflow: Load products → Receive orders → Update order status', async() => {
        // ============ STEP 1: Restaurant loads their products ============
        const mockProducts = [
            { _id: 'p1', name: 'Phở Bò', price: 50000, category: 'main', stock: 100 },
            { _id: 'p2', name: 'Bánh Mì', price: 20000, category: 'snack', stock: 50 },
        ];

        mockProductAPI.getRestaurantProducts.mockResolvedValue({ data: mockProducts });

        await store.dispatch(fetchProducts());

        let state = store.getState();
        expect(state.products.products).toHaveLength(2);
        expect(state.products.products[0].name).toBe('Phở Bò');
        expect(state.products.loading).toBe(false);

        // ============ STEP 2: Restaurant receives new orders ============
        const mockOrders = [{
                _id: 'o1',
                orderNumber: 'ORD001',
                status: 'pending',
                items: [{ product: 'p1', quantity: 2, price: 50000 }],
                total: 100000,
            },
            {
                _id: 'o2',
                orderNumber: 'ORD002',
                status: 'pending',
                items: [{ product: 'p2', quantity: 3, price: 20000 }],
                total: 60000,
            },
        ];

        mockOrderAPI.getRestaurantOrders.mockResolvedValue({ data: mockOrders });

        await store.dispatch(fetchOrders());

        state = store.getState();
        expect(state.orders.orders).toHaveLength(2);
        expect(state.orders.stats.pending).toBe(2);
        expect(state.orders.stats.total).toBe(2);
        expect(state.orders.loading).toBe(false);

        // ============ STEP 3: Restaurant confirms first order ============
        const confirmedOrder = {
            ...mockOrders[0],
            status: 'confirmed',
        };

        mockOrderAPI.updateOrderStatus.mockResolvedValue({ data: confirmedOrder });

        await store.dispatch(updateOrderStatus({ orderId: 'o1', status: 'confirmed' }));

        state = store.getState();
        // Order should be updated in the list
        const updatedOrder = state.orders.orders.find(o => o._id === 'o1');
        expect(updatedOrder.status).toBe('confirmed');
        expect(state.orders.loading).toBe(false);

        // ============ STEP 4: Restaurant marks order as preparing ============
        const preparingOrder = {
            ...confirmedOrder,
            status: 'preparing',
        };

        mockOrderAPI.updateOrderStatus.mockResolvedValue({ data: preparingOrder });

        await store.dispatch(updateOrderStatus({ orderId: 'o1', status: 'preparing' }));

        state = store.getState();
        const preparingOrderState = state.orders.orders.find(o => o._id === 'o1');
        expect(preparingOrderState.status).toBe('preparing');

        // ============ STEP 5: Restaurant marks order as ready for pickup ============
        const readyOrder = {
            ...preparingOrder,
            status: 'ready',
        };

        mockOrderAPI.updateOrderStatus.mockResolvedValue({ data: readyOrder });

        await store.dispatch(updateOrderStatus({ orderId: 'o1', status: 'ready' }));

        state = store.getState();
        const readyOrderState = state.orders.orders.find(o => o._id === 'o1');
        expect(readyOrderState.status).toBe('ready');

        // ============ VERIFICATION: Check final state ============
        // Verify all API calls were made
        expect(mockProductAPI.getRestaurantProducts).toHaveBeenCalledTimes(1);
        expect(mockOrderAPI.getRestaurantOrders).toHaveBeenCalledTimes(1);
        expect(mockOrderAPI.updateOrderStatus).toHaveBeenCalledTimes(3);

        // Verify store state
        expect(state.products.products).toHaveLength(2);
        expect(state.orders.orders).toHaveLength(2);
        expect(state.orders.orders[0].status).toBe('ready');
        expect(state.orders.orders[1].status).toBe('pending');
        expect(state.orders.error).toBeNull();
        expect(state.products.error).toBeNull();
    });

    it('Should handle API errors gracefully', async() => {
        // Simulate network error
        mockOrderAPI.getRestaurantOrders.mockRejectedValue({
            response: { data: { message: 'Network error' } },
        });

        await store.dispatch(fetchOrders());

        const state = store.getState();
        expect(state.orders.loading).toBe(false);
        expect(state.orders.error).toBe('Network error');
        expect(state.orders.orders).toHaveLength(0);
    });
});