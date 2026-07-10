import { CommonFilter, FilterDatePicker } from '@/components';
import React, { useState } from 'react';

/**
 * FilterDatePicker 单日期筛选示例（支持日 / 月 / 年粒度）
 */
const FilterDatePickerDemo: React.FC = () => {
  const [month, setMonth] = useState<string | null>('2026-07');
  const [year, setYear] = useState<string | null>('2026');
  const [date, setDate] = useState<string | null>(null);

  return (
    <CommonFilter
      onClearAll={() => {
        setMonth(null);
        setYear(null);
        setDate(null);
      }}
    >
      <FilterDatePicker
        label="月份"
        filterKey="month"
        picker="month"
        value={month}
        onChange={setMonth}
        showQuickOptions
      />
      <FilterDatePicker
        label="年份"
        filterKey="year"
        picker="year"
        value={year}
        onChange={setYear}
        showQuickOptions
      />
      <FilterDatePicker
        label="日期"
        filterKey="date"
        picker="date"
        value={date}
        onChange={setDate}
        showQuickOptions
      />
    </CommonFilter>
  );
};

export default FilterDatePickerDemo;
