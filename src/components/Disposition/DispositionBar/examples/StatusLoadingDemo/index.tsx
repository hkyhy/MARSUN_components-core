import { DispositionBar } from '@/components';
import { Button } from 'antd';
import React from 'react';

/** statusLoading：只显示状态，不渲染 actions */
const StatusLoadingDemo: React.FC = () => (
  <DispositionBar
    statusBadge="加载中…"
    statusLoading
    actions={<Button size="small">认领</Button>}
  />
);

export default StatusLoadingDemo;
