// Map Configuration for Frontend
export const MAP_CONFIG = {
    // Current map provider: 'osm', 'goong', 'google'
    provider: import.meta.env.VITE_MAP_PROVIDER || 'goong',

    // Default map center (Ho Chi Minh City, Vietnam)
    defaultCenter: {
        lat: 10.762622,
        lng: 106.660172
    },

    // Default zoom level
    defaultZoom: 13,
    maxZoom: 18,
    minZoom: 10,

    // Tile layer configurations
    tiles: {
        osm: {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        },
        goong: {
            url: `https://tiles.goong.io/{z}/{x}/{y}.png?api_key=${import.meta.env.VITE_GOONG_MAPTILES_KEY || 'imOrVLTc3mfwx9EiBgPtleQi6Dqpi8VHMoKgiijd'}`,
            attribution: '&copy; <a href="https://goong.io/">Goong</a>'
        },
        google: {
            // Google Maps uses Google Maps API, not tiles
            url: '',
            attribution: '&copy; Google Maps'
        }
    },

    // API Keys
    goongApiKey: import.meta.env.VITE_GOONG_API_KEY || 'zzq1UTkrCcWLHpf3tgcEAXcOMjvIeDqr9yCGGal6',
    goongMapTilesKey: import.meta.env.VITE_GOONG_MAPTILES_KEY || 'imOrVLTc3mfwx9EiBgPtleQi6Dqpi8VHMoKgiijd',
    googleApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
};

/**
 * Get tile layer configuration based on current provider
 */
export const getTileLayerConfig = () => {
    const config = MAP_CONFIG.tiles[MAP_CONFIG.provider];
    return config || MAP_CONFIG.tiles.osm; // Fallback to OSM
};

/**
 * Drone status colors
 */
export const DRONE_STATUS_COLORS = {
    idle: '#52c41a', // green
    assigned: '#1890ff', // blue
    picking_up: '#1890ff', // blue
    delivering: '#fa8c16', // orange
    returning: '#13c2c2', // cyan
    offline: '#d9d9d9', // gray
    maintenance: '#ff4d4f' // red
};

/**
 * Mission status colors
 */
export const MISSION_STATUS_COLORS = {
    pending: '#faad14', // orange
    assigned: '#1890ff', // blue
    in_progress: '#13c2c2', // cyan
    completed: '#52c41a', // green
    failed: '#ff4d4f', // red
    cancelled: '#8c8c8c' // gray
};

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
};

const toRad = (value) => {
    return (value * Math.PI) / 180;
};

/**
 * Format coordinates for MongoDB (GeoJSON)
 * MongoDB expects [longitude, latitude]
 */
export const formatForMongoDB = (lat, lng) => {
    return [parseFloat(lng), parseFloat(lat)];
};

/**
 * Format coordinates for Leaflet
 * Leaflet expects [latitude, longitude]
 */
export const formatForLeaflet = (coordinates) => {
    if (Array.isArray(coordinates) && coordinates.length === 2) {
        // If it's MongoDB format [lng, lat], convert to [lat, lng]
        return [coordinates[1], coordinates[0]];
    }
    return coordinates;
};