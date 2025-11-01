const axios = require('axios')

/**
 * Geocoding Service - Chuyển địa chỉ văn bản thành tọa độ
 * Sử dụng OpenStreetMap Nominatim API (free, không cần API key)
 */

/**
 * Convert địa chỉ thành tọa độ [longitude, latitude]
 * @param {string} address - Địa chỉ cần geocode
 * @returns {Promise<[number, number] | null>} - Tọa độ [lng, lat] hoặc null nếu fail
 */
const geocodeAddress = async(address) => {
    try {
        if (!address || typeof address !== 'string' || address.trim().length === 0) {
            console.warn('⚠️ Geocoding: Invalid address provided')
            return null
        }

        const trimmedAddress = address.trim()
        console.log('🗺️ Geocoding address:', trimmedAddress)

        // OpenStreetMap Nominatim API
        const url = 'https://nominatim.openstreetmap.org/search'
        const response = await axios.get(url, {
            params: {
                format: 'json',
                q: trimmedAddress,
                limit: 1,
                countrycodes: 'vn', // Ưu tiên tìm kiếm trong Việt Nam
                addressdetails: 1, // Lấy thông tin chi tiết
            },
            headers: {
                'User-Agent': 'FoodFast-DeliveryApp/1.0', // Required by Nominatim
            },
            timeout: 8000, // 8 seconds timeout
        })

        if (response.data && response.data.length > 0) {
            const result = response.data[0]
            const coordinates = [
                parseFloat(result.lon), // longitude
                parseFloat(result.lat), // latitude
            ]

            // Validate coordinates
            if (isNaN(coordinates[0]) || isNaN(coordinates[1])) {
                console.error('❌ Geocoding: Invalid coordinates received:', result)
                return null
            }

            console.log('✅ Geocoding success:', {
                address: trimmedAddress,
                coordinates: coordinates,
                displayName: result.display_name,
                city:
                    (result.address && result.address.city) ||
                    (result.address && result.address.town) ||
                    (result.address && result.address.village),
                country: result.address && result.address.country,
            });

            return coordinates
        }

        console.warn('⚠️ Geocoding: No results found for:', trimmedAddress)
        return null
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.error('❌ Geocoding timeout:', error.message)
        } else if (error.response) {
            console.error('❌ Geocoding API error:', {
                status: error.response.status,
                data: error.response.data,
            })
        } else {
            console.error('❌ Geocoding error:', error.message)
        }
        return null
    }
}

/**
 * Get default coordinates cho các thành phố lớn ở Việt Nam
 * @param {string} address - Địa chỉ để xác định thành phố
 * @returns {[number, number]} - Tọa độ mặc định [lng, lat]
 */
const getDefaultCoordinates = (address) => {
    const cityDefaults = {
        'hà nội': [105.8342, 21.0278],
        'hanoi': [105.8342, 21.0278],
        'hồ chí minh': [106.6297, 10.8231],
        'ho chi minh': [106.6297, 10.8231],
        'sài gòn': [106.6297, 10.8231],
        'saigon': [106.6297, 10.8231],
        'đà nẵng': [108.2022, 16.0544],
        'da nang': [108.2022, 16.0544],
        'hải phòng': [106.6881, 20.8449],
        'hai phong': [106.6881, 20.8449],
        'cần thơ': [105.7467, 10.0452],
        'can tho': [105.7467, 10.0452],
    }

    const lowerAddress = address.toLowerCase()

    for (const [city, coords] of Object.entries(cityDefaults)) {
        if (lowerAddress.includes(city)) {
            console.log(`🏙️ Using default coordinates for ${city}:`, coords)
            return coords
        }
    }

    // Default fallback: Hanoi
    console.log('🏙️ Using default coordinates: Hanoi')
    return [105.8342, 21.0278]
}

/**
 * Geocode với fallback: Thử geocoding API, nếu fail thì dùng default coordinates
 * @param {string} address - Địa chỉ cần geocode
 * @returns {Promise<[number, number]>} - Tọa độ [lng, lat] (luôn trả về)
 */
const geocodeWithFallback = async(address) => {
    try {
        // Try geocoding first
        const coordinates = await geocodeAddress(address)

        if (coordinates) {
            return coordinates
        }

        // Fallback to city defaults
        console.warn('⚠️ Geocoding failed, using fallback coordinates')
        return getDefaultCoordinates(address)
    } catch (error) {
        console.error('❌ Geocoding with fallback error:', error.message)
        return getDefaultCoordinates(address)
    }
}

module.exports = {
    geocodeAddress,
    geocodeWithFallback,
    getDefaultCoordinates,
}