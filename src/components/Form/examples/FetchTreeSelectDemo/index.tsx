import FetchTreeSelect from '@/components/Form/FetchTreeSelect';
import type { TreeNodeOption } from '@/components/Form/FetchTreeSelect';
import treeDataRaw from '@/components/Filter/doc/tree-filter.mock.json';
import React, { useState } from 'react';
import styles from './style.module.scss';

function toTreeNodes(
  nodes: { id: string; name: string; children?: { id: string; name: string }[] }[],
): TreeNodeOption[] {
  return nodes.map((n) => ({
    value: n.id,
    key: n.id,
    title: n.name,
    children: n.children ? toTreeNodes(n.children) : undefined,
  }));
}

const treeData = toTreeNodes(
  treeDataRaw as { id: string; name: string; children?: { id: string; name: string }[] }[],
);

/** FetchTreeSelect：props 模式树数据 */
const FetchTreeSelectDemo: React.FC = () => {
  const [value, setValue] = useState<string>();

  return (
    <div className={styles['fetch-tree-select-demo']}>
      <FetchTreeSelect
        style={{ width: 280 }}
        placeholder="选择节点"
        treeData={treeData}
        value={value}
        onChange={setValue}
        treeDefaultExpandAll
        allowClear
      />
      <p className={styles['fetch-tree-select-demo-hint']}>当前值：{value ?? '（未选择）'}</p>
    </div>
  );
};

export default FetchTreeSelectDemo;
