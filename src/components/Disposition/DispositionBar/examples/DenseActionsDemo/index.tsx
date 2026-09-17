import { DispositionBar } from '@/components';
import { Button } from 'antd';
import React from 'react';

/** 多操作钮：认领 / 分配 / 跟进 / RCA / 关闭 */
const DenseActionsDemo: React.FC = () => (
  <DispositionBar
    statusBadge="跟进中"
    actions={
      <>
        <Button type="primary" size="small">
          认领
        </Button>
        <Button size="small">分配</Button>
        <Button size="small">跟进</Button>
        <Button size="small">发起 RCA</Button>
        <Button size="small" danger>
          关闭
        </Button>
      </>
    }
  />
);

export default DenseActionsDemo;
