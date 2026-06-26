import { FilterTreeSelect } from '@/components';
import type { TreeFilterNode } from '@/components/Filter/FilterTreeSelect';
import treeDataRaw from '@/components/Filter/doc/tree-filter.mock.json';
import React, { useState } from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

const MOCK_TREE: TreeFilterNode[] = treeDataRaw as TreeFilterNode[];

const FilterTreeSelectDemo: React.FC = () => {
  const [value, setValue] = useState<string | undefined>(undefined);

  const handleChange = (v: string | string[] | undefined) => {
    setValue(typeof v === 'string' ? v : undefined);
  };

  return (
    <div className={classNames('filter-tree-select-demo-root', styles['filter-tree-select-demo-root'])}>
      <FilterTreeSelect
        label="组织"
        filterKey="org"
        value={value}
        onChange={handleChange}
        treeData={MOCK_TREE}
      />
      <FilterTreeSelect
        label="组织(搜索)"
        filterKey="org-search"
        value={value}
        onChange={handleChange}
        treeData={MOCK_TREE}
        showSearch
      />
    </div>
  );
};

export default FilterTreeSelectDemo;
