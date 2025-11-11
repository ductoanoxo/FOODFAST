const request = require('supertest');
const express = require('express');
const droneRouter = require('../../../API/Routers/droneRouter');

// Mock controllers
jest.mock('../../../API/Controllers/droneController', () => ({
    getDrones: jest.fn((req, res) => res.json({ success: true, data: [] })),
    getDroneById: jest.fn((req, res) => res.json({ success: true, data: { id: req.params.id } })),
    createDrone: jest.fn((req, res) => res.status(201).json({ success: true, data: req.body })),
    updateDrone: jest.fn((req, res) => res.json({ success: true, data: req.body })),
    deleteDrone: jest.fn((req, res) => res.json({ success: true, data: {} })),
    updateDroneLocation: jest.fn((req, res) => res.json({ success: true, data: { location: req.body.location } })),
    updateDroneStatus: jest.fn((req, res) => res.json({ success: true, data: { status: req.body.status } })),
    updateDroneBattery: jest.fn((req, res) => res.json({ success: true, data: { battery: req.body.battery } })),
    assignDroneToOrder: jest.fn((req, res) => res.json({ success: true, data: { assigned: true } })),
    getNearbyDrones: jest.fn((req, res) => res.json({ success: true, data: [] })),
    getDroneStats: jest.fn((req, res) => res.json({ success: true, data: { stats: {} } }))
}));

jest.mock('../../../API/Controllers/droneSimulationController', () => ({
    startDeliverySimulation: jest.fn((req, res) => res.json({ success: true, data: { simulation: 'started' } })),
    stopDeliverySimulation: jest.fn((req, res) => res.json({ success: true, data: { simulation: 'stopped' } })),
    getActiveSimulations: jest.fn((req, res) => res.json({ success: true, data: [] }))
}));

// Mock middleware
jest.mock('../../../API/Middleware/authMiddleware', () => ({
    protect: (req, res, next) => {
        req.user = { _id: 'admin123', role: 'admin' };
        next();
    },
    authorize: (...roles) => (req, res, next) => {
        if (roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ success: false, error: 'Not authorized' });
        }
    }
}));

describe('Drone Routes - Unit Tests', () => {
    let app;
    const droneController = require('../../../API/Controllers/droneController');
    const droneSimulationController = require('../../../API/Controllers/droneSimulationController');

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api/drones', droneRouter);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/drones', () => {
        it('should call getDrones controller', async() => {
            await request(app).get('/api/drones');

            expect(droneController.getDrones).toHaveBeenCalled();
        });

        it('should allow public access to drone list', async() => {
            const response = await request(app).get('/api/drones');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('GET /api/drones/nearby', () => {
        it('should call getNearbyDrones controller', async() => {
            await request(app).get('/api/drones/nearby');

            expect(droneController.getNearbyDrones).toHaveBeenCalled();
        });
    });

    describe('GET /api/drones/simulations', () => {
        it('should call getActiveSimulations controller', async() => {
            await request(app).get('/api/drones/simulations');

            expect(droneSimulationController.getActiveSimulations).toHaveBeenCalled();
        });
    });

    describe('GET /api/drones/:id', () => {
        it('should call getDroneById controller', async() => {
            await request(app).get('/api/drones/drone123');

            expect(droneController.getDroneById).toHaveBeenCalled();
        });

        it('should return drone details', async() => {
            const response = await request(app).get('/api/drones/drone123');

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe('drone123');
        });
    });

    describe('POST /api/drones', () => {
        it('should call createDrone controller', async() => {
            await request(app)
                .post('/api/drones')
                .send({ name: 'Drone 1', status: 'available' });

            expect(droneController.createDrone).toHaveBeenCalled();
        });

        it('should return 201 on success', async() => {
            const response = await request(app)
                .post('/api/drones')
                .send({ name: 'Drone 1' });

            expect(response.status).toBe(201);
        });
    });

    describe('PUT /api/drones/:id', () => {
        it('should call updateDrone controller', async() => {
            await request(app)
                .put('/api/drones/drone123')
                .send({ name: 'Updated Drone' });

            expect(droneController.updateDrone).toHaveBeenCalled();
        });
    });

    describe('DELETE /api/drones/:id', () => {
        it('should call deleteDrone controller', async() => {
            await request(app).delete('/api/drones/drone123');

            expect(droneController.deleteDrone).toHaveBeenCalled();
        });
    });

    describe('PATCH /api/drones/:id/location', () => {
        it('should call updateDroneLocation controller', async() => {
            await request(app)
                .patch('/api/drones/drone123/location')
                .send({ location: { lat: 10.123, lng: 106.456 } });

            expect(droneController.updateDroneLocation).toHaveBeenCalled();
        });

        it('should return updated location', async() => {
            const response = await request(app)
                .patch('/api/drones/drone123/location')
                .send({ location: { lat: 10, lng: 106 } });

            expect(response.body.data.location).toBeDefined();
        });
    });

    describe('PATCH /api/drones/:id/status', () => {
        it('should call updateDroneStatus controller', async() => {
            await request(app)
                .patch('/api/drones/drone123/status')
                .send({ status: 'busy' });

            expect(droneController.updateDroneStatus).toHaveBeenCalled();
        });
    });

    describe('PATCH /api/drones/:id/battery', () => {
        it('should call updateDroneBattery controller', async() => {
            await request(app)
                .patch('/api/drones/drone123/battery')
                .send({ battery: 85 });

            expect(droneController.updateDroneBattery).toHaveBeenCalled();
        });

        it('should return updated battery level', async() => {
            const response = await request(app)
                .patch('/api/drones/drone123/battery')
                .send({ battery: 85 });

            expect(response.body.data.battery).toBe(85);
        });
    });

    describe('POST /api/drones/:id/assign', () => {
        it('should call assignDroneToOrder controller', async() => {
            await request(app)
                .post('/api/drones/drone123/assign')
                .send({ orderId: 'order123' });

            expect(droneController.assignDroneToOrder).toHaveBeenCalled();
        });

        it('should return assignment confirmation', async() => {
            const response = await request(app)
                .post('/api/drones/drone123/assign')
                .send({ orderId: 'order123' });

            expect(response.body.data.assigned).toBe(true);
        });
    });

    describe('POST /api/drones/:id/start-delivery', () => {
        it('should call startDeliverySimulation controller', async() => {
            await request(app).post('/api/drones/drone123/start-delivery');

            expect(droneSimulationController.startDeliverySimulation).toHaveBeenCalled();
        });

        it('should return simulation status', async() => {
            const response = await request(app).post('/api/drones/drone123/start-delivery');

            expect(response.body.data.simulation).toBe('started');
        });
    });

    describe('POST /api/drones/:id/stop-delivery', () => {
        it('should call stopDeliverySimulation controller', async() => {
            await request(app).post('/api/drones/drone123/stop-delivery');

            expect(droneSimulationController.stopDeliverySimulation).toHaveBeenCalled();
        });
    });

    describe('GET /api/drones/:id/stats', () => {
        it('should call getDroneStats controller', async() => {
            await request(app).get('/api/drones/drone123/stats');

            expect(droneController.getDroneStats).toHaveBeenCalled();
        });

        it('should return drone statistics', async() => {
            const response = await request(app).get('/api/drones/drone123/stats');

            expect(response.body.data.stats).toBeDefined();
        });
    });

    describe('Route Structure', () => {
        it('should have all required drone routes defined', () => {
            expect(droneController.getDrones).toBeDefined();
            expect(droneController.getDroneById).toBeDefined();
            expect(droneController.createDrone).toBeDefined();
            expect(droneController.updateDrone).toBeDefined();
            expect(droneController.deleteDrone).toBeDefined();
            expect(droneController.updateDroneLocation).toBeDefined();
            expect(droneController.updateDroneStatus).toBeDefined();
            expect(droneController.updateDroneBattery).toBeDefined();
            expect(droneController.assignDroneToOrder).toBeDefined();
            expect(droneController.getNearbyDrones).toBeDefined();
            expect(droneController.getDroneStats).toBeDefined();
        });

        it('should have all simulation routes defined', () => {
            expect(droneSimulationController.startDeliverySimulation).toBeDefined();
            expect(droneSimulationController.stopDeliverySimulation).toBeDefined();
            expect(droneSimulationController.getActiveSimulations).toBeDefined();
        });
    });
});