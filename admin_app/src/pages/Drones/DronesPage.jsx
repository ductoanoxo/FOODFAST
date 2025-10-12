import { useEffect, useState } from 'react'
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Modal,
    Descriptions,
    Progress,
    message,
    Form,
    Input,
    InputNumber,
    Select,
    Statistic,
    Row,
    Col,
    Divider,
    Badge,
} from 'antd'
import {
    EyeOutlined,
    EnvironmentOutlined,
    PlusOutlined,
    ThunderboltOutlined,
    RocketOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons'
import { createDrone, getAllDrones, getDroneStats } from '../../api/droneAPI'
import './DronesPage.css'

const DronesPage = () => {
    const [drones, setDrones] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedDrone, setSelectedDrone] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [addModalVisible, setAddModalVisible] = useState(false)
    const [form] = Form.useForm()

    useEffect(() => {
        fetchDrones()
    }, [])

    const fetchDrones = async () => {
        try {
            setLoading(true)
            const data = await getAllDrones()
            setDrones(data.data)
        } catch (error) {
            message.error('Không thể tải danh sách drone')
        } finally {
            setLoading(false)
        }
    }

    const showDetails = async (drone) => {
        try {
            const data = await getDroneStats(drone._id)
            setSelectedDrone({ ...drone, stats: data.data })
            setModalVisible(true)
        } catch (error) {
            message.error('Không thể tải thông tin drone')
        }
    }

    const getStatusColor = (status) => {
        const colors = {
            available: 'green',
            busy: 'orange',
            charging: 'blue',
            maintenance: 'red',
            offline: 'default',
        }
        return colors[status] || 'default'
    }

    const getStatusText = (status) => {
        const texts = {
            available: 'Sẵn sàng',
            busy: 'Đang giao',
            charging: 'Đang sạc',
            maintenance: 'Bảo trì',
            offline: 'Offline',
        }
        return texts[status] || status
    }

    const getBatteryColor = (level) => {
        if (level >= 70) return 'success'
        if (level >= 30) return 'normal'
        return 'exception'
    }

    const columns = [
        {
            title: 'Tên drone',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Model',
            dataIndex: 'model',
            key: 'model',
        },
        {
            title: 'Serial Number',
            dataIndex: 'serialNumber',
            key: 'serialNumber',
        },
        {
            title: 'Pin',
            dataIndex: 'batteryLevel',
            key: 'batteryLevel',
            render: (level) => (
                <Progress
                    percent={level}
                    size="small"
                    status={getBatteryColor(level)}
                    format={(percent) => `${percent}%`}
                />
            ),
            sorter: (a, b) => a.batteryLevel - b.batteryLevel,
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
            title: 'Tổng chuyến bay',
            dataIndex: 'totalFlights',
            key: 'totalFlights',
            sorter: (a, b) => a.totalFlights - b.totalFlights,
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

    const handleAddDrone = async (values) => {
        try {
            const droneData = {
                name: values.name,
                model: values.model,
                serialNumber: values.serialNumber,
                homeLocation: {
                    type: 'Point',
                    coordinates: [values.lng, values.lat],
                },
                batteryLevel: values.batteryLevel || 100,
                maxRange: values.maxRange || 10,
                maxWeight: values.maxWeight || 5,
                speed: values.speed || 60,
                status: values.status || 'available',
            }

            await createDrone(droneData)
            message.success('Thêm drone thành công!')
            setAddModalVisible(false)
            form.resetFields()
            fetchDrones()
        } catch (error) {
            message.error('Lỗi: ' + (error.response?.data?.message || error.message))
        }
    }

    return (
        <div className="drones-page">
            <h1>Quản lý Drone</h1>

            <Card>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setAddModalVisible(true)}
                    style={{ marginBottom: 16 }}
                >
                    Thêm Drone Mới
                </Button>
                <Table
                    columns={columns}
                    dataSource={drones}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng ${total} drone`,
                    }}
                />
            </Card>

            {/* Add Drone Modal */}
            <Modal
                title="Thêm Drone Mới"
                open={addModalVisible}
                onCancel={() => {
                    setAddModalVisible(false)
                    form.resetFields()
                }}
                onOk={() => form.submit()}
                okText="Thêm"
                cancelText="Hủy"
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddDrone}
                >
                    <Form.Item
                        label="Tên drone"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên drone' }]}
                    >
                        <Input placeholder="Nhập tên drone" />
                    </Form.Item>

                    <Form.Item
                        label="Model"
                        name="model"
                        rules={[{ required: true, message: 'Vui lòng nhập model' }]}
                    >
                        <Input placeholder="Ví dụ: DJI-X100" />
                    </Form.Item>

                    <Form.Item
                        label="Serial Number"
                        name="serialNumber"
                        rules={[
                            { required: true, message: 'Vui lòng nhập serial number' },
                            { pattern: /^[A-Z0-9]+$/, message: 'Chỉ chấp nhận chữ in hoa và số' }
                        ]}
                    >
                        <Input placeholder="Ví dụ: DRONE001" />
                    </Form.Item>

                    <Form.Item label="Vị trí home (tọa độ)">
                        <Space>
                            <Form.Item
                                name="lat"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập vĩ độ' },
                                    { type: 'number', min: -90, max: 90, message: 'Vĩ độ phải từ -90 đến 90' }
                                ]}
                                noStyle
                            >
                                <InputNumber
                                    placeholder="Vĩ độ (lat)"
                                    style={{ width: 180 }}
                                    step={0.0001}
                                />
                            </Form.Item>
                            <Form.Item
                                name="lng"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập kinh độ' },
                                    { type: 'number', min: -180, max: 180, message: 'Kinh độ phải từ -180 đến 180' }
                                ]}
                                noStyle
                            >
                                <InputNumber
                                    placeholder="Kinh độ (lng)"
                                    style={{ width: 180 }}
                                    step={0.0001}
                                />
                            </Form.Item>
                        </Space>
                    </Form.Item>

                    <Form.Item
                        label="Mức pin (%)"
                        name="batteryLevel"
                        initialValue={100}
                    >
                        <InputNumber
                            min={0}
                            max={100}
                            style={{ width: '100%' }}
                            placeholder="100"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Tầm bay tối đa (km)"
                        name="maxRange"
                        initialValue={10}
                    >
                        <InputNumber
                            min={1}
                            style={{ width: '100%' }}
                            placeholder="10"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Trọng tải tối đa (kg)"
                        name="maxWeight"
                        initialValue={5}
                    >
                        <InputNumber
                            min={0.1}
                            style={{ width: '100%' }}
                            placeholder="5"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Tốc độ (km/h)"
                        name="speed"
                        initialValue={60}
                    >
                        <InputNumber
                            min={1}
                            style={{ width: '100%' }}
                            placeholder="60"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        initialValue="available"
                    >
                        <Select>
                            <Select.Option value="available">Sẵn sàng</Select.Option>
                            <Select.Option value="charging">Đang sạc</Select.Option>
                            <Select.Option value="maintenance">Bảo trì</Select.Option>
                            <Select.Option value="offline">Offline</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Details Modal */}
            <Modal
                title={
                    <Space>
                        <RocketOutlined />
                        <span>Chi tiết Drone: {selectedDrone?.name}</span>
                        {selectedDrone && (
                            <Tag color={getStatusColor(selectedDrone.status)}>
                                {getStatusText(selectedDrone.status)}
                            </Tag>
                        )}
                    </Space>
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
                {selectedDrone && (
                    <div>
                        {/* Statistics Cards */}
                        <Row gutter={16} style={{ marginBottom: 24 }}>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="Mức pin"
                                        value={selectedDrone.batteryLevel}
                                        suffix="%"
                                        valueStyle={{ color: selectedDrone.batteryLevel >= 70 ? '#3f8600' : selectedDrone.batteryLevel >= 30 ? '#faad14' : '#cf1322' }}
                                        prefix={<ThunderboltOutlined />}
                                    />
                                    <Progress
                                        percent={selectedDrone.batteryLevel}
                                        status={getBatteryColor(selectedDrone.batteryLevel)}
                                        showInfo={false}
                                        style={{ marginTop: 8 }}
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="Tổng chuyến bay"
                                        value={selectedDrone.totalFlights || 0}
                                        prefix={<RocketOutlined />}
                                        valueStyle={{ color: '#1890ff' }}
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="Quãng đường"
                                        value={selectedDrone.totalDistance?.toFixed(2) || 0}
                                        suffix="km"
                                        prefix={<EnvironmentOutlined />}
                                        valueStyle={{ color: '#722ed1' }}
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="Giao hàng thành công"
                                        value={selectedDrone.stats?.totalDeliveries || 0}
                                        prefix={<CheckCircleOutlined />}
                                        valueStyle={{ color: '#52c41a' }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        <Divider orientation="left">Thông tin cơ bản</Divider>
                        
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Tên drone" span={1}>
                                <strong>{selectedDrone.name}</strong>
                            </Descriptions.Item>
                            <Descriptions.Item label="Model" span={1}>
                                {selectedDrone.model}
                            </Descriptions.Item>
                            <Descriptions.Item label="Serial Number" span={2}>
                                <Badge status="processing" text={selectedDrone.serialNumber} />
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái hoạt động" span={2}>
                                {selectedDrone.isActive !== false ? (
                                    <Tag color="success">Đang hoạt động</Tag>
                                ) : (
                                    <Tag color="error">Ngừng hoạt động</Tag>
                                )}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">Thông số kỹ thuật</Divider>
                        
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Tốc độ tối đa">
                                <Space>
                                    <RocketOutlined />
                                    {selectedDrone.speed} km/h
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tầm bay tối đa">
                                <Space>
                                    <EnvironmentOutlined />
                                    {selectedDrone.maxRange} km
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trọng tải tối đa">
                                {selectedDrone.maxWeight} kg
                            </Descriptions.Item>
                            <Descriptions.Item label="Mức pin hiện tại">
                                <Progress
                                    percent={selectedDrone.batteryLevel}
                                    size="small"
                                    status={getBatteryColor(selectedDrone.batteryLevel)}
                                />
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Location Information */}
                        <Divider orientation="left">Thông tin vị trí</Divider>
                        
                        <Row gutter={16}>
                            <Col span={12}>
                                <Card title="🏠 Vị trí Home" size="small">
                                    {selectedDrone.homeLocation && (
                                        <div>
                                            <p><strong>Kinh độ:</strong> {selectedDrone.homeLocation.coordinates[0]}</p>
                                            <p><strong>Vĩ độ:</strong> {selectedDrone.homeLocation.coordinates[1]}</p>
                                        </div>
                                    )}
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card title="📍 Vị trí hiện tại" size="small">
                                    {selectedDrone.currentLocation ? (
                                        <div>
                                            <p><strong>Kinh độ:</strong> {selectedDrone.currentLocation.coordinates[0]}</p>
                                            <p><strong>Vĩ độ:</strong> {selectedDrone.currentLocation.coordinates[1]}</p>
                                        </div>
                                    ) : (
                                        <p style={{ color: '#999' }}>Chưa có dữ liệu vị trí</p>
                                    )}
                                </Card>
                            </Col>
                        </Row>

                        {/* Maintenance Information */}
                        {selectedDrone.lastMaintenanceDate && (
                            <>
                                <Divider orientation="left">Thông tin bảo trì</Divider>
                                <Descriptions bordered column={2} size="small">
                                    <Descriptions.Item label="Bảo trì lần cuối">
                                        <Space>
                                            <ClockCircleOutlined />
                                            {new Date(selectedDrone.lastMaintenanceDate).toLocaleDateString('vi-VN')}
                                        </Space>
                                    </Descriptions.Item>
                                    {selectedDrone.nextMaintenanceDate && (
                                        <Descriptions.Item label="Bảo trì lần sau">
                                            {new Date(selectedDrone.nextMaintenanceDate).toLocaleDateString('vi-VN')}
                                        </Descriptions.Item>
                                    )}
                                </Descriptions>
                            </>
                        )}

                        {/* Current Order */}
                        {selectedDrone.currentOrder && (
                            <>
                                <Divider orientation="left">Đơn hàng hiện tại</Divider>
                                <Descriptions bordered column={1} size="small">
                                    <Descriptions.Item label="Mã đơn hàng">
                                        <Tag color="blue">{selectedDrone.currentOrder}</Tag>
                                    </Descriptions.Item>
                                </Descriptions>
                            </>
                        )}

                        {/* Statistics */}
                        {selectedDrone.stats && (
                            <>
                                <Divider orientation="left">Thống kê chi tiết</Divider>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Card>
                                            <Statistic
                                                title="Tổng giao hàng thành công"
                                                value={selectedDrone.stats.totalDeliveries}
                                                prefix={<CheckCircleOutlined />}
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={12}>
                                        <Card>
                                            <Statistic
                                                title="Tổng thời gian bay"
                                                value={selectedDrone.stats.totalFlightTime}
                                                suffix="giờ"
                                                prefix={<ClockCircleOutlined />}
                                            />
                                        </Card>
                                    </Col>
                                </Row>
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default DronesPage
