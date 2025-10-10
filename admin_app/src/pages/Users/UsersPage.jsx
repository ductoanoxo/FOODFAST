import { Table, Button, Tag } from 'antd'

const UsersPage = () => {
  const columns = [
    { title: 'ID', dataIndex: '_id', key: '_id' },
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role', render: (role) => <Tag>{role}</Tag> },
    { title: 'Hành động', key: 'action', render: () => <Button size="small">Chi tiết</Button> },
  ]

  return (
    <div>
      <h1>Quản lý người dùng</h1>
      <Table columns={columns} dataSource={[]} />
    </div>
  )
}

export default UsersPage
