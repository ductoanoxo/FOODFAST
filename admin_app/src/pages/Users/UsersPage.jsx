import { 
  Table, 
  Button, 
  Tag, 
  message, 
  Card, 
  Modal, 
  Descriptions, 
  Row, 
  Col, 
  Statistic,
  Divider,
  Avatar,
} from 'antd'
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  CalendarOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { useEffect, useState } from 'react'
import axios from '../../api/axios'
import './UsersPage.css'

const UsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/users')
      setUsers(data.data || data)
    } catch (error) {
      console.error('Load users error:', error)
      message.error('Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role) => {
    const colors = {
      admin: 'red',
      customer: 'blue',
      restaurant: 'orange',
      drone_operator: 'green',
    }
    return colors[role] || 'default'
  }

  const getRoleText = (role) => {
    const texts = {
      admin: 'Quản trị viên',
      customer: 'Khách hàng',
      restaurant: 'Nhà hàng',
      drone_operator: 'Vận hành Drone',
    }
    return texts[role] || role
  }

  const showDetails = (user) => {
    setSelectedUser(user)
    setModalVisible(true)
  }

  const columns = [
    { 
      title: 'Tên', 
      dataIndex: 'name', 
      key: 'name',
      width: 200,
    },
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email',
      width: 250,
    },
    { 
      title: 'Số điện thoại', 
      dataIndex: 'phone', 
      key: 'phone',
      width: 150,
    },
    { 
      title: 'Vai trò', 
      dataIndex: 'role', 
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)}>{getRoleText(role)}</Tag>
      ),
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'isActive', 
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive !== false ? 'success' : 'error'}>
          {isActive !== false ? 'Hoạt động' : 'Ngừng hoạt động'}
        </Tag>
      ),
    },
    { 
      title: 'Ngày tạo', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />}
          size="small" 
          onClick={() => showDetails(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ]

  return (
    <div className="users-page">
      <h1>Quản lý người dùng</h1>
      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} người dùng`,
          }}
        />
      </Card>

      {/* User Details Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserOutlined />
            <span>Chi tiết người dùng</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedUser && (
          <div>
            {/* User Avatar and Basic Info */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar 
                size={100} 
                icon={<UserOutlined />}
                src={selectedUser.avatar}
                style={{ marginBottom: 16 }}
              />
              <h2 style={{ margin: 0 }}>{selectedUser.name}</h2>
              <Tag color={getRoleColor(selectedUser.role)} style={{ marginTop: 8 }}>
                {getRoleText(selectedUser.role)}
              </Tag>
            </div>

            {/* Statistics */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Trạng thái"
                    value={selectedUser.isActive !== false ? 'Hoạt động' : 'Ngừng'}
                    valueStyle={{ 
                      color: selectedUser.isActive !== false ? '#3f8600' : '#cf1322',
                      fontSize: 20,
                    }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Xác thực"
                    value={selectedUser.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                    valueStyle={{ 
                      color: selectedUser.isVerified ? '#3f8600' : '#d46b08',
                      fontSize: 20,
                    }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Thành viên từ"
                    value={new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}
                    valueStyle={{ fontSize: 18 }}
                    prefix={<CalendarOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Divider orientation="left">Thông tin liên hệ</Divider>

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label={<><MailOutlined /> Email</>}>
                {selectedUser.email}
              </Descriptions.Item>
              <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
                {selectedUser.phone || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {selectedUser.address || 'Chưa cập nhật'}
              </Descriptions.Item>
            </Descriptions>

            {/* Location if available */}
            {selectedUser.location?.coordinates && 
             selectedUser.location.coordinates[0] !== 0 && 
             selectedUser.location.coordinates[1] !== 0 && (
              <>
                <Divider orientation="left">Vị trí</Divider>
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="Kinh độ">
                    {selectedUser.location.coordinates[0]}
                  </Descriptions.Item>
                  <Descriptions.Item label="Vĩ độ">
                    {selectedUser.location.coordinates[1]}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            {/* Restaurant ID if role is restaurant */}
            {selectedUser.role === 'restaurant' && selectedUser.restaurantId && (
              <>
                <Divider orientation="left">Thông tin nhà hàng</Divider>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Restaurant ID">
                    {selectedUser.restaurantId}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            <Divider orientation="left">Thông tin hệ thống</Divider>

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="ID người dùng" span={2}>
                <code>{selectedUser._id}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                <Tag color={getRoleColor(selectedUser.role)}>
                  {getRoleText(selectedUser.role)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedUser.isActive !== false ? 'success' : 'error'}>
                  {selectedUser.isActive !== false ? 'Hoạt động' : 'Ngừng hoạt động'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {new Date(selectedUser.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối">
                {new Date(selectedUser.updatedAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default UsersPage
