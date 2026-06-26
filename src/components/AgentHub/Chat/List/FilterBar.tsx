import { CommonFilter, FilterInput } from '@/components';
import React from 'react';

export interface ChatFilterBarProps {
  keyword: string;
  onKeywordChange: (v: string) => void;
}

const ChatFilterBar: React.FC<ChatFilterBarProps> = ({ keyword, onKeywordChange }) => (
  <CommonFilter label="筛选">
    <FilterInput
      filterKey="keyword"
      label="助手名称"
      value={keyword || undefined}
      onChange={(v) => onKeywordChange(v ?? '')}
      placeholder="搜索助手名称"
    />
  </CommonFilter>
);

export default ChatFilterBar;
