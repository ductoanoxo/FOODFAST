/**
 * 🧪 JEST GLOBAL SETUP
 * Setup và teardown cho test environment
 */

// Set default timeout for all tests
jest.setTimeout(30000);

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'test';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'test';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'test';

// Global beforeAll hook
beforeAll(async () => {
    console.log('🚀 Starting test suite...');
});

// Global afterAll hook
afterAll(async () => {
    console.log('✅ Test suite completed!');
});
