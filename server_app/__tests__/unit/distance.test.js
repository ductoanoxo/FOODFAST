/**
 * 🧪 UNIT TEST: Distance Calculation
 * Test tính khoảng cách giữa 2 điểm GPS (Haversine formula)
 */

describe('📏 Distance Calculation Utils', () => {
    /**
     * Haversine formula để tính khoảng cách giữa 2 điểm GPS
     */
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    test('✅ Tính khoảng cách giữa 2 điểm chính xác', () => {
        // Saigon to Hanoi (approximately 1,140 km)
        const distance = calculateDistance(10.8231, 106.6297, 21.0285, 105.8542);
        expect(distance).toBeGreaterThan(1100);
        expect(distance).toBeLessThan(1200);
    });

    test('✅ Khoảng cách giữa 2 điểm trùng nhau = 0', () => {
        const distance = calculateDistance(10.8231, 106.6297, 10.8231, 106.6297);
        expect(distance).toBe(0);
    });

    test('✅ Tính khoảng cách ngắn (< 1km)', () => {
        // 2 points very close (~ 100m)
        const distance = calculateDistance(10.8231, 106.6297, 10.8240, 106.6305);
        expect(distance).toBeLessThan(1);
        expect(distance).toBeGreaterThan(0);
    });

    test('✅ Khoảng cách đối xứng (A->B = B->A)', () => {
        const d1 = calculateDistance(10.8231, 106.6297, 21.0285, 105.8542);
        const d2 = calculateDistance(21.0285, 105.8542, 10.8231, 106.6297);
        expect(d1).toBe(d2);
    });
});
