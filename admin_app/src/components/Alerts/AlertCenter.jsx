import { useState, useEffect, useCallback } from 'react';
import {
  Badge,
  Dropdown,
  Button,
  Tag,
  Space,
  Modal,
  message,
  Empty,
  Card,
} from 'antd';
import {
  BellOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
}
from '@ant-design/icons';
import socketService from '../../services/socketService';
import './AlertCenter.css';

const AlertCenter = () => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const soundEnabled = true;

  const saveAlertsToStorage = useCallback((newAlerts) => {
    localStorage.setItem('admin_alerts', JSON.stringify(newAlerts));
  }, []);

  const addAlert = useCallback((alert) => {
    setAlerts(prev => {
      const newAlerts = [{ ...alert, read: false }, ...prev];
      // Keep only last 50 alerts
      const limited = newAlerts.slice(0, 50);
      saveAlertsToStorage(limited);
      return limited;
    });
    setUnreadCount(prev => prev + 1);

    // Show notification
    if (alert.severity === 'critical') {
      message.error(alert.title, 5);
    } else if (alert.severity === 'warning') {
      message.warning(alert.title, 3);
    } else {
      message.info(alert.title, 2);
    }
  }, [setAlerts, setUnreadCount, saveAlertsToStorage, message]);

  const initializeSocket = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    socketService.connect(token);

    // Listen for emergency alerts
    socketService.onDroneEmergency((data) => {
      addAlert({
        id: Date.now() + '_emergency',
        type: 'emergency',
        severity: 'critical',
        title: `🚨 EMERGENCY: Drone ${data.droneId}`,
        message: `${data.issue}: ${data.description}`,
        data: data,
        timestamp: new Date(data.timestamp),
      });
      playAlertSound('critical');
    });

    // Listen for low battery alerts
    socketService.onLowBatteryAlert((data) => {
      addAlert({
        id: Date.now() + '_battery',
        type: 'low_battery',
        severity: data.severity,
        title: `🔋 Low Battery: Drone ${data.droneId}`,
        message: `Battery level: ${data.batteryLevel}%`,
        data: data,
        timestamp: new Date(data.timestamp),
      });
      if (data.severity === 'critical') {
        playAlertSound('critical');
      }
    });

    // Listen for offline drones
    socketService.onDroneOffline((data) => {
      addAlert({
        id: Date.now() + '_offline',
        type: 'offline',
        severity: 'warning',
        title: `⚠️ Drone Offline`,
        message: `Drone ${data.droneId} went offline`,
        data: data,
        timestamp: new Date(data.timestamp),
      });
    });

    // Listen for assignment rejections
    socketService.off('assignment:rejected');
    if (socketService.getSocket()) {
      socketService.getSocket().on('assignment:rejected', (data) => {
        addAlert({
          id: Date.now() + '_rejected',
          type: 'assignment_rejected',
          severity: 'warning',
          title: `❌ Assignment Rejected`,
          message: `Drone ${data.droneId} rejected order ${data.orderId}. Reason: ${data.reason}`,
          data: data,
          timestamp: new Date(),
        });
      });
    }
  }, [addAlert]);

  useEffect(() => {
    initializeSocket();
    loadAlertsFromStorage();

    return () => {
      socketService.off('drone:emergency');
      socketService.off('alert:low-battery');
      socketService.off('drone:offline');
      socketService.off('assignment:rejected');
    };
  }, [initializeSocket, loadAlertsFromStorage]);

  const playAlertSound = (severity) => {
    if (!soundEnabled) return;
    
    // Play different sounds based on severity
    try {
      const audio = new Audio(
        severity === 'critical'
          ? '/sounds/critical-alert.mp3'
          : '/sounds/warning-alert.mp3'
      );
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      console.log('Audio not available');
    }
  };

  const markAsRead = (alertId) => {
    setAlerts(prev => {
      const updated = prev.map(a => 
        a.id === alertId ? { ...a, read: true } : a
      );
      saveAlertsToStorage(updated);
      return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setAlerts(prev => {
      const updated = prev.map(a => ({ ...a, read: true }));
      saveAlertsToStorage(updated);
      return updated;
    });
    setUnreadCount(0);
  };

  const clearAlert = (alertId) => {
    setAlerts(prev => {
      const updated = prev.filter(a => a.id !== alertId);
      saveAlertsToStorage(updated);
      return updated;
    });
    const alert = alerts.find(a => a.id === alertId);
    if (alert && !alert.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'info':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'warning':
        return 'orange';
      case 'info':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'emergency':
        return '🚨';
      case 'low_battery':
        return '🔋';
      case 'offline':
        return '📴';
      case 'assignment_rejected':
        return '❌';
      default:
        return '📢';
    }
  };

  const handleAlertClick = (alert) => {
    setSelectedAlert(alert);
    setModalVisible(true);
    if (!alert.read) {
      markAsRead(alert.id);
    }
  };

  const dropdownMenu = {
    items: [
      {
        key: 'header',
        label: (
          <div style={{ padding: '8px 0' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <strong>Notifications</strong>
              <Button type="link" size="small" onClick={markAllAsRead}>
                Mark all read
              </Button>
            </Space>
          </div>
        ),
        disabled: true,
      },
      {
        type: 'divider',
      },
      ...alerts.slice(0, 5).map((alert) => ({
        key: alert.id,
        label: (
          <div
            onClick={() => handleAlertClick(alert)}
            style={{
              padding: '8px 0',
              background: alert.read ? 'transparent' : '#f0f2f5',
              borderRadius: 4,
            }}
          >
            <Space align="start">
              <span style={{ fontSize: 20 }}>{getTypeIcon(alert.type)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: alert.read ? 'normal' : 'bold' }}>
                  {alert.title}
                </div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                  {alert.timestamp.toLocaleTimeString()}
                </div>
              </div>
              <Tag color={getSeverityColor(alert.severity)}>
                {alert.severity}
              </Tag>
            </Space>
          </div>
        ),
      })),
      ...(alerts.length === 0
        ? [
            {
              key: 'empty',
              label: (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Empty description="No alerts" />
                </div>
              ),
              disabled: true,
            },
          ]
        : []),
      {
        type: 'divider',
      },
      {
        key: 'view-all',
        label: (
          <Button
            type="link"
            block
            onClick={() => {
              // Open full alerts page or modal
              message.info('View all alerts (feature coming soon)');
            }}
          >
            View all alerts ({alerts.length})
          </Button>
        ),
      },
    ],
  };

  return (
    <>
      <Dropdown
        menu={dropdownMenu}
        trigger={['click']}
        placement="bottomRight"
        overlayStyle={{ width: 400, maxHeight: 500, overflowY: 'auto' }}
      >
        <Badge count={unreadCount} overflowCount={99}>
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: 18 }} />}
            style={{ fontSize: 18 }}
          />
        </Badge>
      </Dropdown>

      {/* Alert Detail Modal */}
      <Modal
        title={
          <Space>
            {selectedAlert && getSeverityIcon(selectedAlert.severity)}
            {selectedAlert?.title}
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedAlert(null);
        }}
        footer={[
          <Button
            key="clear"
            danger
            onClick={() => {
              if (selectedAlert) {
                clearAlert(selectedAlert.id);
                setModalVisible(false);
                setSelectedAlert(null);
              }
            }}
          >
            Clear Alert
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => {
              setModalVisible(false);
              setSelectedAlert(null);
            }}
          >
            Close
          </Button>,
        ]}
      >
        {selectedAlert && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <strong>Type:</strong>{' '}
                  <Tag color={getSeverityColor(selectedAlert.severity)}>
                    {selectedAlert.type}
                  </Tag>
                </div>
                <div>
                  <strong>Severity:</strong>{' '}
                  <Tag color={getSeverityColor(selectedAlert.severity)}>
                    {selectedAlert.severity}
                  </Tag>
                </div>
                <div>
                  <strong>Time:</strong> {selectedAlert.timestamp.toLocaleString()}
                </div>
              </Space>
            </Card>

            <Card size="small" title="Message">
              <p>{selectedAlert.message}</p>
            </Card>

            {selectedAlert.data && (
              <Card size="small" title="Details" style={{ marginTop: 16 }}>
                <pre style={{ fontSize: 12, maxHeight: 200, overflow: 'auto' }}>
                  {JSON.stringify(selectedAlert.data, null, 2)}
                </pre>
              </Card>
            )}

            {selectedAlert.type === 'emergency' && (
              <Card
                size="small"
                style={{
                  marginTop: 16,
                  background: '#fff1f0',
                  border: '1px solid #ffccc7',
                }}
              >
                <h4 style={{ color: '#ff4d4f' }}>⚠️ Recommended Actions:</h4>
                <ul>
                  <li>Check drone location and status immediately</li>
                  <li>Contact drone operator: {selectedAlert.data?.operatorName}</li>
                  <li>Consider reassigning the order if needed</li>
                  <li>Document the incident for review</li>
                </ul>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default AlertCenter;
