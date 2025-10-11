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
} from 'antd'
import { EyeOutlined, EditOutlined } from '@ant-design/icons'
import axios from 'axios'
import './RestaurantsPage.css'

const RestaurantsPage = () => {
    const [restaurants, setRestaurants] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedRestaurant, setSelectedRestaurant] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)

    useEffect(() => {
        fetchRestaurants()
    }, [])

    const fetchRestaurants = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }

            const { data } = await axios.get('http://localhost:5000/api/restaurants', config)
            setRestaurants(data.data)
        } catch (error) {
            message.error('Không thể tải danh sách nhà hàng')
        } finally {
            setLoading(false)
        }
    }

    const handleToggleStatus = async (id, isOpen) => {
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

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'image',
            key: 'image',
            render: (image) => (
                <img
                    src={image || 'https://via.placeholder.com/60'}
                    alt="Restaurant"
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
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

            {/* Details Modal */}
            <Modal
                title="Chi tiết nhà hàng"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={700}
            >
                {selectedRestaurant && (
                    <div>
                        <img
                            src={selectedRestaurant.image}
                            alt={selectedRestaurant.name}
                            style={{ width: '100%', borderRadius: 8, marginBottom: 16 }}
                        />
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Tên nhà hàng" span={2}>
                                {selectedRestaurant.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mô tả" span={2}>
                                {selectedRestaurant.description}
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
                            <Descriptions.Item label="Giờ mở cửa">
                                {selectedRestaurant.openingHours}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian giao hàng">
                                {selectedRestaurant.deliveryTime} phút
                            </Descriptions.Item>
                            <Descriptions.Item label="Đánh giá">
                                ⭐ {selectedRestaurant.rating?.toFixed(1)} ({selectedRestaurant.reviewCount} đánh giá)
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={selectedRestaurant.isOpen ? 'green' : 'red'}>
                                    {selectedRestaurant.isOpen ? 'Mở cửa' : 'Đóng cửa'}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default RestaurantsPage
