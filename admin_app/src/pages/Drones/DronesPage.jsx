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
} from 'antd'
import { EyeOutlined, EnvironmentOutlined } from '@ant-design/icons'
import axios from 'axios'
import './DronesPage.css'

const DronesPage = () => {
    const [drones, setDrones] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedDrone, setSelectedDrone] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)

    useEffect(() => {
        fetchDrones()
    }, [])

    const fetchDrones = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }

            const { data } = await axios.get('http://localhost:5000/api/drones', config)
            setDrones(data.data)
        } catch (error) {
            message.error('Không thể tải danh sách drone')
        } finally {
            setLoading(false)
        }
    }

    const showDetails = async (drone) => {
        try {
            const token = localStorage.getItem('token')

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }

            const { data } = await axios.get(
                `http://localhost:5000/api/drones/${drone._id}/stats`,
                config
            )

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
        if (level >= 30) return 'warning'
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

    return (
        <div className="drones-page">
            <h1>Quản lý Drone</h1>

            <Card>
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

            {/* Details Modal */}
            <Modal
                title={`Chi tiết Drone: ${selectedDrone?.name}`}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={700}
            >
                {selectedDrone && (
                    <div>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Tên" span={2}>
                                {selectedDrone.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Model">
                                {selectedDrone.model}
                            </Descriptions.Item>
                            <Descriptions.Item label="Serial Number">
                                {selectedDrone.serialNumber}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={getStatusColor(selectedDrone.status)}>
                                    {getStatusText(selectedDrone.status)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Pin">
                                <Progress
                                    percent={selectedDrone.batteryLevel}
                                    status={getBatteryColor(selectedDrone.batteryLevel)}
                                />
                            </Descriptions.Item>
                            <Descriptions.Item label="Tốc độ tối đa">
                                {selectedDrone.speed} km/h
                            </Descriptions.Item>
                            <Descriptions.Item label="Tầm bay">
                                {selectedDrone.maxRange} km
                            </Descriptions.Item>
                            <Descriptions.Item label="Trọng tải tối đa">
                                {selectedDrone.maxWeight} kg
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng chuyến bay">
                                {selectedDrone.totalFlights}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng quãng đường">
                                {selectedDrone.totalDistance?.toFixed(2)} km
                            </Descriptions.Item>
                            <Descriptions.Item label="Bảo trì lần cuối">
                                {new Date(selectedDrone.lastMaintenanceDate).toLocaleDateString('vi-VN')}
                            </Descriptions.Item>
                        </Descriptions>

                        {selectedDrone.stats && (
                            <div style={{ marginTop: 24 }}>
                                <h3>Thống kê</h3>
                                <Descriptions bordered column={2}>
                                    <Descriptions.Item label="Tổng giao hàng thành công">
                                        {selectedDrone.stats.totalDeliveries}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Thời gian bay">
                                        {selectedDrone.stats.totalFlightTime} giờ
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        )}

                        {selectedDrone.currentLocation && (
                            <div style={{ marginTop: 24 }}>
                                <h3>
                                    <EnvironmentOutlined /> Vị trí hiện tại
                                </h3>
                                <p>
                                    Kinh độ: {selectedDrone.currentLocation.coordinates[0]}<br />
                                    Vĩ độ: {selectedDrone.currentLocation.coordinates[1]}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default DronesPage
