// Map configuration
export const MAP_CONFIG = {
    defaultCenter: [10.8231, 106.6297], // Ho Chi Minh City, Vietnam
    defaultZoom: 13,
    maxZoom: 18,
    minZoom: 10,
}

// Tile layer configuration
export const TILE_LAYER = {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}

// Drone status colors
export const DRONE_STATUS_COLORS = {
    available: '#52c41a',  // green
    busy: '#1890ff',       // blue
    charging: '#faad14',   // orange
    maintenance: '#ff4d4f', // red
    offline: '#8c8c8c',    // gray
}

// Mission status colors
export const MISSION_STATUS_COLORS = {
    pending: '#faad14',     // orange
    assigned: '#1890ff',    // blue
    in_progress: '#13c2c2', // cyan
    completed: '#52c41a',   // green
    failed: '#ff4d4f',      // red
    cancelled: '#8c8c8c',   // gray
}

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    return distance
}

const toRad = (value) => {
    return (value * Math.PI) / 180
}

// Format coordinates
export const formatCoordinates = (coordinates) => {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
        return null
    }
    return {
        lat: coordinates[1],
        lng: coordinates[0],
    }
}

// Get drone icon based on status
export const getDroneIcon = (status) => {
    return `
        <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="12" fill="${DRONE_STATUS_COLORS[status] || '#8c8c8c'}" stroke="#fff" stroke-width="2"/>
            <path d="M15 8 L20 15 L15 22 L10 15 Z" fill="#fff"/>
        </svg>
    `
}

// Get location marker icon
export const getLocationIcon = (color = '#1890ff') => {
    return `
        <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0 C9.5 0 5 4.5 5 10 C5 17.5 15 30 15 30 S25 17.5 25 10 C25 4.5 20.5 0 15 0 Z" 
                  fill="${color}" stroke="#fff" stroke-width="2"/>
            <circle cx="15" cy="10" r="4" fill="#fff"/>
        </svg>
    `
}

// Create custom icon for Leaflet
export const createCustomIcon = (iconHtml, iconSize = [30, 30], iconAnchor = [15, 15]) => {
    if (typeof window !== 'undefined' && window.L) {
        return window.L.divIcon({
            html: iconHtml,
            className: 'custom-marker-icon',
            iconSize: iconSize,
            iconAnchor: iconAnchor,
        })
    }
    return null
}

// Estimate delivery time based on distance
export const estimateDeliveryTime = (distance) => {
    const averageSpeed = 40 // km/h
    const timeInHours = distance / averageSpeed
    const timeInMinutes = Math.round(timeInHours * 60)
    return timeInMinutes
}

// Format time
export const formatTime = (minutes) => {
    if (minutes < 60) {
        return `${minutes} phút`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours} giờ ${mins} phút` : `${hours} giờ`
}
