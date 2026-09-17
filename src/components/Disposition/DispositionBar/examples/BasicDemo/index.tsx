import { DispositionBar } from '@/components';
import { Button } from 'antd';
import React from 'react';

/** 默认：左状态 + 右操作注入 */
const BasicDemo: React.FC = () => (
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
);

export default BasicDemo;
