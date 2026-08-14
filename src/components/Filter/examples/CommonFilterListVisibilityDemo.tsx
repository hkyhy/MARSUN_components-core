import { CommonFilter, FilterInput, FilterSelect, type FilterSelectValue } from '@/components';
import React, { useMemo, useState } from 'react';
import FilterLayoutPreview from './FilterLayoutPreview';
import { CATEGORY_OPTIONS, STATUS_OPTIONS } from './mock';

/**
 * list 模式：用 hidden / display 按条件隐藏筛选项（勿用条件 push 不同数组）
 */
const CommonFilterListVisibilityDemo: React.FC = () => {
  const [category, setCategory] = useState<FilterSelectValue>('ai');
  const [status, setStatus] = useState<FilterSelectValue>(undefined);
  const [level, setLevel] = useState<FilterSelectValue>(undefined);
  const [keyword, setKeyword] = useState<string | undefined>(undefined);

  const filterList = useMemo(
    () => [
      <FilterSelect
        key="category"
        filterKey="category"
        label="任务分类"
        options={CATEGORY_OPTIONS}
        value={category}
        onChange={setCategory}
      />,
      <FilterInput
        key="keyword"
        filterKey="keyword"
        label="文件名"
        value={keyword}
        onChange={setKeyword}
      />,
      <FilterSelect
        key="status"
        filterKey="status"
        label="任务状态"
        options={STATUS_OPTIONS}
        value={status}
        onChange={setStatus}
      />,
      <FilterSelect
        key="level"
        filterKey="level"
        label="质量等级"
        options={[
          { label: 'A', value: 'A' },
          { label: 'B', value: 'B' },
        ]}
        value={level}
        onChange={setLevel}
        hidden={category === 'storage'}
      />,
    ],
    [category, keyword, status, level],
  );

  return (
    <FilterLayoutPreview provideLayout={false}>
      {(layout) => (
        <CommonFilter
          layoutMode={layout}
          label="筛选"
          list={filterList}
          onClearAll={() => {
            setStatus(undefined);
            setLevel(undefined);
            setKeyword(undefined);
          }}
        />
      )}
    </FilterLayoutPreview>
  );
};

export default CommonFilterListVisibilityDemo;
