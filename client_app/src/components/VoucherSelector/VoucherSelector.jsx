import { useState, useEffect, useCallback } from 'react'
import { Input, Button, Modal, message, Tag, Empty } from 'antd'
import { GiftOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { getPublicVouchers, validateVoucher } from '../../api/voucherAPI'
import dayjs from 'dayjs'
import './VoucherSelector.css'

const VoucherSelector = ({ restaurantId, orderTotal, onApply, appliedVoucher }) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(false)
  const [voucherCode, setVoucherCode] = useState('')
  const [validating, setValidating] = useState(false)

  const loadVouchers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getPublicVouchers(restaurantId)
      setVouchers(response.data || [])
    } catch (error) {
      console.error('Error loading vouchers:', error)
    } finally {
      setLoading(false)
    }
  }, [restaurantId])

  useEffect(() => {
    if (modalVisible) {
      loadVouchers()
    }
  }, [modalVisible, loadVouchers])

  const handleValidateCode = async () => {
    if (!voucherCode.trim()) {
      message.warning('Vui lòng nhập mã voucher')
      return
    }

    try {
      setValidating(true)
      const response = await validateVoucher({
        code: voucherCode.trim(),
        restaurantId,
        orderTotal,
      })

      // validateVoucher() returns response.data from the API wrapper,
      // so pass the returned object directly to onApply
      onApply(response)
      message.success('Áp dụng voucher thành công!')
      setModalVisible(false)
      setVoucherCode('')
    } catch (error) {
      message.error(error.response?.data?.message || 'Mã voucher không hợp lệ')
    } finally {
      setValidating(false)
    }
  }

  const handleSelectVoucher = async (voucher) => {
    try {
      setValidating(true)
      const response = await validateVoucher({
        code: voucher.code,
        restaurantId,
        orderTotal,
      })

      // Pass returned data directly
      onApply(response)
      message.success('Áp dụng voucher thành công!')
      setModalVisible(false)
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể áp dụng voucher')
    } finally {
      setValidating(false)
    }
  }

  const formatDiscount = (voucher) => {
    if (voucher.discountType === 'percentage') {
      return `Giảm ${voucher.discountValue}%`
    }
    return `Giảm ${voucher.discountValue.toLocaleString('vi-VN')}đ`
  }

  const canUseVoucher = (voucher) => {
    return orderTotal >= voucher.minOrder
  }

  return (
    <div className="voucher-selector">
      {appliedVoucher ? (
        <div className="applied-voucher">
          <div className="applied-voucher-info">
            <div className="applied-voucher-code">
              <GiftOutlined /> {appliedVoucher.voucher.code}
            </div>
            <div className="applied-voucher-discount">
              Giảm {appliedVoucher.discountAmount.toLocaleString('vi-VN')}đ
            </div>
          </div>
          <Button
            type="link"
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => onApply(null)}
          >
            Xóa
          </Button>
        </div>
      ) : (
        <Button
          type="dashed"
          icon={<GiftOutlined />}
          block
          onClick={() => setModalVisible(true)}
        >
          Chọn mã khuyến mãi
        </Button>
      )}

      <Modal
        title={<><GiftOutlined /> Chọn mã khuyến mãi</>}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <div className="voucher-input-group">
          <Input
            placeholder="Nhập mã voucher"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
            onPressEnter={handleValidateCode}
            style={{ textTransform: 'uppercase' }}
          />
          <Button
            type="primary"
            onClick={handleValidateCode}
            loading={validating}
          >
            Áp dụng
          </Button>
        </div>

        <div className="voucher-list">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 20 }}>Đang tải...</div>
          ) : vouchers.length === 0 ? (
            <Empty description="Không có voucher khả dụng" />
          ) : (
            vouchers.map((voucher) => {
              const usable = canUseVoucher(voucher)
              return (
                <div
                  key={voucher._id}
                  className="voucher-item"
                  onClick={() => usable && handleSelectVoucher(voucher)}
                  style={{
                    opacity: usable ? 1 : 0.5,
                    cursor: usable ? 'pointer' : 'not-allowed',
                  }}
                >
                  <div className="voucher-code">{voucher.code}</div>
                  <div className="voucher-discount">
                    {formatDiscount(voucher)}
                    {voucher.maxDiscount && voucher.discountType === 'percentage' && (
                      <span style={{ fontSize: 14, marginLeft: 8 }}>
                        (tối đa {voucher.maxDiscount.toLocaleString('vi-VN')}đ)
                      </span>
                    )}
                  </div>
                  <div className="voucher-description">{voucher.name}</div>
                  {voucher.description && (
                    <div className="voucher-description" style={{ fontSize: 12 }}>
                      {voucher.description}
                    </div>
                  )}
                  <div className="voucher-conditions">
                    <span>
                      Đơn tối thiểu: {voucher.minOrder.toLocaleString('vi-VN')}đ
                    </span>
                    <span>HSD: {dayjs(voucher.validUntil).format('DD/MM/YYYY')}</span>
                    {voucher.maxUsage && (
                      <span>
                        Còn: {voucher.maxUsage - voucher.usageCount} lượt
                      </span>
                    )}
                  </div>
                  {!usable && (
                    <Tag color="red" style={{ marginTop: 8 }}>
                      Chưa đủ điều kiện
                    </Tag>
                  )}
                </div>
              )
            })
          )}
        </div>
      </Modal>
    </div>
  )
}

export default VoucherSelector
