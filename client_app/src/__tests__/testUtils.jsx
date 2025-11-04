import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '@/redux/slices/cartSlice';
import authReducer from '@/redux/slices/authSlice';
import productReducer from '@/redux/slices/productSlice';
import orderReducer from '@/redux/slices/orderSlice';

/**
 * Custom render function that wraps component with all necessary providers
 * @param {React.Component} ui - Component to render
 * @param {Object} options - Render options
 * @param {Object} options.preloadedState - Initial Redux state
 * @param {Object} options.store - Custom Redux store
 * @returns {Object} - Render result with store
 */
export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        cart: cartReducer,
        auth: authReducer,
        product: productReducer,
        order: orderReducer,
      },
      preloadedState,
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

/**
 * Create mock product data
 */
export const createMockProduct = (overrides = {}) => ({
  _id: '1',
  name: 'Phở Bò',
  price: 50000,
  description: 'Phở bò truyền thống',
  image: 'https://example.com/pho.jpg',
  category: {
    _id: 'cat1',
    name: 'Món Việt',
  },
  restaurant: {
    _id: 'rest1',
    name: 'Nhà hàng Phở 24',
    address: '123 Nguyễn Huệ, Q1',
  },
  inStock: true,
  discount: 0,
  ...overrides,
});

/**
 * Create mock user data
 */
export const createMockUser = (overrides = {}) => ({
  _id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  phone: '0912345678',
  role: 'customer',
  ...overrides,
});

/**
 * Create mock order data
 */
export const createMockOrder = (overrides = {}) => ({
  _id: 'order123',
  user: createMockUser(),
  items: [
    {
      product: createMockProduct(),
      quantity: 2,
      price: 50000,
    },
  ],
  totalAmount: 100000,
  deliveryAddress: '123 Nguyễn Huệ, Q1',
  status: 'pending',
  createdAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Mock API responses
 */
export const mockApiResponse = (data, success = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error',
});

/**
 * Wait for async state updates
 */
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

/**
 * Mock localStorage
 */
export const mockLocalStorage = () => {
  const store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
  };
};

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
