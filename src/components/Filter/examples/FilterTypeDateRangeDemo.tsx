import { FilterTypeDateRange, type FilterTypeDateRangeValue } from '@/components';
import React, { useState } from 'react';
import FilterLayoutPreview from './FilterLayoutPreview';

const FilterTypeDateRangeDemo: React.FC = () => {
  const [value, setValue] = useState<FilterTypeDateRangeValue>(null);

  return (
    <FilterLayoutPreview>
      <FilterTypeDateRange
        filterKey="typedRange"
        label="时间范围"
        value={value}
        onChange={setValue}
      />
    </FilterLayoutPreview>
  );
};

export default FilterTypeDateRangeDemo;
