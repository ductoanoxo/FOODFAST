import { Table, Tag, Button, Progress } from 'antd'

const DronesPage = () => {
  const columns = [
    { title: 'Mã Drone', dataIndex: 'droneCode', key: 'droneCode' },
    { title: 'Model', dataIndex: 'model', key: 'model' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status', 
      render: (status) => {
        const color = status === 'available' ? 'green' : status === 'busy' ? 'orange' : 'red'
        return <Tag color={color}>{status}</Tag>
      }
    },
    { 
      title: 'Pin', 
      dataIndex: 'batteryLevel', 
      key: 'batteryLevel', 
      render: (battery) => <Progress percent={battery} size="small" />
    },
    { 
      title: 'Hành động', 
      key: 'action', 
      render: () => (
        <>
          <Button size="small" type="primary" style={{ marginRight: 8 }}>Theo dõi</Button>
          <Button size="small">Chi tiết</Button>
        </>
      )
    },
  ]

  const data = [
    { _id: '1', droneCode: 'DRONE-001', model: 'DJI Mavic', status: 'available', batteryLevel: 85 },
    { _id: '2', droneCode: 'DRONE-002', model: 'DJI Mini', status: 'busy', batteryLevel: 45 },
    { _id: '3', droneCode: 'DRONE-003', model: 'DJI Air', status: 'charging', batteryLevel: 20 },
  ]

  return (
    <div>
      <h1>Danh sách Drone</h1>
      <Table columns={columns} dataSource={data} rowKey="_id" />
    </div>
  )
}

export default DronesPage
