import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Result, Spin, Card, Button, Descriptions } from 'antd'
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { paymentAPI } from '../../api/paymentAPI'
import { clearCart } from '../../redux/slices/cartSlice'

// VNPay Response Code Messages
const getPaymentMessage = (responseCode) => {
  const messages = {
    '00': 'Giao dịch thành công!',
    '07': 'Giao dịch nghi ngờ gian lận. Vui lòng liên hệ CSKH.',
    '09': 'Thẻ chưa đăng ký Internet Banking.',
    '10': 'Xác thực thông tin thẻ không đúng quá 3 lần.',
    '11': 'Hết thời gian thanh toán. Vui lòng thử lại.',
    '12': 'Thẻ/Tài khoản bị khóa.',
    '13': 'Mật khẩu OTP không đúng.',
    '24': 'Khách hàng đã hủy giao dịch.',
    '51': 'Tài khoản không đủ số dư.',
    '65': 'Vượt quá hạn mức giao dịch trong ngày.',
    '75': 'Ngân hàng đang bảo trì.',
    '79': 'Nhập sai mật khẩu quá số lần quy định.',
    '99': 'Lỗi không xác định. Vui lòng liên hệ CSKH.'
  }
  return messages[responseCode] || 'Lỗi không xác định'
}

const VNPayReturn = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [status, setStatus] = useState('processing') // processing, success, error
  const [message, setMessage] = useState('Đang xử lý thanh toán...')
  const [transactionInfo, setTransactionInfo] = useState(null)

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Lấy tất cả params từ VNPay
        const params = {}
        for (let [key, value] of searchParams.entries()) {
          params[key] = value
        }

        const vnp_ResponseCode = params.vnp_ResponseCode

        // Lưu thông tin giao dịch
        setTransactionInfo({
          responseCode: vnp_ResponseCode,
          transactionId: params.vnp_TxnRef,
          amount: params.vnp_Amount ? parseInt(params.vnp_Amount) / 100 : 0,
          bankCode: params.vnp_BankCode,
          transactionNo: params.vnp_TransactionNo,
          cardType: params.vnp_CardType,
          payDate: params.vnp_PayDate
        })

        // Gọi API verify payment
        const response = await paymentAPI.vnpayReturn(params)

        if (response.success && vnp_ResponseCode === '00') {
          setStatus('success')
          setMessage('Thanh toán thành công!')
          
          // Xóa giỏ hàng
          dispatch(clearCart())
          
          // Xóa pendingOrderId
          localStorage.removeItem('pendingOrderId')
          
          // Chuyển đến trang tracking sau 3 giây
          setTimeout(() => {
            navigate(`/order-tracking/${response.data._id}`)
          }, 3000)
        } else {
          setStatus('error')
          setMessage(getPaymentMessage(vnp_ResponseCode))
        }
      } catch (error) {
        console.error('Payment verification error:', error)
        setStatus('error')
        setMessage(error.response?.data?.message || 'Có lỗi xảy ra khi xử lý thanh toán!')
      }
    }

    verifyPayment()
  }, [searchParams, navigate, dispatch])

  const handleBackToHome = () => {
    navigate('/')
  }

  const handleViewOrder = () => {
    const pendingOrderId = localStorage.getItem('pendingOrderId')
    if (pendingOrderId) {
      navigate(`/order-tracking/${pendingOrderId}`)
      localStorage.removeItem('pendingOrderId')
    } else {
      navigate('/profile')
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5',
      padding: '20px'
    }}>
      <Card style={{ maxWidth: 500, width: '100%' }}>
        {status === 'processing' && (
          <Result
            icon={<Spin indicator={<LoadingOutlined style={{ fontSize: 60 }} spin />} />}
            title="Đang xử lý thanh toán"
            subTitle={message}
          />
        )}

        {status === 'success' && (
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="Thanh toán thành công!"
            subTitle={message}
            extra={[
              <Button type="primary" key="order" onClick={handleViewOrder}>
                Xem đơn hàng
              </Button>,
              <Button key="home" onClick={handleBackToHome}>
                Về trang chủ
              </Button>,
            ]}
          >
            {transactionInfo && (
              <Descriptions bordered column={1} size="small" style={{ marginTop: 20 }}>
                <Descriptions.Item label="Mã giao dịch">
                  {transactionInfo.transactionId}
                </Descriptions.Item>
                <Descriptions.Item label="Số tiền">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(transactionInfo.amount)}
                </Descriptions.Item>
                {transactionInfo.bankCode && (
                  <Descriptions.Item label="Ngân hàng">
                    {transactionInfo.bankCode}
                  </Descriptions.Item>
                )}
                {transactionInfo.cardType && (
                  <Descriptions.Item label="Loại thẻ">
                    {transactionInfo.cardType}
                  </Descriptions.Item>
                )}
              </Descriptions>
            )}
          </Result>
        )}

        {status === 'error' && (
          <Result
            status="error"
            icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            title="Thanh toán thất bại!"
            subTitle={message}
            extra={[
              <Button type="primary" danger key="retry" onClick={handleViewOrder}>
                Xem đơn hàng
              </Button>,
              <Button key="home" onClick={handleBackToHome}>
                Về trang chủ
              </Button>,
            ]}
          >
            {transactionInfo && (
              <Descriptions bordered column={1} size="small" style={{ marginTop: 20 }}>
                <Descriptions.Item label="Mã lỗi">
                  {transactionInfo.responseCode}
                </Descriptions.Item>
                <Descriptions.Item label="Mã giao dịch">
                  {transactionInfo.transactionId}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Result>
        )}
      </Card>
    </div>
  )
}

export default VNPayReturn
