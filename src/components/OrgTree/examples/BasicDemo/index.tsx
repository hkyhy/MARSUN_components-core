import OrgTree, { type OrgTreeNode } from '@/components/OrgTree';
import { message } from 'antd';
import React, { useState } from 'react';

const INITIAL: OrgTreeNode[] = [
  {
    id: '1',
    name: '华茂集团',
    parentId: null,
    children: [
      {
        id: '1-1',
        name: '纺纱事业部',
        parentId: '1',
        nameExtra: 'mapped',
        children: [{ id: '1-1-1', name: '一车间', parentId: '1-1' }],
      },
      { id: '1-2', name: '织造事业部', parentId: '1' },
    ],
  },
];

/** OrgTree：默认展开 + 节点操作 */
const BasicDemo: React.FC = () => {
  const [nodes] = useState(INITIAL);

  return (
    <OrgTree
      nodes={nodes}
      editable
      onAdd={(parentId) => message.info(`添加子节点 parent=${parentId}`)}
      onEdit={(n) => message.info(`编辑 ${n.name}`)}
      onDelete={async (n) => {
        message.success(`已删除 ${n.name}（演示）`);
      }}
    />
  );
};

export default BasicDemo;
