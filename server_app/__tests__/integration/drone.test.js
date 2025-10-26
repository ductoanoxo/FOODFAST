/**
 * 🧪 INTEGRATION TEST: Drone API
 * Test CRUD operations và filtering của drone
 */

const request = require('supertest');
const { createTestApp } = require('../helpers/testApp');
const dbHandler = require('../helpers/dbHandler');
const Drone = require('../../API/Models/droneModel');

const app = createTestApp();

describe('🚁 Drone API Integration Tests', () => {
    beforeAll(async () => {
        await dbHandler.connect();
    });

    afterEach(async () => {
        await dbHandler.clearDatabase();
    });

    afterAll(async () => {
        await dbHandler.closeDatabase();
    });

    describe('GET /api/drones', () => {
        beforeEach(async () => {
            // Create sample drones
            await Drone.create([
                {
                    droneId: 'DRONE-001',
                    model: 'DJI Phantom 4',
                    status: 'available',
                    batteryLevel: 95,
                    currentLocation: {
                        type: 'Point',
                        coordinates: [106.6297, 10.8231]
                    },
                    maxWeight: 5000,
                    currentWeight: 0
                },
                {
                    droneId: 'DRONE-002',
                    model: 'DJI Mavic Pro',
                    status: 'busy',
                    batteryLevel: 60,
                    currentLocation: {
                        type: 'Point',
                        coordinates: [106.6500, 10.8000]
                    },
                    maxWeight: 3000,
                    currentWeight: 1500
                },
                {
                    droneId: 'DRONE-003',
                    model: 'DJI Phantom 4',
                    status: 'available',
                    batteryLevel: 85,
                    currentLocation: {
                        type: 'Point',
                        coordinates: [106.7000, 10.7500]
                    },
                    maxWeight: 5000,
                    currentWeight: 0
                }
            ]);
        });

        test('✅ Lấy tất cả drones', async () => {
            const response = await request(app)
                .get('/api/drones')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(3);
        });

        test('✅ Filter drones by status=available', async () => {
            const response = await request(app)
                .get('/api/drones?status=available')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data.every(d => d.status === 'available')).toBe(true);
        });

        test('✅ Filter drones by battery > 80', async () => {
            const response = await request(app)
                .get('/api/drones?minBattery=80')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
            expect(response.body.data.every(d => d.batteryLevel >= 80)).toBe(true);
        });
    });

    describe('POST /api/drones', () => {
        test('✅ Tạo drone mới thành công', async () => {
            const newDrone = {
                droneId: 'DRONE-999',
                model: 'Custom Drone',
                status: 'available',
                batteryLevel: 100,
                currentLocation: {
                    type: 'Point',
                    coordinates: [106.6297, 10.8231]
                },
                maxWeight: 4000
            };

            const response = await request(app)
                .post('/api/drones')
                .send(newDrone)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.droneId).toBe(newDrone.droneId);
            expect(response.body.data.model).toBe(newDrone.model);

            // Verify in database
            const droneInDb = await Drone.findOne({ droneId: 'DRONE-999' });
            expect(droneInDb).toBeTruthy();
            expect(droneInDb.model).toBe('Custom Drone');
        });

        test('❌ Tạo drone với droneId đã tồn tại', async () => {
            await Drone.create({
                droneId: 'DRONE-001',
                model: 'Existing Drone',
                status: 'available',
                batteryLevel: 100,
                currentLocation: { type: 'Point', coordinates: [106.6297, 10.8231] },
                maxWeight: 4000
            });

            const response = await request(app)
                .post('/api/drones')
                .send({
                    droneId: 'DRONE-001',
                    model: 'Duplicate Drone',
                    status: 'available',
                    batteryLevel: 100,
                    currentLocation: { type: 'Point', coordinates: [106.6297, 10.8231] },
                    maxWeight: 4000
                })
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PATCH /api/drones/:id', () => {
        let droneId;

        beforeEach(async () => {
            const drone = await Drone.create({
                droneId: 'DRONE-001',
                model: 'Test Drone',
                status: 'available',
                batteryLevel: 100,
                currentLocation: { type: 'Point', coordinates: [106.6297, 10.8231] },
                maxWeight: 4000
            });
            droneId = drone._id;
        });

        test('✅ Update drone status', async () => {
            const response = await request(app)
                .patch(`/api/drones/${droneId}`)
                .send({ status: 'busy' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe('busy');

            // Verify in database
            const updatedDrone = await Drone.findById(droneId);
            expect(updatedDrone.status).toBe('busy');
        });

        test('✅ Update drone battery level', async () => {
            const response = await request(app)
                .patch(`/api/drones/${droneId}`)
                .send({ batteryLevel: 75 })
                .expect(200);

            expect(response.body.data.batteryLevel).toBe(75);
        });
    });

    describe('DELETE /api/drones/:id', () => {
        test('✅ Xóa drone thành công', async () => {
            const drone = await Drone.create({
                droneId: 'DRONE-DELETE',
                model: 'To Delete',
                status: 'available',
                batteryLevel: 100,
                currentLocation: { type: 'Point', coordinates: [106.6297, 10.8231] },
                maxWeight: 4000
            });

            await request(app)
                .delete(`/api/drones/${drone._id}`)
                .expect(200);

            // Verify deletion
            const deletedDrone = await Drone.findById(drone._id);
            expect(deletedDrone).toBeNull();
        });

        test('❌ Xóa drone không tồn tại', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            
            await request(app)
                .delete(`/api/drones/${fakeId}`)
                .expect(404);
        });
    });
});
