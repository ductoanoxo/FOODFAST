import { Table, Tag } from 'antd'

const OrdersPage = () => {
  const columns = [
    { title: 'Mã đơn', dataIndex: 'orderNumber', key: 'orderNumber' },
    { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
    { title: 'Tổng tiền', dataIndex: 'total', key: 'total' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => <Tag color="green">{status}</Tag> },
  ]

  return (
    <div>
      <h1>Quản lý đơn hàng</h1>
      <Table columns={columns} dataSource={[]} />
    </div>
  )
}

export default OrdersPage
