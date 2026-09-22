import { ButtonGroup, DispositionBar } from '@/components';
import React from 'react';

/** 多操作：用 core ButtonGroup；unavailable 项不渲染（不置灰占位）；不传 showLength → 按容器宽「⋯」 */
const DenseActionsDemo: React.FC = () => (
  <DispositionBar
    statusBadge="跟进中"
    actions={
      <ButtonGroup
        list={[
          { children: '认领', type: 'primary', size: 'small', unavailable: true },
          { children: '下发任务', type: 'default', size: 'small', unavailable: true },
          { children: '关闭/暂缓', type: 'default', size: 'small', onClick: () => undefined },
          { children: '查看根因分析', type: 'default', size: 'small', onClick: () => undefined },
        ]}
      />
    }
  />
);

export default DenseActionsDemo;
