import { useEffect, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { MapContainer, TileLayer } from 'react-leaflet'
import { Card, Row, Col, Statistic, Select, Space, Button } from 'antd'
import { ReloadOutlined, EnvironmentOutlined, RocketOutlined } from '@ant-design/icons'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../../components/Map/Map.css'
import { DroneMarker, RoutePolyline, MapController } from '../../components/Map'
import { MAP_CONFIG, TILE_LAYER } from '../../utils/mapHelpers'
import { getAllDrones } from '../../api/droneAPI'
import { setDrones, selectDrone } from '../../redux/slices/droneSlice'
import { toast } from 'react-toastify'

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const MapPage = () => {
    const dispatch = useDispatch()
    const { drones, selectedDrone } = useSelector((state) => state.drone)
    const [loading, setLoading] = useState(false)
    const [mapCenter, setMapCenter] = useState(MAP_CONFIG.defaultCenter)
    const [mapZoom, setMapZoom] = useState(MAP_CONFIG.defaultZoom)

    // Fetch drones
    const fetchDrones = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getAllDrones()
            dispatch(setDrones(response.data || []))
        } catch (error) {
            toast.error('Không thể tải danh sách drone')
            console.error('Error fetching drones:', error)
        } finally {
            setLoading(false)
        }
    }, [dispatch])

    useEffect(() => {
        fetchDrones()
        
        // Refresh every 30 seconds
        const interval = setInterval(() => {
            fetchDrones()
        }, 30000)

        return () => clearInterval(interval)
    }, [fetchDrones])

    // Handle drone selection
    const handleDroneSelect = (droneId) => {
        const drone = drones.find((d) => d._id === droneId)
        if (drone) {
            dispatch(selectDrone(drone))
            if (drone.currentLocation && drone.currentLocation.coordinates) {
                const [lng, lat] = drone.currentLocation.coordinates
                setMapCenter([lat, lng])
                setMapZoom(15)
            }
        } else {
            dispatch(selectDrone(null))
            setMapCenter(MAP_CONFIG.defaultCenter)
            setMapZoom(MAP_CONFIG.defaultZoom)
        }
    }

    // Statistics
    const stats = {
        total: drones.length,
        available: drones.filter((d) => d.status === 'available').length,
        busy: drones.filter((d) => d.status === 'busy').length,
        offline: drones.filter((d) => d.status === 'offline' || d.status === 'maintenance').length,
    }

    return (
        <div>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <h1>
                        <EnvironmentOutlined /> Bản đồ theo dõi Drone
                    </h1>
                </Col>

                {/* Statistics */}
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic title="Tổng số Drone" value={stats.total} prefix={<RocketOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic title="Sẵn sàng" value={stats.available} valueStyle={{ color: '#52c41a' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic title="Đang hoạt động" value={stats.busy} valueStyle={{ color: '#1890ff' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic title="Ngoại tuyến" value={stats.offline} valueStyle={{ color: '#ff4d4f' }} />
                    </Card>
                </Col>

                {/* Map Controls */}
                <Col span={24}>
                    <Card>
                        <Space>
                            <Select
                                style={{ width: 250 }}
                                placeholder="Chọn drone để theo dõi"
                                allowClear
                                value={selectedDrone?._id}
                                onChange={handleDroneSelect}
                                options={drones.map((drone) => ({
                                    value: drone._id,
                                    label: `${drone.name || drone.droneId} - ${drone.status}`,
                                }))}
                            />
                            <Button icon={<ReloadOutlined />} onClick={fetchDrones} loading={loading}>
                                Làm mới
                            </Button>
                        </Space>
                    </Card>
                </Col>

                {/* Map */}
                <Col span={24}>
                    <Card>
                        <div style={{ height: '600px' }}>
                            <MapContainer
                                center={MAP_CONFIG.defaultCenter}
                                zoom={MAP_CONFIG.defaultZoom}
                                style={{ height: '100%', width: '100%' }}
                                maxZoom={MAP_CONFIG.maxZoom}
                                minZoom={MAP_CONFIG.minZoom}
                            >
                                <TileLayer attribution={TILE_LAYER.attribution} url={TILE_LAYER.url} />
                                
                                <MapController center={mapCenter} zoom={mapZoom} />

                                {/* Render all drones */}
                                {drones.map((drone) => (
                                    <DroneMarker
                                        key={drone._id}
                                        drone={drone}
                                        onClick={(d) => handleDroneSelect(d._id)}
                                    />
                                ))}

                                {/* Selected drone route */}
                                {selectedDrone && selectedDrone.route && selectedDrone.route.length > 0 && (
                                    <RoutePolyline
                                        positions={selectedDrone.route.map(([lng, lat]) => [lat, lng])}
                                        color="#1890ff"
                                    />
                                )}
                            </MapContainer>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default MapPage
