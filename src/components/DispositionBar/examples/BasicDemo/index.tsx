import { DispositionBar } from '@/components';
import { Button, Space } from 'antd';
import React from 'react';

/** DispositionBar 布局壳：左状态 + 右操作注入 */
const BasicDemo: React.FC = () => (
  <Space direction="vertical" size="large" style={{ width: '100%' }}>
    <DispositionBar
      statusBadge="未处置"
      actions={
        <>
          <Button type="primary" size="small">
            认领
          </Button>
          <Button size="small">分配</Button>
        </>
      }
    />
    <DispositionBar
      statusBadge="加载中…"
      statusLoading
      actions={<Button size="small">认领</Button>}
    />
    <DispositionBar statusBadge="已关闭" />
  </Space>
);

export default BasicDemo;
