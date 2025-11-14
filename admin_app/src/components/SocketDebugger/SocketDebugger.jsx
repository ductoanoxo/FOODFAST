import { useState, useEffect } from 'react'
import { Card, Button, Tag, Space, Typography, Alert } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons'
import socketService from '../../services/socketService'

const { Title, Text } = Typography

/**
 * Component để test Socket.IO connection và real-time events (Admin App)
 */
const SocketDebugger = () => {
  const [connected, setConnected] = useState(false)
  const [events, setEvents] = useState([])
  const [socketId, setSocketId] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    
    if (!token) {
      console.error('No admin_token found!')
      return
    }

    // Connect socket
    socketService.connect(token)
    
    // Check connection status
    const checkConnection = setInterval(() => {
      const isConnected = socketService.isConnected()
      setConnected(isConnected)
      
      if (isConnected) {
        setSocketId(socketService.getSocket()?.id)
      }
    }, 1000)

    // Listen to all possible events
    const eventNames = [
      'order:created',
      'order:status-updated',
      'order:update',
      'order:cancelled',
      'order:drone-assigned',
      'order:ready-for-assignment',
      'assignment:success',
      'reassignment:success',
      'delivery:complete',
      'drone:status-update',
      'drone:online',
      'drone:offline',
      'drone:emergency',
      'alert:low-battery',
      'fleet:status',
      'fleet:location-update',
    ]

    eventNames.forEach(eventName => {
      const handler = (data) => {
        const timestamp = new Date().toLocaleTimeString('vi-VN')
        setEvents(prev => [{
          name: eventName,
          data: JSON.stringify(data, null, 2),
          timestamp
        }, ...prev.slice(0, 19)])
        
        console.log(`📡 Admin Event: ${eventName}`, data)
      }
      
      socketService.getSocket()?.on(eventName, handler)
    })

    return () => {
      clearInterval(checkConnection)
      eventNames.forEach(eventName => {
        socketService.off(eventName)
      })
    }
  }, [])

  const handleClearEvents = () => {
    setEvents([])
  }

  const handleReconnect = () => {
    socketService.disconnect()
    setTimeout(() => {
      const token = localStorage.getItem('admin_token')
      if (token) {
        socketService.connect(token)
      }
    }, 500)
  }

  return (
    <Card 
      title="🔧 Admin Socket.IO Debugger" 
      style={{ margin: '20px' }}
      extra={
        <Space>
          <Button onClick={handleReconnect} icon={<SyncOutlined />}>
            Reconnect
          </Button>
          <Button onClick={handleClearEvents}>Clear</Button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Connection Status */}
        <Alert
          message={
            <Space>
              <Text strong>Connection Status:</Text>
              {connected ? (
                <Tag icon={<CheckCircleOutlined />} color="success">
                  Connected
                </Tag>
              ) : (
                <Tag icon={<CloseCircleOutlined />} color="error">
                  Disconnected
                </Tag>
              )}
              {socketId && <Text type="secondary">Socket ID: {socketId}</Text>}
            </Space>
          }
          type={connected ? 'success' : 'error'}
        />

        {/* Environment Info */}
        <Card size="small" title="Environment">
          <Text>Socket URL: {import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'}</Text>
          <br />
          <Text>Admin Token: {localStorage.getItem('admin_token') ? '✓ Present' : '✗ Missing'}</Text>
        </Card>

        {/* Events Log */}
        <Card 
          size="small" 
          title={`Events Log (${events.length})`}
          style={{ maxHeight: '400px', overflow: 'auto' }}
        >
          {events.length === 0 ? (
            <Text type="secondary">No events received yet.</Text>
          ) : (
            events.map((event, index) => (
              <Card 
                key={index} 
                size="small" 
                style={{ marginBottom: 8 }}
                type="inner"
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Tag color="blue">{event.name}</Tag>
                    <Text type="secondary">{event.timestamp}</Text>
                  </Space>
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: '8px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    maxHeight: '200px',
                    overflow: 'auto'
                  }}>
                    {event.data}
                  </pre>
                </Space>
              </Card>
            ))
          )}
        </Card>
      </Space>
    </Card>
  )
}

export default SocketDebugger
