import { Marker, Popup, Tooltip } from 'react-leaflet'
import { divIcon } from 'leaflet'
import PropTypes from 'prop-types'
import { DRONE_STATUS_COLORS } from '../../utils/mapHelpers'

const DroneMarker = ({ drone, onClick }) => {
    if (!drone.currentLocation || !drone.currentLocation.coordinates) {
        return null
    }

    const [lng, lat] = drone.currentLocation.coordinates
    const position = [lat, lng]

    const icon = divIcon({
        html: `
            <div style="
                width: 32px;
                height: 32px;
                background-color: ${DRONE_STATUS_COLORS[drone.status] || '#8c8c8c'};
                border: 3px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                cursor: pointer;
            ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
                </svg>
            </div>
        `,
        className: 'custom-drone-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    })

    const statusText = {
        available: 'Sẵn sàng',
        busy: 'Đang giao hàng',
        charging: 'Đang sạc',
        maintenance: 'Bảo trì',
        offline: 'Ngoại tuyến',
    }

    return (
        <Marker position={position} icon={icon} eventHandlers={{ click: () => onClick && onClick(drone) }}>
            <Tooltip direction="top" offset={[0, -16]} opacity={0.9}>
                <div style={{ textAlign: 'center' }}>
                    <strong>{drone.name || drone.droneId}</strong>
                    <br />
                    <small>{statusText[drone.status] || drone.status}</small>
                </div>
            </Tooltip>
            <Popup>
                <div style={{ minWidth: '200px' }}>
                    <h4 style={{ margin: '0 0 8px 0' }}>{drone.name || drone.droneId}</h4>
                    <p style={{ margin: '4px 0' }}>
                        <strong>Model:</strong> {drone.model}
                    </p>
                    <p style={{ margin: '4px 0' }}>
                        <strong>Trạng thái:</strong> <span style={{ color: DRONE_STATUS_COLORS[drone.status] }}>{statusText[drone.status]}</span>
                    </p>
                    <p style={{ margin: '4px 0' }}>
                        <strong>Pin:</strong> {drone.batteryLevel}%
                    </p>
                    {drone.currentMission && (
                        <p style={{ margin: '4px 0' }}>
                            <strong>Nhiệm vụ:</strong> {drone.currentMission}
                        </p>
                    )}
                </div>
            </Popup>
        </Marker>
    )
}

DroneMarker.propTypes = {
    drone: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string,
        droneId: PropTypes.string,
        model: PropTypes.string,
        status: PropTypes.string,
        batteryLevel: PropTypes.number,
        currentLocation: PropTypes.shape({
            coordinates: PropTypes.arrayOf(PropTypes.number),
        }),
        currentMission: PropTypes.string,
    }).isRequired,
    onClick: PropTypes.func,
}

export default DroneMarker
