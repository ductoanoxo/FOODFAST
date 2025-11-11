import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { message, Spin, Progress, Typography, Space, Button } from 'antd'
import { EnvironmentOutlined, RocketOutlined, UserOutlined, ShopOutlined } from '@ant-design/icons'
import socketService from '../../services/socketService'
import './DroneMap.css'

const { Text } = Typography

// Component for map controls
const MapControls = ({ mapRef, restaurantPos, deliveryPos, dronePos }) => {
  const handleZoomTo = (target) => {
    const map = mapRef.current
    if (!map) return

    let position
    let zoomLevel = 17 // A close-up zoom level

    switch (target) {
      case 'restaurant':
        position = restaurantPos
        break
      case 'delivery':
        position = deliveryPos
        break
      case 'drone':
        position = dronePos
        break
      default:
        return
    }

    if (position && position.length === 2) {
      map.flyTo(position, zoomLevel, {
        animate: true,
        duration: 1.5,
      })
    } else {
      message.warn(`⚠️ Không có vị trí cho mục tiêu này.`)
    }
  }

  return (
    <div className="map-controls">
      <Button
        shape="circle"
        icon={<UserOutlined />}
        onClick={() => handleZoomTo('delivery')}
        title="Zoom tới vị trí của bạn"
      />
      <Button
        shape="circle"
        icon={<ShopOutlined />}
        onClick={() => handleZoomTo('restaurant')}
        title="Zoom tới nhà hàng"
      />
      {dronePos && (
        <Button
          shape="circle"
          icon={<RocketOutlined />}
          onClick={() => handleZoomTo('drone')}
          title="Zoom tới drone"
        />
      )}
    </div>
  )
}

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom drone icon with animation
const createDroneIcon = () => {
  return L.divIcon({
    className: 'custom-drone-icon',
    html: `
      <div style="text-align: center;">
        <div class="drone-marker-container">
          <div class="drone-pulse"></div>
          <div class="drone-icon">🚁</div>
        </div>
        <div style="
          margin-top: 4px;
          background: rgba(24,144,255,0.9);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          Drone
        </div>
      </div>
    `,
    iconSize: [80, 70],
    iconAnchor: [40, 35],
  })
}

// Restaurant icon
const createRestaurantIcon = () => {
  return L.divIcon({
    className: 'custom-icon',
    html: `
      <div style="text-align: center;">
        <div style="
          background: linear-gradient(135deg, #fa8c16 0%, #ff6b35 100%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(250,140,22,0.4);
          font-size: 24px;
          margin: 0 auto;
        ">
          🏪
        </div>
        <div style="
          margin-top: 4px;
          background: rgba(250,140,22,0.9);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          Nhà hàng
        </div>
      </div>
    `,
    iconSize: [80, 70],
    iconAnchor: [40, 35],
  })
}

// Delivery location icon
const createDeliveryIcon = () => {
  return L.divIcon({
    className: 'custom-icon',
    html: `
      <div style="text-align: center;">
        <div style="
          background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(82,196,26,0.4);
          font-size: 24px;
          margin: 0 auto;
        ">
          📍
        </div>
        <div style="
          margin-top: 4px;
          background: rgba(82,196,26,0.9);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          Điểm giao
        </div>
      </div>
    `,
    iconSize: [80, 70],
    iconAnchor: [40, 35],
  })
}

// Component to auto-fit map bounds
const AutoFitBounds = ({ restaurantPos, deliveryPos, dronePos }) => {
  const map = useMap()

  useEffect(() => {
    const bounds = []
    if (restaurantPos) bounds.push(restaurantPos)
    if (deliveryPos) bounds.push(deliveryPos)
    if (dronePos) bounds.push(dronePos)

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  }, [map, restaurantPos, deliveryPos, dronePos])

  return null
}

const DroneMap = ({ order }) => {
  const [droneLocation, setDroneLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deliveryProgress, setDeliveryProgress] = useState(0)
  const [remainingDistance, setRemainingDistance] = useState(null)
  const [estimatedTime, setEstimatedTime] = useState(null)
  const mapRef = useRef(null)

  // Get coordinates
  const restaurantCoords = order?.restaurant?.location?.coordinates // [lng, lat]
  const deliveryCoords = order?.deliveryInfo?.location?.coordinates // [lng, lat]
  const droneCoords = order?.drone?.currentLocation?.coordinates // [lng, lat]

  // Convert to Leaflet format [lat, lng]
  const restaurantPos = restaurantCoords ? [restaurantCoords[1], restaurantCoords[0]] : null
  const deliveryPos = deliveryCoords ? [deliveryCoords[1], deliveryCoords[0]] : null

  // Default center
  const defaultCenter = restaurantPos || deliveryPos || [10.8231, 106.6297]

  // ✅ Setup socket listeners and effects BEFORE any early returns
  useEffect(() => {
    if (!order?.drone?._id) {
      setLoading(false)
      return
    }

    // Initialize drone location
    if (droneCoords) {
      const [lng, lat] = droneCoords
      setDroneLocation([lat, lng])
    } else if (restaurantPos) {
      // Start at restaurant if no drone location
      setDroneLocation(restaurantPos)
    }

    // Connect to socket
    const token = localStorage.getItem('token')
    if (token) {
      socketService.connect(token)
      
      // Join order room
      socketService.emit('join-order-room', { orderId: order._id })
      
      setupSocketListeners()
    }

    setLoading(false)

    return () => {
      socketService.off('drone:location:update')
      socketService.off('delivery:simulation:started')
      socketService.off('delivery:complete')
      if (order?._id) {
        socketService.emit('leave-order-room', { orderId: order._id })
      }
    }
  }, [order?.drone?._id, order?._id])

  const setupSocketListeners = () => {
    // Listen for delivery simulation started
    socketService.on('delivery:simulation:started', (data) => {
      console.log('🚀 Delivery simulation started:', data)
      if (data.orderId === order._id) {
        message.info(`Drone ${data.droneName} đã bắt đầu giao hàng!`, 3)
        setEstimatedTime(data.estimatedTimeMinutes)
      }
    })

    // Listen for real-time drone location updates
    socketService.on('drone:location:update', (data) => {
      console.log('📍 Drone location update:', data)
      if (data.orderId === order._id) {
        const [lng, lat] = data.location.coordinates
        setDroneLocation([lat, lng])
        setDeliveryProgress(data.progress || 0)
        setRemainingDistance(data.remainingDistance)
        setEstimatedTime(data.estimatedTimeRemaining)
      }
    })

    // Listen for delivery complete
    socketService.on('delivery:complete', (data) => {
      console.log('✅ Delivery complete:', data)
      if (data.orderId === order._id) {
        message.success('Đơn hàng đã được giao đến!', 5)
        setDeliveryProgress(100)
        setRemainingDistance(0)
        setEstimatedTime(0)
      }
    })
  }

  // ✅ Early return for validation - AFTER all hooks
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" tip="Đang tải bản đồ..." />
      </div>
    )
  }

  // ✅ VALIDATION: Check if coordinates exist before rendering map
  if (!restaurantPos || !deliveryPos) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f4ff 100%)',
        borderRadius: '16px',
        border: '2px dashed #91caff'
      }}>
        <div style={{ fontSize: '72px', marginBottom: '20px' }}>🗺️</div>
        <Text strong style={{ fontSize: '20px', color: '#1677ff', display: 'block', marginBottom: '16px' }}>
          ⚠️ Không thể hiển thị bản đồ
        </Text>
        <Space direction="vertical" size="middle" style={{ marginTop: '20px' }}>
          <div style={{ 
            padding: '16px 24px', 
            background: 'white', 
            borderRadius: '8px',
            border: '1px solid #d9d9d9'
          }}>
            <Space direction="vertical" size="small">
              <Text type="secondary" style={{ fontSize: '14px' }}>
                🏪 Nhà hàng: {restaurantPos ? '✅ Có tọa độ' : '❌ Chưa có tọa độ'}
              </Text>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                📍 Điểm giao: {deliveryPos ? '✅ Có tọa độ' : '❌ Chưa có tọa độ'}
              </Text>
            </Space>
          </div>
          <div style={{ 
            padding: '20px', 
            background: '#fff7e6', 
            borderRadius: '12px',
            border: '1px solid #ffd591',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <Text style={{ fontSize: '14px', color: '#ad6800', lineHeight: '1.8' }}>
              💡 <strong>Đơn hàng này được tạo trước khi có tính năng bản đồ.</strong><br/>
              Hệ thống hiện đã tự động chuyển đổi địa chỉ thành tọa độ.<br/>
              Vui lòng tạo đơn hàng mới để trải nghiệm tính năng theo dõi bản đồ! 🚀
            </Text>
          </div>
        </Space>
      </div>
    )
  }

  // Show warning if no drone assigned yet
  const noDroneAssigned = !order?.drone?._id

  const currentDronePos = droneLocation || restaurantPos

  // Create route line 
  // ✅ Ưu tiên dùng route geometry từ OSRM nếu có, nếu không thì dùng đường thẳng
  let routePath = [restaurantPos, deliveryPos] // Fallback: đường thẳng
  
  if (order?.routeGeometry?.coordinates) {
    // OSRM trả về GeoJSON LineString với format [[lng, lat], [lng, lat], ...]
    // Chuyển đổi sang Leaflet format [[lat, lng], [lat, lng], ...]
    routePath = order.routeGeometry.coordinates.map(coord => [coord[1], coord[0]])
  }

  return (
    <div className="drone-map-container">
      {/* Map Controls */}
      <MapControls 
        mapRef={mapRef}
        restaurantPos={restaurantPos}
        deliveryPos={deliveryPos}
        dronePos={currentDronePos}
      />
      
      {/* No Drone Warning */}
      {noDroneAssigned && (
        <div style={{
          background: 'linear-gradient(135deg, #fa8c16 0%, #ff6b35 100%)',
          padding: '12px 20px',
          borderRadius: '12px 12px 0 0',
          color: 'white',
          textAlign: 'center',
        }}>
          <Text strong style={{ color: 'white', fontSize: '14px' }}>
            ⚠️ Chưa có drone được phân công. Map hiển thị vị trí nhà hàng và điểm giao hàng.
          </Text>
          {order?.routingMethod === 'routing' && (
            <div style={{ marginTop: '4px', fontSize: '12px', opacity: 0.9 }}>
              ✓ Lộ trình được tính bằng OSRM (đường đi thực tế)
            </div>
          )}
        </div>
      )}
      
      {/* Delivery Info Bar */}
      {!noDroneAssigned && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '16px 20px',
          borderRadius: noDroneAssigned ? '0 0 0 0' : '12px 12px 0 0',
          color: 'white',
        }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            {deliveryProgress > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ color: 'white', fontSize: '16px' }}>
                  <RocketOutlined /> Đang giao hàng...
                </Text>
                <Text style={{ color: 'white' }}>
                  {deliveryProgress}%
                </Text>
              </div>
              <Progress 
                percent={deliveryProgress} 
                strokeColor={{
                  '0%': '#52c41a',
                  '100%': '#389e0d',
                }}
                showInfo={false}
                style={{ marginBottom: 0 }}
              />
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            {remainingDistance && (
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                <EnvironmentOutlined /> Còn lại: {remainingDistance} km
              </Text>
            )}
            {estimatedTime && (
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                ⏱️ Dự kiến: ~{estimatedTime} phút
              </Text>
            )}
          </div>
        </Space>
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={defaultCenter}
        zoom={14}
        style={{ height: '450px', width: '100%', borderRadius: '0 0 12px 12px' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto fit bounds */}
        <AutoFitBounds 
          restaurantPos={restaurantPos}
          deliveryPos={deliveryPos}
          dronePos={currentDronePos}
        />

        {/* Route line - Layered for emphasis */}
        <Polyline
          positions={routePath}
          pathOptions={{
            color: '#0050b3', // Shadow/outline layer
            weight: 8,
            opacity: 0.3,
          }}
        />
        <Polyline
          positions={routePath}
          pathOptions={{
            color: '#1890ff', // Main vibrant line
            weight: 5,
            opacity: 1,
          }}
        />

        {/* Restaurant Marker */}
        <Marker position={restaurantPos} icon={createRestaurantIcon()}>
          <Popup>
            <div style={{ textAlign: 'center', minWidth: '150px' }}>
              <strong style={{ fontSize: '15px' }}>🏪 {order.restaurant?.name || 'Nhà hàng'}</strong>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {order.restaurant?.address || 'Địa chỉ nhà hàng'}
              </Text>
            </div>
          </Popup>
        </Marker>

        {/* Delivery Location Marker */}
        <Marker position={deliveryPos} icon={createDeliveryIcon()}>
          <Popup>
            <div style={{ textAlign: 'center', minWidth: '150px' }}>
              <strong style={{ fontSize: '15px' }}>📍 Điểm giao hàng</strong>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {order.deliveryInfo?.address}
              </Text>
              <br />
              <Text style={{ fontSize: '12px' }}>
                👤 {order.deliveryInfo?.name}
              </Text>
            </div>
          </Popup>
        </Marker>

        {/* Drone Marker (animated) - Only show if drone is assigned */}
        {!noDroneAssigned && currentDronePos && (
          <Marker position={currentDronePos} icon={createDroneIcon()}>
            <Popup>
              <div style={{ textAlign: 'center', minWidth: '150px' }}>
                <strong style={{ fontSize: '15px' }}>🚁 {order.drone?.name || 'Drone'}</strong>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Model: {order.drone?.model || 'N/A'}
                </Text>
                <br />
                <Text style={{ fontSize: '12px' }}>
                  🔋 Pin: {order.drone?.batteryLevel || 100}%
                </Text>
                <br />
                <Text style={{ fontSize: '12px' }}>
                  📊 Trạng thái: {order.drone?.status || 'busy'}
                </Text>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}

export default DroneMap
