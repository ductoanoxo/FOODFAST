import { useState, useEffect } from 'react'
import {
    Card,
    Table,
    Tag,
    Button,
    Input,
    Select,
    Space,
    Modal,
    Form,
    message,
    Statistic,
    Row,
    Col,
    Timeline,
    Descriptions,
    Typography,
    Alert,
    Tooltip,
} from 'antd'
import {
    DollarOutlined,
    SearchOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined,
    EyeOutlined,
    CheckOutlined,
} from '@ant-design/icons'
import {
    getRefundStats,
    getRefundRequests,
    processManualRefund,
    getRefundLogs,
} from '../../api/refundAPI'
import './RefundsPage.css'

const { Text, Title } = Typography
const { TextArea } = Input

const RefundsPage = () => {
    const [loading, setLoading] = useState(false)
    const [refunds, setRefunds] = useState([])
    const [stats, setStats] = useState({})
    const [filters, setFilters] = useState({
        status: 'all',
        paymentStatus: 'all',
        search: '',
    })
    const [selectedRefund, setSelectedRefund] = useState(null)
    const [detailModalVisible, setDetailModalVisible] = useState(false)
    const [processModalVisible, setProcessModalVisible] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [logs, setLogs] = useState([])
    const [form] = Form.useForm()

    useEffect(() => {
        fetchStats()
        fetchRefunds()
    }, [])

    useEffect(() => {
        fetchRefunds()
    }, [filters])

    const fetchStats = async () => {
        try {
            const response = await getRefundStats()
            setStats(response.data)
        } catch (error) {
            console.error('Error fetching refund stats:', error)
        }
    }

    const fetchRefunds = async () => {
        try {
            setLoading(true)
            const response = await getRefundRequests(filters)
            setRefunds(response.data || [])
        } catch (error) {
            console.error('Error fetching refunds:', error)
            message.error('Không thể tải danh sách hoàn tiền')
        } finally {
            setLoading(false)
        }
    }

    const fetchLogs = async (orderId) => {
        try {
            const response = await getRefundLogs(orderId)
            setLogs(response.data || [])
        } catch (error) {
            console.error('Error fetching logs:', error)
        }
    }

    const handleViewDetails = async (record) => {
        setSelectedRefund(record)
        setDetailModalVisible(true)
        await fetchLogs(record._id)
    }

    const handleProcessRefund = (record) => {
        setSelectedRefund(record)
        form.resetFields()
        setProcessModalVisible(true)
    }

    const handleSubmitProcess = async (values) => {
        try {
            setProcessing(true)
            await processManualRefund(selectedRefund._id, values)
            message.success('Đã xác nhận hoàn tiền thành công!')
            setProcessModalVisible(false)
            fetchRefunds()
            fetchStats()
        } catch (error) {
            console.error('Error processing refund:', error)
            message.error(error.response?.data?.message || 'Không thể xử lý hoàn tiền')
        } finally {
            setProcessing(false)
        }
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price)
    }

    const getPaymentStatusTag = (status) => {
        const statusConfig = {
            refunded: { color: 'success', icon: <CheckCircleOutlined />, text: 'Đã hoàn tiền' },
            refund_pending: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Đang chờ' },
            refund_failed: { color: 'error', icon: <ExclamationCircleOutlined />, text: 'Thất bại' },
            paid: { color: 'blue', text: 'Đã thanh toán' },
        }
        const config = statusConfig[status] || { color: 'default', text: status }
        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        )
    }

    const getRefundStatusTag = (refundInfo) => {
        if (!refundInfo || !refundInfo.status) return <Tag>N/A</Tag>

        const statusConfig = {
            success: { color: 'success', icon: <CheckCircleOutlined />, text: 'Thành công' },
            pending: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Đang xử lý' },
            not_applicable: { color: 'default', text: 'Không áp dụng' },
        }
        const config = statusConfig[refundInfo.status] || { color: 'default', text: refundInfo.status }
        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        )
    }

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
            width: 150,
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                <div>
                    <div>{user?.name || 'N/A'}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {user?.phone || user?.email || ''}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Số tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount) => <Text strong>{formatPrice(amount)}</Text>,
        },
        {
            title: 'Phương thức thanh toán',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method) => <Tag>{method}</Tag>,
        },
        {
            title: 'Trạng thái thanh toán',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: (status) => getPaymentStatusTag(status),
        },
        {
            title: 'Trạng thái hoàn tiền',
            dataIndex: 'refundInfo',
            key: 'refundStatus',
            render: (refundInfo) => getRefundStatusTag(refundInfo),
        },
        {
            title: 'Ngày hủy',
            dataIndex: 'cancelledAt',
            key: 'cancelledAt',
            render: (date) => (date ? new Date(date).toLocaleString('vi-VN') : 'N/A'),
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(record)}
                        />
                    </Tooltip>
                    {record.paymentStatus !== 'refunded' && (
                        <Tooltip title="Xác nhận đã hoàn tiền">
                            <Button
                                type="primary"
                                size="small"
                                icon={<CheckOutlined />}
                                onClick={() => handleProcessRefund(record)}
                            >
                                Xác nhận
                            </Button>
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ]

    return (
        <div className="refunds-page">
            <div className="page-header">
                <Title level={2}>
                    <DollarOutlined /> Quản Lý Hoàn Tiền
                </Title>
            </div>

            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng yêu cầu"
                            value={stats.total || 0}
                            prefix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đang chờ xử lý"
                            value={stats.pending || 0}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đã hoàn tiền"
                            value={stats.completed || 0}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng tiền đã hoàn"
                            value={stats.totalRefundAmount || 0}
                            valueStyle={{ color: '#1890ff' }}
                            formatter={(value) => formatPrice(value)}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 16 }}>
                <Space wrap>
                    <Input
                        placeholder="Tìm mã đơn hàng"
                        prefix={<SearchOutlined />}
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        style={{ width: 200 }}
                        allowClear
                    />
                    <Select
                        value={filters.paymentStatus}
                        onChange={(value) => setFilters({ ...filters, paymentStatus: value })}
                        style={{ width: 180 }}
                    >
                        <Select.Option value="all">Tất cả trạng thái</Select.Option>
                        <Select.Option value="refund_pending">Đang chờ</Select.Option>
                        <Select.Option value="refund_failed">Thất bại</Select.Option>
                        <Select.Option value="refunded">Đã hoàn</Select.Option>
                        <Select.Option value="paid">Đã thanh toán</Select.Option>
                    </Select>
                    <Button icon={<ReloadOutlined />} onClick={fetchRefunds}>
                        Làm mới
                    </Button>
                </Space>
            </Card>

            {/* Refunds Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={refunds}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} yêu cầu`,
                    }}
                />
            </Card>

            {/* Detail Modal */}
            <Modal
                title={`Chi tiết hoàn tiền - ${selectedRefund?.orderNumber || ''}`}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>,
                    selectedRefund?.paymentStatus !== 'refunded' && (
                        <Button
                            key="process"
                            type="primary"
                            onClick={() => {
                                setDetailModalVisible(false)
                                handleProcessRefund(selectedRefund)
                            }}
                        >
                            Xác nhận đã hoàn tiền
                        </Button>
                    ),
                ]}
                width={800}
            >
                {selectedRefund && (
                    <div>
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Mã đơn hàng" span={2}>
                                <Text strong>{selectedRefund.orderNumber}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Khách hàng">
                                {selectedRefund.user?.name || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="SĐT">
                                {selectedRefund.user?.phone || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email" span={2}>
                                {selectedRefund.user?.email || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số tiền">
                                {formatPrice(selectedRefund.totalAmount)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phương thức TT">
                                {selectedRefund.paymentMethod}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái TT">
                                {getPaymentStatusTag(selectedRefund.paymentStatus)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái hoàn tiền">
                                {getRefundStatusTag(selectedRefund.refundInfo)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày hủy" span={2}>
                                {selectedRefund.cancelledAt
                                    ? new Date(selectedRefund.cancelledAt).toLocaleString('vi-VN')
                                    : 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Lý do hủy" span={2}>
                                {selectedRefund.cancelReason || 'N/A'}
                            </Descriptions.Item>
                        </Descriptions>

                        {selectedRefund.refundInfo && (
                            <>
                                <Title level={5} style={{ marginTop: 16 }}>
                                    Thông tin hoàn tiền
                                </Title>
                                <Alert
                                    message={selectedRefund.refundInfo.message || 'N/A'}
                                    type={
                                        selectedRefund.refundInfo.status === 'success'
                                            ? 'success'
                                            : 'info'
                                    }
                                    showIcon
                                />
                                <Descriptions
                                    bordered
                                    column={2}
                                    size="small"
                                    style={{ marginTop: 8 }}
                                >
                                    <Descriptions.Item label="Phương thức hoàn">
                                        {selectedRefund.refundInfo.method || 'N/A'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Mã giao dịch">
                                        {selectedRefund.refundInfo.transactionId || 'N/A'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày yêu cầu">
                                        {selectedRefund.refundInfo.requestedAt
                                            ? new Date(
                                                  selectedRefund.refundInfo.requestedAt
                                              ).toLocaleString('vi-VN')
                                            : 'N/A'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày xử lý">
                                        {selectedRefund.refundInfo.processedAt
                                            ? new Date(
                                                  selectedRefund.refundInfo.processedAt
                                              ).toLocaleString('vi-VN')
                                            : 'N/A'}
                                    </Descriptions.Item>
                                </Descriptions>
                            </>
                        )}

                        {logs.length > 0 && (
                            <>
                                <Title level={5} style={{ marginTop: 16 }}>
                                    Lịch sử hoạt động
                                </Title>
                                <Timeline>
                                    {logs.map((log) => (
                                        <Timeline.Item key={log._id}>
                                            <Text strong>{log.action}</Text>
                                            <br />
                                            <Text type="secondary">{log.reason}</Text>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {new Date(log.createdAt).toLocaleString('vi-VN')} -{' '}
                                                {log.user?.name || log.user?.email || 'System'}
                                            </Text>
                                        </Timeline.Item>
                                    ))}
                                </Timeline>
                            </>
                        )}
                    </div>
                )}
            </Modal>

            {/* Process Refund Modal */}
            <Modal
                title="Xác nhận đã hoàn tiền thủ công"
                open={processModalVisible}
                onCancel={() => setProcessModalVisible(false)}
                onOk={() => form.submit()}
                confirmLoading={processing}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                {selectedRefund && (
                    <>
                        <Alert
                            message="Xác nhận hoàn tiền"
                            description={`Bạn xác nhận đã hoàn ${formatPrice(
                                selectedRefund.totalAmount
                            )} cho khách hàng ${selectedRefund.user?.name || 'N/A'}?`}
                            type="warning"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                        <Form form={form} layout="vertical" onFinish={handleSubmitProcess}>
                            <Form.Item
                                name="method"
                                label="Phương thức hoàn tiền"
                                rules={[{ required: true, message: 'Vui lòng chọn phương thức' }]}
                            >
                                <Select placeholder="Chọn phương thức">
                                    <Select.Option value="manual">Chuyển khoản ngân hàng</Select.Option>
                                    <Select.Option value="vnpay">VNPay</Select.Option>
                                    <Select.Option value="momo">MoMo</Select.Option>
                                    <Select.Option value="cash">Tiền mặt</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item name="transactionId" label="Mã giao dịch (tùy chọn)">
                                <Input placeholder="VD: TXN123456789" />
                            </Form.Item>
                            <Form.Item
                                name="notes"
                                label="Ghi chú"
                                rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}
                            >
                                <TextArea
                                    rows={3}
                                    placeholder="VD: Đã chuyển khoản vào tài khoản ACB số xxx"
                                />
                            </Form.Item>
                        </Form>
                    </>
                )}
            </Modal>
        </div>
    )
}

export default RefundsPage
