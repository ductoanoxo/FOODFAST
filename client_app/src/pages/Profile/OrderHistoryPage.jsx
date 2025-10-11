import { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Typography } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { orderAPI } from '../../api/orderAPI'
import './OrderHistoryPage.css'

const { Title } = Typography

const OrderHistoryPage = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await orderAPI.getOrderHistory()
      setOrders(response.data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      confirmed: 'blue',
      preparing: 'cyan',
      delivering: 'purple',
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
      delivering: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
    }
    return texts[status] || status
  }

  // Define a logical ordering for statuses for sorting
  const statusOrder = {
    pending: 0,
    confirmed: 1,
    preparing: 2,
    delivering: 3,
    delivered: 4,
    cancelled: 5,
  }

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text, record) => `#${text || record._id?.slice(-6)}`,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => {
        if (!date) return 'N/A'
        try {
          // Show full date and time (day/month/year hour:minute:second) in Vietnamese locale
          return new Date(date).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })
        } catch (err) {
          return new Date(date).toString()
        }
      },
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Món ăn',
      dataIndex: 'items',
      key: 'items',
      render: (items) => `${items?.length || 0} món`,
      sorter: (a, b) => (a.items?.length || 0) - (b.items?.length || 0),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => formatPrice(amount),
      sorter: (a, b) => (a.totalAmount || 0) - (b.totalAmount || 0),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      sorter: (a, b) => {
        const av = statusOrder[a.status] !== undefined ? statusOrder[a.status] : 999
        const bv = statusOrder[b.status] !== undefined ? statusOrder[b.status] : 999
        if (av === bv) return (a.status || '').toString().localeCompare((b.status || '').toString())
        return av - bv
      },
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/order-tracking/${record._id}`)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ]

  return (
    <div className="order-history-page">
      <div className="container">
        <Title level={2}>Lịch sử đơn hàng</Title>
        <Card>
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="_id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} đơn hàng`,
            }}
          />
        </Card>
      </div>
    </div>
  )
}

export default OrderHistoryPage
