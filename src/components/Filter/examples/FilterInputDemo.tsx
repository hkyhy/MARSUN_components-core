import { FilterInput } from '@/components';
import React, { useState } from 'react';

/**
 * FilterInput 输入框筛选示例
 */
const FilterInputDemo: React.FC = () => {
  const [value, setValue] = useState<string | undefined>(undefined);

  return (
    <FilterInput
      label="关键词"
      filterKey="keyword"
      value={value}
      onChange={setValue}
      placeholder="请输入搜索关键词"
    />
  );
};

export default FilterInputDemo;
