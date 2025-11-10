import { describe, it, expect, beforeEach, vi } from 'vitest';
import cartReducer, {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    updateItemDetails,
} from '@/redux/slices/cartSlice';

describe('Cart Slice', () => {
    let initialState;

    beforeEach(() => {
        // Clear localStorage mock before each test
        vi.clearAllMocks();
        localStorage.clear();

        initialState = {
            items: [],
            totalItems: 0,
            totalPrice: 0,
        };
    });

    describe('addToCart', () => {
        it('should add new item to cart', () => {
            const product = {
                _id: '1',
                name: 'Phở Bò',
                price: 50000,
            };

            const state = cartReducer(initialState, addToCart(product));

            expect(state.items).toHaveLength(1);
            expect(state.items[0]).toEqual({
                ...product,
                quantity: 1,
            });
            expect(state.totalItems).toBe(1);
            expect(state.totalPrice).toBe(50000);
        });

        it('should increase quantity if item already exists', () => {
            const product = {
                _id: '1',
                name: 'Phở Bò',
                price: 50000,
            };

            let state = cartReducer(initialState, addToCart(product));
            state = cartReducer(state, addToCart(product));

            expect(state.items).toHaveLength(1);
            expect(state.items[0].quantity).toBe(2);
            expect(state.totalItems).toBe(2);
            expect(state.totalPrice).toBe(100000);
        });

        it('should add item with custom quantity', () => {
            const product = {
                _id: '1',
                name: 'Phở Bò',
                price: 50000,
                quantity: 3,
            };

            const state = cartReducer(initialState, addToCart(product));

            expect(state.items[0].quantity).toBe(3);
            expect(state.totalItems).toBe(3);
            expect(state.totalPrice).toBe(150000);
        });

        it('should add multiple different items', () => {
            const product1 = {
                _id: '1',
                name: 'Phở Bò',
                price: 50000,
            };

            const product2 = {
                _id: '2',
                name: 'Cơm Tấm',
                price: 40000,
            };

            let state = cartReducer(initialState, addToCart(product1));
            state = cartReducer(state, addToCart(product2));

            expect(state.items).toHaveLength(2);
            expect(state.totalItems).toBe(2);
            expect(state.totalPrice).toBe(90000);
        });
    });

    describe('removeFromCart', () => {
        it('should remove item from cart', () => {
            const stateWithItem = {
                items: [
                    { _id: '1', name: 'Phở Bò', price: 50000, quantity: 1 },
                ],
                totalItems: 1,
                totalPrice: 50000,
            };

            const state = cartReducer(stateWithItem, removeFromCart('1'));

            expect(state.items).toHaveLength(0);
            expect(state.totalItems).toBe(0);
            expect(state.totalPrice).toBe(0);
        });

        it('should remove correct item when multiple items exist', () => {
            const stateWithItems = {
                items: [
                    { _id: '1', name: 'Phở Bò', price: 50000, quantity: 2 },
                    { _id: '2', name: 'Cơm Tấm', price: 40000, quantity: 1 },
                ],
                totalItems: 3,
                totalPrice: 140000,
            };

            const state = cartReducer(stateWithItems, removeFromCart('1'));

            expect(state.items).toHaveLength(1);
            expect(state.items[0]._id).toBe('2');
            expect(state.totalItems).toBe(1);
            expect(state.totalPrice).toBe(40000);
        });
    });

    describe('updateQuantity', () => {
        it('should update item quantity', () => {
            const stateWithItem = {
                items: [
                    { _id: '1', name: 'Phở Bò', price: 50000, quantity: 1 },
                ],
                totalItems: 1,
                totalPrice: 50000,
            };

            const state = cartReducer(
                stateWithItem,
                updateQuantity({ id: '1', quantity: 3 })
            );

            expect(state.items[0].quantity).toBe(3);
            expect(state.totalItems).toBe(3);
            expect(state.totalPrice).toBe(150000);
        });

        it('should update quantity to 0', () => {
            const stateWithItem = {
                items: [
                    { _id: '1', name: 'Phở Bò', price: 50000, quantity: 2 },
                ],
                totalItems: 2,
                totalPrice: 100000,
            };

            const state = cartReducer(
                stateWithItem,
                updateQuantity({ id: '1', quantity: 0 })
            );

            expect(state.items[0].quantity).toBe(0);
            expect(state.totalItems).toBe(0);
            expect(state.totalPrice).toBe(0);
        });

        it('should only update specific item when multiple items exist', () => {
            const stateWithItems = {
                items: [
                    { _id: '1', name: 'Phở Bò', price: 50000, quantity: 2 },
                    { _id: '2', name: 'Cơm Tấm', price: 40000, quantity: 1 },
                ],
                totalItems: 3,
                totalPrice: 140000,
            };

            const state = cartReducer(
                stateWithItems,
                updateQuantity({ id: '1', quantity: 5 })
            );

            expect(state.items[0].quantity).toBe(5);
            expect(state.items[1].quantity).toBe(1);
            expect(state.totalItems).toBe(6);
            expect(state.totalPrice).toBe(290000);
        });
    });

    describe('updateItemDetails', () => {
        it('should update item details', () => {
            const stateWithItem = {
                items: [
                    { _id: '1', name: 'Phở Bò', price: 50000, quantity: 1 },
                ],
                totalItems: 1,
                totalPrice: 50000,
            };

            const state = cartReducer(
                stateWithItem,
                updateItemDetails({
                    id: '1',
                    data: {
                        price: 45000,
                        name: 'Phở Bò (Giảm giá)',
                        discount: 10,
                    }
                })
            );

            expect(state.items[0].price).toBe(45000);
            expect(state.items[0].name).toBe('Phở Bò (Giảm giá)');
            expect(state.items[0].discount).toBe(10);
            expect(state.totalPrice).toBe(45000);
        });

        it('should not affect other items when updating details', () => {
            const stateWithItems = {
                items: [
                    { _id: '1', name: 'Phở Bò', price: 50000, quantity: 1 },
                    { _id: '2', name: 'Cơm Tấm', price: 40000, quantity: 1 },
                ],
                totalItems: 2,
                totalPrice: 90000,
            };

            const state = cartReducer(
                stateWithItems,
                updateItemDetails({
                    id: '1',
                    data: { price: 45000 }
                })
            );

            expect(state.items[0].price).toBe(45000);
            expect(state.items[1].price).toBe(40000);
            expect(state.totalPrice).toBe(85000);
        });
    });

    describe('clearCart', () => {
        it('should clear all items from cart', () => {
            const stateWithItems = {
                items: [
                    { _id: '1', name: 'Phở Bò', price: 50000, quantity: 2 },
                    { _id: '2', name: 'Cơm Tấm', price: 40000, quantity: 1 },
                ],
                totalItems: 3,
                totalPrice: 140000,
            };

            const state = cartReducer(stateWithItems, clearCart());

            expect(state.items).toHaveLength(0);
            expect(state.totalItems).toBe(0);
            expect(state.totalPrice).toBe(0);
        });

        it('should clear cart when already empty', () => {
            const state = cartReducer(initialState, clearCart());

            expect(state.items).toHaveLength(0);
            expect(state.totalItems).toBe(0);
            expect(state.totalPrice).toBe(0);
        });
    });

    describe('localStorage integration', () => {
        it('should save cart to localStorage when adding item', () => {
            const product = {
                _id: '1',
                name: 'Phở Bò',
                price: 50000,
            };

            cartReducer(initialState, addToCart(product));

            expect(localStorage.setItem).toHaveBeenCalled();
        });

        it('should clear localStorage when clearing cart', () => {
            const stateWithItems = {
                items: [{ _id: '1', name: 'Phở Bò', price: 50000, quantity: 1 }],
                totalItems: 1,
                totalPrice: 50000,
            };

            cartReducer(stateWithItems, clearCart());

            expect(localStorage.removeItem).toHaveBeenCalledWith('cart');
        });
    });
});