/**
 * 🚁 INTEGRATION TEST: DRONE API ROUTES
 * Test toàn bộ Drone Management endpoints
 * Độ quan trọng: ⭐⭐⭐⭐⭐ (Critical)
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createTestApp = require('../helpers/testApp');
const User = require('../../API/Models/User');
const Drone = require('../../API/Models/Drone');
const Order = require('../../API/Models/Order');
const Restaurant = require('../../API/Models/Restaurant');
const Product = require('../../API/Models/Product');

const app = createTestApp();
let mongod;

describe('🚁 DRONE API - INTEGRATION TESTS', () => {
    let customerToken, adminToken, droneToken;
    let testDrone;

    beforeAll(async() => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        await mongoose.connect(uri);
    });

    afterAll(async() => {
        await mongoose.disconnect();
        await mongod.stop();
    });

    beforeEach(async() => {
        // Tạo Customer
        const customerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Customer Drone',
                email: 'customer@drone.com',
                password: 'Customer@123',
                phone: '0901234567',
                role: 'customer'
            });
        customerToken = customerRes.body.data.token;

        // Tạo Admin
        const adminRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Admin Drone',
                email: 'admin@drone.com',
                password: 'Admin@123',
                phone: '0903456789',
                role: 'admin'
            });
        adminToken = adminRes.body.data.token;

        // Tạo Drone Operator
        const droneRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Drone Operator',
                email: 'drone@operator.com',
                password: 'Drone@123',
                phone: '0904567890',
                role: 'drone'
            });
        droneToken = droneRes.body.data.token;

        // Tạo test drone
        testDrone = await Drone.create({
            name: 'Test Drone Alpha',
            model: 'DJI Phantom 4 Pro',
            status: 'available',
            battery: 95,
            maxRange: 15,
            location: {
                type: 'Point',
                coordinates: [106.660172, 10.762622] // Landmark 81
            }
        });
    });

    afterEach(async() => {
        await User.deleteMany({});
        await Drone.deleteMany({});
        await Order.deleteMany({});
    });

    // ==================== GET /api/drones ==================== //
    describe('GET /api/drones', () => {
        beforeEach(async() => {
            // Tạo thêm 2 drones
            await Drone.create([{
                    name: 'Drone Beta',
                    model: 'DJI Mavic',
                    status: 'busy',
                    battery: 60,
                    maxRange: 10,
                    location: { type: 'Point', coordinates: [106.67, 10.77] }
                },
                {
                    name: 'Drone Gamma',
                    model: 'DJI Mini',
                    status: 'charging',
                    battery: 30,
                    maxRange: 8,
                    location: { type: 'Point', coordinates: [106.68, 10.78] }
                }
            ]);
        });

        test('✅ DRN-001: Lấy danh sách drones (public)', async() => {
            const res = await request(app).get('/api/drones');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThanOrEqual(3);
        });

        test('✅ DRN-002: Lọc drones theo status', async() => {
            const res = await request(app)
                .get('/api/drones')
                .query({ status: 'available' });

            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.every(d => d.status === 'available')).toBe(true);
        });

        test('✅ DRN-003: Lọc drones theo battery tối thiểu', async() => {
            const res = await request(app)
                .get('/api/drones')
                .query({ minBattery: 50 });

            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.every(d => d.battery >= 50)).toBe(true);
        });
    });

    // ==================== GET /api/drones/:id ==================== //
    describe('GET /api/drones/:id', () => {
        test('✅ DRN-004: Lấy chi tiết drone theo ID', async() => {
            const res = await request(app).get(`/api/drones/${testDrone._id}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data._id.toString()).toBe(testDrone._id.toString());
            expect(res.body.data.name).toBe('Test Drone Alpha');
        });

        test('❌ DRN-005: Lỗi khi drone ID không tồn tại', async() => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/api/drones/${fakeId}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        test('❌ DRN-006: Lỗi khi drone ID không hợp lệ', async() => {
            const res = await request(app).get('/api/drones/invalid_id');

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // ==================== POST /api/drones (Create) ==================== //
    describe('POST /api/drones', () => {
        const validDroneData = {
            name: 'New Drone Delta',
            model: 'DJI Matrice 300',
            status: 'available',
            battery: 100,
            maxRange: 20,
            location: {
                type: 'Point',
                coordinates: [106.69, 10.79]
            }
        };

        test('✅ DRN-007: Admin tạo drone mới thành công', async() => {
            const res = await request(app)
                .post('/api/drones')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(validDroneData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(validDroneData.name);
            expect(res.body.data.status).toBe('available');

            // Verify trong database
            const droneInDb = await Drone.findById(res.body.data._id);
            expect(droneInDb).toBeTruthy();
        });

        test('❌ DRN-008: Customer không thể tạo drone', async() => {
            const res = await request(app)
                .post('/api/drones')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(validDroneData);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        test('❌ DRN-009: Lỗi khi không có token', async() => {
            const res = await request(app)
                .post('/api/drones')
                .send(validDroneData);

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        test('❌ DRN-010: Lỗi khi thiếu trường name', async() => {
            const invalidData = {...validDroneData };
            delete invalidData.name;

            const res = await request(app)
                .post('/api/drones')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(invalidData);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('❌ DRN-011: Lỗi khi battery > 100', async() => {
            const res = await request(app)
                .post('/api/drones')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({...validDroneData, battery: 150 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('❌ DRN-012: Lỗi khi battery < 0', async() => {
            const res = await request(app)
                .post('/api/drones')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({...validDroneData, battery: -10 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('❌ DRN-013: Lỗi khi location coordinates không hợp lệ', async() => {
            const res = await request(app)
                .post('/api/drones')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    ...validDroneData,
                    location: { coordinates: [200, 100] } // Invalid
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // ==================== PUT /api/drones/:id (Update) ==================== //
    describe('PUT /api/drones/:id', () => {
        test('✅ DRN-014: Admin cập nhật drone thành công', async() => {
            const updateData = {
                name: 'Updated Drone Alpha',
                battery: 80,
                status: 'charging'
            };

            const res = await request(app)
                .put(`/api/drones/${testDrone._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(updateData.name);
            expect(res.body.data.battery).toBe(updateData.battery);
        });

        test('✅ DRN-015: Drone operator cập nhật drone của mình', async() => {
            const res = await request(app)
                .put(`/api/drones/${testDrone._id}`)
                .set('Authorization', `Bearer ${droneToken}`)
                .send({ battery: 70 });

            expect(res.status).toBe(200);
            expect(res.body.data.battery).toBe(70);
        });

        test('❌ DRN-016: Customer không thể cập nhật drone', async() => {
            const res = await request(app)
                .put(`/api/drones/${testDrone._id}`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ battery: 50 });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        test('❌ DRN-017: Lỗi khi drone không tồn tại', async() => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/api/drones/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ battery: 60 });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    // ==================== DELETE /api/drones/:id ==================== //
    describe('DELETE /api/drones/:id', () => {
        test('✅ DRN-018: Admin xóa drone thành công', async() => {
            const res = await request(app)
                .delete(`/api/drones/${testDrone._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify đã bị xóa
            const droneInDb = await Drone.findById(testDrone._id);
            expect(droneInDb).toBeNull();
        });

        test('❌ DRN-019: Drone operator không thể xóa drone', async() => {
            const res = await request(app)
                .delete(`/api/drones/${testDrone._id}`)
                .set('Authorization', `Bearer ${droneToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);

            // Verify chưa bị xóa
            const droneInDb = await Drone.findById(testDrone._id);
            expect(droneInDb).toBeTruthy();
        });

        test('❌ DRN-020: Customer không thể xóa drone', async() => {
            const res = await request(app)
                .delete(`/api/drones/${testDrone._id}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });

    // ==================== PATCH /api/drones/:id/location ==================== //
    describe('PATCH /api/drones/:id/location', () => {
        test('✅ DRN-021: Cập nhật vị trí drone thành công', async() => {
            const newLocation = {
                type: 'Point',
                coordinates: [106.700172, 10.776622]
            };

            const res = await request(app)
                .patch(`/api/drones/${testDrone._id}/location`)
                .set('Authorization', `Bearer ${droneToken}`)
                .send({ location: newLocation });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.location.coordinates).toEqual(newLocation.coordinates);
        });

        test('❌ DRN-022: Lỗi khi coordinates không hợp lệ', async() => {
            const res = await request(app)
                .patch(`/api/drones/${testDrone._id}/location`)
                .set('Authorization', `Bearer ${droneToken}`)
                .send({
                    location: { coordinates: [200, 100] }
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // ==================== PATCH /api/drones/:id/battery ==================== //
    describe('PATCH /api/drones/:id/battery', () => {
        test('✅ DRN-023: Cập nhật pin drone thành công', async() => {
            const res = await request(app)
                .patch(`/api/drones/${testDrone._id}/battery`)
                .set('Authorization', `Bearer ${droneToken}`)
                .send({ battery: 85 });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.battery).toBe(85);
        });

        test('❌ DRN-024: Lỗi khi battery > 100', async() => {
            const res = await request(app)
                .patch(`/api/drones/${testDrone._id}/battery`)
                .set('Authorization', `Bearer ${droneToken}`)
                .send({ battery: 120 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('❌ DRN-025: Lỗi khi battery < 0', async() => {
            const res = await request(app)
                .patch(`/api/drones/${testDrone._id}/battery`)
                .set('Authorization', `Bearer ${droneToken}`)
                .send({ battery: -5 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // ==================== PATCH /api/drones/:id/status ==================== //
    describe('PATCH /api/drones/:id/status', () => {
        test('✅ DRN-026: Cập nhật status drone thành công', async() => {
            const res = await request(app)
                .patch(`/api/drones/${testDrone._id}/status`)
                .set('Authorization', `Bearer ${droneToken}`)
                .send({ status: 'busy' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('busy');
        });

        test('❌ DRN-027: Lỗi khi status không hợp lệ', async() => {
            const res = await request(app)
                .patch(`/api/drones/${testDrone._id}/status`)
                .set('Authorization', `Bearer ${droneToken}`)
                .send({ status: 'invalid_status' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('✅ DRN-028: Chuyển status: busy → available', async() => {
            await Drone.findByIdAndUpdate(testDrone._id, { status: 'busy' });

            const res = await request(app)
                .patch(`/api/drones/${testDrone._id}/status`)
                .set('Authorization', `Bearer ${droneToken}`)
                .send({ status: 'available' });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('available');
        });

        test('✅ DRN-029: Chuyển status: available → charging', async() => {
            const res = await request(app)
                .patch(`/api/drones/${testDrone._id}/status`)
                .set('Authorization', `Bearer ${droneToken}`)
                .send({ status: 'charging' });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('charging');
        });
    });

    // ==================== GET /api/drones/nearby ==================== //
    describe('GET /api/drones/nearby', () => {
        beforeEach(async() => {
            // Tạo thêm drones ở các vị trí khác nhau
            await Drone.create([{
                    name: 'Nearby Drone 1',
                    model: 'DJI',
                    status: 'available',
                    battery: 90,
                    maxRange: 15,
                    location: { type: 'Point', coordinates: [106.661, 10.763] } // Rất gần
                },
                {
                    name: 'Far Drone',
                    model: 'DJI',
                    status: 'available',
                    battery: 90,
                    maxRange: 15,
                    location: { type: 'Point', coordinates: [106.8, 10.9] } // Xa
                }
            ]);
        });

        test('✅ DRN-030: Tìm drone gần nhất (lat/lng)', async() => {
            const res = await request(app)
                .get('/api/drones/nearby')
                .query({
                    lat: 10.762622,
                    lng: 106.660172,
                    maxDistance: 5
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeTruthy();
        });

        test('❌ DRN-031: Lỗi khi thiếu lat hoặc lng', async() => {
            const res = await request(app)
                .get('/api/drones/nearby')
                .query({ lat: 10.76 }); // Thiếu lng

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('❌ DRN-032: Lỗi khi lat/lng không hợp lệ', async() => {
            const res = await request(app)
                .get('/api/drones/nearby')
                .query({ lat: 200, lng: 100 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // ==================== GET /api/drones/:id/stats ==================== //
    describe('GET /api/drones/:id/stats', () => {
        test('✅ DRN-033: Admin lấy thống kê drone', async() => {
            const res = await request(app)
                .get(`/api/drones/${testDrone._id}/stats`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('totalDeliveries');
        });

        test('❌ DRN-034: Customer không thể xem stats', async() => {
            const res = await request(app)
                .get(`/api/drones/${testDrone._id}/stats`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });
});