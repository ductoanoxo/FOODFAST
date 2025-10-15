// ============================================
// END-TO-END TESTS using Cypress
// ============================================

describe('Customer Journey - Complete Order Flow', () => {
  
  beforeEach(() => {
    // Reset database
    cy.task('db:seed');
    
    // Visit homepage
    cy.visit('http://localhost:3000');
  });

  it('TC-E2E-001: Customer đặt hàng thành công end-to-end', () => {
    // Step 1: Open homepage
    cy.contains('FOODFAST').should('be.visible');
    
    // Step 2: Register/Login
    cy.get('[data-cy=login-button]').click();
    cy.get('[data-cy=email-input]').type('customer@test.com');
    cy.get('[data-cy=password-input]').type('Password123!');
    cy.get('[data-cy=login-submit]').click();
    
    // Verify logged in
    cy.get('[data-cy=user-menu]').should('contain', 'customer@test.com');
    
    // Step 3: Browse products
    cy.get('[data-cy=menu-link]').click();
    cy.url().should('include', '/menu');
    
    // Step 4: Search for "phở"
    cy.get('[data-cy=search-input]').type('phở');
    cy.get('[data-cy=search-button]').click();
    
    // Verify search results
    cy.get('[data-cy=product-card]').should('have.length.gt', 0);
    cy.get('[data-cy=product-card]').first().should('contain', 'Phở');
    
    // Step 5: View product detail
    cy.get('[data-cy=product-card]').first().click();
    cy.url().should('include', '/product/');
    cy.get('[data-cy=product-name]').should('be.visible');
    cy.get('[data-cy=product-price]').should('be.visible');
    
    // Step 6: Add to cart
    cy.get('[data-cy=quantity-input]').clear().type('2');
    cy.get('[data-cy=add-to-cart-button]').click();
    
    // Verify added to cart
    cy.get('[data-cy=cart-badge]').should('contain', '2');
    cy.contains('Added to cart').should('be.visible');
    
    // Step 7: Go to cart page
    cy.get('[data-cy=cart-icon]').click();
    cy.url().should('include', '/cart');
    
    // Verify cart items
    cy.get('[data-cy=cart-item]').should('have.length', 1);
    cy.get('[data-cy=cart-total]').should('be.visible');
    
    // Step 8: Apply voucher
    cy.get('[data-cy=voucher-input]').type('DISCOUNT10');
    cy.get('[data-cy=apply-voucher-button]').click();
    cy.contains('Voucher applied').should('be.visible');
    cy.get('[data-cy=discount-amount]').should('be.visible');
    
    // Step 9: Proceed to checkout
    cy.get('[data-cy=checkout-button]').click();
    cy.url().should('include', '/checkout');
    
    // Step 10: Fill delivery address
    cy.get('[data-cy=address-input]').type('123 Test Street');
    cy.get('[data-cy=city-select]').select('Hanoi');
    cy.get('[data-cy=district-select]').select('Ba Dinh');
    cy.get('[data-cy=phone-input]').type('0901234567');
    
    // Step 11: Select payment method
    cy.get('[data-cy=payment-method-vnpay]').click();
    
    // Step 12: Complete payment
    cy.get('[data-cy=place-order-button]').click();
    
    // Verify order created
    cy.url().should('include', '/payment');
    cy.contains('Processing payment').should('be.visible');
    
    // Simulate VNPay success (mock)
    cy.intercept('GET', '/api/payment/vnpay-return*', {
      statusCode: 200,
      body: { success: true, message: 'Payment successful' }
    });
    
    cy.visit('/payment/success?orderId=mock_order_id');
    
    // Step 13: View order tracking
    cy.contains('Order placed successfully').should('be.visible');
    cy.get('[data-cy=track-order-button]').click();
    cy.url().should('include', '/order-tracking');
    
    // Step 14: Verify tracking page
    cy.get('[data-cy=order-status]').should('be.visible');
    cy.get('[data-cy=map-container]').should('be.visible');
    
    // Wait for delivery (mock)
    cy.wait(2000);
    
    // Step 15: Write review
    cy.get('[data-cy=write-review-button]').click();
    cy.get('[data-cy=rating-5]').click();
    cy.get('[data-cy=review-comment]').type('Great food! Fast delivery!');
    cy.get('[data-cy=submit-review-button]').click();
    
    // Verify review submitted
    cy.contains('Review submitted').should('be.visible');
  });

  it('TC-E2E-002: Customer track order real-time', () => {
    // Login
    cy.login('customer@test.com', 'Password123!');
    
    // Create order via API
    cy.request({
      method: 'POST',
      url: '/api/orders',
      body: {
        items: [{ product: 'product_id', quantity: 1, price: 50000 }],
        deliveryAddress: { street: '123 Test', city: 'Hanoi' },
        paymentMethod: 'COD'
      },
      headers: {
        Authorization: `Bearer ${Cypress.env('customerToken')}`
      }
    }).then((response) => {
      const orderId = response.body.data._id;
      
      // Open tracking page
      cy.visit(`/order-tracking/${orderId}`);
      
      // Verify order status displayed
      cy.get('[data-cy=order-status]').should('contain', 'Pending');
      
      // Mock status update via socket
      cy.window().then((win) => {
        win.socket.emit('order:updated', {
          orderId: orderId,
          status: 'preparing'
        });
      });
      
      // Verify status updated
      cy.get('[data-cy=order-status]').should('contain', 'Preparing');
      
      // Mock drone location update
      cy.window().then((win) => {
        win.socket.emit('drone:location-updated', {
          orderId: orderId,
          location: { lat: 21.0285, lng: 105.8542 }
        });
      });
      
      // Verify map marker moved
      cy.get('[data-cy=drone-marker]').should('be.visible');
      
      // Mock delivery complete
      cy.window().then((win) => {
        win.socket.emit('order:updated', {
          orderId: orderId,
          status: 'delivered'
        });
      });
      
      // Verify notification
      cy.contains('Your order has been delivered').should('be.visible');
    });
  });

  it('TC-E2E-003: Customer cancel order', () => {
    // Login
    cy.login('customer@test.com', 'Password123!');
    
    // Create pending order
    cy.createOrder({ status: 'pending' }).then((orderId) => {
      
      // Go to order history
      cy.visit('/profile/orders');
      
      // Find the order
      cy.get(`[data-cy=order-${orderId}]`).should('be.visible');
      
      // Click cancel button
      cy.get(`[data-cy=cancel-order-${orderId}]`).click();
      
      // Confirm cancellation
      cy.get('[data-cy=confirm-cancel]').click();
      
      // Verify status changed
      cy.get(`[data-cy=order-${orderId}]`).should('contain', 'Cancelled');
      
      // Verify refund message (if paid)
      cy.contains('Refund will be processed').should('be.visible');
    });
  });
});

// ==================== RESTAURANT JOURNEY ====================

describe('Restaurant Management', () => {
  
  beforeEach(() => {
    cy.task('db:seed');
  });

  it('TC-E2E-004: Restaurant quản lý menu', () => {
    // Step 1: Restaurant login
    cy.visit('http://localhost:3001');
    cy.login('restaurant@test.com', 'Password123!');
    
    // Step 2: Go to menu page
    cy.get('[data-cy=menu-link]').click();
    cy.url().should('include', '/menu');
    
    // Step 3: Add new product
    cy.get('[data-cy=add-product-button]').click();
    
    // Step 4: Upload image
    cy.get('[data-cy=image-upload]').attachFile('test-product.jpg');
    cy.wait(1000); // Wait for upload
    
    // Step 5: Set price & category
    cy.get('[data-cy=product-name]').type('Test Product');
    cy.get('[data-cy=product-price]').type('50000');
    cy.get('[data-cy=category-select]').select('Food');
    cy.get('[data-cy=product-description]').type('Delicious test product');
    
    // Step 6: Save product
    cy.get('[data-cy=save-product-button]').click();
    
    // Verify product added
    cy.contains('Product added successfully').should('be.visible');
    cy.get('[data-cy=product-list]').should('contain', 'Test Product');
    
    // Step 7: Edit product
    cy.get('[data-cy=product-list]').contains('Test Product').parent().find('[data-cy=edit-button]').click();
    cy.get('[data-cy=product-price]').clear().type('55000');
    cy.get('[data-cy=save-product-button]').click();
    
    // Verify updated
    cy.contains('Product updated').should('be.visible');
    cy.get('[data-cy=product-list]').should('contain', '55,000');
    
    // Step 8: Delete product
    cy.get('[data-cy=product-list]').contains('Test Product').parent().find('[data-cy=delete-button]').click();
    cy.get('[data-cy=confirm-delete]').click();
    
    // Verify deleted
    cy.contains('Product deleted').should('be.visible');
    cy.get('[data-cy=product-list]').should('not.contain', 'Test Product');
  });

  it('TC-E2E-005: Restaurant xử lý đơn hàng', () => {
    // Step 1: Restaurant login
    cy.visit('http://localhost:3001');
    cy.login('restaurant@test.com', 'Password123!');
    
    // Step 2: Simulate new order notification
    cy.window().then((win) => {
      win.socket.emit('order:new', {
        orderId: 'new_order_id',
        customerName: 'Test Customer',
        items: [{ name: 'Phở Bò', quantity: 2 }],
        totalAmount: 90000
      });
    });
    
    // Verify notification received
    cy.get('[data-cy=notification-badge]').should('contain', '1');
    cy.contains('New order received').should('be.visible');
    
    // Step 3: View order details
    cy.get('[data-cy=orders-link]').click();
    cy.get('[data-cy=order-new_order_id]').click();
    
    // Verify order details displayed
    cy.get('[data-cy=order-details]').should('be.visible');
    cy.get('[data-cy=customer-name]').should('contain', 'Test Customer');
    
    // Step 4: Accept order
    cy.get('[data-cy=accept-order-button]').click();
    cy.contains('Order accepted').should('be.visible');
    
    // Step 5: Update status to "preparing"
    cy.get('[data-cy=status-select]').select('Preparing');
    cy.get('[data-cy=update-status-button]').click();
    
    // Step 6: Update to "ready"
    cy.wait(2000); // Simulate preparation time
    cy.get('[data-cy=status-select]').select('Ready for pickup');
    cy.get('[data-cy=update-status-button]').click();
    
    // Step 7: Wait for drone pickup (mock)
    cy.wait(1000);
    cy.window().then((win) => {
      win.socket.emit('drone:picked-up', { orderId: 'new_order_id' });
    });
    
    // Step 8: Confirm picked up
    cy.get('[data-cy=order-status]').should('contain', 'Picked up');
  });
});

// ==================== ADMIN JOURNEY ====================

describe('Admin Operations', () => {
  
  beforeEach(() => {
    cy.task('db:seed');
  });

  it('TC-E2E-007: Admin quản lý drone fleet', () => {
    // Step 1: Admin login
    cy.visit('http://localhost:3002');
    cy.login('admin@test.com', 'Admin123!');
    
    // Step 2: Go to fleet map
    cy.get('[data-cy=fleet-map-link]').click();
    cy.url().should('include', '/fleet-map');
    
    // Step 3: View all drones real-time
    cy.get('[data-cy=map-container]').should('be.visible');
    cy.get('[data-cy=drone-marker]').should('have.length.gt', 0);
    
    // Step 4: Add new drone
    cy.get('[data-cy=add-drone-button]').click();
    cy.get('[data-cy=drone-code]').type('DRONE-NEW-001');
    cy.get('[data-cy=drone-model]').type('DJI Mavic Pro');
    cy.get('[data-cy=save-drone-button]').click();
    
    // Verify drone added
    cy.contains('Drone added successfully').should('be.visible');
    
    // Step 5: Assign drone to order manually
    cy.get('[data-cy=pending-orders]').first().click();
    cy.get('[data-cy=assign-drone-select]').select('DRONE-NEW-001');
    cy.get('[data-cy=assign-button]').click();
    
    // Verify assignment
    cy.contains('Drone assigned').should('be.visible');
    
    // Step 6: Monitor drone battery
    cy.get('[data-cy=drone-DRONE-NEW-001]').find('[data-cy=battery-level]').should('be.visible');
    
    // Step 7: Mark drone for maintenance
    cy.get('[data-cy=drone-DRONE-NEW-001]').find('[data-cy=maintenance-button]').click();
    cy.get('[data-cy=confirm-maintenance]').click();
    
    // Verify status changed
    cy.get('[data-cy=drone-DRONE-NEW-001]').should('contain', 'Maintenance');
  });

  it('TC-E2E-009: Admin view analytics dashboard', () => {
    // Step 1: Go to dashboard
    cy.visit('http://localhost:3002');
    cy.login('admin@test.com', 'Admin123!');
    
    // Step 2: View total orders
    cy.get('[data-cy=total-orders]').should('be.visible');
    cy.get('[data-cy=total-orders]').invoke('text').should('match', /\d+/);
    
    // Step 3: View revenue charts
    cy.get('[data-cy=revenue-chart]').should('be.visible');
    
    // Step 4: View active drones
    cy.get('[data-cy=active-drones-count]').should('be.visible');
    
    // Step 5: Export reports
    cy.get('[data-cy=export-button]').click();
    cy.get('[data-cy=export-pdf]').click();
    
    // Verify download started
    cy.readFile('cypress/downloads/report.pdf').should('exist');
  });
});

// ==================== CUSTOM COMMANDS ====================

// cypress/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-cy=email-input]').type(email);
  cy.get('[data-cy=password-input]').type(password);
  cy.get('[data-cy=login-submit]').click();
  cy.get('[data-cy=user-menu]').should('be.visible');
});

Cypress.Commands.add('createOrder', (options = {}) => {
  return cy.request({
    method: 'POST',
    url: '/api/orders',
    body: {
      items: options.items || [{ product: 'product_id', quantity: 1, price: 50000 }],
      deliveryAddress: options.address || { street: '123 Test', city: 'Hanoi' },
      paymentMethod: options.paymentMethod || 'COD',
      ...options
    },
    headers: {
      Authorization: `Bearer ${Cypress.env('customerToken')}`
    }
  }).then((response) => response.body.data._id);
});
