import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, createMockProduct, mockApiResponse } from '../testUtils';
import CheckoutPage from '../../pages/Checkout/CheckoutPage';
import { addToCart } from '../../redux/slices/cartSlice';

/**
 * INTEGRATION TEST: Complete Checkout Flow
 * Test quy trình đặt hàng hoàn chỉnh từ đầu đến cuối
 * Flow: Customer fills form → Submit order → API call → Cart clear → Navigate to success
 */

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('Checkout Order Flow - Integration Test', () => {
  let user;
  let mockNavigate;
  let store;

  beforeEach(() => {
    user = userEvent.setup();
    mockNavigate = vi.fn();
    
    // Mock navigate
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });

    // Mock geolocation using Object.defineProperty
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn((success) => {
          success({
            coords: {
              latitude: 10.8231,
              longitude: 106.6297,
            },
          });
        }),
      },
      writable: true,
      configurable: true,
    });

    // Mock localStorage
    Storage.prototype.getItem = vi.fn((key) => {
      if (key === 'token') return 'mock-token-123';
      if (key === 'user') return JSON.stringify({ 
        _id: 'user123', 
        name: 'Test User',
        phone: '0912345678',
        address: '123 Nguyen Hue, Q1, TPHCM'
      });
      return null;
    });
  });

  it('should complete full checkout flow: form → submit → API → cart clear → success', async () => {
    console.log('\n🔥 Starting Complete Checkout Integration Test\n');

    // STEP 1: Setup initial cart with products
    console.log('📦 STEP 1: Add products to cart');
    const product1 = createMockProduct({ 
      _id: 'prod1', 
      name: 'Phở Bò', 
      price: 50000 
    });
    const product2 = createMockProduct({ 
      _id: 'prod2', 
      name: 'Bún Chả', 
      price: 45000 
    });

    const { store: testStore, container } = renderWithProviders(<CheckoutPage />, {
      preloadedState: {
        cart: {
          items: [
            { productId: product1._id, quantity: 2, product: product1 },
            { productId: product2._id, quantity: 1, product: product2 },
          ],
          totalItems: 3,
          totalPrice: 145000, // 50000*2 + 45000
        },
      },
    });
    store = testStore;

    expect(store.getState().cart.items).toHaveLength(2);
    expect(store.getState().cart.totalPrice).toBe(145000);
    console.log('✅ Cart initialized with 2 products, total: 145,000 VND\n');

    // STEP 2: Fill customer information
    console.log('📝 STEP 2: Fill customer information form');
    const nameInput = screen.getByLabelText(/tên người nhận/i);
    const phoneInput = screen.getByLabelText(/số điện thoại/i);
    const addressInput = screen.getByLabelText(/địa chỉ giao hàng/i);
    const paymentSelect = screen.getByLabelText(/phương thức thanh toán/i);

    await user.clear(nameInput);
    await user.type(nameInput, 'Nguyễn Văn A');
    console.log('   - Name: Nguyễn Văn A');

    await user.clear(phoneInput);
    await user.type(phoneInput, '0912345678');
    console.log('   - Phone: 0912345678');

    await user.clear(addressInput);
    await user.type(addressInput, '123 Nguyễn Huệ, Quận 1, TP.HCM');
    console.log('   - Address: 123 Nguyễn Huệ, Quận 1, TP.HCM');

    await user.selectOptions(paymentSelect, 'COD');
    console.log('   - Payment: COD');
    console.log('✅ Customer information filled\n');

    // STEP 3: Get current location (mock)
    console.log('📍 STEP 3: Get delivery location');
    const locationButton = screen.getByRole('button', { name: /lấy vị trí hiện tại/i });
    await user.click(locationButton);

    await waitFor(() => {
      expect(screen.getByText(/vị trí: 10.8231, 106.6297/i)).toBeInTheDocument();
    });
    console.log('✅ Location acquired: 10.8231, 106.6297 (TP.HCM)\n');

    // STEP 4: Mock API order creation
    console.log('🌐 STEP 4: Mock API - Create order');
    const mockOrderResponse = {
      success: true,
      data: {
        _id: 'order123',
        customerId: 'user123',
        items: store.getState().cart.items,
        totalAmount: 145000,
        status: 'pending',
        deliveryLocation: {
          type: 'Point',
          coordinates: [106.6297, 10.8231],
        },
        customerInfo: {
          name: 'Nguyễn Văn A',
          phone: '0912345678',
          address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        },
        paymentMethod: 'COD',
        createdAt: new Date().toISOString(),
      },
    };

    mockApiResponse('/api/orders', mockOrderResponse);
    console.log(`✅ API mocked - Order ID: ${mockOrderResponse.data._id}\n`);

    // STEP 5: Submit order
    console.log('🚀 STEP 5: Submit order');
    const submitButton = screen.getByRole('button', { name: /đặt hàng/i });
    await user.click(submitButton);

    // STEP 6: Wait for API call and loading state
    console.log('⏳ STEP 6: Processing order...');
    await waitFor(() => {
      expect(screen.getByText(/đang xử lý/i)).toBeInTheDocument();
    });
    console.log('✅ Loading state displayed\n');

    // STEP 7: Verify API response
    console.log('✅ STEP 7: API response received');
    await waitFor(() => {
      const currentState = store.getState();
      expect(currentState.order.currentOrder).toBeDefined();
      expect(currentState.order.currentOrder._id).toBe('order123');
      expect(currentState.order.currentOrder.status).toBe('pending');
    });
    console.log(`   - Order created: order123`);
    console.log(`   - Status: pending`);
    console.log(`   - Total: 145,000 VND\n`);

    // STEP 8: Verify cart cleared
    console.log('🧹 STEP 8: Verify cart cleared');
    await waitFor(() => {
      const cartState = store.getState().cart;
      expect(cartState.items).toHaveLength(0);
      expect(cartState.totalItems).toBe(0);
      expect(cartState.totalPrice).toBe(0);
    });
    console.log('✅ Cart cleared successfully\n');

    // STEP 9: Verify success message displayed
    console.log('🎉 STEP 9: Display success message');
    await waitFor(() => {
      expect(screen.getByText(/đặt hàng thành công/i)).toBeInTheDocument();
    });
    console.log('✅ Success message displayed\n');

    // STEP 10: Verify navigation to order tracking page
    console.log('🧭 STEP 10: Navigate to order tracking');
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/orders/order123');
    });
    console.log('✅ Redirected to: /orders/order123\n');

    console.log('✅✅✅ COMPLETE CHECKOUT FLOW PASSED ✅✅✅\n');
    console.log('Summary:');
    console.log('  - Customer filled form ✅');
    console.log('  - Location acquired ✅');
    console.log('  - Order created via API ✅');
    console.log('  - Cart cleared ✅');
    console.log('  - Success message shown ✅');
    console.log('  - Redirected to tracking page ✅');
    console.log('\n🎯 Integration test completed successfully!\n');
  });

  it('should handle validation errors', async () => {
    console.log('\n⚠️  Testing validation error handling\n');

    renderWithProviders(<CheckoutPage />, {
      preloadedState: {
        cart: {
          items: [{ productId: 'prod1', quantity: 1 }],
          totalItems: 1,
          totalPrice: 50000,
        },
      },
    });

    // Submit without filling form
    const submitButton = screen.getByRole('button', { name: /đặt hàng/i });
    await user.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/tên phải có ít nhất 2 ký tự/i)).toBeInTheDocument();
      expect(screen.getByText(/số điện thoại không hợp lệ/i)).toBeInTheDocument();
    });

    console.log('✅ Validation errors displayed correctly\n');
  });

  it('should handle API errors gracefully', async () => {
    console.log('\n❌ Testing API error handling\n');

    renderWithProviders(<CheckoutPage />, {
      preloadedState: {
        cart: {
          items: [{ productId: 'prod1', quantity: 1 }],
          totalItems: 1,
          totalPrice: 50000,
        },
      },
    });

    // Fill form
    const nameInput = screen.getByLabelText(/tên người nhận/i);
    const phoneInput = screen.getByLabelText(/số điện thoại/i);
    const addressInput = screen.getByLabelText(/địa chỉ giao hàng/i);

    await user.type(nameInput, 'Test User');
    await user.type(phoneInput, '0912345678');
    await user.type(addressInput, '123 Test Street, District 1');

    // Mock API error
    mockApiResponse('/api/orders', {
      success: false,
      error: 'Server error',
    }, { status: 500 });

    // Submit order
    const submitButton = screen.getByRole('button', { name: /đặt hàng/i });
    await user.click(submitButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/đã xảy ra lỗi/i)).toBeInTheDocument();
    });

    console.log('✅ API error handled gracefully\n');
  });
});
