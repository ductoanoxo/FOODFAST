import { Table, Tag, Button } from 'antd'

const OrdersPage = () => {
  const columns = [
    { title: 'Mã đơn', dataIndex: 'orderNumber', key: 'orderNumber' },
    { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
    { title: 'Tổng tiền', dataIndex: 'total', key: 'total' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => <Tag color="blue">{status}</Tag> },
    { title: 'Hành động', key: 'action', render: () => <Button type="primary">Xem</Button> },
  ]

  const data = []

  return (
    <div>
      <h1>Quản lý đơn hàng</h1>
      <Table columns={columns} dataSource={data} />
    </div>
  )
}

export default OrdersPage
