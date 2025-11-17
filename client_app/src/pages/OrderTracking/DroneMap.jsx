import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { message, Spin, Progress, Typography, Space, Button } from 'antd'
import { EnvironmentOutlined, RocketOutlined, UserOutlined, ShopOutlined } from '@ant-design/icons'
import socketService from '../../services/socketService'
import axiosInstance from '../../api/axios'
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
  const [currentOrder, setCurrentOrder] = useState(order) // Track order state locally
  const [droneHomeLocation, setDroneHomeLocation] = useState(null) // Store drone's home location
  const mapRef = useRef(null)
  const isSimulatingRef = useRef(false)
  const simulationIntervalRef = useRef(null)
  const isWaitingSetRef = useRef(false)
  const isReturningRef = useRef(false) // Track if drone is returning to base

  // Get coordinates from currentOrder state (will update in real-time)
  const restaurantCoords = currentOrder?.restaurant?.location?.coordinates // [lng, lat]
  const deliveryCoords = currentOrder?.deliveryInfo?.location?.coordinates // [lng, lat]
  const droneCoords = currentOrder?.drone?.currentLocation?.coordinates // [lng, lat]
  
  // Update currentOrder when order prop changes
  useEffect(() => {
    setCurrentOrder(order)
  }, [order])

  // ✅ VALIDATION: Check if coordinates exist before rendering map
  if (!restaurantCoords || !deliveryCoords) {
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
                🏪 Nhà hàng: {restaurantCoords ? '✅ Có tọa độ' : '❌ Chưa có tọa độ'}
              </Text>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                📍 Điểm giao: {deliveryCoords ? '✅ Có tọa độ' : '❌ Chưa có tọa độ'}
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

  // Convert to Leaflet format [lat, lng]
  const restaurantPos = [restaurantCoords[1], restaurantCoords[0]]
  const deliveryPos = [deliveryCoords[1], deliveryCoords[0]]

  // Default center
  const defaultCenter = restaurantPos || deliveryPos || [10.8231, 106.6297]

  useEffect(() => {
    // reset waiting flag when order changes
    isWaitingSetRef.current = false
    if (!order?._id) {
      setLoading(false)
      return
    }

    // Initialize drone location and home location
    console.log('🔍 DEBUG Order Drone Info:', {
      droneName: order?.drone?.name,
      droneSerial: order?.drone?.serialNumber,
      currentLocation: order?.drone?.currentLocation?.coordinates,
      homeLocation: order?.drone?.homeLocation?.coordinates
    });
    
    if (!order?.drone) {
      console.warn('⚠️ No drone assigned to this order yet')
      setLoading(false)
      return
    }
    
    if (order?.drone?.homeLocation?.coordinates) {
      const [homeLng, homeLat] = order.drone.homeLocation.coordinates
      setDroneHomeLocation([homeLat, homeLng])
      console.log('🏠 Drone home location set:', [homeLat, homeLng], 'from drone:', order.drone.name)
    } else {
      console.warn('⚠️ No homeLocation found for drone:', order?.drone?.name || 'Unknown')
    }
    
    // Set initial drone location based on order status
    if (droneCoords) {
      const [lng, lat] = droneCoords
      setDroneLocation([lat, lng])
      console.log('📍 Setting drone location from order.drone.currentLocation:', [lat, lng])
    } else {
      // If order is delivered or failed, drone should be at delivery location (customer)
      // This prevents drone from teleporting back to restaurant after delivery
      if (order.status === 'delivered' || order.status === 'delivery_failed' || order.status === 'waiting_for_customer') {
        console.log('📍 Order completed/waiting - setting drone location to DELIVERY position:', deliveryPos)
        setDroneLocation(deliveryPos)
      } else if (restaurantPos) {
        console.log('📍 Setting drone location to RESTAURANT position:', restaurantPos)
        setDroneLocation(restaurantPos)
      }
    }

    // Connect to socket
    const token = localStorage.getItem('token')
    if (token) {
      socketService.connect(token)
      
      // Setup socket listeners first
      const setupListenersAfterConnect = () => {
        if (!socketService.isConnected()) {
          console.log('⏳ DroneMap - Waiting for socket connection...')
          setTimeout(setupListenersAfterConnect, 500)
          return
        }
        
        console.log('✅ DroneMap - Socket connected, joining order room:', order._id)
        // Join order room
        socketService.emit('join-order-room', { orderId: order._id })
        console.log('📤 Sent join-order-room request for:', order._id)
        
        setupSocketListeners()
      }
      
      setupListenersAfterConnect()
    } else {
      console.warn('⚠️ DroneMap - No token found, cannot connect to socket')
    }

    setLoading(false)

    return () => {
      console.log('🧹 DroneMap cleanup - removing socket listeners')
      socketService.off('drone:location:update')
      socketService.off('delivery:simulation:started')
      socketService.off('delivery:complete')
      socketService.off('order:status-updated')
      socketService.off('drone:returning-home')
      socketService.off('drone:arrived-home')
      if (order?._id) {
        socketService.emit('leave-order-room', { orderId: order._id })
      }
      // cleanup simulation
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current)
        simulationIntervalRef.current = null
      }
      isSimulatingRef.current = false
      isReturningRef.current = false
      // reset waiting flag when leaving
      isWaitingSetRef.current = false
    }
  }, [order?.drone?._id, order?._id])

  // --- Helpers for simulation ---
  const toRad = (deg) => deg * Math.PI / 180
  const haversineDistance = (a, b) => {
    // a,b are [lat, lng]
    const R = 6371 // km
    const dLat = toRad(b[0] - a[0])
    const dLon = toRad(b[1] - a[1])
    const lat1 = toRad(a[0])
    const lat2 = toRad(b[0])
    const sa = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2)
    const c = 2 * Math.atan2(Math.sqrt(sa), Math.sqrt(1-sa))
    return R * c
  }

  const interpolate = (a, b, t) => {
    // linear interpolation for lat/lng
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
  }

  const emitLocationUpdate = (latlng, progress, remainingKm, etaMinutes) => {
    const [lat, lng] = latlng
    const payload = {
      orderId: order._id,
      location: { coordinates: [lng, lat] },
      progress: Math.round(progress),
      remainingDistance: remainingKm != null ? Number((remainingKm).toFixed(2)) : null,
      estimatedTimeRemaining: etaMinutes != null ? Math.round(etaMinutes) : null,
    }
    try {
      // emit both naming styles to be compatible with listeners
      socketService.emit('drone:location-update', payload)
      socketService.emit('drone:location:update', payload)
    } catch (e) {
      // socket may not be connected in some dev environments
      console.debug('Could not emit socket update', e)
    }
  }

  const returnToBase = (targetHomeLocation = null) => {
    console.log('🔵 returnToBase CALLED')
    console.log('   targetHomeLocation param:', targetHomeLocation)
    console.log('   droneHomeLocation state:', droneHomeLocation)
    console.log('   restaurantPos:', restaurantPos)
    console.log('   isReturningRef.current:', isReturningRef.current)
    console.log('   isSimulatingRef.current:', isSimulatingRef.current)
    
    if (isReturningRef.current || isSimulatingRef.current) {
      console.warn('⚠️ returnToBase BLOCKED - already returning or simulating')
      return
    }
    
    // Use parameter first, then state, then fallback to restaurant
    const homePos = targetHomeLocation || droneHomeLocation || restaurantPos
    if (!homePos) {
      console.error('❌ Cannot return to base: No home position available')
      return
    }
    
    // Determine starting position - prefer current drone location, fallback to delivery location
    const startPos = droneLocation || deliveryPos
    if (!startPos) {
      console.error('❌ Cannot return to base: No starting position available')
      return
    }
    
    isReturningRef.current = true
    console.log('🔙 Starting drone return to HOME LOCATION animation (5 seconds)')
    console.log('   From:', startPos, '→ To:', homePos)
    
    const endPos = homePos
    const durationMs = 5000 // 5 seconds
    const startTime = Date.now()
    const endTime = startTime + durationMs
    const tickMs = 100
    
    const returnIntervalId = setInterval(() => {
      const now = Date.now()
      const t = Math.min(1, (now - startTime) / durationMs)
      
      // Interpolate position
      const pos = interpolate(startPos, endPos, t)
      setDroneLocation(pos)
      
      // Update progress as negative (returning)
      const returnProgress = Math.round((1 - t) * 100)
      
      // Emit location updates
      try {
        const [plat, plng] = pos
        socketService.emit('drone:location-update', {
          orderId: order._id,
          location: { coordinates: [plng, plat] },
          progress: returnProgress,
          remainingDistance: null,
          estimatedTimeRemaining: null,
        })
      } catch (e) {
        console.debug('Could not emit return location update', e)
      }
      
      // Finish
      if (now >= endTime) {
        clearInterval(returnIntervalId)
        isReturningRef.current = false
        // Use the final target position (endPos) instead of state
        setDroneLocation(endPos)
        console.log('✅ Drone returned to HOME LOCATION:', endPos)
      }
    }, tickMs)
  }
  
  const simulateFlight = (durationMs = 10000) => {
    if (isSimulatingRef.current || isReturningRef.current) return
    if (!order) return
    isSimulatingRef.current = true

    // Note: we do not notify server now. Status will be updated when drone reaches customer.

    // Build the polyline points (lat,lng)
    let path = []
    // routePath is [ [lat,lng], ... ] from restaurant->delivery
    const routePoints = (order?.routeGeometry?.coordinates && order.routeGeometry.coordinates.length > 0)
      ? order.routeGeometry.coordinates.map(c => [c[1], c[0]])
      : [restaurantPos, deliveryPos]

    const startPos = droneLocation || (order.drone?.currentLocation?.coordinates ? [order.drone.currentLocation.coordinates[1], order.drone.currentLocation.coordinates[0]] : restaurantPos)

    // Ensure route begins from current drone position
    path = [startPos, ...routePoints]

    // Compute segment lengths and total length
    const segLengths = []
    let total = 0
    for (let i = 0; i < path.length - 1; i++) {
      const d = haversineDistance(path[i], path[i+1])
      segLengths.push(d)
      total += d
    }

    if (total === 0) {
      isSimulatingRef.current = false
      return
    }

    const startTime = Date.now()
    const endTime = startTime + durationMs
    const tickMs = 100 // update every 100ms

    simulationIntervalRef.current = setInterval(() => {
      const now = Date.now()
      const t = Math.min(1, (now - startTime) / durationMs)

      // target distance along route
      const targetDist = total * t
      // walk segments
      let acc = 0
      let segIndex = 0
      while (segIndex < segLengths.length && acc + segLengths[segIndex] < targetDist) {
        acc += segLengths[segIndex]
        segIndex++
      }

      let pos
      if (segIndex >= segLengths.length) {
        pos = path[path.length - 1]
      } else {
        const segStart = path[segIndex]
        const segEnd = path[segIndex+1]
        const segDist = segLengths[segIndex] || 0.000001
        const withinSeg = (targetDist - acc) / segDist
        pos = interpolate(segStart, segEnd, withinSeg)
      }

      // update remaining and progress
      const traveled = total * t
      const remaining = Math.max(0, total - traveled)
      const progress = (traveled / total) * 100
      const etaMinutes = (remaining / (total || 1)) * (durationMs / 60000) // proportionally

      setDroneLocation(pos)
      setDeliveryProgress(Math.round(progress))
      setRemainingDistance(Number(remaining.toFixed(2)))
      setEstimatedTime(Math.max(0, Math.round(etaMinutes)))

      // emit socket updates so other components (and server) can receive them
      try {
        const [plat, plng] = pos
        const payload = {
          orderId: order._id,
          location: { coordinates: [plng, plat] },
          progress: Math.round(progress),
          remainingDistance: remaining != null ? Number(remaining.toFixed(2)) : null,
          estimatedTimeRemaining: etaMinutes != null ? Math.round(etaMinutes) : null,
        }
        socketService.emit('drone:location-update', payload)
        socketService.emit('drone:location:update', payload)
      } catch (e) {
        console.debug('Could not emit simulated location update', e)
      }

      // finish
      if (now >= endTime) {
        clearInterval(simulationIntervalRef.current)
        simulationIntervalRef.current = null
        isSimulatingRef.current = false

        // final arrival at delivery point
        setDroneLocation(deliveryPos)
        setDeliveryProgress(100)
        setRemainingDistance(0)
        setEstimatedTime(0)
        try {
          const [plat, plng] = deliveryPos
          const payload = {
            orderId: order._id,
            location: { coordinates: [plng, plat] },
            progress: 100,
            remainingDistance: 0,
            estimatedTimeRemaining: 0,
          }
          socketService.emit('drone:location-update', payload)
          socketService.emit('drone:location:update', payload)
        } catch (e) {
          console.debug('Could not emit final simulated location update', e)
        }

        // When the drone reaches the customer's location, set the order status to 'waiting_for_customer'
        // via socket so restaurant/admin UIs update immediately. No notifications.
        try {
          socketService.emit('order:status-updated', {
            orderId: order._id,
            status: 'waiting_for_customer',
            timestamp: new Date()
          })
            isWaitingSetRef.current = true
        } catch (e) {
          console.debug('Could not emit waiting_for_customer status on arrival', e)
        }
      }
    }, tickMs)
  }

  // Start simulation automatically when order status changes to 'delivering'
  useEffect(() => {
    if (!currentOrder) return
    if (!currentOrder.drone?._id) return
    
    // Start simulation when order transitions to 'delivering' status
    if (currentOrder.status === 'delivering' && !isSimulatingRef.current && !isReturningRef.current) {
      console.log('🚁 Order status is "delivering", starting drone flight simulation')
      // start simulation for ~10s
      simulateFlight(10000)
    }
    
    // Don't simulate for completed/cancelled orders
    if (['delivered', 'cancelled', 'returned', 'delivery_failed'].includes(currentOrder.status)) {
      // Stop any ongoing simulation
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current)
        simulationIntervalRef.current = null
        isSimulatingRef.current = false
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrder?.status, currentOrder?.drone?._id, currentOrder?.routeGeometry])

  const setupSocketListeners = () => {
    console.log('🎧 DroneMap - Setting up socket listeners for order:', order._id)
    
    // Listen for order status updates (real-time database updates)
    socketService.on('order:status-updated', (data) => {
      console.log('📡 DroneMap received order:status-updated:', data)
      console.log('   Current order ID:', order._id)
      console.log('   Event order ID:', data.orderId || data._id)
      console.log('   Match:', (data.orderId === order._id || data._id === order._id))
      
      if (data.orderId === order._id || data._id === order._id) {
        console.log('✅ Order IDs match! Updating currentOrder state...')
        console.log('   Old status:', currentOrder?.status)
        console.log('   New status:', data.status)
        
        // Update the currentOrder state with new status
        setCurrentOrder(prev => {
          const updated = {
            ...prev,
            status: data.status,
            ...(data.arrivedAt && { arrivedAt: data.arrivedAt }),
            ...(data.deliveredAt && { deliveredAt: data.deliveredAt }),
            ...(data.timeoutAt && { timeoutAt: data.timeoutAt }),
            ...(data.confirmedAt && { confirmedAt: data.confirmedAt }),
            ...(data.preparingAt && { preparingAt: data.preparingAt }),
            ...(data.readyAt && { readyAt: data.readyAt }),
            ...(data.deliveringAt && { deliveringAt: data.deliveringAt }),
          }
          console.log('   Updated order state:', updated.status)
          return updated
        })
        
        // Handle status transitions
        if (data.status === 'waiting_for_customer') {
          console.log('✅ Order transitioned to waiting_for_customer')
          isWaitingSetRef.current = true
        }
        
        // 🚀 TRIGGER DRONE RETURN ANIMATION for delivery_failed using socket data
        if (data.status === 'delivery_failed') {
          console.log('📋 Order delivery_failed - triggering drone return animation')
          
          // Use drone info from socket event
          if (data.drone?.homeLocation?.coordinates) {
            const [lng, lat] = data.drone.homeLocation.coordinates
            const targetHome = [lat, lng]
            console.log('🎯 Using homeLocation from socket event:', targetHome)
            
            // Update drone location to current position
            if (data.drone.currentLocation?.coordinates) {
              const [clng, clat] = data.drone.currentLocation.coordinates
              setDroneLocation([clat, clng])
              console.log('📍 Updated drone starting position:', [clat, clng])
            }
            
            // Trigger return animation
            setTimeout(() => {
              console.log('🚁 Calling returnToBase with:', targetHome)
              returnToBase(targetHome)
            }, 100)
          } else {
            console.error('❌ No drone homeLocation in socket event data:', data)
          }
        }
        
        if (['delivered', 'cancelled', 'returned'].includes(data.status)) {
          console.log('📋 Order completed with status:', data.status)
        }
      } else {
        console.log('⚠️ Order IDs do not match, ignoring event')
      }
    })
    
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
        // If server reports arrival (remainingDistance === 0) or drone is within ~50m, set order to waiting_for_customer
        try {
          const remaining = data.remainingDistance != null ? Number(data.remainingDistance) : null
          const currentPos = [lat, lng]
          const distanceToDelivery = deliveryPos ? haversineDistance(currentPos, deliveryPos) : null
          const arrivedByDistance = distanceToDelivery != null ? distanceToDelivery <= 0.05 : false // 0.05 km == 50 meters
          if ((remaining === 0 || arrivedByDistance) && !isWaitingSetRef.current && currentOrder?.status === 'delivering') {
            isWaitingSetRef.current = true
            socketService.emit('order:status-updated', {
              orderId: order._id,
              status: 'waiting_for_customer',
              timestamp: new Date()
            })
          }
        } catch (e) {
          console.debug('Could not evaluate arrival or emit waiting_for_customer', e)
        }
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
    
    // Listen for drone returning home (triggered by server)
    socketService.on('drone:returning-home', (data) => {
      console.log('🔙 [DroneMap] Received drone:returning-home event:', data)
      console.log('   Current order._id:', order._id)
      console.log('   Event orderId:', data.orderId)
      console.log('   Order match:', data.orderId === order._id, '(String match:', String(data.orderId) === String(order._id), ')')
      console.log('   isReturningRef.current:', isReturningRef.current)
      console.log('   isSimulatingRef.current:', isSimulatingRef.current)
      
      // Skip if already returning or simulating
      if (isReturningRef.current || isSimulatingRef.current) {
        console.log('⚠️ Ignoring drone:returning-home - already in motion')
        return
      }
      
      // Convert ObjectId to string for comparison
      const eventOrderId = String(data.orderId)
      const currentOrderId = String(order._id)
      
      if (eventOrderId === currentOrderId) {
        console.log('✅ Order IDs match! Processing drone return...')
        message.info(`🚁 ${data.droneName} đang bay về vị trí ban đầu...`, 3)
        
        // Extract homeLocation from server data and convert to [lat, lng] format
        let targetHome = null
        if (data.homeLocation?.coordinates) {
          const [lng, lat] = data.homeLocation.coordinates
          targetHome = [lat, lng]
          console.log('🎯 Target homeLocation from server:', targetHome)
        } else {
          console.error('❌ No homeLocation in server data!')
          return
        }
        
        // Set drone location to delivery position (customer location) before starting return animation
        // This ensures drone starts from customer location, not restaurant
        if (deliveryPos) {
          setDroneLocation(deliveryPos)
          console.log('📍 Set drone starting position to CUSTOMER location:', deliveryPos)
        } else {
          console.warn('⚠️ No delivery position available, using current location')
        }
        
        // Trigger return animation with server's homeLocation IMMEDIATELY (no timeout)
        console.log('🚀 Calling returnToBase NOW with target:', targetHome)
        returnToBase(targetHome)
      } else {
        console.log('❌ Order IDs do NOT match - ignoring event')
        console.log('   Expected:', currentOrderId)
        console.log('   Received:', eventOrderId)
      }
    })
    
    // Listen for drone arrived home
    socketService.on('drone:arrived-home', (data) => {
      console.log('🏠 Drone arrived home:', data)
      if (data.orderId === order._id) {
        message.success(`✅ ${data.droneName} đã về đến vị trí ban đầu!`, 3)
      }
    })
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" tip="Đang tải bản đồ..." />
      </div>
    )
  }

  // Validate coordinates exist
  if (!restaurantPos || !deliveryPos) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
        <p>⚠️ Chưa có thông tin vị trí đầy đủ</p>
        <small>Nhà hàng: {restaurantPos ? '✅' : '❌'} | Điểm giao: {deliveryPos ? '✅' : '❌'}</small>
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
