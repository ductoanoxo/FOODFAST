import { describe, it, expect, beforeEach } from 'vitest';
import productReducer, {
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    clearError,
} from './productSlice';

describe('Restaurant productSlice', () => {
    let initialState;

    beforeEach(() => {
        initialState = {
            products: [],
            loading: false,
            error: null,
        };
    });

    describe('reducers', () => {
        it('should handle clearError', () => {
            const stateWithError = {...initialState, error: 'Test error' };
            const newState = productReducer(stateWithError, clearError());
            expect(newState.error).toBeNull();
        });
    });

    describe('fetchProducts async thunk', () => {
        it('should handle fetchProducts.pending', () => {
            const action = { type: fetchProducts.pending.type };
            const newState = productReducer(initialState, action);
            expect(newState.loading).toBe(true);
            expect(newState.error).toBeNull();
        });

        it('should handle fetchProducts.fulfilled', () => {
            const products = [
                { _id: '1', name: 'Product 1', price: 50000 },
                { _id: '2', name: 'Product 2', price: 60000 },
            ];
            const action = {
                type: fetchProducts.fulfilled.type,
                payload: { data: products },
            };
            const newState = productReducer(initialState, action);

            expect(newState.loading).toBe(false);
            expect(newState.products).toEqual(products);
        });

        it('should handle fetchProducts.rejected', () => {
            const action = {
                type: fetchProducts.rejected.type,
                payload: 'Failed to fetch products',
            };
            const newState = productReducer(initialState, action);

            expect(newState.loading).toBe(false);
            expect(newState.error).toBe('Failed to fetch products');
        });
    });

    describe('createProduct async thunk', () => {
        it('should handle createProduct.pending', () => {
            const action = { type: createProduct.pending.type };
            const newState = productReducer(initialState, action);
            expect(newState.loading).toBe(true);
            expect(newState.error).toBeNull();
        });

        it('should handle createProduct.fulfilled', () => {
            const newProduct = { _id: '3', name: 'New Product', price: 70000 };
            const action = {
                type: createProduct.fulfilled.type,
                payload: { data: newProduct },
            };
            const newState = productReducer(initialState, action);

            expect(newState.loading).toBe(false);
            expect(newState.products).toContainEqual(newProduct);
        });

        it('should handle createProduct.rejected', () => {
            const action = {
                type: createProduct.rejected.type,
                payload: 'Failed to create product',
            };
            const newState = productReducer(initialState, action);

            expect(newState.loading).toBe(false);
            expect(newState.error).toBe('Failed to create product');
        });
    });

    describe('updateProduct async thunk', () => {
        it('should handle updateProduct.pending', () => {
            const action = { type: updateProduct.pending.type };
            const newState = productReducer(initialState, action);
            expect(newState.loading).toBe(true);
            expect(newState.error).toBeNull();
        });

        it('should handle updateProduct.fulfilled', () => {
            const stateWithProducts = {
                ...initialState,
                products: [
                    { _id: '1', name: 'Product 1', price: 50000 },
                    { _id: '2', name: 'Product 2', price: 60000 },
                ],
            };
            const updatedProduct = { _id: '1', name: 'Updated Product', price: 55000 };
            const action = {
                type: updateProduct.fulfilled.type,
                payload: { data: updatedProduct },
            };
            const newState = productReducer(stateWithProducts, action);

            expect(newState.loading).toBe(false);
            expect(newState.products[0]).toEqual(updatedProduct);
        });

        it('should handle updateProduct.rejected', () => {
            const action = {
                type: updateProduct.rejected.type,
                payload: 'Failed to update product',
            };
            const newState = productReducer(initialState, action);

            expect(newState.loading).toBe(false);
            expect(newState.error).toBe('Failed to update product');
        });
    });

    describe('deleteProduct async thunk', () => {
        it('should handle deleteProduct.pending', () => {
            const action = { type: deleteProduct.pending.type };
            const newState = productReducer(initialState, action);
            expect(newState.loading).toBe(true);
            expect(newState.error).toBeNull();
        });

        it('should handle deleteProduct.fulfilled', () => {
            const stateWithProducts = {
                ...initialState,
                products: [
                    { _id: '1', name: 'Product 1', price: 50000 },
                    { _id: '2', name: 'Product 2', price: 60000 },
                ],
            };
            const action = {
                type: deleteProduct.fulfilled.type,
                payload: '1', // deleted product ID
            };
            const newState = productReducer(stateWithProducts, action);

            expect(newState.loading).toBe(false);
            expect(newState.products).toHaveLength(1);
            expect(newState.products[0]._id).toBe('2');
        });

        it('should handle deleteProduct.rejected', () => {
            const action = {
                type: deleteProduct.rejected.type,
                payload: 'Failed to delete product',
            };
            const newState = productReducer(initialState, action);

            expect(newState.loading).toBe(false);
            expect(newState.error).toBe('Failed to delete product');
        });
    });
});