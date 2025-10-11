import { useEffect, useState } from 'react'
import {
    Card,
    Form,
    Input,
    Button,
    Switch,
    message,
    Row,
    Col,
} from 'antd'
import axios from 'axios'
import './ProfilePage.css'

const ProfilePage = () => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [restaurant, setRestaurant] = useState(null)

    useEffect(() => {
        fetchRestaurantProfile()
    }, [])

    const fetchRestaurantProfile = async () => {
        try {
            const token = localStorage.getItem('restaurant_token')

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }

            const { data } = await axios.get('http://localhost:5000/api/auth/profile', config)

            if (data.data.restaurant) {
                const restaurantData = data.data.restaurant
                setRestaurant(restaurantData)
                form.setFieldsValue({
                    name: restaurantData.name,
                    description: restaurantData.description,
                    address: restaurantData.address,
                    phone: restaurantData.phone,
                    email: restaurantData.email,
                    openingHours: restaurantData.openingHours,
                    isOpen: restaurantData.isOpen,
                })
            }
        } catch (error) {
            message.error('Không thể tải thông tin nhà hàng')
        }
    }

    const handleUpdate = async (values) => {
        try {
            setLoading(true)
            const token = localStorage.getItem('restaurant_token')

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }

            await axios.put(
                `http://localhost:5000/api/restaurants/${restaurant._id}`,
                values,
                config
            )

            message.success('Cập nhật thông tin thành công')
            fetchRestaurantProfile()
        } catch (error) {
            message.error('Không thể cập nhật thông tin')
        } finally {
            setLoading(false)
        }
    }

    const handleToggleStatus = async () => {
        try {
            const token = localStorage.getItem('restaurant_token')

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }

            await axios.patch(
                `http://localhost:5000/api/restaurants/${restaurant._id}/toggle-status`,
                {},
                config
            )

            message.success('Cập nhật trạng thái thành công')
            fetchRestaurantProfile()
        } catch (error) {
            message.error('Không thể cập nhật trạng thái')
        }
    }

    return (
        <div className="profile-page">
            <h1>Thông tin nhà hàng</h1>

            <Row gutter={24}>
                <Col xs={24} lg={16}>
                    <Card title="Thông tin chung">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleUpdate}
                        >
                            <Form.Item
                                label="Tên nhà hàng"
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập tên nhà hàng',
                                    },
                                ]}
                            >
                                <Input placeholder="Nhập tên nhà hàng" />
                            </Form.Item>

                            <Form.Item
                                label="Mô tả"
                                name="description"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập mô tả',
                                    },
                                ]}
                            >
                                <Input.TextArea
                                    rows={4}
                                    placeholder="Nhập mô tả nhà hàng"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Địa chỉ"
                                name="address"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập địa chỉ',
                                    },
                                ]}
                            >
                                <Input placeholder="Nhập địa chỉ" />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Số điện thoại"
                                        name="phone"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Vui lòng nhập số điện thoại',
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Nhập số điện thoại" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        rules={[
                                            {
                                                required: true,
                                                type: 'email',
                                                message: 'Vui lòng nhập email hợp lệ',
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Nhập email" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                label="Giờ mở cửa"
                                name="openingHours"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập giờ mở cửa',
                                    },
                                ]}
                            >
                                <Input placeholder="VD: 8:00 - 22:00" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Cập nhật thông tin
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Trạng thái hoạt động">
                        <div className="status-section">
                            <div className="status-toggle">
                                <span>Trạng thái nhà hàng:</span>
                                <Switch
                                    checked={restaurant?.isOpen}
                                    onChange={handleToggleStatus}
                                    checkedChildren="Mở cửa"
                                    unCheckedChildren="Đóng cửa"
                                />
                            </div>
                        </div>
                    </Card>

                    {restaurant && (
                        <Card title="Thống kê" style={{ marginTop: 16 }}>
                            <div className="stats-item">
                                <span>Đánh giá:</span>
                                <strong>⭐ {restaurant.rating?.toFixed(1)}</strong>
                            </div>
                            <div className="stats-item">
                                <span>Số lượt đánh giá:</span>
                                <strong>{restaurant.reviewCount}</strong>
                            </div>
                        </Card>
                    )}
                </Col>
            </Row>
        </div>
    )
}

export default ProfilePage
