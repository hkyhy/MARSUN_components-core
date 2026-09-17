import { DispositionBar } from '@/components';
import { Button } from 'antd';
import React from 'react';

/** 自定义左侧 label */
const CustomLabelDemo: React.FC = () => (
  <DispositionBar
    label="当前处置"
    statusBadge="跟进中"
    actions={
      <>
        <Button size="small">继续跟进</Button>
        <Button size="small">关闭</Button>
      </>
    }
  />
);

export default CustomLabelDemo;
