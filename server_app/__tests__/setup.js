// ============================================
// Test setup file
// This file runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.GOONG_API_KEY = 'test-goong-api-key';

// Mock console methods to keep test output clean
global.console = {
    ...console,
    log: jest.fn(), // Mock console.log
    error: jest.fn(), // Mock console.error
    warn: jest.fn(), // Mock console.warn
};

// Set timeout for async operations
jest.setTimeout(10000);
// ============================================

// Mock external services
jest.mock('cloudinary', () => ({
    v2: {
        config: jest.fn(),
        uploader: {
            upload: jest.fn().mockResolvedValue({
                secure_url: 'https://cloudinary.com/test-image.jpg',
                public_id: 'test_public_id'
            })
        }
    }
}));

// Mock nodemailer
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test_message_id' })
    })
}));

// Mock socket.io
jest.mock('socket.io', () => {
    const mockIo = {
        on: jest.fn(),
        emit: jest.fn(),
        to: jest.fn().mockReturnThis(),
        sockets: {
            emit: jest.fn()
        }
    };
    return jest.fn(() => mockIo);
});

// Global test utilities
global.testUtils = {
    createMockUser: (overrides = {}) => ({
        _id: 'mock_user_id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
        password: 'hashed_password',
        ...overrides
    }),

    createMockProduct: (overrides = {}) => ({
        _id: 'mock_product_id',
        name: 'Test Product',
        price: 50000,
        category: 'food',
        stock: 100,
        ...overrides
    }),

    createMockOrder: (overrides = {}) => ({
        _id: 'mock_order_id',
        customer: 'customer_id',
        items: [{ product: 'product_id', quantity: 1, price: 50000 }],
        totalAmount: 50000,
        status: 'pending',
        ...overrides
    }),

    createMockDrone: (overrides = {}) => ({
        _id: 'mock_drone_id',
        code: 'DRONE-TEST-001',
        status: 'available',
        battery: 100,
        location: { lat: 21.0285, lng: 105.8542 },
        ...overrides
    })
};

// Set timeout for all tests
jest.setTimeout(10000);

console.log('✅ Test environment initialized');