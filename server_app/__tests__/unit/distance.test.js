/**
 * UNIT TEST: Distance Calculation
 * Chức năng: Tính khoảng cách giữa 2 điểm (Haversine formula)
 * Độ quan trọng: ⭐⭐⭐⭐⭐ (Critical - dùng cho assign drone)
 */

// Haversine formula - Calculate distance between two coordinates
function calculateDistance(point1, point2) {
    const R = 6371; // Earth radius in km
    const dLat = toRad(point2.lat - point1.lat);
    const dLon = toRad(point2.lng - point1.lng);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

function toRad(value) {
    return value * Math.PI / 180;
}

describe('📏 Distance Calculation - UNIT TEST', () => {

    test('✅ Tính đúng khoảng cách giữa 2 điểm', () => {
        const landmark81 = { lat: 10.794512, lng: 106.721991 }; // Landmark 81
        const benThanh = { lat: 10.772461, lng: 106.698055 }; // Chợ Bến Thành

        const distance = calculateDistance(landmark81, benThanh);

        // Khoảng cách thực tế ~ 3.5km
        expect(distance).toBeGreaterThan(3.0);
        expect(distance).toBeLessThan(4.0);
    });

    test('✅ Trả về 0 khi 2 điểm trùng nhau', () => {
        const point = { lat: 10.762622, lng: 106.660172 };

        const distance = calculateDistance(point, point);

        expect(distance).toBe(0);
    });

    test('✅ Xử lý tọa độ âm (Nam bán cầu)', () => {
        const point1 = { lat: -33.8688, lng: 151.2093 }; // Sydney
        const point2 = { lat: -37.8136, lng: 144.9631 }; // Melbourne

        const distance = calculateDistance(point1, point2);

        // Khoảng cách thực tế ~ 713km
        expect(distance).toBeGreaterThan(700);
        expect(distance).toBeLessThan(730);
    });

    test('✅ Tính khoảng cách nhỏ (< 1km)', () => {
        const point1 = { lat: 10.7622, lng: 106.6602 };
        const point2 = { lat: 10.7632, lng: 106.6612 }; // ~100m

        const distance = calculateDistance(point1, point2);

        expect(distance).toBeLessThan(1);
        expect(distance).toBeGreaterThan(0.1);
    });
});