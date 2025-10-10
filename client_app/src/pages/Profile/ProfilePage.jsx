import { useState, useEffect } from 'react'
import { Card, Descriptions, Button, Avatar, Upload, Form, Input, message } from 'antd'
import { UserOutlined, EditOutlined, CameraOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { authAPI } from '../../api/authAPI'
import { updateUser } from '../../redux/slices/authSlice'
import './ProfilePage.css'

const ProfilePage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [editing, setEditing] = useState(false)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      form.setFieldsValue(user)
    }
  }, [user, form])

  const handleUpdate = async (values) => {
    try {
      setLoading(true)
      const response = await authAPI.updateProfile(values)
      dispatch(updateUser(response.data))
      message.success('Cập nhật thông tin thành công!')
      setEditing(false)
    } catch (error) {
      message.error(error.message || 'Cập nhật thất bại!')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadAvatar = async (info) => {
    if (info.file.status === 'done') {
      message.success('Upload ảnh thành công!')
      // Update avatar URL
      dispatch(updateUser({ avatar: info.file.response.url }))
    } else if (info.file.status === 'error') {
      message.error('Upload ảnh thất bại!')
    }
  }

  return (
    <div className="profile-page">
      <div className="container">
        <Card>
          <div className="profile-header">
            <div className="avatar-section">
              <Avatar
                size={120}
                icon={<UserOutlined />}
                src={user?.avatar}
              />
              <Upload
                showUploadList={false}
                action="/api/upload"
                onChange={handleUploadAvatar}
              >
                <Button icon={<CameraOutlined />} className="upload-avatar-btn">
                  Đổi ảnh
                </Button>
              </Upload>
            </div>

            <div className="profile-info">
              <h2>{user?.name}</h2>
              <p>{user?.email}</p>
            </div>

            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Hủy' : 'Chỉnh sửa'}
            </Button>
          </div>

          {editing ? (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdate}
              style={{ marginTop: 32 }}
            >
              <Form.Item
                name="name"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input size="large" disabled />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
                ]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item name="address" label="Địa chỉ">
                <Input.TextArea rows={3} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
          ) : (
            <Descriptions bordered column={1} style={{ marginTop: 32 }}>
              <Descriptions.Item label="Họ và tên">{user?.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{user?.phone}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">{user?.address || 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Ngày tham gia">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Card>
      </div>
    </div>
  )
}

export default ProfilePage
