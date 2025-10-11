import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const ErrorBoundary = ({ error, resetError }) => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <Result
        status="error"
        title="Có lỗi xảy ra"
        subTitle={error?.message || 'Vui lòng thử lại sau'}
        extra={[
          <Button type="primary" key="home" onClick={() => navigate('/dashboard')}>
            Về trang chủ
          </Button>,
          <Button key="retry" onClick={resetError}>
            Thử lại
          </Button>,
        ]}
      />
    </div>
  );
};

export default ErrorBoundary;
