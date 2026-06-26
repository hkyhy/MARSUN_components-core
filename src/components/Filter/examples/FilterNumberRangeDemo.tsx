import { FilterNumberRange } from '@/components';
import React, { useState } from 'react';

/**
 * FilterNumberRange 数字范围筛选示例
 */
const FilterNumberRangeDemo: React.FC = () => {
  const [value, setValue] = useState<[number | undefined, number | undefined] | null>(null);

  return (
    <FilterNumberRange
      label="评分范围"
      filterKey="score"
      value={value}
      onChange={setValue}
      unit="分"
    />
  );
};

export default FilterNumberRangeDemo;
