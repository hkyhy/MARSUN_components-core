// @ts-nocheck — vendor ReactFilter JSX 无完整 Props 类型，demo 对齐上游 playground
import { Flex } from 'antd';
import React, { useState } from 'react';
import { FilterValueDisplay, type FilterValue } from '../index';

/**
 * 上游 filter-value-display.js：已选值展示与清除
 */
const FilterValueDisplayDemo: React.FC = () => {
  const [filterValue, setFilterValue] = useState<FilterValue>([
    { name: 'keyword', label: '关键词', value: { label: 'React', value: 'React' } },
    { name: 'status', label: '状态', value: { label: '已完成', value: 'completed' } },
    { name: 'amount', label: '金额', value: { label: '100-500万', value: [100, 500] } },
    {
      name: 'tags',
      label: '标签',
      value: [
        { label: '前端', value: 'frontend' },
        { label: 'React', value: 'react' },
      ],
    },
  ]);

  return (
    <Flex vertical gap={16}>
      <h4>已选筛选条件展示</h4>
      <FilterValueDisplay
        value={filterValue}
        onChange={setFilterValue}
        extraExpand={
          <span style={{ fontSize: 12, color: '#999' }}>共 {filterValue.length} 项</span>
        }
      />
      <Flex gap={8}>
        <span>当前值:</span>
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
  );
};

export default FilterValueDisplayDemo;
