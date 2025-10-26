/**
 * UNIT TEST: Drone Assignment Logic
 * Chức năng: Tìm drone gần nhất và available
 * Độ quan trọng: ⭐⭐⭐⭐⭐ (Critical - core business logic)
 */

// Business logic: Find nearest available drone
function findNearestAvailableDrone(drones, orderLocation) {
    // Filter available drones
    const availableDrones = drones.filter(drone =>
        drone.status === 'available' && drone.battery >= 30
    );

    if (availableDrones.length === 0) {
        throw new Error('No drones available');
    }

    // Calculate distance for each drone
    let nearestDrone = null;
    let minDistance = Infinity;

    for (const drone of availableDrones) {
        const distance = calculateDistance({ lat: drone.location[1], lng: drone.location[0] },
            orderLocation
        );

        if (distance < minDistance) {
            minDistance = distance;
            nearestDrone = drone;
        }
    }

    return { drone: nearestDrone, distance: minDistance };
}

function calculateDistance(point1, point2) {
    const R = 6371;
    const dLat = toRad(point2.lat - point1.lat);
    const dLon = toRad(point2.lng - point1.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(value) {
    return value * Math.PI / 180;
}

describe('🚁 Drone Assignment Logic - UNIT TEST', () => {

    const mockDrones = [{
            id: '1',
            name: 'Drone-001',
            status: 'available',
            battery: 85,
            location: [106.660172, 10.762622] // [lng, lat]
        },
        {
            id: '2',
            name: 'Drone-002',
            status: 'available',
            battery: 90,
            location: [106.670172, 10.772622] // 1.5km xa hơn
        },
        {
            id: '3',
            name: 'Drone-003',
            status: 'busy', // Đang bận
            battery: 95,
            location: [106.661172, 10.763622] // Gần nhưng busy
        },
        {
            id: '4',
            name: 'Drone-004',
            status: 'available',
            battery: 20, // Pin yếu
            location: [106.661000, 10.763000]
        }
    ];

    test('✅ Chọn drone GẦN NHẤT và AVAILABLE', () => {
        const orderLocation = { lat: 10.7626, lng: 106.6602 };

        const result = findNearestAvailableDrone(mockDrones, orderLocation);

        expect(result.drone.id).toBe('1'); // Drone-001 gần nhất
        expect(result.drone.status).toBe('available');
        expect(result.distance).toBeLessThan(0.5); // < 500m
    });

    test('✅ BỎ QUA drone đang BUSY', () => {
        const orderLocation = { lat: 10.763622, lng: 106.661172 };

        const result = findNearestAvailableDrone(mockDrones, orderLocation);

        // Không chọn Drone-003 dù gần nhất vì đang busy
        expect(result.drone.id).not.toBe('3');
        expect(result.drone.status).toBe('available');
    });

    test('✅ BỎ QUA drone PIN YẾU (< 30%)', () => {
        const orderLocation = { lat: 10.763000, lng: 106.661000 };

        const result = findNearestAvailableDrone(mockDrones, orderLocation);

        // Không chọn Drone-004 dù gần vì pin < 30%
        expect(result.drone.id).not.toBe('4');
        expect(result.drone.battery).toBeGreaterThanOrEqual(30);
    });

    test('❌ THROW ERROR khi KHÔNG CÓ drone available', () => {
        const busyDrones = mockDrones.map(d => ({...d, status: 'busy' }));
        const orderLocation = { lat: 10.7626, lng: 106.6602 };

        expect(() => {
            findNearestAvailableDrone(busyDrones, orderLocation);
        }).toThrow('No drones available');
    });

    test('❌ THROW ERROR khi TẤT CẢ drone PIN YẾU', () => {
        const lowBatteryDrones = mockDrones.map(d => ({
            ...d,
            status: 'available',
            battery: 20
        }));
        const orderLocation = { lat: 10.7626, lng: 106.6602 };

        expect(() => {
            findNearestAvailableDrone(lowBatteryDrones, orderLocation);
        }).toThrow('No drones available');
    });
});