import { useState } from 'react'
import PropTypes from 'prop-types'
import { Modal, Form, Rate, Input, Upload, Button, message } from 'antd'
import { PlusOutlined, CameraOutlined } from '@ant-design/icons'
import { reviewAPI } from '../../api'
import './CreateReview.css'

const { TextArea } = Input

const CreateReview = ({ visible, onClose, productId, orderId, onSuccess }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [fileList, setFileList] = useState([])

    const handleSubmit = async (values) => {
        try {
            setLoading(true)
            
            // Upload images trước
            const imageUrls = await Promise.all(
                fileList.map(async (file) => {
                    if (file.url) {
                        return file.url // Ảnh đã có URL
                    }
                    if (file.originFileObj) {
                        // Convert to base64 hoặc upload lên server
                        return await convertToBase64(file.originFileObj)
                    }
                    return null
                })
            )
            
            const reviewData = {
                product: productId,
                rating: values.rating,
                comment: values.comment,
                order: orderId,
                images: imageUrls.filter(Boolean),
                isVerified: !!orderId
            }

            const response = await reviewAPI.createReview(reviewData)
            
            if (response.success) {
                message.success('Đánh giá của bạn đã được gửi thành công!')
                form.resetFields()
                setFileList([])
                onSuccess?.()
                onClose()
            }
        } catch (error) {
            console.error('Lỗi khi gửi đánh giá:', error)
            
            const errorMessage = error.error || error.message || 'Không thể gửi đánh giá. Vui lòng thử lại!'
            message.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    // Convert image to base64
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result)
            reader.onerror = (error) => reject(error)
        })
    }

    const handleUploadChange = ({ fileList: newFileList }) => {
        setFileList(newFileList)
    }

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
        </div>
    )

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/')
        if (!isImage) {
            message.error('Chỉ có thể tải lên file ảnh!')
            return false
        }
        const isLt5M = file.size / 1024 / 1024 < 5
        if (!isLt5M) {
            message.error('Ảnh phải nhỏ hơn 5MB!')
            return false
        }
        // Return false để không tự động upload
        return false
    }

    return (
        <Modal
            title="Đánh giá sản phẩm"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={600}
            className="create-review-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ rating: 5 }}
            >
                <Form.Item
                    name="rating"
                    label="Đánh giá của bạn"
                    rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}
                >
                    <Rate style={{ fontSize: 32 }} />
                </Form.Item>

                <Form.Item
                    name="comment"
                    label="Nhận xét"
                    rules={[
                        { required: true, message: 'Vui lòng nhập nhận xét!' },
                        { min: 10, message: 'Nhận xét phải có ít nhất 10 ký tự!' }
                    ]}
                >
                    <TextArea
                        rows={4}
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                        maxLength={500}
                        showCount
                    />
                </Form.Item>

                <Form.Item label="Ảnh sản phẩm (tùy chọn)">
                    <Upload
                        listType="picture-card"
                        fileList={fileList}
                        onChange={handleUploadChange}
                        beforeUpload={beforeUpload}
                        maxCount={5}
                        accept="image/*"
                    >
                        {fileList.length >= 5 ? null : uploadButton}
                    </Upload>
                    <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 8 }}>
                        <CameraOutlined /> Tối đa 5 ảnh, mỗi ảnh không quá 5MB
                    </div>
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <Button onClick={onClose}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Gửi đánh giá
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    )
}

CreateReview.propTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    productId: PropTypes.string.isRequired,
    orderId: PropTypes.string,
    onSuccess: PropTypes.func
}

export default CreateReview
