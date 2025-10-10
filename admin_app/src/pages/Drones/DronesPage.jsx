import { Table, Tag, Button } from 'antd'

const DronesPage = () => {
  const columns = [
    { title: 'Mã Drone', dataIndex: 'droneCode', key: 'droneCode' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => <Tag color="blue">{status}</Tag> },
    { title: 'Pin', dataIndex: 'battery', key: 'battery', render: (battery) => `${battery}%` },
    { title: 'Hành động', key: 'action', render: () => <Button size="small">Theo dõi</Button> },
  ]

  return (
    <div>
      <h1>Quản lý Drone</h1>
      <Table columns={columns} dataSource={[]} />
    </div>
  )
}

export default DronesPage
