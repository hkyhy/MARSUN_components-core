import { FilterDateRange } from '@/components';
import React, { useState } from 'react';

/**
 * FilterDateRange 日期范围筛选示例
 */
const FilterDateRangeDemo: React.FC = () => {
  const [value, setValue] = useState<[string, string] | null>(null);

  return (
    <FilterDateRange
      label="日期范围"
      filterKey="dateRange"
      value={value}
      onChange={setValue}
      showQuickOptions
    />
  );
};

export default FilterDateRangeDemo;
