import { Card, Tag, Typography, Space, Button, Popconfirm, Avatar } from 'antd';
<<<<<<< HEAD
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
=======
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
>>>>>>> parent of c1a1dc0 (5:03)
import './ProductCard.css';

const { Text, Paragraph } = Typography;

const categoryNames = {
  rice: '🍚 Cơm',
  noodles: '🍜 Mì/Phở',
  drinks: '🥤 Đồ uống',
  snacks: '🍿 Đồ ăn vặt',
  desserts: '🍰 Tráng miệng',
  other: '🍽️ Khác',
};

const ProductCard = ({ product, onEdit, onDelete }) => {
  return (
    <Card
      className="product-card"
      hoverable
      cover={
        <div style={{ 
          height: 200, 
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5'
        }}>
          {product.image ? (
            <img
              alt={product.name}
              src={product.image}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Avatar size={100} style={{ background: '#667eea' }}>
              {product.name?.charAt(0)}
            </Avatar>
          )}
        </div>
      }
      actions={[
        <Button 
          type="text" 
          icon={<EditOutlined />} 
          onClick={() => onEdit(product)}
        >
          Sửa
        </Button>,
        <Popconfirm
          title="Xóa món ăn"
          description="Bạn có chắc muốn xóa món ăn này?"
          onConfirm={() => onDelete(product._id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="text" danger icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Popconfirm>,
      ]}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Text strong style={{ fontSize: 16 }}>{product.name}</Text>
          <Tag color={product.isAvailable ? 'green' : 'red'}>
            {product.isAvailable ? 'Còn hàng' : 'Hết hàng'}
          </Tag>
        </div>

        <Tag color="blue">
          {categoryNames[product.category?._id || product.category] || 
           product.category?.name || 
           'Khác'}
        </Tag>

        <Paragraph 
          ellipsis={{ rows: 2 }} 
          type="secondary"
          style={{ margin: 0, minHeight: 40 }}
        >
          {product.description || 'Chưa có mô tả'}
        </Paragraph>

        <Text strong style={{ fontSize: 18, color: '#667eea' }}>
          {(product.promotion?.originalPrice ?? product.price)?.toLocaleString('vi-VN')}₫
        </Text>
      </Space>
    </Card>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string,
    isAvailable: PropTypes.bool,
    category: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
      }),
    ]),
    description: PropTypes.string,
    price: PropTypes.number,
    promotion: PropTypes.shape({
      originalPrice: PropTypes.number,
    }),
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ProductCard;
