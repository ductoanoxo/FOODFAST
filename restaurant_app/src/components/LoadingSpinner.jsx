import { Spin } from 'antd';
import PropTypes from 'prop-types';

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

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'default', 'large']),
  tip: PropTypes.string,
};

export default LoadingSpinner;
