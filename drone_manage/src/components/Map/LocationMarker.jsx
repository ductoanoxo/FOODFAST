import { Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'

const LocationMarker = ({ position, label, color = '#1890ff', type = 'default' }) => {
    if (!position || !Array.isArray(position) || position.length < 2) {
        return null
    }

    const getIcon = () => {
        if (type === 'restaurant') {
            return divIcon({
                html: `
                    <div style="
                        width: 40px;
                        height: 50px;
                        position: relative;
                    ">
                        <svg width="40" height="50" viewBox="0 0 40 50">
                            <path d="M20 0 C11 0 4 7 4 16 C4 28 20 45 20 45 S36 28 36 16 C36 7 29 0 20 0 Z" 
                                  fill="#ff6b6b" stroke="white" stroke-width="2"/>
                            <circle cx="20" cy="16" r="6" fill="white"/>
                            <text x="20" y="20" text-anchor="middle" font-size="14" fill="#ff6b6b">🍴</text>
                        </svg>
                    </div>
                `,
                className: 'custom-location-marker',
                iconSize: [40, 50],
                iconAnchor: [20, 50],
            })
        } else if (type === 'customer') {
            return divIcon({
                html: `
                    <div style="
                        width: 40px;
                        height: 50px;
                        position: relative;
                    ">
                        <svg width="40" height="50" viewBox="0 0 40 50">
                            <path d="M20 0 C11 0 4 7 4 16 C4 28 20 45 20 45 S36 28 36 16 C36 7 29 0 20 0 Z" 
                                  fill="#52c41a" stroke="white" stroke-width="2"/>
                            <circle cx="20" cy="16" r="6" fill="white"/>
                            <text x="20" y="21" text-anchor="middle" font-size="16" fill="#52c41a">📍</text>
                        </svg>
                    </div>
                `,
                className: 'custom-location-marker',
                iconSize: [40, 50],
                iconAnchor: [20, 50],
            })
        } else {
            return divIcon({
                html: `
                    <div style="
                        width: 40px;
                        height: 50px;
                        position: relative;
                    ">
                        <svg width="40" height="50" viewBox="0 0 40 50">
                            <path d="M20 0 C11 0 4 7 4 16 C4 28 20 45 20 45 S36 28 36 16 C36 7 29 0 20 0 Z" 
                                  fill="${color}" stroke="white" stroke-width="2"/>
                            <circle cx="20" cy="16" r="6" fill="white"/>
                        </svg>
                    </div>
                `,
                className: 'custom-location-marker',
                iconSize: [40, 50],
                iconAnchor: [20, 50],
            })
        }
    }

    return (
        <Marker position={position} icon={getIcon()}>
            {label && (
                <Popup>
                    <div style={{ textAlign: 'center' }}>
                        <strong>{label}</strong>
                    </div>
                </Popup>
            )}
        </Marker>
    )
}

export default LocationMarker
