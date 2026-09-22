import { ButtonGroup } from '@/components';
import React from 'react';

const BasicDemo: React.FC = () => (
  <ButtonGroup
    moreType="link"
    list={[
      { children: '编辑', type: 'link', onClick: () => undefined },
      {
        children: '删除',
        type: 'link',
        isDelete: true,
        message: '确定删除？',
        onClick: () => undefined,
      },
    ]}
  />
);

export default BasicDemo;
