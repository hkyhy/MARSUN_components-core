// @ts-nocheck — vendor ReactFilter JSX 无完整 Props 类型，demo 对齐上游 playground
import { Button, Flex, message } from 'antd';
import React, { useState } from 'react';
import { AdvancedFilter, type FilterValue } from '../index';
import ReactFilterLayoutPreview from './ReactFilterLayoutPreview';

const { InputFilterItem, ListFilterItem, CityFilterItem } = (
  AdvancedFilter as typeof AdvancedFilter & {
    fields: {
      InputFilterItem: React.ComponentType<Record<string, unknown>>;
      ListFilterItem: React.ComponentType<Record<string, unknown>>;
      CityFilterItem: React.ComponentType<Record<string, unknown>>;
    };
  }
).fields;

/**
 * 上游 advanced-filter.js：AdvancedFilter 多行布局
 */
const AdvancedFilterDemo: React.FC = () => {
  const [filterValue, setFilterValue] = useState<FilterValue>([]);

  const handleSearch = () => {
    const params: Record<string, unknown> = {};
    filterValue.forEach((item) => {
      params[item.name] = Array.isArray(item.value)
        ? item.value.map((v: { value?: unknown }) => v.value)
        : (item.value as { value?: unknown } | null | undefined)?.value;
    });
    message.info(`搜索参数: ${JSON.stringify(params, null, 2)}`);
  };

  return (
    <ReactFilterLayoutPreview>
      <Flex vertical gap={16}>
        <AdvancedFilter
          value={filterValue}
          onChange={setFilterValue}
          list={[
            [
              {
                type: InputFilterItem,
                props: {
                  name: 'name',
                  label: '姓名',
                },
              },
              {
                type: InputFilterItem,
                props: {
                  name: 'phone',
                  label: '手机号',
                },
              },
            ],
            [
              {
                type: ListFilterItem,
                props: {
                  name: 'status',
                  label: '状态',
                  single: true,
                  items: [
                    { label: '待处理', value: 'pending' },
                    { label: '处理中', value: 'processing' },
                    { label: '已完成', value: 'completed' },
                    { label: '已取消', value: 'cancelled' },
                  ],
                },
              },
            ],
            [
              {
                type: ListFilterItem,
                props: {
                  name: 'tags',
                  label: '标签',
                  single: false,
                  maxLength: 3,
                  items: [
                    { label: '前端', value: 'frontend' },
                    { label: '后端', value: 'backend' },
                    { label: '全栈', value: 'fullstack' },
                    { label: 'UI设计', value: 'ui' },
                    { label: '产品', value: 'product' },
                  ],
                },
              },
            ],
            [
              {
                type: CityFilterItem,
                props: {
                  name: 'city',
                  label: '城市',
                  maxLength: 3,
                },
              },
            ],
          ]}
        />
        <Flex justify="end">
          <Button type="primary" onClick={handleSearch}>
            查询
          </Button>
        </Flex>
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

export default AdvancedFilterDemo;
