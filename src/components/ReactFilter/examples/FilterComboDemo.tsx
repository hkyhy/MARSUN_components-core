// @ts-nocheck — vendor ReactFilter JSX 无完整 Props 类型，demo 对齐上游 playground
import { Button, Flex, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import Filter, { fields, getFilterValue, type FilterValue } from '../index';
import ReactFilterLayoutPreview from './ReactFilterLayoutPreview';

const {
  InputFilterItem,
  NumberRangeFilterItem,
  DatePickerFilterItem,
  DateRangePickerFilterItem,
  TypeDateRangePickerFilterItem,
  SuperSelectFilterItem,
  SelectFunctionFilterItem,
  SelectIndustryFilterItem,
  SelectAddressFilterItem,
} = fields;

const departmentOptions = [
  { value: 'tech', label: '技术研发部' },
  { value: 'product', label: '产品设计部' },
  { value: 'operation', label: '运营管理部' },
  { value: 'hr', label: '人力资源部' },
  { value: 'finance', label: '财务部' },
  { value: 'marketing', label: '市场营销部' },
];

const filterList = [
  {
    type: InputFilterItem,
    props: { name: 'keyword', label: '关键词', placeholder: '请输入关键词搜索' },
  },
  {
    type: NumberRangeFilterItem,
    props: { name: 'amount', label: '金额', unit: '元', min: 0, max: 999999 },
  },
  {
    type: DatePickerFilterItem,
    props: { name: 'createTime', label: '创建时间', format: 'YYYY-MM-DD' },
  },
  {
    type: DateRangePickerFilterItem,
    props: { name: 'dateRange', label: '日期范围', format: 'YYYY-MM-DD' },
  },
  {
    type: TypeDateRangePickerFilterItem,
    props: { name: 'typeDateRange', label: '快捷日期' },
  },
  {
    type: SuperSelectFilterItem,
    props: { name: 'department', label: '部门', options: departmentOptions },
  },
  {
    type: SelectFunctionFilterItem,
    props: { name: 'function', label: '职能' },
  },
  {
    type: SelectIndustryFilterItem,
    props: { name: 'industry', label: '行业' },
  },
  {
    type: SelectAddressFilterItem,
    props: { name: 'city', label: '城市' },
  },
];

const ContainerWidthIndicator: React.FC<{
  containerRef: React.RefObject<HTMLDivElement | null>;
}> = ({ containerRef }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const update = () => setWidth(Math.round(el.clientWidth));
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  return (
    <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
      中间容器宽度: {width}px（观察收起/更多时是否持续增大或跳动）
    </div>
  );
};

/**
 * 上游 base.js：多字段组合 + 左右操作区布局
 */
const FilterComboDemo: React.FC = () => {
  const [filterValue, setFilterValue] = useState<FilterValue>([]);
  const filterContainerRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    const params = getFilterValue(filterValue);
    message.info(`搜索参数: ${JSON.stringify(params, null, 2)}`);
  };

  return (
    <ReactFilterLayoutPreview>
      <Flex vertical gap={16} style={{ width: '100%' }}>
        <div style={{ width: '100%' }}>
          <ContainerWidthIndicator containerRef={filterContainerRef} />
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <Button>左侧操作</Button>
            <div
              ref={filterContainerRef}
              style={{
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                border: '1px dashed #d9d9d9',
                borderRadius: 4,
              }}
            >
              <Filter value={filterValue} onChange={setFilterValue} list={filterList} />
            </div>
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
          </div>
        </div>
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

export default FilterComboDemo;
