const { describe, it, expect } = require('@jest/globals');

/**
 * UNIT TEST: Drone Assignment Algorithm
 * Test logic assign drone gần nhất và available
 */

// Mock distance calculation (Haversine formula)
const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Mock drone assignment function
const findNearestAvailableDrone = (restaurantLocation, drones) => {
    // Filter available drones
    const availableDrones = drones.filter(drone => {
        return drone.status === 'available' && drone.batteryLevel >= 30;
    });

    if (availableDrones.length === 0) {
        throw new Error('Không có drone khả dụng');
    }

    // Find nearest drone
    let nearestDrone = null;
    let minDistance = Infinity;

    availableDrones.forEach(drone => {
        const distance = calculateDistance(restaurantLocation, drone.currentLocation);
        if (distance < minDistance) {
            minDistance = distance;
            nearestDrone = drone;
        }
    });

    return {
        drone: nearestDrone,
        distance: minDistance
    };
};

describe('Drone Assignment Algorithm - Unit Tests', () => {

    const restaurantLocation = {
        lat: 10.8231,
        lng: 106.6297
    };

    describe('findNearestAvailableDrone', () => {
        it('should find nearest available drone', () => {
            const drones = [{
                    id: 'drone1',
                    status: 'available',
                    batteryLevel: 80,
                    currentLocation: { lat: 10.8241, lng: 106.6307 } // Gần nhất
                },
                {
                    id: 'drone2',
                    status: 'available',
                    batteryLevel: 90,
                    currentLocation: { lat: 10.8500, lng: 106.6800 } // Xa hơn
                }
            ];

            const result = findNearestAvailableDrone(restaurantLocation, drones);

            expect(result.drone.id).toBe('drone1');
            expect(result.distance).toBeLessThan(1); // < 1km
        });

        it('should skip busy drones', () => {
            const drones = [{
                    id: 'drone1',
                    status: 'busy', // BUSY - skip
                    batteryLevel: 90,
                    currentLocation: { lat: 10.8241, lng: 106.6307 }
                },
                {
                    id: 'drone2',
                    status: 'available',
                    batteryLevel: 80,
                    currentLocation: { lat: 10.8500, lng: 106.6800 }
                }
            ];

            const result = findNearestAvailableDrone(restaurantLocation, drones);

            expect(result.drone.id).toBe('drone2');
        });

        it('should skip drones with low battery', () => {
            const drones = [{
                    id: 'drone1',
                    status: 'available',
                    batteryLevel: 25, // < 30% - skip
                    currentLocation: { lat: 10.8241, lng: 106.6307 }
                },
                {
                    id: 'drone2',
                    status: 'available',
                    batteryLevel: 50,
                    currentLocation: { lat: 10.8500, lng: 106.6800 }
                }
            ];

            const result = findNearestAvailableDrone(restaurantLocation, drones);

            expect(result.drone.id).toBe('drone2');
            expect(result.drone.batteryLevel).toBeGreaterThanOrEqual(30);
        });

        it('should throw error when no drone available', () => {
            const drones = [{
                    id: 'drone1',
                    status: 'busy',
                    batteryLevel: 80,
                    currentLocation: { lat: 10.8241, lng: 106.6307 }
                },
                {
                    id: 'drone2',
                    status: 'maintenance',
                    batteryLevel: 50,
                    currentLocation: { lat: 10.8500, lng: 106.6800 }
                }
            ];

            expect(() => {
                findNearestAvailableDrone(restaurantLocation, drones);
            }).toThrow('Không có drone khả dụng');
        });

        it('should throw error when all drones have low battery', () => {
            const drones = [{
                    id: 'drone1',
                    status: 'available',
                    batteryLevel: 20,
                    currentLocation: { lat: 10.8241, lng: 106.6307 }
                },
                {
                    id: 'drone2',
                    status: 'available',
                    batteryLevel: 15,
                    currentLocation: { lat: 10.8500, lng: 106.6800 }
                }
            ];

            expect(() => {
                findNearestAvailableDrone(restaurantLocation, drones);
            }).toThrow('Không có drone khả dụng');
        });

        it('should calculate distance correctly', () => {
            const point1 = { lat: 10.8231, lng: 106.6297 }; // Landmark 81
            const point2 = { lat: 10.7769, lng: 106.7009 }; // Chợ Bến Thành

            const distance = calculateDistance(point1, point2);

            expect(distance).toBeGreaterThan(8);
            expect(distance).toBeLessThan(10);
        });
    });
});

module.exports = {
    findNearestAvailableDrone,
    calculateDistance
};