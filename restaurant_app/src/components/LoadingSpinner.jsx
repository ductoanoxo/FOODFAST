import { Spin } from 'antd';

const LoadingSpinner = ({ size = 'large', tip = 'Đang tải...' }) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '300px',
      flexDirection: 'column',
      gap: 16
    }}>
      <Spin size={size} />
      {tip && <p style={{ color: '#8c8c8c' }}>{tip}</p>}
    </div>
  );
};

export default LoadingSpinner;
