import { Empty as AntEmpty, Button } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const EmptyState = ({ 
  description = 'Không có dữ liệu', 
  actionText,
  onAction,
  icon 
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '300px',
      padding: '40px 0'
    }}>
      <AntEmpty
        image={icon || <InboxOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
        imageStyle={{ height: 100 }}
        description={<span style={{ color: '#8c8c8c' }}>{description}</span>}
      >
        {actionText && onAction && (
          <Button type="primary" onClick={onAction}>
            {actionText}
          </Button>
        )}
      </AntEmpty>
    </div>
  );
};

EmptyState.propTypes = {
  description: PropTypes.string,
  actionText: PropTypes.string,
  onAction: PropTypes.func,
  icon: PropTypes.node,
};

export default EmptyState;
