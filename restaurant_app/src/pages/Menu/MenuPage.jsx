import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Button, Row, Col, Spin, Empty, Input, Select, Space, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../../redux/slices/productSlice';
import ProductCard from '../../components/ProductCard';
import ProductFormModal from '../../components/ProductFormModal';
import './MenuPage.css';

const { Title, Text } = Typography;

const MenuPage = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAvailable, setFilterAvailable] = useState('all');

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setModalVisible(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setModalVisible(true);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await dispatch(deleteProduct(productId)).unwrap();
      message.success('Xóa món ăn thành công!');
    } catch (error) {
      message.error('Có lỗi xảy ra: ' + (error || 'Vui lòng thử lại'));
    }
  };

  const handleSubmitProduct = async (productData) => {
    try {
      if (editingProduct) {
        await dispatch(updateProduct({ 
          id: editingProduct._id, 
          productData 
        })).unwrap();
        message.success('Cập nhật món ăn thành công!');
      } else {
        await dispatch(createProduct(productData)).unwrap();
        message.success('Thêm món ăn thành công!');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra: ' + (error || 'Vui lòng thử lại'));
      throw error;
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchSearch = product.name.toLowerCase().includes(searchText.toLowerCase());
    const matchCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchAvailable = 
      filterAvailable === 'all' || 
      (filterAvailable === 'available' && product.available) ||
      (filterAvailable === 'unavailable' && !product.available);
    
    return matchSearch && matchCategory && matchAvailable;
  });

  return (
    <div className="menu-page">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Title level={2}>Quản lý thực đơn</Title>
            <Text type="secondary">Quản lý các món ăn trong menu nhà hàng</Text>
          </div>
          <Button 
            type="primary" 
            size="large"
            icon={<PlusOutlined />}
            onClick={handleAddProduct}
          >
            Thêm món mới
          </Button>
        </div>

        {/* Filters */}
        <Space size="middle" wrap>
          <Input
            placeholder="Tìm kiếm món ăn..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            value={filterCategory}
            onChange={setFilterCategory}
            style={{ width: 180 }}
          >
            <Select.Option value="all">Tất cả danh mục</Select.Option>
            <Select.Option value="rice">🍚 Cơm</Select.Option>
            <Select.Option value="noodles">🍜 Mì/Phở</Select.Option>
            <Select.Option value="drinks">🥤 Đồ uống</Select.Option>
            <Select.Option value="snacks">🍿 Đồ ăn vặt</Select.Option>
            <Select.Option value="desserts">🍰 Tráng miệng</Select.Option>
            <Select.Option value="other">🍽️ Khác</Select.Option>
          </Select>
          <Select
            value={filterAvailable}
            onChange={setFilterAvailable}
            style={{ width: 150 }}
          >
            <Select.Option value="all">Tất cả</Select.Option>
            <Select.Option value="available">Còn hàng</Select.Option>
            <Select.Option value="unavailable">Hết hàng</Select.Option>
          </Select>
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <Empty
          description={
            searchText || filterCategory !== 'all' || filterAvailable !== 'all'
              ? 'Không tìm thấy món ăn nào'
              : 'Chưa có món ăn nào'
          }
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredProducts.map((product) => (
            <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
              <ProductCard
                product={product}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            </Col>
          ))}
        </Row>
      )}

      <ProductFormModal
        visible={modalVisible}
        product={editingProduct}
        onClose={() => {
          setModalVisible(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSubmitProduct}
      />
    </div>
  );
};

export default MenuPage;
