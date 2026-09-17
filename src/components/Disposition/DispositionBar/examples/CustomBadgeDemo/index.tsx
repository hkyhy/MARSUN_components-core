import { DispositionBar } from '@/components';
import { Button, Tag } from 'antd';
import React from 'react';

/** statusBadge 传 ReactNode（自定义徽章） */
const CustomBadgeDemo: React.FC = () => (
  <DispositionBar
    statusBadge={
      <Tag color="warning" style={{ margin: 0 }}>
        待分配
      </Tag>
    }
    actions={
      <>
        <Button type="primary" size="small">
          分配
        </Button>
        <Button size="small">认领</Button>
      </>
    }
  />
);

export default CustomBadgeDemo;
