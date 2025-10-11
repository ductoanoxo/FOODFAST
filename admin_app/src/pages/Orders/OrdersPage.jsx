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
    Select,
} from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import axios from 'axios'
import './OrdersPage.css'

const { Option } = Select

const OrdersPage = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        fetchOrders()
    }, [statusFilter])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }

            let url = 'http://localhost:5000/api/orders'
            if (statusFilter !== 'all') {
                url += `?status=${statusFilter}`
            }

            const { data } = await axios.get(url, config)
            setOrders(data.data)
        } catch (error) {
            message.error('Không thể tải danh sách đơn hàng')
        } finally {
            setLoading(false)
        }
    }

    const showDetails = (order) => {
        setSelectedOrder(order)
        setModalVisible(true)
    }

    const getStatusColor = (status) => {
        const colors = {
            pending: 'orange',
            confirmed: 'blue',
            preparing: 'cyan',
            ready: 'purple',
            delivering: 'geekblue',
            delivered: 'green',
            cancelled: 'red',
        }
        return colors[status] || 'default'
    }

    const getStatusText = (status) => {
        const texts = {
            pending: 'Chờ xác nhận',
            confirmed: 'Đã xác nhận',
            preparing: 'Đang chuẩn bị',
            ready: 'Sẵn sàng',
            delivering: 'Đang giao',
            delivered: 'Đã giao',
            cancelled: 'Đã hủy',
        }
        return texts[status] || status
    }

    const columns = [
        {
            title: 'Mã đơn',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
        },
        {
            title: 'Khách hàng',
            dataIndex: ['user', 'name'],
            key: 'customer',
        },
        {
            title: 'Nhà hàng',
            dataIndex: ['restaurant', 'name'],
            key: 'restaurant',
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (price) => `${price?.toLocaleString()}đ`,
        },
        {
            title: 'Thanh toán',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method) => {
                const methodMap = {
                    cod: 'Tiền mặt',
                    vnpay: 'VNPay',
                    momo: 'Momo',
                }
                return methodMap[method] || method
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
            ),
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleString('vi-VN'),
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
        <div className="orders-page">
            <h1>Quản lý đơn hàng</h1>

            <Card>
                <div style={{ marginBottom: 16 }}>
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        style={{ width: 200 }}
                    >
                        <Option value="all">Tất cả</Option>
                        <Option value="pending">Chờ xác nhận</Option>
                        <Option value="confirmed">Đã xác nhận</Option>
                        <Option value="preparing">Đang chuẩn bị</Option>
                        <Option value="ready">Sẵn sàng</Option>
                        <Option value="delivering">Đang giao</Option>
                        <Option value="delivered">Đã giao</Option>
                        <Option value="cancelled">Đã hủy</Option>
                    </Select>
                </div>

                <Table
                    columns={columns}
                    dataSource={orders}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng ${total} đơn hàng`,
                    }}
                />
            </Card>

            {/* Details Modal */}
            <Modal
                title={`Chi tiết đơn hàng: ${selectedOrder?.orderNumber}`}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedOrder && (
                    <div>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Mã đơn" span={2}>
                                {selectedOrder.orderNumber}
                            </Descriptions.Item>
                            <Descriptions.Item label="Khách hàng">
                                {selectedOrder.user?.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {selectedOrder.user?.phone}
                            </Descriptions.Item>
                            <Descriptions.Item label="Nhà hàng" span={2}>
                                {selectedOrder.restaurant?.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                                {selectedOrder.deliveryAddress?.address}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú" span={2}>
                                {selectedOrder.note || 'Không có'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phương thức thanh toán">
                                {selectedOrder.paymentMethod === 'cod'
                                    ? 'Tiền mặt'
                                    : selectedOrder.paymentMethod === 'vnpay'
                                    ? 'VNPay'
                                    : 'Momo'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái thanh toán">
                                <Tag color={selectedOrder.isPaid ? 'green' : 'orange'}>
                                    {selectedOrder.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái đơn hàng">
                                <Tag color={getStatusColor(selectedOrder.status)}>
                                    {getStatusText(selectedOrder.status)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt">
                                {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: 24 }}>
                            <h3>Sản phẩm</h3>
                            <Table
                                dataSource={selectedOrder.items}
                                columns={[
                                    {
                                        title: 'Tên món',
                                        dataIndex: ['product', 'name'],
                                        key: 'name',
                                    },
                                    {
                                        title: 'Số lượng',
                                        dataIndex: 'quantity',
                                        key: 'quantity',
                                    },
                                    {
                                        title: 'Đơn giá',
                                        dataIndex: 'price',
                                        key: 'price',
                                        render: (price) => `${price?.toLocaleString()}đ`,
                                    },
                                    {
                                        title: 'Thành tiền',
                                        key: 'total',
                                        render: (_, record) =>
                                            `${(record.quantity * record.price).toLocaleString()}đ`,
                                    },
                                ]}
                                pagination={false}
                                rowKey={(record, index) => index}
                            />

                            <div style={{ marginTop: 16, textAlign: 'right' }}>
                                <Space direction="vertical">
                                    <div>
                                        <strong>Tổng tiền hàng:</strong>{' '}
                                        {selectedOrder.itemsPrice?.toLocaleString()}đ
                                    </div>
                                    <div>
                                        <strong>Phí giao hàng:</strong>{' '}
                                        {selectedOrder.deliveryFee?.toLocaleString()}đ
                                    </div>
                                    <div style={{ fontSize: 18, color: '#ff4d4f' }}>
                                        <strong>Tổng cộng:</strong>{' '}
                                        {selectedOrder.totalPrice?.toLocaleString()}đ
                                    </div>
                                </Space>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default OrdersPage
