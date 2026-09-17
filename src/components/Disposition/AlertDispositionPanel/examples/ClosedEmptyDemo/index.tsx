import { AlertDispositionPanel, DispositionBar } from '@/components';
import { Space, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

/** open=false / context=null → 不渲染（空态） */
const ClosedEmptyDemo: React.FC = () => (
  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
    <div>
      <Text type="secondary">open=false：</Text>
      <AlertDispositionPanel open={false} context={{ kind: 'warn', label: '预警' }}>
        <DispositionBar statusBadge="不应出现" />
      </AlertDispositionPanel>
      <Text type="secondary">（上方无面板）</Text>
    </div>
    <div>
      <Text type="secondary">context=null：</Text>
      <AlertDispositionPanel open context={null}>
        <DispositionBar statusBadge="不应出现" />
      </AlertDispositionPanel>
      <Text type="secondary">（上方无面板）</Text>
    </div>
  </Space>
);

export default ClosedEmptyDemo;
