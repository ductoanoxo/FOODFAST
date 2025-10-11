import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Result, Spin, Button } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { paymentAPI } from '../../api/paymentAPI'

const VNPayReturnPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [paymentResult, setPaymentResult] = useState(null)

  useEffect(() => {
    handleVNPayReturn()
  }, [])

  const handleVNPayReturn = async () => {
    try {
      // Lấy tất cả params từ VNPay
      const params = {}
      for (let [key, value] of searchParams.entries()) {
        params[key] = value
      }

      // Gọi API để xác thực và xử lý kết quả
      const response = await paymentAPI.vnpayReturn(params)
      
      setPaymentResult({
        success: response.data.success,
        message: response.data.message,
        orderId: response.data.data?._id,
      })
    } catch (error) {
      console.error('VNPay return error:', error)
      setPaymentResult({
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi xử lý thanh toán',
        orderId: localStorage.getItem('pendingOrderId'),
      })
    } finally {
      setLoading(false)
      // Xóa orderId đã lưu
      localStorage.removeItem('pendingOrderId')
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh' 
      }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: 50 }}>
      <Result
        status={paymentResult?.success ? 'success' : 'error'}
        title={paymentResult?.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
        subTitle={paymentResult?.message}
        extra={[
          <Button type="primary" key="order" onClick={() => navigate(`/order-tracking/${paymentResult?.orderId}`)}>
            Xem đơn hàng
          </Button>,
          <Button key="home" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>,
        ]}
      />
    </div>
  )
}

export default VNPayReturnPage
