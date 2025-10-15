// ============================================
// BACKEND UNIT TEST EXAMPLES
// ============================================

const request = require('supertest');
const app = require('../index');
const User = require('../API/Models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock database
jest.mock('../API/Models/User');

describe('Authentication Controller Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== REGISTER TESTS ====================
  
  describe('POST /api/auth/register', () => {
    
    test('TC-AUTH-001: Đăng ký thành công với thông tin hợp lệ', async () => {
      // Arrange
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        phone: '0901234567',
        role: 'customer'
      };

      User.findOne.mockResolvedValue(null); // Email chưa tồn tại
      User.prototype.save = jest.fn().mockResolvedValue({
        _id: 'mock_user_id',
        ...newUser,
        password: 'hashed_password'
      });

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(newUser.email);
      expect(response.body.data.user).not.toHaveProperty('password'); // Password không được trả về
    });

    test('TC-AUTH-002: Đăng ký thất bại - Email đã tồn tại', async () => {
      // Arrange
      const existingUser = {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'Password123!',
        phone: '0901234567'
      };

      User.findOne.mockResolvedValue({ email: existingUser.email }); // Email đã tồn tại

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(existingUser);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email already exists');
    });

    test('TC-AUTH-003: Đăng ký thất bại - Thiếu thông tin bắt buộc', async () => {
      // Arrange
      const incompleteUser = {
        email: 'test@example.com',
        password: 'Password123!'
        // Missing name, phone
      };

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteUser);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('TC-AUTH-009: Mật khẩu được mã hóa bcrypt khi lưu', async () => {
      // Arrange
      const plainPassword = 'MySecretPassword123!';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // Act
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);

      // Assert
      expect(isMatch).toBe(true);
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(50); // Bcrypt hash length
    });
  });

  // ==================== LOGIN TESTS ====================
  
  describe('POST /api/auth/login', () => {
    
    test('TC-AUTH-004: Đăng nhập thành công với credentials đúng', async () => {
      // Arrange
      const loginData = {
        email: 'user@example.com',
        password: 'Password123!'
      };

      const mockUser = {
        _id: 'mock_user_id',
        email: loginData.email,
        password: await bcrypt.hash(loginData.password, 10),
        name: 'Test User',
        role: 'customer',
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(loginData.email);
    });

    test('TC-AUTH-005: Đăng nhập thất bại - Sai mật khẩu', async () => {
      // Arrange
      const loginData = {
        email: 'user@example.com',
        password: 'WrongPassword123!'
      };

      const mockUser = {
        _id: 'mock_user_id',
        email: loginData.email,
        password: await bcrypt.hash('CorrectPassword123!', 10),
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      User.findOne.mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('TC-AUTH-006: Đăng nhập thất bại - Email không tồn tại', async () => {
      // Arrange
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!'
      };

      User.findOne.mockResolvedValue(null); // User không tồn tại

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User not found');
    });
  });

  // ==================== GET CURRENT USER TESTS ====================
  
  describe('GET /api/auth/me', () => {
    
    test('TC-AUTH-007: Lấy thông tin user hiện tại thành công', async () => {
      // Arrange
      const mockUser = {
        _id: 'mock_user_id',
        email: 'user@example.com',
        name: 'Test User',
        role: 'customer'
      };

      const token = jwt.sign(
        { id: mockUser._id, role: mockUser.role },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '7d' }
      );

      User.findById.mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(mockUser.email);
    });

    test('TC-AUTH-008: Lấy thông tin thất bại - Token không hợp lệ', async () => {
      // Arrange
      const invalidToken = 'invalid.token.here';

      // Act
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${invalidToken}`);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });

    test('TC-AUTH-010: JWT token có thời hạn hợp lệ', () => {
      // Arrange
      const payload = { id: 'user_id', role: 'customer' };
      const token = jwt.sign(payload, 'test_secret', { expiresIn: '1h' });

      // Act
      const decoded = jwt.verify(token, 'test_secret');

      // Assert
      expect(decoded.id).toBe(payload.id);
      expect(decoded.role).toBe(payload.role);
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      
      // Verify token expires in approximately 1 hour
      const expiresIn = decoded.exp - decoded.iat;
      expect(expiresIn).toBeCloseTo(3600, -2); // 3600 seconds = 1 hour
    });
  });
});

// ==================== PRODUCT CONTROLLER TESTS ====================

describe('Product Controller Tests', () => {
  
  const Product = require('../API/Models/Product');
  jest.mock('../API/Models/Product');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    
    test('TC-PROD-001: Lấy danh sách sản phẩm với pagination', async () => {
      // Arrange
      const mockProducts = Array(20).fill(null).map((_, i) => ({
        _id: `product_${i}`,
        name: `Product ${i}`,
        price: 10000 * (i + 1),
        category: 'food'
      }));

      Product.find.mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockResolvedValue(mockProducts)
        })
      });

      Product.countDocuments.mockResolvedValue(100);

      // Act
      const response = await request(app)
        .get('/api/products?page=1&limit=20');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(20);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(100);
    });

    test('TC-PROD-002: Tìm kiếm sản phẩm theo tên', async () => {
      // Arrange
      const searchTerm = 'phở';
      const mockProducts = [
        { _id: '1', name: 'Phở Bò', price: 45000 },
        { _id: '2', name: 'Phở Gà', price: 40000 }
      ];

      Product.find.mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockResolvedValue(mockProducts)
        })
      });

      // Act
      const response = await request(app)
        .get(`/api/products?search=${searchTerm}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach(product => {
        expect(product.name.toLowerCase()).toContain(searchTerm.toLowerCase());
      });
    });

    test('TC-PROD-004: Lọc sản phẩm theo khoảng giá', async () => {
      // Arrange
      const minPrice = 10000;
      const maxPrice = 50000;
      const mockProducts = [
        { _id: '1', name: 'Product 1', price: 20000 },
        { _id: '2', name: 'Product 2', price: 45000 }
      ];

      Product.find.mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockResolvedValue(mockProducts)
        })
      });

      // Act
      const response = await request(app)
        .get(`/api/products?minPrice=${minPrice}&maxPrice=${maxPrice}`);

      // Assert
      expect(response.status).toBe(200);
      response.body.data.forEach(product => {
        expect(product.price).toBeGreaterThanOrEqual(minPrice);
        expect(product.price).toBeLessThanOrEqual(maxPrice);
      });
    });

    test('TC-PROD-010: Validation giá sản phẩm phải > 0', async () => {
      // Arrange
      const invalidProduct = {
        name: 'Invalid Product',
        price: -1000, // Invalid price
        category: 'food',
        restaurant: 'restaurant_id'
      };

      // Act
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer valid_restaurant_token')
        .send(invalidProduct);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some(err => err.field === 'price')).toBe(true);
    });
  });
});

// ==================== ORDER CONTROLLER TESTS ====================

describe('Order Controller Tests', () => {
  
  const Order = require('../API/Models/Order');
  const Product = require('../API/Models/Product');
  jest.mock('../API/Models/Order');
  jest.mock('../API/Models/Product');

  describe('POST /api/orders', () => {
    
    test('TC-ORDER-001: Tạo đơn hàng mới thành công', async () => {
      // Arrange
      const orderData = {
        items: [
          { product: 'product_1', quantity: 2, price: 45000 }
        ],
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Hanoi',
          coordinates: { lat: 21.0285, lng: 105.8542 }
        },
        paymentMethod: 'VNPay',
        totalAmount: 90000
      };

      Product.findById.mockResolvedValue({ _id: 'product_1', price: 45000, stock: 100 });
      Order.prototype.save = jest.fn().mockResolvedValue({
        _id: 'order_id',
        ...orderData,
        status: 'pending'
      });

      // Act
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer valid_customer_token')
        .send(orderData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.totalAmount).toBe(90000);
    });

    test('TC-ORDER-002: Tạo đơn thất bại - Giỏ hàng trống', async () => {
      // Arrange
      const emptyOrder = {
        items: [], // Empty items
        deliveryAddress: { street: '123 Test', city: 'Hanoi' },
        paymentMethod: 'COD'
      };

      // Act
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer valid_customer_token')
        .send(emptyOrder);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Cart is empty');
    });

    test('TC-ORDER-004: Tính tổng tiền đơn hàng chính xác', () => {
      // Arrange
      const items = [
        { price: 45000, quantity: 2 }, // 90000
        { price: 30000, quantity: 1 }  // 30000
      ];
      const deliveryFee = 15000;
      const discount = 10000;

      // Act
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const total = subtotal + deliveryFee - discount;

      // Assert
      expect(subtotal).toBe(120000);
      expect(total).toBe(125000);
    });

    test('TC-ORDER-011: Không thể hủy đơn khi đang giao', async () => {
      // Arrange
      const orderId = 'delivering_order_id';
      const mockOrder = {
        _id: orderId,
        status: 'delivering',
        save: jest.fn()
      };

      Order.findById.mockResolvedValue(mockOrder);

      // Act
      const response = await request(app)
        .patch(`/api/orders/${orderId}/cancel`)
        .set('Authorization', 'Bearer valid_customer_token');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Cannot cancel order');
    });
  });
});

module.exports = {
  // Export for use in other test files
};
