const axios = require('axios');

/**
 * Map Service - Strategy Pattern for multiple map providers
 * Supports: OpenStreetMap (Nominatim), Goong Maps, Google Maps
 */
class MapService {
    constructor() {
        this.provider = process.env.MAP_PROVIDER || 'osm';
        this.goongApiKey = process.env.GOONG_API_KEY;
        this.googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    }

    /**
     * Geocoding - Convert address to coordinates
     * @param {string} address - Address string
     * @returns {Object} { lat, lng, formatted_address }
     */
    async geocode(address) {
        try {
            switch (this.provider) {
                case 'goong':
                    return await this.goongGeocode(address);
                case 'google':
                    return await this.googleGeocode(address);
                case 'osm':
                default:
                    return await this.osmGeocode(address);
            }
        } catch (error) {
            console.error(`[${this.provider}] Geocoding error:`, error.message);
            // Fallback to OSM if primary provider fails
            if (this.provider !== 'osm') {
                console.log('Falling back to OpenStreetMap...');
                return await this.osmGeocode(address);
            }
            throw error;
        }
    }

    /**
     * Reverse Geocoding - Convert coordinates to address
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Object} { formatted_address, components }
     */
    async reverseGeocode(lat, lng) {
        try {
            switch (this.provider) {
                case 'goong':
                    return await this.goongReverseGeocode(lat, lng);
                case 'google':
                    return await this.googleReverseGeocode(lat, lng);
                case 'osm':
                default:
                    return await this.osmReverseGeocode(lat, lng);
            }
        } catch (error) {
            console.error(`[${this.provider}] Reverse geocoding error:`, error.message);
            if (this.provider !== 'osm') {
                console.log('Falling back to OpenStreetMap...');
                return await this.osmReverseGeocode(lat, lng);
            }
            throw error;
        }
    }

    /**
     * Calculate distance and duration between two points
     * @param {Object} origin - { lat, lng }
     * @param {Object} destination - { lat, lng }
     * @returns {Object} { distance, duration, distance_text, duration_text }
     */
    async getDistance(origin, destination) {
        try {
            switch (this.provider) {
                case 'goong':
                    return await this.goongDistance(origin, destination);
                case 'google':
                    return await this.googleDistance(origin, destination);
                case 'osm':
                default:
                    return await this.osmDistance(origin, destination);
            }
        } catch (error) {
            console.error(`[${this.provider}] Distance calculation error:`, error.message);
            if (this.provider !== 'osm') {
                console.log('Falling back to Haversine formula...');
                return await this.osmDistance(origin, destination);
            }
            throw error;
        }
    }

    // ===== GOONG MAPS API =====

    async goongGeocode(address) {
        if (!this.goongApiKey) {
            throw new Error('Goong API key not configured');
        }

        const response = await axios.get('https://rsapi.goong.io/Geocode', {
            params: {
                address: address,
                api_key: this.goongApiKey
            },
            timeout: 5000
        });

        if (response.data.results && response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            return {
                lat: location.lat,
                lng: location.lng,
                formatted_address: response.data.results[0].formatted_address,
                place_id: response.data.results[0].place_id
            };
        }
        throw new Error('Không tìm thấy địa chỉ');
    }

    async goongReverseGeocode(lat, lng) {
        if (!this.goongApiKey) {
            throw new Error('Goong API key not configured');
        }

        const response = await axios.get('https://rsapi.goong.io/Geocode', {
            params: {
                latlng: `${lat},${lng}`,
                api_key: this.goongApiKey
            },
            timeout: 5000
        });

        if (response.data.results && response.data.results.length > 0) {
            return {
                formatted_address: response.data.results[0].formatted_address,
                components: response.data.results[0].address_components,
                place_id: response.data.results[0].place_id
            };
        }
        throw new Error('Không tìm thấy địa chỉ');
    }

    async goongDistance(origin, destination) {
        if (!this.goongApiKey) {
            throw new Error('Goong API key not configured');
        }

        const response = await axios.get('https://rsapi.goong.io/DistanceMatrix', {
            params: {
                origins: `${origin.lat},${origin.lng}`,
                destinations: `${destination.lat},${destination.lng}`,
                vehicle: 'car',
                api_key: this.goongApiKey
            },
            timeout: 5000
        });

        const element = response.data.rows[0].elements[0];

        if (element.status === 'OK') {
            return {
                distance: element.distance.value, // meters
                duration: element.duration.value, // seconds
                distance_text: element.distance.text,
                duration_text: element.duration.text
            };
        }
        throw new Error('Cannot calculate distance');
    }

    // ===== GOOGLE MAPS API =====

    async googleGeocode(address) {
        if (!this.googleApiKey) {
            throw new Error('Google API key not configured');
        }

        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: address,
                key: this.googleApiKey
            },
            timeout: 5000
        });

        if (response.data.results && response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            return {
                lat: location.lat,
                lng: location.lng,
                formatted_address: response.data.results[0].formatted_address,
                place_id: response.data.results[0].place_id
            };
        }
        throw new Error('Address not found');
    }

    async googleReverseGeocode(lat, lng) {
        if (!this.googleApiKey) {
            throw new Error('Google API key not configured');
        }

        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                latlng: `${lat},${lng}`,
                key: this.googleApiKey
            },
            timeout: 5000
        });

        if (response.data.results && response.data.results.length > 0) {
            return {
                formatted_address: response.data.results[0].formatted_address,
                components: response.data.results[0].address_components,
                place_id: response.data.results[0].place_id
            };
        }
        throw new Error('Address not found');
    }

    async googleDistance(origin, destination) {
        if (!this.googleApiKey) {
            throw new Error('Google API key not configured');
        }

        const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
            params: {
                origins: `${origin.lat},${origin.lng}`,
                destinations: `${destination.lat},${destination.lng}`,
                key: this.googleApiKey
            },
            timeout: 5000
        });

        const element = response.data.rows[0].elements[0];

        if (element.status === 'OK') {
            return {
                distance: element.distance.value,
                duration: element.duration.value,
                distance_text: element.distance.text,
                duration_text: element.duration.text
            };
        }
        throw new Error('Cannot calculate distance');
    }

    // ===== OPENSTREETMAP (Nominatim) =====

    async osmGeocode(address) {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: address,
                format: 'json',
                limit: 1,
                countrycodes: 'vn' // Focus on Vietnam
            },
            headers: {
                'User-Agent': 'FoodFast-Drone-Delivery/1.0'
            },
            timeout: 5000
        });

        if (response.data && response.data.length > 0) {
            return {
                lat: parseFloat(response.data[0].lat),
                lng: parseFloat(response.data[0].lon),
                formatted_address: response.data[0].display_name,
                place_id: response.data[0].place_id
            };
        }
        throw new Error('Address not found');
    }

    async osmReverseGeocode(lat, lng) {
        const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: {
                lat: lat,
                lon: lng,
                format: 'json'
            },
            headers: {
                'User-Agent': 'FoodFast-Drone-Delivery/1.0'
            },
            timeout: 5000
        });

        if (response.data) {
            return {
                formatted_address: response.data.display_name,
                components: response.data.address,
                place_id: response.data.place_id
            };
        }
        throw new Error('Address not found');
    }

    async osmDistance(origin, destination) {
        // OpenStreetMap doesn't have distance API
        // Use Haversine formula for straight-line distance
        const R = 6371e3; // Earth radius in meters
        const φ1 = origin.lat * Math.PI / 180;
        const φ2 = destination.lat * Math.PI / 180;
        const Δφ = (destination.lat - origin.lat) * Math.PI / 180;
        const Δλ = (destination.lng - origin.lng) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // in meters

        // Estimate duration (assuming 40 km/h average speed for drone)
        const duration = (distance / 1000) / 40 * 3600; // in seconds

        return {
            distance: Math.round(distance),
            duration: Math.round(duration),
            distance_text: `${(distance / 1000).toFixed(2)} km`,
            duration_text: `${Math.round(duration / 60)} phút`
        };
    }

    /**
     * Get autocomplete suggestions (Goong Place Autocomplete)
     * @param {string} input - Search input
     * @param {Object} location - { lat, lng } for bias
     * @returns {Array} suggestions
     */
    async autocomplete(input, location = null) {
        if (this.provider !== 'goong' || !this.goongApiKey) {
            throw new Error('Autocomplete only available with Goong provider');
        }

        const params = {
            input: input,
            api_key: this.goongApiKey,
            limit: 5
        };

        if (location) {
            params.location = `${location.lat},${location.lng}`;
            params.radius = 50000; // 50km radius
        }

        const response = await axios.get('https://rsapi.goong.io/Place/AutoComplete', {
            params: params,
            timeout: 5000
        });

        if (response.data.predictions) {
            return response.data.predictions.map(p => ({
                description: p.description,
                place_id: p.place_id,
                structured_formatting: p.structured_formatting
            }));
        }

        return [];
    }

    /**
     * Get place details by place_id
     * @param {string} placeId - Place ID from autocomplete
     * @returns {Object} place details with coordinates
     */
    async getPlaceDetails(placeId) {
        if (this.provider !== 'goong' || !this.goongApiKey) {
            throw new Error('Place details only available with Goong provider');
        }

        const response = await axios.get('https://rsapi.goong.io/Place/Detail', {
            params: {
                place_id: placeId,
                api_key: this.goongApiKey
            },
            timeout: 5000
        });

        if (response.data.result) {
            const result = response.data.result;
            return {
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                formatted_address: result.formatted_address,
                name: result.name,
                place_id: result.place_id
            };
        }

        throw new Error('Place not found');
    }
}

module.exports = new MapService();