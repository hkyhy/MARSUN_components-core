import { CommonFilter, FilterTreeSelect } from '@/components';
import type { TreeFilterNode } from '@/components/Filter/FilterTreeSelect';
import treeDataRaw from '@/components/Filter/doc/tree-filter.mock.json';
import React, { useState } from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

const MOCK_ORG: TreeFilterNode[] = treeDataRaw as TreeFilterNode[];

/** 质量分析主对标：分厂 → 品种（leafOnly 级联） */
const MOCK_FACTORY_VARIETY: TreeFilterNode[] = [
  {
    id: 'factory::1001',
    name: '一分厂',
    children: [
      { id: '1001@@JCF14.6KD@@', name: 'JCF14.6KD' },
      { id: '1001@@JCF11.4D@@', name: 'JCF11.4D' },
      { id: '1001@@JC40S@@', name: 'JC40S' },
    ],
  },
  {
    id: 'factory::1050',
    name: '五分厂',
    children: [
      { id: '1050@@JCF14.8KD@@', name: 'JCF14.8KD' },
      { id: '1050@@JCF14.6KD@@', name: 'JCF14.6KD' },
    ],
  },
  {
    id: 'factory::1080',
    name: '八分厂',
    children: [{ id: '1080@@JCF14.5KD@@', name: 'JCF14.5KD' }],
  },
];

const FilterTreeSelectDemo: React.FC = () => {
  const [org, setOrg] = useState<string | undefined>(undefined);
  const [primary, setPrimary] = useState<string | undefined>(undefined);
  const [compare, setCompare] = useState<string[]>([]);

  return (
    <div
      className={classNames('filter-tree-select-demo-root', styles['filter-tree-select-demo-root'])}
    >
      <p className={styles['filter-tree-select-demo-hint']}>
        分厂→品种级联（leafOnly）：父节点只展开，只能选品种叶子；主对标单选 / 对比多选。
      </p>
      <CommonFilter label="筛选">
        <FilterTreeSelect
          label="主对标分厂×品种"
          filterKey="primary-plant"
          treeData={MOCK_FACTORY_VARIETY}
          value={primary}
          onChange={(v) => setPrimary(typeof v === 'string' ? v : undefined)}
          showSearch
          leafOnly
          getNodeLabel={(n) => {
            if (n.id.startsWith('factory::')) return n.name;
            const factory = MOCK_FACTORY_VARIETY.find((f) =>
              f.children?.some((c) => c.id === n.id),
            );
            return factory ? `${factory.name} · ${n.name}` : n.name;
          }}
        />
        <FilterTreeSelect
          label="对比分厂×品种"
          filterKey="compare-plants"
          treeData={MOCK_FACTORY_VARIETY}
          value={compare}
          onChange={(v) => setCompare(Array.isArray(v) ? v : [])}
          showSearch
          multiple
          leafOnly
        />
      </CommonFilter>

      <p className={styles['filter-tree-select-demo-hint']}>组织树（普通树选，可选任意节点）</p>
      <FilterTreeSelect
        label="组织"
        filterKey="org"
        value={org}
        onChange={(v) => setOrg(typeof v === 'string' ? v : undefined)}
        treeData={MOCK_ORG}
      />
      <FilterTreeSelect
        label="组织(搜索)"
        filterKey="org-search"
        value={org}
        onChange={(v) => setOrg(typeof v === 'string' ? v : undefined)}
        treeData={MOCK_ORG}
        showSearch
      />
    </div>
  );
};

export default FilterTreeSelectDemo;
