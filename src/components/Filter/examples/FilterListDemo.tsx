import { CommonFilter, FilterList, type FilterListValue } from '@/components';
import React, { useState } from 'react';
import FilterLayoutPreview from './FilterLayoutPreview';

const STATUS_OPTS = [
  { label: '待处理', value: 'pending' },
  { label: '处理中', value: 'processing' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
];

const TAG_OPTS = [
  { label: '前端', value: 'fe' },
  { label: '后端', value: 'be' },
  { label: '全栈', value: 'fs' },
  { label: '设计', value: 'ui' },
];

const FilterListDemo: React.FC = () => {
  const [status, setStatus] = useState<FilterListValue>('pending');
  const [tags, setTags] = useState<FilterListValue>(['fe']);

  return (
    <FilterLayoutPreview provideLayout={false}>
      {(layout) => (
        <CommonFilter
          layoutMode={layout}
          onClearAll={() => {
            setStatus(undefined);
            setTags(undefined);
          }}
        >
          <FilterList
            filterKey="status"
            label="状态"
            single
            options={STATUS_OPTS}
            value={status}
            onChange={setStatus}
          />
          <FilterList
            filterKey="tags"
            label="标签"
            options={TAG_OPTS}
            value={tags}
            onChange={setTags}
            maxSelection={3}
          />
          <FilterList
            filterKey="tagsInline"
            label="标签(inline)"
            mode="inline"
            options={TAG_OPTS}
            value={tags}
            onChange={setTags}
          />
        </CommonFilter>
      )}
    </FilterLayoutPreview>
  );
};

export default FilterListDemo;
