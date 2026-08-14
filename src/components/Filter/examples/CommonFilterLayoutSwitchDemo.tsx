import {
  CommonFilter,
  FilterInput,
  FilterNumberRange,
  FilterSelect,
  type FilterSelectValue,
} from '@/components';
import React, { useState } from 'react';
import FilterLayoutPreview from './FilterLayoutPreview';
import { DEPT_OPTIONS, STATUS_OPTIONS } from './mock';

/**
 * 同一组筛选项下 PC / Mobile 布局切换（Segmented → layoutMode）。
 */
const CommonFilterLayoutSwitchDemo: React.FC = () => {
  const [status, setStatus] = useState<FilterSelectValue>('passed');
  const [dept, setDept] = useState<FilterSelectValue>(undefined);
  const [keyword, setKeyword] = useState<string | undefined>('指标');
  const [score, setScore] = useState<[number | undefined, number | undefined] | null>([60, 90]);

  return (
    <FilterLayoutPreview provideLayout={false}>
      {(layout) => (
        <CommonFilter
          layoutMode={layout}
          onClearAll={() => {
            setStatus(undefined);
            setDept(undefined);
            setKeyword(undefined);
            setScore(null);
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
          <FilterInput
            label="指标/摘要/ID"
            filterKey="keyword"
            value={keyword}
            onChange={setKeyword}
          />
          <FilterNumberRange
            label="评分范围"
            filterKey="score"
            value={score}
            onChange={setScore}
            unit="分"
          />
        </CommonFilter>
      )}
    </FilterLayoutPreview>
  );
};

export default CommonFilterLayoutSwitchDemo;
