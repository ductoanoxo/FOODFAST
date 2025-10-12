import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { message, Spin } from 'antd'
import socketService from '../../services/socketService'
import './DroneMap.css'

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom drone icon
const createDroneIcon = () => {
  return L.divIcon({
    className: 'custom-drone-icon',
    html: `
      <div style="
        background: #1890ff;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 12px rgba(0,0,0,0.4);
        font-size: 24px;
        animation: pulse 2s infinite;
      ">
        🚁
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

// Restaurant icon
const createRestaurantIcon = () => {
  return L.divIcon({
    className: 'custom-icon',
    html: `
      <div style="
        background: #fa8c16;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-size: 20px;
      ">
        🏪
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

// Delivery location icon
const createDeliveryIcon = () => {
  return L.divIcon({
    className: 'custom-icon',
    html: `
      <div style="
        background: #52c41a;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-size: 20px;
      ">
        🏠
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

const DroneMap = ({ order }) => {
  const [droneLocation, setDroneLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [path, setPath] = useState([])
  const mapRef = useRef(null)

  // Default center (Ho Chi Minh City)
  const defaultCenter = [10.8231, 106.6297]

  useEffect(() => {
    if (!order?.drone?._id) {
      setLoading(false)
      return
    }

    // Initialize drone location from order data
    if (order.drone?.currentLocation?.coordinates) {
      const [lng, lat] = order.drone.currentLocation.coordinates
      setDroneLocation({ lat, lng })
      setPath([[lat, lng]])
    }

    // Initialize socket connection
    const token = localStorage.getItem('token')
    if (token) {
      socketService.connect(token)
      setupSocketListeners()
    }

    setLoading(false)

    return () => {
      socketService.off('drone:location-update')
      socketService.off('fleet:location-update')
    }
  }, [order?.drone?._id])

  const setupSocketListeners = () => {
    // Listen for specific drone location updates
    socketService.on('drone:location-update', (data) => {
      if (data.droneId === order.drone._id) {
        const newLocation = { lat: data.lat, lng: data.lng }
        setDroneLocation(newLocation)
        
        // Add to path
        setPath(prevPath => [...prevPath, [data.lat, data.lng]])
      }
    })

    // Listen for fleet updates
    socketService.on('fleet:location-update', (data) => {
      if (data.droneId === order.drone._id) {
        const newLocation = { lat: data.lat, lng: data.lng }
        setDroneLocation(newLocation)
        
        // Add to path
        setPath(prevPath => [...prevPath, [data.lat, data.lng]])
      }
    })
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  // If order doesn't have drone or delivery location
  if (!order?.drone || !order?.deliveryInfo?.location?.coordinates) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
        <p>Chưa có thông tin vị trí giao hàng</p>
      </div>
    )
  }

  // Get coordinates with validation
  const restaurantCoords = order.restaurant?.location?.coordinates?.[0] && order.restaurant?.location?.coordinates?.[1]
    ? [order.restaurant.location.coordinates[1], order.restaurant.location.coordinates[0]]
    : null

  const deliveryCoords = order.deliveryInfo?.location?.coordinates?.[0] && order.deliveryInfo?.location?.coordinates?.[1]
    ? [order.deliveryInfo.location.coordinates[1], order.deliveryInfo.location.coordinates[0]]
    : null

  const droneCoords = droneLocation
    ? [droneLocation.lat, droneLocation.lng]
    : (order.drone?.currentLocation?.coordinates?.[0] && order.drone?.currentLocation?.coordinates?.[1]
        ? [order.drone.currentLocation.coordinates[1], order.drone.currentLocation.coordinates[0]]
        : null)

  // Calculate center and bounds
  let center = defaultCenter
  let bounds = []

  if (droneCoords && droneCoords[0] && droneCoords[1]) bounds.push(droneCoords)
  if (restaurantCoords && restaurantCoords[0] && restaurantCoords[1]) bounds.push(restaurantCoords)
  if (deliveryCoords && deliveryCoords[0] && deliveryCoords[1]) bounds.push(deliveryCoords)

  if (bounds.length > 0) {
    center = bounds[0]
  }

  // If no valid coordinates, show message
  if (bounds.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
        <p>Chưa có tọa độ hợp lệ để hiển thị bản đồ</p>
        <small>Vui lòng đợi drone được gán cho đơn hàng</small>
      </div>
    )
  }

  return (
    <div className="drone-map-container">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '500px', width: '100%', borderRadius: '8px' }}
        ref={mapRef}
        bounds={bounds.length > 1 ? bounds : undefined}
        boundsOptions={{ padding: [50, 50] }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Restaurant Marker */}
        {restaurantCoords && (
          <Marker position={restaurantCoords} icon={createRestaurantIcon()}>
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong>🏪 {order.restaurant?.name}</strong>
                <br />
                <small>{order.restaurant?.address}</small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Delivery Location Marker */}
        {deliveryCoords && (
          <>
            <Marker position={deliveryCoords} icon={createDeliveryIcon()}>
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  <strong>🏠 Điểm giao hàng</strong>
                  <br />
                  <small>{order.deliveryInfo?.address}</small>
                  <br />
                  <small>Người nhận: {order.deliveryInfo?.name}</small>
                </div>
              </Popup>
            </Marker>
            {/* Delivery radius circle */}
            <Circle
              center={deliveryCoords}
              radius={50}
              pathOptions={{
                color: '#52c41a',
                fillColor: '#52c41a',
                fillOpacity: 0.1,
              }}
            />
          </>
        )}

        {/* Drone Marker */}
        {droneCoords && (
          <>
            <Marker position={droneCoords} icon={createDroneIcon()}>
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  <strong>🚁 Drone #{order.drone?.droneId}</strong>
                  <br />
                  <small>Model: {order.drone?.model}</small>
                  <br />
                  <small>Pin: {order.drone?.batteryLevel}%</small>
                  <br />
                  <small>Trạng thái: {order.drone?.status}</small>
                </div>
              </Popup>
            </Marker>
            {/* Drone radius circle */}
            <Circle
              center={droneCoords}
              radius={100}
              pathOptions={{
                color: '#1890ff',
                fillColor: '#1890ff',
                fillOpacity: 0.1,
              }}
            />
          </>
        )}

        {/* Flight path */}
        {path.length > 1 && (
          <Polyline
            positions={path}
            pathOptions={{
              color: '#1890ff',
              weight: 3,
              opacity: 0.7,
              dashArray: '10, 10',
            }}
          />
        )}

        {/* Route line from restaurant to delivery */}
        {restaurantCoords && deliveryCoords && (
          <Polyline
            positions={[restaurantCoords, deliveryCoords]}
            pathOptions={{
              color: '#d9d9d9',
              weight: 2,
              opacity: 0.5,
              dashArray: '5, 10',
            }}
          />
        )}
      </MapContainer>

      {/* Map Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-icon">🏪</span>
          <span>Nhà hàng</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">🚁</span>
          <span>Drone</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">🏠</span>
          <span>Điểm giao</span>
        </div>
      </div>
    </div>
  )
}

export default DroneMap
