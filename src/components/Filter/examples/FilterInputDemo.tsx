import { FilterInput } from '@/components';
import React, { useState } from 'react';
import FilterLayoutPreview from './FilterLayoutPreview';

/**
 * FilterInput 输入框筛选示例
 */
const FilterInputDemo: React.FC = () => {
  const [value, setValue] = useState<string | undefined>(undefined);

  return (
    <FilterLayoutPreview>
      <FilterInput
        label="指标/摘要/ID"
        filterKey="keyword"
        value={value}
        onChange={setValue}
        placeholder="请输入指标、摘要或 ID"
      />
    </FilterLayoutPreview>
  );
};

export default FilterInputDemo;
