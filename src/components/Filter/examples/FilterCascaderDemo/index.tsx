import { CommonFilter, FilterCascader } from '@/components';
import type { TreeFilterNode } from '@/components';
import React, { useState } from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

/** 质量分析主对标：分厂 → 品种（leafOnly 级联路径） */
const MOCK_FACTORY_VARIETY: TreeFilterNode[] = [
  {
    id: '1001',
    name: '一分厂',
    children: [
      { id: '1001@@JCF14.6KD@@', name: 'JCF14.6KD' },
      { id: '1001@@JCF11.4D@@', name: 'JCF11.4D' },
      { id: '1001@@JC40S@@', name: 'JC40S' },
    ],
  },
  {
    id: '1050',
    name: '五分厂',
    children: [
      { id: '1050@@JCF14.8KD@@', name: 'JCF14.8KD' },
      { id: '1050@@JCF14.6KD@@', name: 'JCF14.6KD' },
    ],
  },
  {
    id: '1080',
    name: '八分厂',
    children: [{ id: '1080@@JCF14.5KD@@', name: 'JCF14.5KD' }],
  },
];

const FilterCascaderDemo: React.FC = () => {
  const [primary, setPrimary] = useState<string | undefined>(undefined);
  const [primaryPath, setPrimaryPath] = useState<string[] | undefined>(undefined);
  const [compare, setCompare] = useState<string[]>([]);
  const [comparePaths, setComparePaths] = useState<string[][] | undefined>(undefined);

  return (
    <div className={classNames('filter-cascader-demo-root', styles['filter-cascader-demo-root'])}>
      <p className={styles['filter-cascader-demo-hint']}>
        FilterCascader：分厂→品种两列路径；leafOnly 时 Trigger/已选区只显示品种叶子；onChangePath
        可取 path[0] 作为分厂 Code。对比 dependsOn 主对标。
      </p>
      <CommonFilter label="筛选">
        <FilterCascader
          label="主对标分厂×品种"
          filterKey="primaryPlant"
          treeData={MOCK_FACTORY_VARIETY}
          value={primary}
          onChange={(v) => setPrimary(typeof v === 'string' ? v : undefined)}
          onChangePath={(p) => {
            if (!p) {
              setPrimaryPath(undefined);
              return;
            }
            setPrimaryPath(Array.isArray(p[0]) ? undefined : (p as string[]));
          }}
          showSearch
          leafOnly
        />
        <FilterCascader
          label="对比分厂×品种"
          filterKey="comparePlants"
          dependsOn={['primaryPlant']}
          treeData={MOCK_FACTORY_VARIETY}
          value={compare}
          onChange={(v) => setCompare(Array.isArray(v) ? v : [])}
          onChangePath={(p) => {
            if (!p) {
              setComparePaths(undefined);
              return;
            }
            setComparePaths(Array.isArray(p[0]) ? (p as string[][]) : undefined);
          }}
          showSearch
          multiple
          leafOnly
        />
      </CommonFilter>
      <p className={styles['filter-cascader-demo-hint']}>
        主对标叶子：{primary || '—'}；路径：{primaryPath?.join(' / ') || '—'}；分厂 Code：
        {primaryPath?.[0] || '—'}
      </p>
      <p className={styles['filter-cascader-demo-hint']}>
        对比叶子数：{compare.length}；路径数：{comparePaths?.length ?? 0}
      </p>
    </div>
  );
};

export default FilterCascaderDemo;
