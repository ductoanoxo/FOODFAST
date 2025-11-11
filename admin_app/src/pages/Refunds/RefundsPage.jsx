import { useState, useEffect, useCallback } from 'react'
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
    CreditCardOutlined,
    MoneyCollectOutlined,
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
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    })
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

    const fetchStats = useCallback(async () => {
        try {
            const response = await getRefundStats()
            setStats(response.data)
        } catch (error) {
            console.error('Error fetching refund stats:', error)
        }
    }, [setStats]);

    const fetchRefunds = useCallback(async (page = pagination.current) => {
        try {
            setLoading(true)
            const response = await getRefundRequests({
                ...filters,
                page,
                limit: pagination.pageSize,
            })
            setRefunds(response.data || [])
            setPagination({
                ...pagination,
                current: response.page || page,
                total: response.total || 0,
            })
        } catch (error) {
            console.error('Error fetching refunds:', error)
            message.error('Không thể tải danh sách hoàn tiền')
        } finally {
            setLoading(false)
        }
    }, [setLoading, setRefunds, setPagination, filters, message]);

    useEffect(() => {
        // Fetch both stats and refunds in parallel
        Promise.all([fetchStats(), fetchRefunds(1)])
    }, [fetchStats, fetchRefunds])

    useEffect(() => {
        // Debounce search to avoid too many API calls
        const timer = setTimeout(() => {
            fetchRefunds(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [filters.search, filters.status, filters.paymentStatus, fetchRefunds])

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

    const getPaymentStatusTag = (status, paymentMethod) => {
        // Handle payment status based on payment method
        if (status === 'pending') {
            if (paymentMethod === 'COD') {
                return (
                    <Tag color="orange" icon={<ClockCircleOutlined />}>
                        Thanh toán khi nhận hàng
                    </Tag>
                )
            } else if (paymentMethod === 'VNPAY' || paymentMethod === 'MOMO') {
                return (
                    <Tag color="warning" icon={<ClockCircleOutlined />}>
                        Đang chờ thanh toán online
                    </Tag>
                )
            }
        }

        const statusConfig = {
            refunded: { color: 'success', icon: <CheckCircleOutlined />, text: 'Đã hoàn tiền' },
            refund_pending: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Đang chờ hoàn tiền' },
            paid: { color: 'blue', icon: <CheckCircleOutlined />, text: 'Đã thanh toán' },
            failed: { color: 'error', icon: <ExclamationCircleOutlined />, text: 'Thanh toán thất bại' },
            pending: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Chưa thanh toán' },
        }
        const config = statusConfig[status] || { color: 'default', text: status }
        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        )
    }

    const getRefundStatusTag = (record) => {
        const { refundInfo, paymentMethod } = record;

        if (paymentMethod === 'COD') {
            return <Tag color="default">Không áp dụng (COD)</Tag>;
        }

        if (!refundInfo || !refundInfo.status) {
            return <Tag color="warning" icon={<ClockCircleOutlined />}>Chờ xử lý</Tag>;
        }

        const statusConfig = {
            success: { color: 'success', icon: <CheckCircleOutlined />, text: 'Thành công' },
            pending: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Đang xử lý' },
            not_applicable: { color: 'default', text: 'Không áp dụng' },
        };
        const config = statusConfig[refundInfo.status] || { color: 'default', text: refundInfo.status };
        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        );
    }

    const getPaymentMethodTag = (method) => {
        let color;
        let icon;
        let text;

        switch (method) {
            case 'COD':
                color = 'green';
                icon = <MoneyCollectOutlined />;
                text = 'Tiền mặt';
                break;
            case 'VNPAY':
                color = 'blue';
                icon = <CreditCardOutlined />;
                text = 'VNPay';
                break;
            case 'MOMO':
                color = 'purple';
                icon = <CreditCardOutlined />;
                text = 'MoMo';
                break;
            default:
                color = 'default';
                icon = null;
                text = method;
        }
        return (
            <Tag color={color} icon={icon}>
                {text}
            </Tag>
        );
    };

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
                    <div>{user?.name || 'Không có tên'}</div>
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
            render: (method) => getPaymentMethodTag(method),
        },
        {
            title: 'Trạng thái thanh toán',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: (status, record) => getPaymentStatusTag(status, record.paymentMethod),
        },
        {
            title: 'Trạng thái hoàn tiền',
            dataIndex: 'refundInfo',
            key: 'refundStatus',
            render: (refundInfo, record) => getRefundStatusTag(record),
        },
        {
            title: 'Ngày hủy',
            dataIndex: 'cancelledAt',
            key: 'cancelledAt',
            render: (date) => (date ? new Date(date).toLocaleString('vi-VN') : 'Chưa hủy'),
        },
        {
            title: 'Hành động',
            key: 'actions',
            fixed: 'right',
            width: 180,
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(record)}
                    >
                        Chi tiết
                    </Button>
                    {record.paymentStatus !== 'refunded' && record.paymentMethod !== 'COD' && (
                        <Button
                            type="primary"
                            icon={<CheckOutlined />}
                            onClick={() => handleProcessRefund(record)}
                        >
                            Xác nhận
                        </Button>
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
                    <Card hoverable className="stat-card">
                        <Statistic
                            title="Tổng yêu cầu"
                            value={stats.total || 0}
                            prefix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable className="stat-card">
                        <Statistic
                            title="Đang chờ xử lý"
                            value={stats.pending || 0}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable className="stat-card">
                        <Statistic
                            title="Đã hoàn tiền"
                            value={stats.completed || 0}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable className="stat-card">
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
            <Card title="Bộ lọc và Tìm kiếm" style={{ marginBottom: 16 }} className="filter-card">
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
                        style={{ width: 200 }}
                        placeholder="Lọc theo trạng thái"
                    >
                        <Select.Option value="all">Tất cả trạng thái thanh toán</Select.Option>
                        <Select.Option value="paid">Đã thanh toán</Select.Option>
                        <Select.Option value="pending">Chưa thanh toán/Đang chờ</Select.Option>
                        <Select.Option value="failed">Thanh toán thất bại</Select.Option>
                        <Select.Option value="refund_pending">Đang chờ hoàn tiền</Select.Option>
                        <Select.Option value="refunded">Đã hoàn tiền</Select.Option>
                    </Select>
                    <Button icon={<ReloadOutlined />} onClick={() => fetchRefunds(1)}>
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
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} yêu cầu`,
                        onChange: (page, pageSize) => {
                            setPagination({ ...pagination, current: page, pageSize })
                            fetchRefunds(page)
                        },
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
                    selectedRefund?.paymentStatus !== 'refunded' && selectedRefund?.paymentMethod !== 'COD' && (
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
                                {selectedRefund.user?.name || 'Chưa cung cấp'}
                            </Descriptions.Item>
                            <Descriptions.Item label="SĐT">
                                {selectedRefund.user?.phone || 'Chưa cung cấp'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email" span={2}>
                                {selectedRefund.user?.email || 'Chưa cung cấp'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số tiền">
                                {formatPrice(selectedRefund.totalAmount)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phương thức TT">
                                {selectedRefund.paymentMethod}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái TT">
                                {getPaymentStatusTag(selectedRefund.paymentStatus, selectedRefund.paymentMethod)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái hoàn tiền">
                                {getRefundStatusTag(selectedRefund)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày hủy" span={2}>
                                {selectedRefund.cancelledAt
                                    ? new Date(selectedRefund.cancelledAt).toLocaleString('vi-VN')
                                    : 'Chưa hủy'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Lý do hủy" span={2}>
                                {selectedRefund.cancelReason || 'Không có lý do'}
                            </Descriptions.Item>
                        </Descriptions>

                        {selectedRefund.refundInfo ? (
                            <>
                                <Title level={5} style={{ marginTop: 16 }}>
                                    Thông tin hoàn tiền
                                </Title>
                                <Alert
                                    message={selectedRefund.refundInfo.message || 'Chưa có thông báo.'}
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
                                        {selectedRefund.refundInfo.method || 'Chưa xử lý'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Mã giao dịch">
                                        {selectedRefund.refundInfo.transactionId || 'Chưa có'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày yêu cầu">
                                        {selectedRefund.refundInfo.requestedAt
                                            ? new Date(
                                                  selectedRefund.refundInfo.requestedAt
                                              ).toLocaleString('vi-VN')
                                            : 'Chưa có'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày xử lý">
                                        {selectedRefund.refundInfo.processedAt
                                            ? new Date(
                                                  selectedRefund.refundInfo.processedAt
                                              ).toLocaleString('vi-VN')
                                            : 'Chưa xử lý'}
                                    </Descriptions.Item>
                                </Descriptions>
                            </>
                        ) : (
                            <Alert
                                message="Chưa có thông tin hoàn tiền"
                                description="Qúa trình hoàn tiền cho đơn hàng này chưa được bắt đầu hoặc không áp dụng."
                                type="info"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
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
                title="Xác nhận hoàn tiền"
                open={processModalVisible}
                onCancel={() => setProcessModalVisible(false)}
                onOk={() => form.submit()}
                confirmLoading={processing}
                okText="Xác nhận hoàn tiền"
                cancelText="Hủy"
                width={600}
            >
                {selectedRefund && (
                    <>
                        <Alert
                            message="Xác nhận hoàn tiền"
                            description={
                                <div>
                                    <div>Số tiền: <strong>{formatPrice(selectedRefund.totalAmount)}</strong></div>
                                    <div>Khách hàng: <strong>{selectedRefund.user?.name || 'N/A'}</strong></div>
                                    <div>Phương thức thanh toán gốc: <strong>{selectedRefund.paymentMethod}</strong></div>
                                </div>
                            }
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                        <Form form={form} layout="vertical" onFinish={handleSubmitProcess}>
                            <Form.Item
                                name="method"
                                label="Phương thức hoàn tiền"
                                rules={[{ required: true, message: 'Vui lòng chọn phương thức' }]}
                                extra={
                                    <div style={{ marginTop: 8 }}>
                                        {form.getFieldValue('method') === 'vnpay' && (
                                            <Alert
                                                message="Hoàn tiền tự động qua VNPay"
                                                description="Hệ thống sẽ tự động gọi API VNPay để hoàn tiền. Tiền sẽ về tài khoản khách hàng trong 3-7 ngày làm việc."
                                                type="success"
                                                showIcon
                                                icon={<CheckCircleOutlined />}
                                            />
                                        )}
                                        {form.getFieldValue('method') === 'manual' && (
                                            <Alert
                                                message="Hoàn tiền thủ công"
                                                description="Bạn xác nhận đã chuyển khoản thủ công cho khách hàng. Vui lòng nhập mã giao dịch và ghi chú."
                                                type="warning"
                                                showIcon
                                            />
                                        )}
                                        {(form.getFieldValue('method') === 'momo' || form.getFieldValue('method') === 'cash') && (
                                            <Alert
                                                message="Xác nhận thủ công"
                                                description="Bạn xác nhận đã hoàn tiền cho khách hàng qua phương thức này."
                                                type="warning"
                                                showIcon
                                            />
                                        )}
                                    </div>
                                }
                            >
                                <Select 
                                    placeholder="Chọn phương thức"
                                    onChange={() => form.validateFields(['method'])}
                                >
                                    {selectedRefund.paymentMethod === 'VNPAY' && (
                                        <Select.Option value="vnpay">
                                            <CreditCardOutlined /> VNPay (Tự động)
                                        </Select.Option>
                                    )}
                                    <Select.Option value="manual">
                                        <MoneyCollectOutlined /> Chuyển khoản ngân hàng (Thủ công)
                                    </Select.Option>
                                    <Select.Option value="momo">
                                        <CreditCardOutlined /> MoMo (Thủ công)
                                    </Select.Option>
                                    <Select.Option value="cash">
                                        <DollarOutlined /> Tiền mặt
                                    </Select.Option>
                                </Select>
                            </Form.Item>
                            
                            {form.getFieldValue('method') !== 'vnpay' && (
                                <Form.Item 
                                    name="transactionId" 
                                    label="Mã giao dịch (tùy chọn)"
                                >
                                    <Input 
                                        placeholder="VD: TXN123456789" 
                                        prefix={<CreditCardOutlined />}
                                    />
                                </Form.Item>
                            )}
                            
                            <Form.Item
                                name="notes"
                                label="Ghi chú"
                                rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}
                            >
                                <TextArea
                                    rows={3}
                                    placeholder={
                                        form.getFieldValue('method') === 'vnpay'
                                            ? "VD: Admin xác nhận hoàn tiền tự động qua VNPay"
                                            : "VD: Đã chuyển khoản vào tài khoản ACB số xxx"
                                    }
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
