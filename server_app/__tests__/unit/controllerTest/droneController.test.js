const droneController = require('../../../API/Controllers/droneController');

describe('Drone Controller - Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
            query: {},
            user: { _id: 'admin123', role: 'admin' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('Controller Structure', () => {
        it('should export getDrones function', () => {
            expect(droneController.getDrones).toBeDefined();
            expect(typeof droneController.getDrones).toBe('function');
        });

        it('should export getDroneById function', () => {
            expect(droneController.getDroneById).toBeDefined();
            expect(typeof droneController.getDroneById).toBe('function');
        });

        it('should export createDrone function', () => {
            expect(droneController.createDrone).toBeDefined();
            expect(typeof droneController.createDrone).toBe('function');
        });

        it('should export updateDrone function', () => {
            expect(droneController.updateDrone).toBeDefined();
            expect(typeof droneController.updateDrone).toBe('function');
        });

        it('should export deleteDrone function', () => {
            expect(droneController.deleteDrone).toBeDefined();
            expect(typeof droneController.deleteDrone).toBe('function');
        });

        it('should export updateDroneLocation function', () => {
            expect(droneController.updateDroneLocation).toBeDefined();
            expect(typeof droneController.updateDroneLocation).toBe('function');
        });

        it('should export updateDroneStatus function', () => {
            expect(droneController.updateDroneStatus).toBeDefined();
            expect(typeof droneController.updateDroneStatus).toBe('function');
        });

        it('should export updateDroneBattery function', () => {
            expect(droneController.updateDroneBattery).toBeDefined();
            expect(typeof droneController.updateDroneBattery).toBe('function');
        });

        it('should export assignDroneToOrder function', () => {
            expect(droneController.assignDroneToOrder).toBeDefined();
            expect(typeof droneController.assignDroneToOrder).toBe('function');
        });

        it('should export getNearbyDrones function', () => {
            expect(droneController.getNearbyDrones).toBeDefined();
            expect(typeof droneController.getNearbyDrones).toBe('function');
        });

        it('should export getDroneStats function', () => {
            expect(droneController.getDroneStats).toBeDefined();
            expect(typeof droneController.getDroneStats).toBe('function');
        });
    });

    describe('Function Exports', () => {
        it('should have all required drone management functions', () => {
            const requiredFunctions = [
                'getDrones',
                'getDroneById',
                'createDrone',
                'updateDrone',
                'deleteDrone',
                'updateDroneLocation',
                'updateDroneStatus',
                'updateDroneBattery',
                'assignDroneToOrder',
                'getNearbyDrones',
                'getDroneStats'
            ];

            requiredFunctions.forEach(funcName => {
                expect(droneController[funcName]).toBeDefined();
                expect(typeof droneController[funcName]).toBe('function');
            });
        });
    });

    describe('getNearbyDrones - Query Validation', () => {
        it('should reject when latitude and longitude are missing', async() => {
            req.query = {}; // No lat/lng

            await droneController.getNearbyDrones(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.message).toContain('Please provide longitude and latitude');
        });

        it('should reject invalid coordinate format', async() => {
            req.query = { lat: 'invalid', lng: 'invalid' };

            await droneController.getNearbyDrones(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            // Mongoose will throw cast error for invalid numbers
            expect(error.message).toBeDefined();
        });
    });
});