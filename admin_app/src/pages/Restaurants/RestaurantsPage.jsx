import { useEffect, useState } from 'react'
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Modal,
    Descriptions,
    message,
    Switch,
    Form,
    Input,
    Statistic,
    Row,
    Col,
    Divider,
} from 'antd'
import { 
    EyeOutlined, 
    PlusOutlined,
    StarOutlined,
    CommentOutlined,
    ClockCircleOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { getAllRestaurants, createRestaurantWithAccount } from '../../api/restaurantAPI'
import { checkEmailExists } from '../../api/authAPI'
import { geocodeAddress } from '../../api/mapAPI'
import axios from 'axios'
import './RestaurantsPage.css'

const RestaurantsPage = () => {
    const [restaurants, setRestaurants] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedRestaurant, setSelectedRestaurant] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [addModalVisible, setAddModalVisible] = useState(false)
    const [credentialsModalVisible, setCredentialsModalVisible] = useState(false)
    const [createdCredentials, setCreatedCredentials] = useState(null)
    const [form] = Form.useForm()
    const emailChecking = false;

    useEffect(() => {
        fetchRestaurants()
    }, [])

    const fetchRestaurants = async () => {
        try {
            setLoading(true)
            const data = await getAllRestaurants()
            setRestaurants(data.data)
        } catch (error) {
            message.error('Không thể tải danh sách nhà hàng')
        } finally {
            setLoading(false)
        }
    }

    const handleToggleStatus = async (id) => {
        try {
            const token = localStorage.getItem('token')

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }

            await axios.patch(
                `http://localhost:5000/api/restaurants/${id}/toggle-status`,
                {},
                config
            )

            message.success('Cập nhật trạng thái thành công')
            fetchRestaurants()
        } catch (error) {
            message.error('Không thể cập nhật trạng thái')
        }
    }

    const showDetails = async (restaurant) => {
        setSelectedRestaurant(restaurant)
        setModalVisible(true)
    }

    const validateEmail = async (_, value) => {
        if (!value) {
            return Promise.reject(new Error('Email không được để trống!'))
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
            return Promise.reject(new Error('Email không đúng định dạng!'))
        }

        try {
            const result = await checkEmailExists(value)
            if (result.exists) {
                return Promise.reject(new Error('Email đã được sử dụng!'))
            }
            return Promise.resolve()
        } catch (error) {
            console.error('Error checking email:', error)
            return Promise.resolve() // Continue if check fails
        }
    }

    const handleAddRestaurant = async (values) => {
        try {
            // 1. Hiển thị loading khi đang geocode
            const loadingKey = 'geocoding'
            message.loading({ content: 'Đang xác định vị trí nhà hàng...', key: loadingKey, duration: 0 })
            
            // 2. Geocode địa chỉ để lấy tọa độ
            const geocodeResult = await geocodeAddress(values.address)
            
            if (!geocodeResult) {
                message.destroy(loadingKey)
                message.error('Không thể xác định tọa độ từ địa chỉ. Vui lòng kiểm tra lại địa chỉ hoặc nhập chi tiết hơn (VD: thêm quận/huyện, tỉnh/thành phố)')
                return
            }
            
            message.destroy(loadingKey)
            message.success(`Đã xác định vị trí: ${geocodeResult.formatted_address}`)
            
            // 3. Tạo restaurant với tọa độ chính xác
            const restaurantData = {
                email: values.email,
                password: values.password,
                restaurantName: values.restaurantName,
                description: values.description,
                address: values.address, // Giữ địa chỉ gốc
                lat: geocodeResult.lat,  // ✅ Tọa độ chính xác
                lng: geocodeResult.lng,  // ✅ Tọa độ chính xác
                restaurantPhone: values.phone,
                restaurantEmail: values.restaurantEmail || values.email,
                openingHours: values.openingHours || '8:00 - 22:00',
                deliveryTime: values.deliveryTime || '20-30',
            }

            const response = await createRestaurantWithAccount(restaurantData)
            
            message.success('Tạo nhà hàng và tài khoản thành công!')
            
            // Show credentials modal
            setCreatedCredentials(response.data.credentials)
            setCredentialsModalVisible(true)
            
            setAddModalVisible(false)
            form.resetFields()
            fetchRestaurants()
        } catch (error) {
            message.destroy()
            const errorMsg = error.response?.data?.message || error.message
            
            // Hiển thị lỗi cụ thể
            if (errorMsg.includes('Email đã tồn tại')) {
                message.error('Email này đã được sử dụng. Vui lòng dùng email khác!')
            } else if (errorMsg.includes('tọa độ') || errorMsg.includes('location')) {
                message.error('Lỗi xác định vị trí. Vui lòng nhập lại địa chỉ chi tiết hơn.')
            } else {
                message.error('Lỗi: ' + errorMsg)
            }
        }
    }

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'image',
            key: 'image',
            render: (image) => (
                <img
                    src={image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect width="60" height="60" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="14" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'}
                    alt="Restaurant"
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                    onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect width="60" height="60" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="14" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'
                    }}
                />
            ),
        },
        {
            title: 'Tên nhà hàng',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating) => (
                <Tag color="gold">⭐ {rating?.toFixed(1)}</Tag>
            ),
            sorter: (a, b) => a.rating - b.rating,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isOpen',
            key: 'isOpen',
            render: (isOpen, record) => (
                <Switch
                    checked={isOpen}
                    onChange={() => handleToggleStatus(record._id, isOpen)}
                    checkedChildren="Mở cửa"
                    unCheckedChildren="Đóng cửa"
                />
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => showDetails(record)}
                    >
                        Chi tiết
                    </Button>
                </Space>
            ),
        },
    ]

    return (
        <div className="restaurants-page">
            <h1>Quản lý nhà hàng</h1>

            <Card>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setAddModalVisible(true)}
                    style={{ marginBottom: 16 }}
                >
                    Thêm nhà hàng mới
                </Button>
                <Table
                    columns={columns}
                    dataSource={restaurants}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng ${total} nhà hàng`,
                    }}
                />
            </Card>

            {/* Add Restaurant Modal */}
            <Modal
                title="Thêm nhà hàng mới"
                open={addModalVisible}
                onCancel={() => {
                    setAddModalVisible(false)
                    form.resetFields()
                }}
                onOk={() => form.submit()}
                okText="Tạo nhà hàng"
                cancelText="Hủy"
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddRestaurant}
                >
                    <h3>Thông tin tài khoản</h3>
                    <Form.Item
                        label="Email đăng nhập"
                        name="email"
                        validateFirst
                        hasFeedback
                        rules={[
                            { validator: validateEmail }
                        ]}
                    >
                        <Input 
                            placeholder="restaurant@example.com"
                            suffix={emailChecking ? <span style={{ color: '#1890ff' }}>Đang kiểm tra...</span> : null}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu' },
                            { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }
                        ]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu" />
                    </Form.Item>

                    <h3 style={{ marginTop: 24 }}>Thông tin nhà hàng</h3>
                    <Form.Item
                        label="Tên nhà hàng"
                        name="restaurantName"
                        rules={[{ required: true, message: 'Vui lòng nhập tên nhà hàng' }]}
                    >
                        <Input placeholder="Nhập tên nhà hàng" />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                    >
                        <Input.TextArea 
                            rows={3} 
                            placeholder="Mô tả về nhà hàng..."
                        />
                    </Form.Item>

                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                    >
                        <Input placeholder="0123456789" />
                    </Form.Item>

                    <Form.Item
                        label="Email nhà hàng (tùy chọn)"
                        name="restaurantEmail"
                        rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
                    >
                        <Input placeholder="Nếu khác với email đăng nhập" />
                    </Form.Item>

                    <Form.Item
                        label="Địa chỉ"
                        name="address"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                        extra="Địa chỉ càng chi tiết càng tốt (bao gồm số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                    >
                        <Input.TextArea 
                            rows={2}
                            placeholder="VD: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh" 
                        />
                    </Form.Item>

                    <Form.Item
                        label="Giờ mở cửa"
                        name="openingHours"
                        initialValue="8:00 - 22:00"
                    >
                        <Input placeholder="8:00 - 22:00" />
                    </Form.Item>

                    <Form.Item
                        label="Thời gian giao hàng (phút)"
                        name="deliveryTime"
                        initialValue="20-30"
                    >
                        <Input placeholder="20-30" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Credentials Modal */}
            <Modal
                title="🎉 Tạo tài khoản thành công!"
                open={credentialsModalVisible}
                onCancel={() => setCredentialsModalVisible(false)}
                footer={[
                    <Button 
                        key="copy" 
                        type="primary"
                        onClick={() => {
                            const text = `Email: ${createdCredentials?.email}\nMật khẩu: ${createdCredentials?.password}`
                            navigator.clipboard.writeText(text)
                            message.success('Đã copy thông tin đăng nhập!')
                        }}
                    >
                        Copy thông tin
                    </Button>,
                    <Button 
                        key="close" 
                        onClick={() => setCredentialsModalVisible(false)}
                    >
                        Đóng
                    </Button>
                ]}
            >
                {createdCredentials && (
                    <div>
                        <p style={{ fontSize: 16, marginBottom: 16 }}>
                            <strong>Gửi thông tin đăng nhập sau cho nhà hàng:</strong>
                        </p>
                        <Card style={{ background: '#f0f2f5' }}>
                            <p><strong>Email:</strong> {createdCredentials.email}</p>
                            <p><strong>Mật khẩu:</strong> {createdCredentials.password}</p>
                            <p><strong>Vai trò:</strong> {createdCredentials.role}</p>
                        </Card>
                        <p style={{ marginTop: 16, color: '#999' }}>
                            ⚠️ Lưu ý: Hãy lưu lại thông tin này và gửi cho nhà hàng. 
                            Mật khẩu sẽ không hiển thị lại lần sau!
                        </p>
                    </div>
                )}
            </Modal>

            {/* Details Modal - Enhanced */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>Chi tiết nhà hàng</span>
                        {selectedRestaurant?.isOpen && (
                            <Tag color="green">Đang mở cửa</Tag>
                        )}
                    </div>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={900}
            >
                {selectedRestaurant && (
                    <div>
                        {/* Image */}
                        {selectedRestaurant.image && (
                            <img
                                src={selectedRestaurant.image}
                                alt={selectedRestaurant.name}
                                style={{ 
                                    width: '100%', 
                                    height: 300,
                                    objectFit: 'cover',
                                    borderRadius: 8, 
                                    marginBottom: 20 
                                }}
                                onError={(e) => {
                                    e.target.src = 'https://placehold.co/800x300/e2e8f0/64748b?text=No+Image'
                                }}
                            />
                        )}

                        {/* Statistics Cards */}
                        <Row gutter={16} style={{ marginBottom: 20 }}>
                            <Col span={8}>
                                <Card>
                                    <Statistic
                                        title="Đánh giá trung bình"
                                        value={selectedRestaurant.rating || 0}
                                        precision={1}
                                        prefix={<StarOutlined style={{ color: '#faad14' }} />}
                                        suffix="/ 5.0"
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card>
                                    <Statistic
                                        title="Số đánh giá"
                                        value={selectedRestaurant.reviewCount || 0}
                                        prefix={<CommentOutlined style={{ color: '#1890ff' }} />}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card>
                                    <Statistic
                                        title="Thời gian giao hàng"
                                        value={selectedRestaurant.deliveryTime || 'N/A'}
                                        suffix="phút"
                                        prefix={<ClockCircleOutlined style={{ color: '#52c41a' }} />}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        <Divider orientation="left">Thông tin cơ bản</Divider>

                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Tên nhà hàng" span={2}>
                                <strong>{selectedRestaurant.name}</strong>
                            </Descriptions.Item>
                            <Descriptions.Item label="Mô tả" span={2}>
                                {selectedRestaurant.description || 'Chưa có mô tả'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ" span={2}>
                                {selectedRestaurant.address}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {selectedRestaurant.phone}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {selectedRestaurant.email}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giờ mở cửa" span={2}>
                                {selectedRestaurant.openingHours}
                            </Descriptions.Item>
                            <Descriptions.Item label="Danh mục" span={2}>
                                {selectedRestaurant.categories?.length > 0 ? (
                                    selectedRestaurant.categories.map((cat, idx) => (
                                        <Tag key={idx} color="blue">{cat}</Tag>
                                    ))
                                ) : (
                                    <span style={{ color: '#999' }}>Chưa có danh mục</span>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái hoạt động">
                                <Tag color={selectedRestaurant.isActive ? 'success' : 'error'}>
                                    {selectedRestaurant.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái mở cửa">
                                <Tag color={selectedRestaurant.isOpen ? 'green' : 'red'}>
                                    {selectedRestaurant.isOpen ? 'Mở cửa' : 'Đóng cửa'}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Owner Information */}
                        {selectedRestaurant.owner && (
                            <>
                                <Divider orientation="left">
                                    <UserOutlined /> Thông tin chủ sở hữu
                                </Divider>
                                <Descriptions bordered column={2} size="small">
                                    <Descriptions.Item label="Tên chủ sở hữu">
                                        {selectedRestaurant.owner.name || 'N/A'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Email">
                                        {selectedRestaurant.owner.email || 'N/A'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số điện thoại">
                                        {selectedRestaurant.owner.phone || 'N/A'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Vai trò">
                                        <Tag color="orange">{selectedRestaurant.owner.role || 'restaurant'}</Tag>
                                    </Descriptions.Item>
                                </Descriptions>
                            </>
                        )}

                        {/* Location */}
                        {selectedRestaurant.location?.coordinates && (
                            <>
                                <Divider orientation="left">Vị trí</Divider>
                                <Descriptions bordered column={2} size="small">
                                    <Descriptions.Item label="Kinh độ">
                                        {selectedRestaurant.location.coordinates[0]}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Vĩ độ">
                                        {selectedRestaurant.location.coordinates[1]}
                                    </Descriptions.Item>
                                </Descriptions>
                            </>
                        )}

                        {/* Timestamps */}
                        <Divider orientation="left">Thời gian</Divider>
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Ngày tạo">
                                {new Date(selectedRestaurant.createdAt).toLocaleString('vi-VN')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật lần cuối">
                                {new Date(selectedRestaurant.updatedAt).toLocaleString('vi-VN')}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default RestaurantsPage
