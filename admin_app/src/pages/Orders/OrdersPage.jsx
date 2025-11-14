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
    Input,
    Form,
    Popconfirm,
    Typography,
    Skeleton,
    Empty,
    Alert,
} from 'antd'
import { EyeOutlined, CloseCircleOutlined, EnvironmentOutlined, DollarCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { getAllOrders, cancelOrder } from '../../api/orderAPI'
import socketService from '../../services/socketService'
import './OrdersPage.css'

const { Option } = Select
const { TextArea } = Input
const { Text } = Typography

const OrdersPage = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [statusFilter, setStatusFilter] = useState('all')
    const [cancelModalVisible, setCancelModalVisible] = useState(false)
    const [cancelReason, setCancelReason] = useState('')
    const [cancelingOrderId, setCancelingOrderId] = useState(null)
    const [canceling, setCanceling] = useState(false)

    useEffect(() => {
        fetchOrders()
        
        // Connect socket for real-time updates
        const token = localStorage.getItem('admin_token')
        if (!token) {
            console.warn('Admin - No token found, skipping socket connection')
            return
        }

        socketService.connect(token)
        
        // Setup listeners after connection
        const setupListeners = () => {
            if (!socketService.isConnected()) {
                console.log('⏳ Admin - Waiting for socket connection...')
                setTimeout(setupListeners, 500)
                return
            }

            console.log('✅ Admin - Setting up real-time listeners for orders')
            
            // Listen for order status updates
            const handleOrderStatusUpdate = (data) => {
                console.log('📡 Admin - Order status updated:', data)
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order._id === data.orderId || order._id === data._id
                            ? { ...order, status: data.status, paymentStatus: data.paymentStatus || order.paymentStatus }
                            : order
                    )
                )
            }
            
            // Listen for new orders
            const handleOrderCreated = (data) => {
                console.log('📡 Admin - New order created:', data)
                message.info('🆕 Đơn hàng mới!')
                fetchOrders()
            }
            
            // Listen for order cancellations
            const handleOrderCancelled = (data) => {
                console.log('📡 Admin - Order cancelled:', data)
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order._id === data.orderId
                            ? { ...order, status: 'cancelled', cancelReason: data.reason }
                            : order
                    )
                )
            }

            // Generic order update
            const handleOrderUpdate = (data) => {
                console.log('📡 Admin - Order updated:', data)
                fetchOrders()
            }
            
            // Use socketService.on() method directly
            const socket = socketService.getSocket()
            if (socket) {
                socket.on('order:status-updated', handleOrderStatusUpdate)
                socket.on('order:created', handleOrderCreated)
                socket.on('order:cancelled', handleOrderCancelled)
                socket.on('order:update', handleOrderUpdate)
                console.log('✅ Admin - Event listeners attached successfully')
            } else {
                console.error('❌ Admin - Socket instance not available')
            }
        }

        setupListeners()
        
        return () => {
            console.log('🧹 Admin - Cleaning up order listeners')
            socketService.off('order:status-updated')
            socketService.off('order:created')
            socketService.off('order:cancelled')
            socketService.off('order:update')
        }
    }, [statusFilter])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const filters = statusFilter !== 'all' ? { status: statusFilter } : {}
            const response = await getAllOrders(filters)
            setOrders(response.data || response)
            
            // Show success message only on first load or when filtering
            if (response.data?.length > 0 || response.length > 0) {
                console.log(`Loaded ${response.data?.length || response.length} orders successfully`)
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
            
            // Better error message handling
            const errorMsg = error?.response?.data?.message 
                || error?.message 
                || (error?.code === 'ECONNABORTED' ? 'Timeout - Server mất quá nhiều thời gian phản hồi' : '')
                || 'Không thể tải danh sách đơn hàng'
            
            message.error(errorMsg, 5) // Show error for 5 seconds
            setOrders([]) // Set empty array on error
        } finally {
            setLoading(false)
        }
    }

    const showDetails = (order) => {
        setSelectedOrder(order)
        setModalVisible(true)
    }

    const showCancelModal = (orderId) => {
        setCancelingOrderId(orderId)
        setCancelReason('')
        setCancelModalVisible(true)
    }

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            message.error('Vui lòng nhập lý do hủy đơn')
            return
        }

        try {
            setCanceling(true)
            await cancelOrder(cancelingOrderId, cancelReason)
            message.success('Đã hủy đơn hàng thành công')
            setCancelModalVisible(false)
            setCancelReason('')
            setCancelingOrderId(null)
            fetchOrders() // Refresh list
        } catch (error) {
            console.error('Error canceling order:', error)
            message.error(error.response?.data?.message || 'Không thể hủy đơn hàng')
        } finally {
            setCanceling(false)
        }
    }

    const canCancelOrder = (order) => {
        // Can only cancel orders that are not delivered or already cancelled
        return !['delivered', 'cancelled'].includes(order.status)
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

    const getPaymentStatusText = (paymentStatus, paymentMethod) => {
        // Handle payment status based on payment method for better UX
        if (paymentStatus === 'pending') {
            if (paymentMethod === 'COD') {
                return 'Thanh toán khi nhận hàng'
            } else if (paymentMethod === 'VNPAY' || paymentMethod === 'MOMO') {
                return 'Đang chờ thanh toán online'
            }
            return 'Chưa thanh toán'
        }
        
        const texts = {
            paid: 'Đã thanh toán',
            failed: 'Thanh toán thất bại',
            refund_pending: 'Chờ hoàn tiền thủ công',
            refunded: 'Đã hoàn tiền',
        }
        return texts[paymentStatus] || paymentStatus
    }

    const getPaymentStatusColor = (paymentStatus) => {
        const colors = {
            pending: 'orange',
            paid: 'green',
            failed: 'red',
            refund_pending: 'gold',
            refunded: 'cyan',
        }
        return colors[paymentStatus] || 'default'
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
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (price) => `${price?.toLocaleString()}đ`,
        },
        {
            title: 'Phương thức',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method) => {
                const methodKey = (method || '').toString().toLowerCase()
                const methodMap = {
                    cod: 'Tiền mặt',
                    vnpay: 'VNPay',
                    momo: 'Momo',
                    card: 'Thẻ',
                }
                return methodMap[methodKey] || method
            },
        },
        {
            title: 'TT Thanh toán',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: (paymentStatus, record) => (
                <Tag color={getPaymentStatusColor(paymentStatus)}>
                    {getPaymentStatusText(paymentStatus, record.paymentMethod)}
                </Tag>
            ),
        },
        {
            title: 'TT Đơn hàng',
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
                    {canCancelOrder(record) && (
                        <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={() => showCancelModal(record._id)}
                        >
                            Hủy đơn
                        </Button>
                    )}
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

                {loading ? (
                    <Skeleton active paragraph={{ rows: 10 }} />
                ) : (
                <Table
                    columns={columns}
                    dataSource={orders}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng ${total} đơn hàng`,
                    }}
                    locale={{
                        emptyText: (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={<span>Không có đơn hàng nào.</span>}
                            >
                                <Button type="primary" onClick={fetchOrders}>Làm mới</Button>
                            </Empty>
                        ),
                    }}
                />
                )}
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
                                {selectedOrder.deliveryInfo?.address}
                            </Descriptions.Item>
                            <Descriptions.Item label="Khoảng cách giao hàng">
                                <EnvironmentOutlined style={{ marginRight: 8 }} />
                                <Text strong>{selectedOrder.distanceKm ? `${selectedOrder.distanceKm} km` : 'N/A'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Phí giao hàng">
                                <DollarCircleOutlined style={{ marginRight: 8 }} />
                                <Text strong>{selectedOrder.deliveryFee?.toLocaleString()}đ</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú" span={2}>
                                {selectedOrder.note || 'Không có'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phương thức thanh toán">
                                {(() => {
                                    const pm = (selectedOrder.paymentMethod || '').toString().toLowerCase()
                                    if (pm === 'cod') return 'Tiền mặt'
                                    if (pm === 'vnpay') return 'VNPay'
                                    if (pm === 'momo') return 'Momo'
                                    if (pm === 'card') return 'Thẻ'
                                    return selectedOrder.paymentMethod || '-'
                                })()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái thanh toán">
                                <Tag color={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                                    {getPaymentStatusText(selectedOrder.paymentStatus, selectedOrder.paymentMethod)}
                                </Tag>
                            </Descriptions.Item>
                            
                            {/* Hiển thị lỗi thanh toán chi tiết nếu có */}
                            {selectedOrder.paymentStatus === 'failed' && selectedOrder.paymentInfo?.errorMessage && (
                                <Descriptions.Item label="Lỗi thanh toán" span={2}>
                                    <Alert
                                        message="Chi tiết lỗi thanh toán"
                                        description={
                                            <div>
                                                <p style={{ marginBottom: 4 }}>
                                                    <strong>Mã lỗi:</strong> {selectedOrder.paymentInfo.errorCode}
                                                </p>
                                                <p style={{ marginBottom: 0 }}>
                                                    <strong>Mô tả:</strong> {selectedOrder.paymentInfo.errorMessage}
                                                </p>
                                                {selectedOrder.paymentInfo.failedAt && (
                                                    <p style={{ marginTop: 8, marginBottom: 0, fontSize: '12px', color: '#999' }}>
                                                        Thời gian thất bại: {new Date(selectedOrder.paymentInfo.failedAt).toLocaleString('vi-VN')}
                                                    </p>
                                                )}
                                            </div>
                                        }
                                        type="error"
                                        showIcon
                                        icon={<WarningOutlined />}
                                        style={{ marginTop: 8 }}
                                    />
                                </Descriptions.Item>
                            )}
                            
                            <Descriptions.Item label="Trạng thái đơn hàng">
                                <Tag color={getStatusColor(selectedOrder.status)}>
                                    {getStatusText(selectedOrder.status)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt">
                                {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                            </Descriptions.Item>
                            {selectedOrder.status === 'cancelled' && selectedOrder.cancelReason && (
                                <Descriptions.Item label="Lý do hủy" span={2}>
                                    <span style={{ color: '#ff4d4f' }}>{selectedOrder.cancelReason}</span>
                                </Descriptions.Item>
                            )}
                            {selectedOrder.status === 'cancelled' && selectedOrder.cancelledAt && (
                                <Descriptions.Item label="Thời gian hủy" span={2}>
                                    {new Date(selectedOrder.cancelledAt).toLocaleString('vi-VN')}
                                </Descriptions.Item>
                            )}
                            
                            {/* Hiển thị thông tin hoàn tiền nếu có */}
                            {selectedOrder.refundInfo && (
                                <>
                                    <Descriptions.Item label="Thông tin hoàn tiền" span={2}>
                                        <Alert
                                            message={selectedOrder.refundInfo.message || 'Đang xử lý hoàn tiền'}
                                            description={
                                                <div>
                                                    {selectedOrder.refundInfo.adminNote && (
                                                        <p style={{ marginBottom: 8, color: '#ff4d4f' }}>
                                                            <strong>Lưu ý cho Admin:</strong> {selectedOrder.refundInfo.adminNote}
                                                        </p>
                                                    )}
                                                    <p style={{ marginBottom: 4 }}>
                                                        <strong>Số tiền:</strong> {selectedOrder.refundInfo.amount?.toLocaleString()}đ
                                                    </p>
                                                    <p style={{ marginBottom: 4 }}>
                                                        <strong>Phương thức:</strong> {selectedOrder.refundInfo.method === 'manual' ? 'Thủ công' : 'VNPay tự động'}
                                                    </p>
                                                    {selectedOrder.refundInfo.requestedAt && (
                                                        <p style={{ marginBottom: 4 }}>
                                                            <strong>Yêu cầu lúc:</strong> {new Date(selectedOrder.refundInfo.requestedAt).toLocaleString('vi-VN')}
                                                        </p>
                                                    )}
                                                    {selectedOrder.refundInfo.processedAt && (
                                                        <p style={{ marginBottom: 0 }}>
                                                            <strong>Xử lý lúc:</strong> {new Date(selectedOrder.refundInfo.processedAt).toLocaleString('vi-VN')}
                                                        </p>
                                                    )}
                                                </div>
                                            }
                                            type={selectedOrder.paymentStatus === 'refunded' ? 'success' : 'warning'}
                                            showIcon
                                            style={{ marginTop: 8 }}
                                        />
                                    </Descriptions.Item>
                                </>
                            )}
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
                                            `${((record.quantity || 0) * (record.price || 0)).toLocaleString()}đ`,
                                    },
                                ]}
                                pagination={false}
                                rowKey={(record, index) => String(index)}
                            />

                            <div style={{ marginTop: 16, textAlign: 'right' }}>
                                <Space direction="vertical">
                                    <div>
                                        <strong>Tổng tiền hàng:</strong>{' '}
                                        {selectedOrder.subtotal?.toLocaleString()}đ
                                    </div>
                                    <div>
                                        <strong>Phí giao hàng:</strong>{' '}
                                        {selectedOrder.deliveryFee?.toLocaleString()}đ
                                    </div>
                                    <div style={{ fontSize: 18, color: '#ff4d4f' }}>
                                        <strong>Tổng cộng:</strong>{' '}
                                        {selectedOrder.totalAmount?.toLocaleString()}đ
                                    </div>
                                </Space>
                            </div>
                        </div>

                        {/* Cancel Button in Detail Modal */}
                        {selectedOrder && canCancelOrder(selectedOrder) && (
                            <div style={{ marginTop: 24, textAlign: 'center' }}>
                                <Button
                                    danger
                                    size="large"
                                    icon={<CloseCircleOutlined />}
                                    onClick={() => {
                                        setModalVisible(false)
                                        showCancelModal(selectedOrder._id)
                                    }}
                                >
                                    Hủy đơn hàng này
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Cancel Order Modal */}
            <Modal
                title="Hủy đơn hàng"
                open={cancelModalVisible}
                onOk={handleCancelOrder}
                onCancel={() => {
                    setCancelModalVisible(false)
                    setCancelReason('')
                    setCancelingOrderId(null)
                }}
                okText="Xác nhận hủy"
                cancelText="Đóng"
                okButtonProps={{ danger: true, loading: canceling }}
                cancelButtonProps={{ disabled: canceling }}
            >
                <Form layout="vertical">
                    <Form.Item 
                        label="Lý do hủy đơn" 
                        required
                        help="Vui lòng nhập lý do hủy đơn hàng"
                    >
                        <TextArea
                            rows={4}
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Ví dụ: Hết nguyên liệu, Khách yêu cầu hủy, v.v..."
                            disabled={canceling}
                        />
                    </Form.Item>
                    <div style={{ color: '#ff4d4f', fontSize: '12px' }}>
                        <strong>Lưu ý:</strong> Sau khi hủy đơn:
                        <ul>
                            <li>Voucher (nếu có) sẽ được hoàn lại cho khách hàng</li>
                            
                            <li>Nếu đã thanh toán, hệ thống sẽ tự động hoàn tiền</li>
                        </ul>
                    </div>
                </Form>
            </Modal>
        </div>
    )
}

export default OrdersPage
