import { FilterDateRange } from '@/components';
import React, { useState } from 'react';
import FilterLayoutPreview from './FilterLayoutPreview';

/**
 * FilterDateRange 日期范围筛选示例
 */
const FilterDateRangeDemo: React.FC = () => {
  const [value, setValue] = useState<[string, string] | null>(null);

  return (
    <FilterLayoutPreview>
      <FilterDateRange
        label="日期范围"
        filterKey="dateRange"
        value={value}
        onChange={setValue}
        showQuickOptions
      />
    </FilterLayoutPreview>
  );
};

export default FilterDateRangeDemo;
