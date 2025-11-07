const axios = require('axios');

/**
 * Routing Service - Tính khoảng cách thực tế theo đường đi
 * Sử dụng OSRM (Open Source Routing Machine) - Free, không cần API key
 */

/**
 * Tính khoảng cách thực tế theo đường đi giữa 2 điểm
 * @param {number} lat1 - Latitude điểm xuất phát
 * @param {number} lon1 - Longitude điểm xuất phát
 * @param {number} lat2 - Latitude điểm đến
 * @param {number} lon2 - Longitude điểm đến
 * @returns {Promise<{distance: number, duration: number, route: object} | null>}
 */
const getRoutingDistance = async (lat1, lon1, lat2, lon2) => {
    try {
        console.log('🗺️ Calculating routing distance:', {
            from: { lat: lat1, lon: lon1 },
            to: { lat: lat2, lon: lon2 }
        });

        // OSRM Demo Server - Free routing API
        // Documentation: http://project-osrm.org/docs/v5.24.0/api/
        const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}`;
        
        const response = await axios.get(url, {
            params: {
                overview: 'full',
                geometries: 'geojson',
                steps: false,
                alternatives: false
            },
            timeout: 10000, // 10 seconds timeout
            headers: {
                'User-Agent': 'FoodFast-DeliveryApp/1.0'
            }
        });

        if (response.data && response.data.code === 'Ok' && response.data.routes && response.data.routes.length > 0) {
            const route = response.data.routes[0];
            
            // OSRM trả về khoảng cách bằng mét và thời gian bằng giây
            const distanceInKm = route.distance / 1000; // Convert mét -> km
            const durationInMinutes = Math.ceil(route.duration / 60); // Convert giây -> phút
            
            console.log('✅ Routing success:', {
                distance: `${distanceInKm.toFixed(2)} km`,
                duration: `${durationInMinutes} phút`,
                geometry: route.geometry ? 'có' : 'không'
            });

            return {
                distance: distanceInKm,
                duration: durationInMinutes,
                route: {
                    geometry: route.geometry,
                    legs: route.legs
                }
            };
        }

        console.warn('⚠️ Routing: No route found');
        return null;
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.error('❌ Routing timeout:', error.message);
        } else if (error.response) {
            console.error('❌ Routing API error:', {
                status: error.response.status,
                data: error.response.data
            });
        } else {
            console.error('❌ Routing error:', error.message);
        }
        return null;
    }
};

/**
 * Tính khoảng cách thực tế với fallback về Haversine nếu routing API fail
 * @param {number} lat1 - Latitude điểm xuất phát
 * @param {number} lon1 - Longitude điểm xuất phát
 * @param {number} lat2 - Latitude điểm đến
 * @param {number} lon2 - Longitude điểm đến
 * @returns {Promise<{distance: number, duration: number, method: string, route?: object}>}
 */
const getDistanceWithFallback = async (lat1, lon1, lat2, lon2) => {
    try {
        // Thử lấy khoảng cách thực tế qua routing API
        const routingResult = await getRoutingDistance(lat1, lon1, lat2, lon2);
        
        if (routingResult) {
            return {
                distance: routingResult.distance,
                duration: routingResult.duration,
                method: 'routing', // Đường đi thực tế
                route: routingResult.route
            };
        }

        // Fallback: Dùng Haversine (đường thẳng) và nhân với hệ số điều chỉnh
        console.warn('⚠️ Routing API failed, using Haversine with adjustment factor');
        const { getDistanceFromLatLonInKm } = require('../API/Utils/locationUtils');
        const straightDistance = getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);
        
        // Hệ số điều chỉnh: Đường đi thực tế thường dài hơn đường thẳng 20-40%
        // Trong thành phố: ~1.3-1.4, ngoại thành: ~1.2
        const CITY_FACTOR = 1.35; // Giả định đi trong thành phố
        const adjustedDistance = straightDistance * CITY_FACTOR;
        
        // Ước tính thời gian: 30 km/h trong thành phố
        const AVERAGE_SPEED_KMH = 30;
        const estimatedDuration = Math.ceil((adjustedDistance / AVERAGE_SPEED_KMH) * 60); // phút

        console.log('📐 Fallback calculation:', {
            straightDistance: `${straightDistance.toFixed(2)} km`,
            adjustedDistance: `${adjustedDistance.toFixed(2)} km`,
            factor: CITY_FACTOR,
            estimatedDuration: `${estimatedDuration} phút`
        });

        return {
            distance: adjustedDistance,
            duration: estimatedDuration,
            method: 'haversine_adjusted' // Đường thẳng có điều chỉnh
        };
    } catch (error) {
        console.error('❌ getDistanceWithFallback error:', error.message);
        
        // Last resort: Haversine thuần
        const { getDistanceFromLatLonInKm } = require('../API/Utils/locationUtils');
        const distance = getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);
        
        return {
            distance: distance * 1.3, // Nhân hệ số tối thiểu
            duration: Math.ceil((distance * 1.3 / 30) * 60),
            method: 'haversine_fallback'
        };
    }
};

module.exports = {
    getRoutingDistance,
    getDistanceWithFallback
};
