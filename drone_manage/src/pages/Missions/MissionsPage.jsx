import { Table, Tag } from 'antd'

const MissionsPage = () => {
  const columns = [
    { title: 'Mã nhiệm vụ', dataIndex: 'missionId', key: 'missionId' },
    { title: 'Drone', dataIndex: 'droneCode', key: 'droneCode' },
    { title: 'Đơn hàng', dataIndex: 'orderNumber', key: 'orderNumber' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => <Tag color="blue">{status}</Tag> },
    { title: 'Thời gian', dataIndex: 'time', key: 'time' },
  ]

  return (
    <div>
      <h1>Danh sách nhiệm vụ</h1>
      <Table columns={columns} dataSource={[]} />
    </div>
  )
}

export default MissionsPage
