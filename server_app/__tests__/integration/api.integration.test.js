// ============================================
// INTEGRATION TEST EXAMPLES
// ============================================

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../index');
const User = require('../../API/Models/User');
const Product = require('../../API/Models/Product');
const Order = require('../../API/Models/Order');
const Drone = require('../../API/Models/Drone');

let mongoServer;

// Setup test database
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear database before each test
  await User.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});
  await Drone.deleteMany({});
});

// ==================== AUTHENTICATION INTEGRATION ====================

describe('Authentication Integration Tests', () => {
  
  test('TC-INT-001: Complete registration và login flow', async () => {
    // Step 1: Register new user
    const registerData = {
      name: 'Integration Test User',
      email: 'integration@test.com',
      password: 'TestPassword123!',
      phone: '0901234567',
      role: 'customer'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(registerData);

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.data.token).toBeDefined();

    const token = registerResponse.body.data.token;
    const userId = registerResponse.body.data.user._id;

    // Step 2: Verify user stored in database
    const userInDb = await User.findById(userId);
    expect(userInDb).toBeTruthy();
    expect(userInDb.email).toBe(registerData.email);
    expect(userInDb.password).not.toBe(registerData.password); // Should be hashed

    // Step 3: Login with same credentials
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: registerData.email,
        password: registerData.password
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.data.token).toBeDefined();

    // Step 4: Access protected route with token
    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.data.email).toBe(registerData.email);
  });
});

// ==================== ORDER CREATION INTEGRATION ====================

describe('Order Creation Integration Tests', () => {
  
  let customerToken;
  let restaurantId;
  let productId;

  beforeEach(async () => {
    // Setup: Create customer
    const customer = await User.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      password: 'Password123!',
      role: 'customer'
    });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@test.com', password: 'Password123!' });

    customerToken = loginResponse.body.data.token;

    // Setup: Create restaurant
    const restaurant = await User.create({
      name: 'Test Restaurant',
      email: 'restaurant@test.com',
      password: 'Password123!',
      role: 'restaurant'
    });
    restaurantId = restaurant._id;

    // Setup: Create product
    const product = await Product.create({
      name: 'Test Product',
      price: 50000,
      category: 'food',
      restaurant: restaurantId,
      stock: 100
    });
    productId = product._id;
  });

  test('TC-INT-003: Complete order flow từ cart đến payment', async () => {
    // Step 1 & 2: Add product to cart (handled in frontend, skip)
    
    // Step 3: Create order
    const orderData = {
      items: [
        {
          product: productId,
          quantity: 2,
          price: 50000
        }
      ],
      deliveryAddress: {
        street: '123 Test Street',
        city: 'Hanoi',
        district: 'Ba Dinh',
        coordinates: { lat: 21.0285, lng: 105.8542 }
      },
      paymentMethod: 'VNPay',
      totalAmount: 100000
    };

    const createOrderResponse = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(orderData);

    expect(createOrderResponse.status).toBe(201);
    expect(createOrderResponse.body.data.status).toBe('pending');

    const orderId = createOrderResponse.body.data._id;

    // Step 4: Generate VNPay URL
    const paymentResponse = await request(app)
      .post('/api/payment/create-payment')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderId: orderId,
        amount: 100000
      });

    expect(paymentResponse.status).toBe(200);
    expect(paymentResponse.body.data.paymentUrl).toBeDefined();
    expect(paymentResponse.body.data.paymentUrl).toContain('vnpay');

    // Step 5: Simulate VNPay callback (payment success)
    const callbackParams = {
      vnp_TxnRef: orderId,
      vnp_ResponseCode: '00', // Success code
      vnp_Amount: '10000000', // 100000 * 100
      vnp_SecureHash: 'mock_hash'
    };

    const callbackResponse = await request(app)
      .get('/api/payment/vnpay-return')
      .query(callbackParams);

    // Step 6: Verify order status updated
    const updatedOrder = await Order.findById(orderId);
    expect(updatedOrder.paymentStatus).toBe('paid');
    expect(updatedOrder.status).toBe('confirmed');

    // Step 7: Verify drone auto-assigned (if enabled)
    if (updatedOrder.drone) {
      const drone = await Drone.findById(updatedOrder.drone);
      expect(drone.status).toBe('busy');
    }
  });

  test('TC-INT-004: Order flow với COD payment', async () => {
    // Step 1: Create order with COD
    const orderData = {
      items: [
        {
          product: productId,
          quantity: 1,
          price: 50000
        }
      ],
      deliveryAddress: {
        street: '456 Test Road',
        city: 'Hanoi',
        coordinates: { lat: 21.0285, lng: 105.8542 }
      },
      paymentMethod: 'COD',
      totalAmount: 50000
    };

    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(orderData);

    expect(response.status).toBe(201);
    expect(response.body.data.paymentMethod).toBe('COD');
    expect(response.body.data.paymentStatus).toBe('pending');

    // Step 2: Verify no payment URL generated
    expect(response.body.data.paymentUrl).toBeUndefined();

    // Step 3: Verify order created successfully
    const order = await Order.findById(response.body.data._id);
    expect(order).toBeTruthy();
    expect(order.paymentMethod).toBe('COD');
  });
});

// ==================== DRONE ASSIGNMENT INTEGRATION ====================

describe('Drone Assignment Integration Tests', () => {
  
  let customerToken;
  let orderId;
  let droneId;

  beforeEach(async () => {
    // Create customer and order
    const customer = await User.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      password: 'Password123!',
      role: 'customer'
    });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@test.com', password: 'Password123!' });

    customerToken = loginResponse.body.data.token;

    // Create product
    const product = await Product.create({
      name: 'Test Product',
      price: 50000,
      category: 'food',
      stock: 100
    });

    // Create order
    const order = await Order.create({
      customer: customer._id,
      items: [{ product: product._id, quantity: 1, price: 50000 }],
      totalAmount: 50000,
      status: 'pending',
      paymentStatus: 'pending',
      deliveryAddress: {
        coordinates: { lat: 21.0285, lng: 105.8542 }
      }
    });
    orderId = order._id;

    // Create available drone
    const drone = await Drone.create({
      code: 'DRONE-TEST-001',
      status: 'available',
      battery: 100,
      location: { lat: 21.0285, lng: 105.8542 }
    });
    droneId = drone._id;
  });

  test('TC-INT-005: Auto-assign drone khi order confirmed', async () => {
    // Step 1 & 2: Order confirmed (payment success)
    const order = await Order.findById(orderId);
    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    await order.save();

    // Step 3: Trigger auto-assignment (simulate cron job or webhook)
    const assignResponse = await request(app)
      .post(`/api/orders/${orderId}/assign-drone`)
      .set('Authorization', `Bearer ${customerToken}`);

    // Step 4: Verify drone status = "busy"
    const drone = await Drone.findById(droneId);
    expect(drone.status).toBe('busy');

    // Step 5: Verify order status = "assigned"
    const updatedOrder = await Order.findById(orderId);
    expect(updatedOrder.status).toBe('assigned');
    expect(updatedOrder.drone.toString()).toBe(droneId.toString());
  });

  test('TC-INT-006: Drone complete delivery flow', async () => {
    // Step 1: Assign drone to order
    await Order.findByIdAndUpdate(orderId, {
      drone: droneId,
      status: 'assigned'
    });
    await Drone.findByIdAndUpdate(droneId, { status: 'busy' });

    // Step 2: Update status to "delivering"
    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .send({ status: 'delivering' });

    let order = await Order.findById(orderId);
    expect(order.status).toBe('delivering');

    // Step 3: Update drone location periodically (simulate)
    await Drone.findByIdAndUpdate(droneId, {
      location: { lat: 21.0300, lng: 105.8550 }
    });

    // Step 4: Mark as "delivered"
    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .send({ status: 'delivered' });

    order = await Order.findById(orderId);
    expect(order.status).toBe('delivered');

    // Step 5: Verify drone status = "available"
    const drone = await Drone.findById(droneId);
    expect(drone.status).toBe('available');
  });
});

// ==================== SOCKET.IO INTEGRATION ====================

describe('Socket.io Integration Tests', () => {
  
  const io = require('socket.io-client');
  let clientSocket;
  let serverSocket;

  beforeAll((done) => {
    const PORT = process.env.TEST_PORT || 5001;
    // Start server on test port
    const server = app.listen(PORT, () => {
      done();
    });
  });

  beforeEach((done) => {
    const PORT = process.env.TEST_PORT || 5001;
    clientSocket = io(`http://localhost:${PORT}`, {
      auth: { token: 'valid_test_token' }
    });
    
    clientSocket.on('connect', done);
  });

  afterEach(() => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  test('TC-INT-007: Order update broadcast to customer', (done) => {
    const orderId = 'test_order_id';
    
    // Customer listens for order updates
    clientSocket.on('order:updated', (data) => {
      expect(data.orderId).toBe(orderId);
      expect(data.status).toBe('preparing');
      done();
    });

    // Simulate restaurant updating order
    setTimeout(() => {
      clientSocket.emit('order:update', {
        orderId: orderId,
        status: 'preparing'
      });
    }, 100);
  });

  test('TC-INT-008: Drone location broadcast to admin', (done) => {
    const droneId = 'test_drone_id';
    
    // Admin listens for drone location updates
    clientSocket.on('drone:location-updated', (data) => {
      expect(data.droneId).toBe(droneId);
      expect(data.location).toBeDefined();
      expect(data.location.lat).toBeDefined();
      expect(data.location.lng).toBeDefined();
      done();
    });

    // Simulate drone updating location
    setTimeout(() => {
      clientSocket.emit('drone:update-location', {
        droneId: droneId,
        location: { lat: 21.0285, lng: 105.8542 }
      });
    }, 100);
  });
});

// ==================== DATABASE OPERATIONS ====================

describe('Database Operations Integration Tests', () => {
  
  test('TC-DB-002: Cascade delete relationships', async () => {
    // Create restaurant with products
    const restaurant = await User.create({
      name: 'Test Restaurant',
      email: 'restaurant@test.com',
      password: 'Password123!',
      role: 'restaurant'
    });

    const product1 = await Product.create({
      name: 'Product 1',
      price: 50000,
      restaurant: restaurant._id
    });

    const product2 = await Product.create({
      name: 'Product 2',
      price: 60000,
      restaurant: restaurant._id
    });

    // Delete restaurant
    await User.findByIdAndDelete(restaurant._id);

    // Verify products also deleted (if cascade delete is implemented)
    const remainingProducts = await Product.find({ restaurant: restaurant._id });
    expect(remainingProducts.length).toBe(0);
  });

  test('TC-DB-004: Geospatial query finds nearest drone', async () => {
    // Create drones at different locations
    await Drone.create({
      code: 'DRONE-1',
      status: 'available',
      location: { lat: 21.0285, lng: 105.8542 } // Close
    });

    await Drone.create({
      code: 'DRONE-2',
      status: 'available',
      location: { lat: 21.0500, lng: 105.9000 } // Far
    });

    // Find nearest drone to order location
    const orderLocation = { lat: 21.0280, lng: 105.8540 };

    const nearestDrone = await Drone.findOne({
      status: 'available',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [orderLocation.lng, orderLocation.lat]
          }
        }
      }
    });

    expect(nearestDrone.code).toBe('DRONE-1');
  });
});

module.exports = {
  // Export for CI/CD
};
