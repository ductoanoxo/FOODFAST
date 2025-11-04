import { useState, useEffect } from 'react';
import { Row, Col, Card, List, Button, Modal, message, Tag, Space, Spin, Empty, Divider } from 'antd';
import {
  ThunderboltOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  ThunderboltFilled,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import * as adminAPI from '../../api/adminAPI';
import socketService from '../../services/socketService';
import './AssignmentDashboard.css';

const AssignmentDashboard = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [availableDrones, setAvailableDrones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchData();
    initializeSocket();

    return () => {
      socketService.off('order:ready-for-assignment');
      socketService.off('assignment:success');
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, dronesRes] = await Promise.all([
        adminAPI.getPendingOrders(),
        adminAPI.getAvailableDrones(),
      ]);

      setPendingOrders(ordersRes.data || []);
      setAvailableDrones(dronesRes.data || []);
    } catch (error) {
      message.error('Failed to fetch data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    socketService.connect(token);

    // Listen for new orders
    socketService.onOrderReady((data) => {
      message.info(`🆕 New order ready for assignment: ${data.orderId}`);
      fetchData();
    });

    // Listen for successful assignments
    socketService.onAssignmentSuccess((data) => {
      message.success(`✅ Order assigned to drone successfully!`);
      fetchData();
    });
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside valid area
    if (!destination) return;

    // Dropped in same place
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Only allow dropping from orders to drones
    if (source.droppableId === 'orders' && destination.droppableId.startsWith('drone-')) {
      const orderId = draggableId;
      const droneId = destination.droppableId.replace('drone-', '');

      const order = pendingOrders.find((o) => o._id === orderId);
      const drone = availableDrones.find((d) => d._id === droneId);

      if (order && drone) {
        setSelectedOrder(order);
        setSelectedDrone(drone);
        setAssignModalVisible(true);
      }
    }
  };

  const handleManualSelect = (order) => {
    setSelectedOrder(order);
    // Fetch drones near this order's restaurant
    if (order.restaurant?.location?.coordinates) {
      const [lng, lat] = order.restaurant.location.coordinates;
      adminAPI.getAvailableDrones(lat, lng).then((res) => {
        setAvailableDrones(res.data || []);
      });
    }
  };

  const handleDroneSelect = (drone) => {
    if (!selectedOrder) {
      message.warning('Please select an order first');
      return;
    }
    setSelectedDrone(drone);
    setAssignModalVisible(true);
  };

  const handleAssign = async () => {
    if (!selectedOrder || !selectedDrone) return;

    try {
      setAssigning(true);
      await adminAPI.assignDrone(selectedOrder._id, selectedDrone._id);
      
      message.success(
        `✅ Assigned Order #${selectedOrder.orderNumber} to ${selectedDrone.name}!`
      );

      setAssignModalVisible(false);
      setSelectedOrder(null);
      setSelectedDrone(null);
      fetchData();
    } catch (error) {
      message.error('Assignment failed: ' + error.response?.data?.message || error.message);
    } finally {
      setAssigning(false);
    }
  };

  const getBatteryColor = (level) => {
    if (level >= 70) return '#52c41a';
    if (level >= 40) return '#faad14';
    return '#ff4d4f';
  };

  const getStatusColor = (status) => {
    const colors = {
      idle: 'green',
      available: 'green',
      assigned: 'blue',
      delivering: 'orange',
      returning: 'cyan',
      offline: 'red',
      maintenance: 'gray',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <p>Loading assignment dashboard...</p>
      </div>
    );
  }

  return (
    <div className="assignment-dashboard">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Space>
              <ThunderboltOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <h2 style={{ margin: 0 }}>Manual Assignment Dashboard</h2>
            </Space>
            <p style={{ marginTop: 8, color: '#666' }}>
              Drag orders to drones or click to select
            </p>
          </Card>
        </Col>
      </Row>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {/* Pending Orders Column */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <ClockCircleOutlined />
                  Pending Orders ({pendingOrders.length})
                </Space>
              }
              extra={
                <Button onClick={fetchData} size="small">
                  Refresh
                </Button>
              }
            >
              <Droppable droppableId="orders">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`orders-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    style={{ minHeight: 500, maxHeight: 600, overflowY: 'auto' }}
                  >
                    {pendingOrders.length === 0 ? (
                      <Empty description="No pending orders" />
                    ) : (
                      pendingOrders.map((order, index) => (
                        <Draggable key={order._id} draggableId={order._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`order-card ${snapshot.isDragging ? 'dragging' : ''} ${
                                selectedOrder?._id === order._id ? 'selected' : ''
                              }`}
                              onClick={() => handleManualSelect(order)}
                            >
                              <div className="order-header">
                                <strong>#{order.orderNumber}</strong>
                                <Tag color="orange">{order.status}</Tag>
                              </div>
                              <Divider style={{ margin: '8px 0' }} />
                              <div className="order-detail">
                                <EnvironmentOutlined /> {order.restaurant?.name}
                                <br />
                                <small>{order.restaurant?.address}</small>
                              </div>
                              <div className="order-detail">
                                <PhoneOutlined /> {order.user?.phone || order.deliveryInfo?.phone}
                                <br />
                                <small>{order.deliveryInfo?.address}</small>
                              </div>
                              <div className="order-footer">
                                <Space size="middle">
                                  <Tag color="blue">{order.items?.length} items</Tag>
                                  {order.distanceKm != null && (
                                    <Tag icon={<EnvironmentOutlined />} color="purple">
                                      ~{order.distanceKm} km
                                    </Tag>
                                  )}
                                </Space>
                                <strong>{order.totalAmount?.toLocaleString()} ₫</strong>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Card>
          </Col>

          {/* Available Drones Column */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <ThunderboltOutlined />
                  Available Drones ({availableDrones.length})
                </Space>
              }
              extra={
                <Button onClick={fetchData} size="small">
                  Refresh
                </Button>
              }
            >
              <div style={{ minHeight: 500, maxHeight: 600, overflowY: 'auto' }}>
                {availableDrones.length === 0 ? (
                  <Empty description="No available drones" />
                ) : (
                  <List
                    dataSource={availableDrones}
                    renderItem={(drone) => (
                      <Droppable droppableId={`drone-${drone._id}`}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`drone-card ${snapshot.isDraggingOver ? 'drop-target' : ''} ${
                              selectedDrone?._id === drone._id ? 'selected' : ''
                            }`}
                            onClick={() => handleDroneSelect(drone)}
                          >
                            <div className="drone-header">
                              <Space>
                                <ThunderboltOutlined style={{ fontSize: 20 }} />
                                <strong>{drone.name}</strong>
                              </Space>
                              <Tag color={getStatusColor(drone.status)}>{drone.status}</Tag>
                            </div>
                            <Divider style={{ margin: '8px 0' }} />
                            <Row gutter={[8, 8]}>
                              <Col span={12}>
                                <ThunderboltFilled style={{ color: getBatteryColor(drone.batteryLevel) }} />
                                <span style={{ marginLeft: 4 }}>
                                  {drone.batteryLevel || 0}%
                                </span>
                              </Col>
                              <Col span={12} style={{ textAlign: 'right' }}>
                                {drone.distance && (
                                  <Tag color="blue">{drone.distance} km away</Tag>
                                )}
                              </Col>
                            </Row>
                            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                              {drone.operator?.name || 'No operator'}
                              <br />
                              {drone.serialNumber}
                            </div>
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    )}
                  />
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </DragDropContext>

      {/* Assignment Confirmation Modal */}
      <Modal
        title="Confirm Assignment"
        open={assignModalVisible}
        onCancel={() => {
          setAssignModalVisible(false);
          setSelectedDrone(null);
        }}
        onOk={handleAssign}
        confirmLoading={assigning}
        okText="Assign"
        width={600}
      >
        {selectedOrder && selectedDrone && (
          <div>
            <Card size="small" title="Order Details" style={{ marginBottom: 16 }}>
              <p>
                <strong>Order Number:</strong> #{selectedOrder.orderNumber}
              </p>
              <p>
                <strong>Restaurant:</strong> {selectedOrder.restaurant?.name}
              </p>
              <p>
                <strong>Delivery Address:</strong> {selectedOrder.deliveryInfo?.address}
              </p>
              <p>
                <strong>Items:</strong> {selectedOrder.items?.length} items
              </p>
              <p>
                <strong>Total:</strong> {selectedOrder.totalAmount?.toLocaleString()} ₫
              </p>
              {selectedOrder.distanceKm != null && (
                <p>
                  <strong>Khoảng cách:</strong> {selectedOrder.distanceKm} km
                </p>
              )}
              {selectedOrder.distanceExplanation && (
                <p style={{ fontSize: 12, color: '#666' }}>
                  <strong>Cách tính:</strong> {selectedOrder.distanceExplanation}
                </p>
              )}
            </Card>

            <Card size="small" title="Drone Details">
              <p>
                <strong>Drone:</strong> {selectedDrone.name}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <Tag color={getStatusColor(selectedDrone.status)}>{selectedDrone.status}</Tag>
              </p>
              <p>
                <strong>Battery:</strong>{' '}
                <Tag color={selectedDrone.batteryLevel >= 40 ? 'green' : 'red'}>
                  {selectedDrone.batteryLevel}%
                </Tag>
              </p>
              {selectedDrone.distance && (
                <p>
                  <strong>Distance:</strong> {selectedDrone.distance} km
                </p>
              )}
              <p>
                <strong>Operator:</strong> {selectedDrone.operator?.name || 'None'}
              </p>
            </Card>

            {selectedDrone.batteryLevel < 30 && (
              <div style={{ marginTop: 16, padding: 12, background: '#fff7e6', border: '1px solid #ffd591' }}>
                <WarningOutlined style={{ color: '#fa8c16' }} /> Battery level is low. Are you sure you want to assign this drone?
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AssignmentDashboard;
