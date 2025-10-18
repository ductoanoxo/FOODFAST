import axios from './axios';

/**
 * Geocode address to coordinates using backend API
 * @param {string} address - Address string
 * @returns {Object} { lat, lng, formatted_address }
 */
export const geocodeAddress = async(address) => {
    try {
        const response = await axios.get('/api/map/geocode', {
            params: { address }
        });
        return response.data.data;
    } catch (error) {
        console.error('Geocoding error:', error);
        throw error;
    }
};

/**
 * Reverse geocode coordinates to address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object} { formatted_address, components }
 */
export const reverseGeocode = async(lat, lng) => {
    try {
        const response = await axios.get('/api/map/reverse-geocode', {
            params: { lat, lng }
        });
        return response.data.data;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        throw error;
    }
};

/**
 * Calculate distance between two points
 * @param {Object} origin - { lat, lng }
 * @param {Object} destination - { lat, lng }
 * @returns {Object} { distance, duration, distance_text, duration_text }
 */
export const calculateDistance = async(origin, destination) => {
    try {
        const response = await axios.get('/api/map/distance', {
            params: {
                originLat: origin.lat,
                originLng: origin.lng,
                destLat: destination.lat,
                destLng: destination.lng
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Distance calculation error:', error);
        throw error;
    }
};

/**
 * Autocomplete place search (Goong only)
 * @param {string} input - Search input
 * @param {Object} location - { lat, lng } for bias (optional)
 * @returns {Array} suggestions
 */
export const autocompletePlace = async(input, location = null) => {
    try {
        const params = { input };
        if (location) {
            params.lat = location.lat;
            params.lng = location.lng;
        }

        const response = await axios.get('/api/map/autocomplete', { params });
        return response.data.data;
    } catch (error) {
        console.error('Autocomplete error:', error);
        throw error;
    }
};

/**
 * Get place details by place_id (Goong only)
 * @param {string} placeId - Place ID from autocomplete
 * @returns {Object} place details with coordinates
 */
export const getPlaceDetails = async(placeId) => {
    try {
        const response = await axios.get(`/api/map/place/${placeId}`);
        return response.data.data;
    } catch (error) {
        console.error('Get place details error:', error);
        throw error;
    }
};