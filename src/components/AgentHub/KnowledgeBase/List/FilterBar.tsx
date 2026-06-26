import { CommonFilter, FilterInput } from '@/components';
import React from 'react';

export interface KBFilterBarProps {
  keyword: string;
  onKeywordChange: (v: string) => void;
}

const KBFilterBar: React.FC<KBFilterBarProps> = ({ keyword, onKeywordChange }) => (
  <CommonFilter label="筛选">
    <FilterInput
      filterKey="keyword"
      label="知识库名称"
      value={keyword || undefined}
      onChange={(v) => onKeywordChange(v ?? '')}
      placeholder="搜索知识库名称"
    />
  </CommonFilter>
);

export default KBFilterBar;
