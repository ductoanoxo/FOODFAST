/**
 * SIMPLE INTEGRATION TEST - Kiểm tra setup cơ bản
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createTestApp = require('../helpers/testApp');

const app = createTestApp();
let mongod;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    
    await mongoose.connect(uri);
    console.log('✅ Test DB connected');
}, 60000);

afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
    console.log('✅ Test DB disconnected');
}, 60000);

describe('🧪 Simple Integration Test - Setup Check', () => {
    
    test('✅ Express app khởi tạo thành công', () => {
        expect(app).toBeDefined();
    });
    
    test('✅ MongoDB Memory Server hoạt động', async () => {
        expect(mongoose.connection.readyState).toBe(1); // 1 = connected
    });
    
    test('✅ API endpoint phản hồi (GET /api/drones)', async () => {
        const response = await request(app)
            .get('/api/drones')
            .expect(200);
        
        expect(response.body).toBeDefined();
        expect(response.body.success).toBe(true);
    }, 10000);
});
