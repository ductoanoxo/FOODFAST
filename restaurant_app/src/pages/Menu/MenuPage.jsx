import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Typography, 
  Button, 
  Row, 
  Col, 
  Spin, 
  Empty, 
  Input, 
  Select, 
  Space, 
  message,
  Table,
  Tag,
  Image,
  Switch,
  Popconfirm,
  Dropdown,
  Card,
  Statistic,
  Modal,
  Segmented,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined
} from '@ant-design/icons';
import { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../../redux/slices/productSlice';
import ProductCard from '../../components/ProductCard';
import ProductFormModal from '../../components/ProductFormModal';
import { getCategoriesWithProducts } from '../../api/categoryAPI';
import './MenuPage.css';

const { Title, Text } = Typography;

const MenuPage = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [filterAvailable, setFilterAvailable] = useState('all');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price', 'createdAt'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0
  });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getCategoriesWithProducts()
        const list = Array.isArray(res) ? res : (res && res.data) ? res.data : []
        setCategories(list)
      } catch (err) {
        console.error('Error loading categories:', err)
      }
    }
    loadCategories()
  }, [])

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

  // Toggle product availability
  const handleToggleAvailability = async (product) => {
    try {
      // Don't use FormData for simple field update - just send JSON
      await dispatch(updateProduct({ 
        id: product._id, 
        productData: { isAvailable: !product.isAvailable }
      })).unwrap();
      
      message.success(`Đã ${!product.isAvailable ? 'mở bán' : 'ngừng bán'} món ăn!`);
    } catch (error) {
      message.error('Có lỗi xảy ra: ' + (error || 'Vui lòng thử lại'));
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRowKeys.map(id => 
        dispatch(deleteProduct(id)).unwrap()
      ));
      message.success(`Đã xóa ${selectedRowKeys.length} món ăn!`);
      setSelectedRowKeys([]);
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa: ' + (error || 'Vui lòng thử lại'));
    }
  };

  // Bulk update availability
  const handleBulkUpdateAvailability = async (isAvailable) => {
    try {
      // Use JSON instead of FormData for simple updates
      await Promise.all(selectedRowKeys.map(id => 
        dispatch(updateProduct({ 
          id, 
          productData: { isAvailable }
        })).unwrap()
      ));
      message.success(`Đã cập nhật trạng thái ${selectedRowKeys.length} món ăn!`);
      setSelectedRowKeys([]);
    } catch (error) {
      message.error('Có lỗi xảy ra: ' + (error || 'Vui lòng thử lại'));
    }
  };

  // Export to CSV
  const handleExport = () => {
    const csvContent = [
      ['Tên món', 'Giá', 'Danh mục', 'Trạng thái', 'Mô tả'].join(','),
      ...filteredAndSortedProducts.map(p => [
        p.name,
        (p.promotion?.originalPrice ?? p.price),
        p.category?.name || p.category || '',
        p.isAvailable ? 'Còn hàng' : 'Hết hàng',
        (p.description || '').replace(/,/g, ';')
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `menu_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    message.success('Đã xuất file CSV!');
  };

  const filteredProducts = products.filter((product) => {
    const matchSearch = product.name.toLowerCase().includes(searchText.toLowerCase());
    // product.category can be string key or object { _id, name }
    const productCategoryKey = product.category?._id || product.category || '';
    const matchCategory = filterCategory === 'all' || productCategoryKey === filterCategory;
    const matchAvailable = 
      filterAvailable === 'all' || 
      (filterAvailable === 'available' && product.isAvailable) ||
      (filterAvailable === 'unavailable' && !product.isAvailable);
    
    return matchSearch && matchCategory && matchAvailable;
  });

  // Sort products
  const filteredAndSortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'price') {
      comparison = a.price - b.price;
    } else if (sortBy === 'createdAt') {
      comparison = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Update pagination total
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: filteredAndSortedProducts.length
    }));
  }, [filteredAndSortedProducts.length]);

  // Get paginated data for card view
  const paginatedProducts = filteredAndSortedProducts.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  // Statistics
  const stats = {
    total: products.length,
    available: products.filter(p => p.isAvailable).length,
    unavailable: products.filter(p => !p.isAvailable).length,
    avgPrice: products.length > 0 
      ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length)
      : 0
  };

  // Category names map
  const categoryNames = {
    rice: '🍚 Cơm',
    noodles: '🍜 Mì/Phở',
    drinks: '🥤 Đồ uống',
    snacks: '🍿 Đồ ăn vặt',
    desserts: '🍰 Tráng miệng',
    other: '🍽️ Khác',
  };

  // Table columns
  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image, record) => (
        <Image
          src={image || 'https://via.placeholder.com/80'}
          alt={record.name}
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 8 }}
          preview={{
            mask: <EyeOutlined />,
          }}
        />
      ),
    },
    {
      title: 'Tên món',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color="blue">
          {categoryNames[category?._id || category] || 
           category?.name || 
           'Khác'}
        </Tag>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      sorter: true,
      render: (_, record) => {
        const displayPrice = record.promotion?.originalPrice ?? record.price
        return (
          <Text strong style={{ color: '#667eea' }}>
            {displayPrice?.toLocaleString('vi-VN')}₫
          </Text>
        )
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date) => (
        <Text type="secondary">{date ? new Date(date).toLocaleDateString() : '-'}</Text>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Text type="secondary">{text || 'Chưa có mô tả'}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      width: 120,
      render: (isAvailable, record) => (
        <Switch
          checked={isAvailable}
          onChange={() => handleToggleAvailability(record)}
          checkedChildren="Còn hàng"
          unCheckedChildren="Hết hàng"
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Chỉnh sửa',
                onClick: () => handleEditProduct(record),
              },
              {
                key: 'toggle',
                icon: record.isAvailable ? <CloseCircleOutlined /> : <CheckCircleOutlined />,
                label: record.isAvailable ? 'Ngừng bán' : 'Mở bán',
                onClick: () => handleToggleAvailability(record),
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Xóa',
                danger: true,
                onClick: () => {
                  Modal.confirm({
                    title: 'Xóa món ăn',
                    content: `Bạn có chắc muốn xóa "${record.name}"?`,
                    okText: 'Xóa',
                    okType: 'danger',
                    cancelText: 'Hủy',
                    onOk: () => handleDeleteProduct(record._id),
                  });
                },
              },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // Row selection for table
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
  };

  return (
    <div className="menu-page">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>Quản lý thực đơn</Title>
            <Text type="secondary">Quản lý các món ăn trong menu nhà hàng</Text>
          </div>
          <Space>
            <Button 
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              Xuất Excel
            </Button>
            <Button 
              type="primary" 
              size="large"
              icon={<PlusOutlined />}
              onClick={handleAddProduct}
            >
              Thêm món mới
            </Button>
          </Space>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Tổng món ăn"
                value={stats.total}
                valueStyle={{ color: '#667eea', fontSize: 20 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Đang bán"
                value={stats.available}
                valueStyle={{ color: '#52c41a', fontSize: 20 }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Ngừng bán"
                value={stats.unavailable}
                valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Giá trung bình"
                value={stats.avgPrice}
                valueStyle={{ color: '#f59e0b', fontSize: 20 }}
                suffix="₫"
              />
            </Card>
          </Col>
        </Row>

        {/* Filters and Actions */}
        <Space 
          direction="vertical" 
          size="middle" 
          style={{ width: '100%' }}
        >
          <Space size="middle" wrap style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space wrap>
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
                style={{ width: 200 }}
              >
                <Select.Option value="all">Tất cả danh mục</Select.Option>
                {categories.map((c) => (
                  <Select.Option key={c._id} value={c._id}>
                    {c.name}
                  </Select.Option>
                ))}
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
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 150 }}
              >
                <Select.Option value="name">Sắp xếp: Tên</Select.Option>
                <Select.Option value="price">Sắp xếp: Giá</Select.Option>
                <Select.Option value="createdAt">Sắp xếp: Ngày tạo</Select.Option>
              </Select>
              <Button
                icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
              </Button>
            </Space>
            
            <Segmented
              value={viewMode}
              onChange={setViewMode}
              options={[
                { label: 'Thẻ', value: 'card', icon: <AppstoreOutlined /> },
                { label: 'Bảng', value: 'table', icon: <UnorderedListOutlined /> },
              ]}
            />
          </Space>

          {/* Bulk Actions */}
          {selectedRowKeys.length > 0 && (
            <Card size="small" style={{ background: '#e6f7ff', borderColor: '#1890ff' }}>
              <Space>
                <Text strong>{selectedRowKeys.length} món được chọn</Text>
                <Button
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleBulkUpdateAvailability(true)}
                >
                  Mở bán
                </Button>
                <Button
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleBulkUpdateAvailability(false)}
                >
                  Ngừng bán
                </Button>
                <Popconfirm
                  title={`Xóa ${selectedRowKeys.length} món ăn?`}
                  description="Hành động này không thể hoàn tác!"
                  onConfirm={handleBulkDelete}
                  okText="Xóa"
                  cancelText="Hủy"
                  okType="danger"
                >
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  >
                    Xóa
                  </Button>
                </Popconfirm>
                <Button
                  size="small"
                  onClick={() => setSelectedRowKeys([])}
                >
                  Bỏ chọn
                </Button>
              </Space>
            </Card>
          )}
        </Space>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      ) : filteredAndSortedProducts.length === 0 ? (
        <Empty
          description={
            searchText || filterCategory !== 'all' || filterAvailable !== 'all'
              ? 'Không tìm thấy món ăn nào'
              : 'Chưa có món ăn nào'
          }
        />
      ) : viewMode === 'table' ? (
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredAndSortedProducts}
          rowKey="_id"
          onChange={(paginationConfig, filters, sorter) => {
            // sorter can be an object or an array when multiple columns sorting enabled
            const s = Array.isArray(sorter) ? sorter[0] : sorter || {};
            if (!s || !s.field) {
              // cleared sorting
              setSortBy('name');
              setSortOrder('asc');
            } else {
              // Map table column field to our sortBy keys (we already use same keys)
              setSortBy(s.field);
              setSortOrder(s.order === 'ascend' ? 'asc' : 'desc');
            }

            // Keep pagination in sync
            if (paginationConfig && typeof paginationConfig.current === 'number') {
              setPagination(prev => ({ ...prev, current: paginationConfig.current, pageSize: paginationConfig.pageSize }));
            }
          }}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} món`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          scroll={{ x: 1000 }}
        />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {paginatedProducts.map((product) => (
              <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
                <ProductCard
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              </Col>
            ))}
          </Row>
          
          {/* Pagination for card view */}
          {filteredAndSortedProducts.length > pagination.pageSize && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Space direction="vertical" align="center">
                <Text type="secondary">
                  Hiển thị {((pagination.current - 1) * pagination.pageSize) + 1} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} / {pagination.total} món
                </Text>
                <Space>
                  <Button
                    disabled={pagination.current === 1}
                    onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
                  >
                    Trang trước
                  </Button>
                  <Select
                    value={pagination.current}
                    onChange={(page) => setPagination({ ...pagination, current: page })}
                    style={{ width: 100 }}
                  >
                    {Array.from({ length: Math.ceil(pagination.total / pagination.pageSize) }, (_, i) => (
                      <Select.Option key={i + 1} value={i + 1}>
                        Trang {i + 1}
                      </Select.Option>
                    ))}
                  </Select>
                  <Button
                    disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                    onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
                  >
                    Trang sau
                  </Button>
                  <Select
                    value={pagination.pageSize}
                    onChange={(pageSize) => setPagination({ ...pagination, pageSize, current: 1 })}
                    style={{ width: 120 }}
                  >
                    <Select.Option value={12}>12 / trang</Select.Option>
                    <Select.Option value={24}>24 / trang</Select.Option>
                    <Select.Option value={48}>48 / trang</Select.Option>
                  </Select>
                </Space>
              </Space>
            </div>
          )}
        </>
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
