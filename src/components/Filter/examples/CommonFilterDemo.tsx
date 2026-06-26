import {
  CommonFilter,
  FilterDateRange,
  FilterInput,
  FilterNumberRange,
  FilterSelect,
} from '@/components';
import React, { useState } from 'react';
import { DEPT_OPTIONS, STATUS_OPTIONS } from './mock';

const CommonFilterDemo: React.FC = () => {
  const [status, setStatus] = useState<string | number | undefined>(undefined);
  const [dept, setDept] = useState<string | number | undefined>(undefined);
  const [keyword, setKeyword] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [scoreRange, setScoreRange] = useState<[number | undefined, number | undefined] | null>(
    null,
  );

  return (
    <CommonFilter
      onClearAll={() => {
        setStatus(undefined);
        setDept(undefined);
        setKeyword(undefined);
        setDateRange(null);
        setScoreRange(null);
      }}
    >
      <FilterSelect
        label="状态"
        filterKey="status"
        options={STATUS_OPTIONS}
        value={status}
        onChange={setStatus}
      />
      <FilterSelect
        label="部门"
        filterKey="dept"
        options={DEPT_OPTIONS}
        value={dept}
        onChange={setDept}
        searchable
      />
      <FilterInput label="关键词" filterKey="keyword" value={keyword} onChange={setKeyword} />
      <FilterDateRange label="日期" filterKey="date" value={dateRange} onChange={setDateRange} />
      <FilterNumberRange
        label="评分"
        filterKey="score"
        value={scoreRange}
        onChange={setScoreRange}
        unit="分"
      />
    </CommonFilter>
  );
};

export default CommonFilterDemo;
