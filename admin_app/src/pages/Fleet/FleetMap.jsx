import { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Tag, Space, Spin, Statistic, List, Button, Badge, message } from 'antd';
import {
  ThunderboltOutlined,
  EnvironmentOutlined,
  ThunderboltFilled,
  ClockCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as adminAPI from '../../api/adminAPI';
import socketService from '../../services/socketService';
import './FleetMap.css';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom drone icons
const createDroneIcon = (status, batteryLevel) => {
  let color = '#52c41a'; // green - idle
  if (status === 'assigned' || status === 'picking_up') color = '#1890ff'; // blue
  if (status === 'delivering') color = '#fa8c16'; // orange
  if (status === 'offline') color = '#d9d9d9'; // gray
  if (batteryLevel < 20) color = '#ff4d4f'; // red - low battery

  return L.divIcon({
    className: 'custom-drone-icon',
    html: `
      <div style="
        background: ${color};
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
        🚁
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Component to update map view
const MapUpdater = ({ drones }) => {
  const map = useMap();

  useEffect(() => {
    if (drones.length > 0) {
      const bounds = drones
        .filter(d => d.currentLocation?.coordinates)
        .map(d => [
          d.currentLocation.coordinates[1],
          d.currentLocation.coordinates[0],
        ]);

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [drones, map]);

  return null;
};

const FleetMap = () => {
  const [drones, setDrones] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const mapRef = useRef(null);

  // Default center (Ho Chi Minh City)
  const defaultCenter = [10.8231, 106.6297];

  useEffect(() => {
    fetchData();
    initializeSocket();

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => {
      clearInterval(interval);
      socketService.off('fleet:status');
      socketService.off('fleet:location-update');
      socketService.off('drone:online');
      socketService.off('drone:offline');
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mapRes, statsRes] = await Promise.all([
        adminAPI.getFleetMap(),
        adminAPI.getFleetStats(),
      ]);

      setDrones(mapRes.data || []);
      setStats(statsRes.data);
    } catch (error) {
      message.error('Failed to fetch fleet data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    socketService.connect(token);
    socketService.subscribeToFleet();

    // Listen for fleet updates
    socketService.onFleetStatus((fleetData) => {
      console.log('Fleet status update:', fleetData);
      // Update drones with real-time data
      setDrones(prevDrones => {
        return prevDrones.map(drone => {
          const update = fleetData.find(f => f.droneId === drone._id);
          if (update) {
            return {
              ...drone,
              currentLocation: {
                ...drone.currentLocation,
                coordinates: [update.lng, update.lat],
              },
              batteryLevel: update.batteryLevel,
              status: update.status,
            };
          }
          return drone;
        });
      });
    });

    socketService.onFleetLocationUpdate((data) => {
      // Update specific drone location
      setDrones(prevDrones => {
        return prevDrones.map(drone => {
          if (drone._id === data.droneId) {
            return {
              ...drone,
              currentLocation: {
                ...drone.currentLocation,
                coordinates: [data.location.lng, data.location.lat],
              },
              batteryLevel: data.batteryLevel,
              status: data.status,
            };
          }
          return drone;
        });
      });
    });

    socketService.onDroneOnline((data) => {
      message.success(`🚁 Drone ${data.droneId} is now online`);
      fetchData();
    });

    socketService.onDroneOffline((data) => {
      message.warning(`⚠️ Drone ${data.droneId} went offline`);
      fetchData();
    });
  };

  const handleDroneClick = (drone) => {
    setSelectedDrone(drone);
    
    // Fly to drone location
    if (mapRef.current && drone.currentLocation?.coordinates) {
      const [lng, lat] = drone.currentLocation.coordinates;
      mapRef.current.flyTo([lat, lng], 14, {
        duration: 1.5,
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      idle: 'green',
      available: 'green',
      assigned: 'blue',
      picking_up: 'blue',
      delivering: 'orange',
      returning: 'cyan',
      offline: 'red',
      maintenance: 'gray',
    };
    return colors[status] || 'default';
  };

  const getBatteryColor = (level) => {
    if (level >= 70) return 'success';
    if (level >= 40) return 'warning';
    return 'danger';
  };

  if (loading && drones.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <p>Loading fleet map...</p>
      </div>
    );
  }

  return (
    <div className="fleet-map-page">
      <Row gutter={[16, 16]}>
        {/* Stats Cards */}
        <Col xs={24}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Total Drones"
                  value={stats?.fleet?.total || 0}
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Idle"
                  value={stats?.fleet?.idle || 0}
                  prefix={<Badge status="success" />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Busy"
                  value={stats?.fleet?.busy || 0}
                  prefix={<Badge status="processing" />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Offline"
                  value={stats?.fleet?.offline || 0}
                  prefix={<Badge status="error" />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Map and Drone List */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <EnvironmentOutlined />
                Fleet Real-Time Map
              </Space>
            }
            extra={
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchData}
                loading={loading}
                size="small"
              >
                Refresh
              </Button>
            }
          >
            <div style={{ height: 600, borderRadius: 8, overflow: 'hidden' }}>
              <MapContainer
                center={defaultCenter}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapUpdater drones={drones} />

                {/* Render drones */}
                {drones.map((drone) => {
                  if (!drone.currentLocation?.coordinates) return null;

                  const [lng, lat] = drone.currentLocation.coordinates;
                  const isSelected = selectedDrone?._id === drone._id;

                  return (
                    <div key={drone._id}>
                      <Marker
                        position={[lat, lng]}
                        icon={createDroneIcon(drone.status, drone.batteryLevel)}
                        eventHandlers={{
                          click: () => handleDroneClick(drone),
                        }}
                      >
                        <Popup>
                          <div style={{ minWidth: 200 }}>
                            <h3>{drone.name}</h3>
                            <p>
                              <strong>Status:</strong>{' '}
                              <Tag color={getStatusColor(drone.status)}>
                                {drone.status}
                              </Tag>
                            </p>
                            <p>
                              <strong>Battery:</strong>{' '}
                              <Tag color={drone.batteryLevel >= 40 ? 'green' : 'red'}>
                                🔋 {drone.batteryLevel}%
                              </Tag>
                            </p>
                            {drone.operator && (
                              <p>
                                <strong>Operator:</strong> {drone.operator.name}
                              </p>
                            )}
                            {drone.currentOrder && (
                              <p>
                                <strong>Current Order:</strong>{' '}
                                {drone.currentOrder.orderNumber}
                              </p>
                            )}
                          </div>
                        </Popup>
                      </Marker>

                      {/* Show range circle for selected drone */}
                      {isSelected && (
                        <Circle
                          center={[lat, lng]}
                          radius={5000} // 5km range
                          pathOptions={{
                            color: '#1890ff',
                            fillColor: '#1890ff',
                            fillOpacity: 0.1,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </MapContainer>
            </div>
          </Card>
        </Col>

        {/* Drone List Sidebar */}
        <Col xs={24} lg={8}>
          <Card
            title={`Drones (${drones.length})`}
            extra={<ClockCircleOutlined />}
          >
            <List
              dataSource={drones}
              style={{ maxHeight: 600, overflowY: 'auto' }}
              renderItem={(drone) => (
                <List.Item
                  className={`drone-list-item ${
                    selectedDrone?._id === drone._id ? 'selected' : ''
                  }`}
                  onClick={() => handleDroneClick(drone)}
                  style={{ cursor: 'pointer' }}
                >
                  <List.Item.Meta
                    avatar={<span style={{ fontSize: 24 }}>🚁</span>}
                    title={
                      <Space>
                        <span>{drone.name}</span>
                        <Tag color={getStatusColor(drone.status)}>
                          {drone.status}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div>
                          <ThunderboltFilled
                            style={{
                              color:
                                drone.batteryLevel >= 70
                                  ? '#52c41a'
                                  : drone.batteryLevel >= 40
                                  ? '#faad14'
                                  : '#ff4d4f',
                            }}
                          />{' '}
                          {drone.batteryLevel}%
                        </div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                          {drone.operator?.name || 'No operator'}
                        </div>
                        {drone.currentOrder && (
                          <Tag color="blue" size="small">
                            Order: {drone.currentOrder.orderNumber}
                          </Tag>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FleetMap;
