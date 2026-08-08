// @ts-nocheck — vendor ReactFilter JSX 无完整 Props 类型，demo 对齐上游 playground
import { Button, Flex, Typography, message } from 'antd';
import React, { useState } from 'react';
import { FilterProvider, SearchInput, getFilterValue, type FilterValue } from '../index';
import ReactFilterLayoutPreview from './ReactFilterLayoutPreview';

/**
 * 上游 search-input.js：SearchInput + FilterProvider
 */
const SearchInputDemo: React.FC = () => {
  const [filterValue, setFilterValue] = useState<FilterValue>([]);

  const handleSearch = () => {
    const params = getFilterValue(filterValue);
    message.info(`搜索参数: ${JSON.stringify(params)}`);
  };

  return (
    <ReactFilterLayoutPreview>
      <Flex vertical gap={16}>
        <Typography.Title level={4}>SearchInput 搜索输入</Typography.Title>
        <Typography.Paragraph style={{ margin: 0 }}>
          输入停止 500ms
          后自动写入筛选值并触发搜索；中文等输入法组合输入期间不会触发搜索，确认文本后才开始计时。按回车或点击搜索按钮会立即提交。
          清空后也会在 500ms 后移除该筛选条件。
        </Typography.Paragraph>
        <FilterProvider value={filterValue} onChange={setFilterValue}>
          <Flex gap={8} align="center">
            <SearchInput
              name="keyword"
              label="关键词"
              placeholder="请输入关键词"
              style={{ width: 320 }}
              allowClear
            />
            <Button type="primary" onClick={handleSearch}>
              查看搜索参数
            </Button>
          </Flex>
        </FilterProvider>
        <Flex gap={8}>
          <span>当前筛选值:</span>
          <pre
            style={{
              margin: 0,
              background: '#f5f5f5',
              padding: 8,
              borderRadius: 4,
              flex: 1,
            }}
          >
            {JSON.stringify(filterValue, null, 2)}
          </pre>
        </Flex>
      </Flex>
    </ReactFilterLayoutPreview>
  );
};

export default SearchInputDemo;
