import { Table, Button } from 'antd'

const RestaurantsPage = () => {
  const columns = [
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
    { title: 'Điện thoại', dataIndex: 'phone', key: 'phone' },
    { title: 'Hành động', key: 'action', render: () => <Button size="small">Chi tiết</Button> },
  ]

  return (
    <div>
      <h1>Quản lý nhà hàng</h1>
      <Table columns={columns} dataSource={[]} />
    </div>
  )
}

export default RestaurantsPage
