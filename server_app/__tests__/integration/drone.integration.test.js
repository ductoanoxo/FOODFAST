/**
 * INTEGRATION TEST: Drone Management API
 * Chức năng: CRUD operations cho Drones
 * Độ quan trọng: ⭐⭐⭐⭐⭐ (Critical)
 * 
 * Test: HTTP Request → Router → Controller → MongoDB → Response
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createTestApp = require('../helpers/testApp');
const Drone = require('../../API/Models/Drone');

const app = createTestApp();

let mongod;
let adminToken;

// Setup: Start in-memory MongoDB before all tests
beforeAll(async() => {
    // Create in-memory MongoDB
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // Disconnect if already connected
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    // Connect to in-memory DB
    await mongoose.connect(uri);

    // Create admin user và get token (simplified - no auth for demo)
    adminToken = 'mock-admin-token';
}, 30000);

// Cleanup: Clear data after each test
afterEach(async() => {
    await Drone.deleteMany({});
});

// Teardown: Close DB connection after all tests
afterAll(async() => {
    await mongoose.disconnect();
    await mongod.stop();
});

describe('🚁 Drone Management API - INTEGRATION TEST', () => {

    describe('GET /api/drones', () => {

        test('✅ Trả về danh sách RỖNG khi chưa có drone', async() => {
            const response = await request(app)
                .get('/api/drones')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual([]);
            expect(response.body.count).toBe(0);
        });

        test('✅ Trả về danh sách drones từ DATABASE', async() => {
            // Setup: Tạo 2 drones trong DB
            await Drone.create([{
                    name: 'Drone-001',
                    model: 'DJI Mavic',
                    serialNumber: 'SN001',
                    status: 'available',
                    batteryLevel: 90,
                    homeLocation: {
                        type: 'Point',
                        coordinates: [106.660172, 10.762622]
                    },
                    maxRange: 10,
                    maxLoad: 2
                },
                {
                    name: 'Drone-002',
                    model: 'Parrot',
                    serialNumber: 'SN002',
                    status: 'busy',
                    batteryLevel: 60,
                    homeLocation: {
                        type: 'Point',
                        coordinates: [106.670172, 10.772622]
                    },
                    maxRange: 8,
                    maxLoad: 1.5
                }
            ]);

            // Test: Get all drones
            const response = await request(app)
                .get('/api/drones')
                .expect(200);

            // Verify
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(2);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data[0].name).toBe('Drone-001');
            expect(response.body.data[1].name).toBe('Drone-002');
        });

        test('✅ FILTER drones theo STATUS', async() => {
            // Setup
            await Drone.create([
                { name: 'D1', model: 'DJI', serialNumber: 'SN1', status: 'available', homeLocation: { coordinates: [106.6, 10.7] }, maxRange: 10, maxLoad: 2 },
                { name: 'D2', model: 'DJI', serialNumber: 'SN2', status: 'busy', homeLocation: { coordinates: [106.6, 10.7] }, maxRange: 10, maxLoad: 2 },
                { name: 'D3', model: 'DJI', serialNumber: 'SN3', status: 'available', homeLocation: { coordinates: [106.6, 10.7] }, maxRange: 10, maxLoad: 2 },
            ]);

            // Test: Filter by status=available
            const response = await request(app)
                .get('/api/drones?status=available')
                .expect(200);

            expect(response.body.count).toBe(2);
            expect(response.body.data.every(d => d.status === 'available')).toBe(true);
        });
    });

    describe('POST /api/drones', () => {

        test('✅ TẠO drone mới và LƯU vào DATABASE', async() => {
            const newDrone = {
                name: 'Drone-Test-001',
                model: 'DJI Mavic Pro',
                serialNumber: 'TEST-SN-001',
                status: 'available',
                batteryLevel: 100,
                homeLocation: {
                    type: 'Point',
                    coordinates: [106.660172, 10.762622]
                },
                maxRange: 15,
                maxLoad: 3
            };

            // Test: Create drone
            const response = await request(app)
                .post('/api/drones')
                .send(newDrone)
                .expect(201);

            // Verify response
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Drone-Test-001');
            expect(response.body.data.serialNumber).toBe('TEST-SN-001');
            expect(response.body.data._id).toBeDefined();

            // Verify data THẬT SỰ lưu vào database
            const droneInDB = await Drone.findOne({ serialNumber: 'TEST-SN-001' });
            expect(droneInDB).toBeTruthy();
            expect(droneInDB.name).toBe('Drone-Test-001');
            expect(droneInDB.batteryLevel).toBe(100);
        });

        test('✅ Set currentLocation = homeLocation khi tạo mới', async() => {
            const newDrone = {
                name: 'D1',
                model: 'DJI',
                serialNumber: 'SN001',
                homeLocation: {
                    type: 'Point',
                    coordinates: [106.660172, 10.762622]
                },
                maxRange: 10,
                maxLoad: 2
            };

            const response = await request(app)
                .post('/api/drones')
                .send(newDrone)
                .expect(201);

            // Verify currentLocation = homeLocation
            expect(response.body.data.currentLocation).toBeDefined();
            expect(response.body.data.currentLocation.coordinates).toEqual([106.660172, 10.762622]);
        });

        test('❌ REJECT khi thiếu REQUIRED fields', async() => {
            const invalidDrone = {
                name: 'Incomplete Drone'
                    // Missing: model, serialNumber, homeLocation
            };

            const response = await request(app)
                .post('/api/drones')
                .send(invalidDrone)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        test('❌ REJECT khi DUPLICATE serialNumber', async() => {
            // Create first drone
            await Drone.create({
                name: 'D1',
                model: 'DJI',
                serialNumber: 'DUPLICATE-SN',
                homeLocation: { coordinates: [106.6, 10.7] },
                maxRange: 10,
                maxLoad: 2
            });

            // Try to create with same serialNumber
            const duplicateDrone = {
                name: 'D2',
                model: 'DJI',
                serialNumber: 'DUPLICATE-SN', // Same serial
                homeLocation: { coordinates: [106.6, 10.7] },
                maxRange: 10,
                maxLoad: 2
            };

            const response = await request(app)
                .post('/api/drones')
                .send(duplicateDrone)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/drones/:id', () => {

        test('✅ Trả về CHI TIẾT drone theo ID', async() => {
            // Setup: Create drone
            const drone = await Drone.create({
                name: 'Drone-Detail',
                model: 'DJI',
                serialNumber: 'SN-DETAIL',
                status: 'available',
                batteryLevel: 85,
                homeLocation: { coordinates: [106.6, 10.7] },
                maxRange: 10,
                maxLoad: 2
            });

            // Test: Get drone by ID
            const response = await request(app)
                .get(`/api/drones/${drone._id}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data._id).toBe(drone._id.toString());
            expect(response.body.data.name).toBe('Drone-Detail');
            expect(response.body.data.batteryLevel).toBe(85);
        });

        test('❌ Trả về 404 khi DRONE KHÔNG TỒN TẠI', async() => {
            const fakeId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .get(`/api/drones/${fakeId}`)
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/drones/:id', () => {

        test('✅ CẬP NHẬT drone và lưu vào DB', async() => {
            // Setup
            const drone = await Drone.create({
                name: 'Old Name',
                model: 'DJI',
                serialNumber: 'SN-UPDATE',
                status: 'available',
                batteryLevel: 50,
                homeLocation: { coordinates: [106.6, 10.7] },
                maxRange: 10,
                maxLoad: 2
            });

            // Test: Update drone
            const updates = {
                name: 'New Name',
                status: 'charging',
                batteryLevel: 75
            };

            const response = await request(app)
                .put(`/api/drones/${drone._id}`)
                .send(updates)
                .expect(200);

            // Verify response
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('New Name');
            expect(response.body.data.status).toBe('charging');
            expect(response.body.data.batteryLevel).toBe(75);

            // Verify DB updated
            const updatedDrone = await Drone.findById(drone._id);
            expect(updatedDrone.name).toBe('New Name');
            expect(updatedDrone.status).toBe('charging');
        });
    });

    describe('DELETE /api/drones/:id', () => {

        test('✅ XÓA drone khỏi DATABASE', async() => {
            // Setup
            const drone = await Drone.create({
                name: 'To Delete',
                model: 'DJI',
                serialNumber: 'SN-DELETE',
                homeLocation: { coordinates: [106.6, 10.7] },
                maxRange: 10,
                maxLoad: 2
            });

            // Test: Delete drone
            const response = await request(app)
                .delete(`/api/drones/${drone._id}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify drone DELETED from DB
            const deletedDrone = await Drone.findById(drone._id);
            expect(deletedDrone).toBeNull();
        });
    });
});