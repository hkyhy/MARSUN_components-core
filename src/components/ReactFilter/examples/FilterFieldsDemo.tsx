// @ts-nocheck — vendor ReactFilter JSX 无完整 Props 类型，demo 对齐上游 playground
import { Divider, Flex, Select, Tag } from 'antd';
import React, { useState } from 'react';
import { PopoverItem, fields } from '../index';
import ReactFilterLayoutPreview from './ReactFilterLayoutPreview';

const {
  InputFilterItem,
  NumberRangeFilterItem,
  DatePickerFilterItem,
  DateRangePickerFilterItem,
  TypeDateRangePickerFilterItem,
  SuperSelectFilterItem,
  SelectTableListFilterItem,
  SelectTreeFilterItem,
  SelectCascaderFilterItem,
  SelectFunctionFilterItem,
  SelectIndustryFilterItem,
  SelectAddressFilterItem,
} = fields;

type FieldValueMap = Record<string, unknown>;

/** 自定义下拉选择筛选项（PopoverItem + antd Select） */
const SelectFilterItem: React.FC<{
  label: string;
  value?: { label?: string; value?: string } | null;
  onChange?: (val: { label: string; value: string } | null) => void;
  options?: { value: string; label: string }[];
}> = ({ label, value, onChange, options = [] }) => {
  return (
    <PopoverItem label={label} value={value} onChange={onChange}>
      {({ value: innerValue, onChange: innerOnChange }) => (
        <Select
          style={{ width: 200 }}
          placeholder={`请选择${label}`}
          value={innerValue?.value}
          onChange={(val, option) => {
            const opt = option as { label?: string } | undefined;
            innerOnChange({
              value: val,
              label: opt?.label || val,
            });
          }}
          options={options}
        />
      )}
    </PopoverItem>
  );
};

const FilterFieldsExample: React.FC = () => {
  const [values, setValues] = useState<FieldValueMap>({});

  const fieldConfigs = [
    {
      name: 'input',
      label: '输入筛选',
      component: InputFilterItem,
      props: {},
    },
    {
      name: 'numberRange',
      label: '数字区间',
      component: NumberRangeFilterItem,
      props: { unit: '万', min: 0 },
    },
    {
      name: 'date',
      label: '日期选择',
      component: DatePickerFilterItem,
      props: { picker: 'date' },
    },
    {
      name: 'month',
      label: '月份选择',
      component: DatePickerFilterItem,
      props: { picker: 'month' },
    },
    {
      name: 'dateRange',
      label: '日期范围',
      component: DateRangePickerFilterItem,
      props: {},
    },
    {
      name: 'typeDateRange',
      label: '类型日期范围',
      component: TypeDateRangePickerFilterItem,
      props: {},
    },
    {
      name: 'select',
      label: '下拉选择',
      component: SelectFilterItem,
      props: {
        options: [
          { value: 'pending', label: '待处理' },
          { value: 'processing', label: '处理中' },
          { value: 'completed', label: '已完成' },
          { value: 'cancelled', label: '已取消' },
        ],
      },
    },
  ];

  return (
    <Flex vertical gap={24}>
      <h4>筛选字段组件展示</h4>
      <Flex wrap gap={16}>
        {fieldConfigs.map(({ name, label, component: Component, props }) => (
          <Component
            key={name}
            label={label}
            value={values[name]}
            onChange={(val: unknown) => setValues((prev) => ({ ...prev, [name]: val }))}
            {...props}
          />
        ))}
      </Flex>
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
          {JSON.stringify(values, null, 2)}
        </pre>
      </Flex>
    </Flex>
  );
};

const departmentOptions = [
  { value: 'tech', label: '技术研发部' },
  { value: 'product', label: '产品设计部' },
  { value: 'operation', label: '运营管理部' },
  { value: 'hr', label: '人力资源部' },
  { value: 'finance', label: '财务部' },
  { value: 'marketing', label: '市场营销部' },
];

const SuperSelectExample: React.FC = () => {
  const [values, setValues] = useState<FieldValueMap>({});

  return (
    <Flex vertical gap={24}>
      <Flex align="center" gap={8}>
        <h4 style={{ margin: 0 }}>SuperSelect 业务选择器</h4>
        <Tag color="blue">单选/多选</Tag>
        <Tag color="blue">搜索</Tag>
        <Tag color="blue">全选</Tag>
      </Flex>
      <p style={{ margin: 0, color: '#666', fontSize: 12 }}>
        基于 @kne/super-select 的通用选择器筛选项，支持单选/多选、搜索、全选等功能
      </p>
      <Flex wrap gap={16}>
        <SuperSelectFilterItem
          label="部门（多选）"
          value={values.dept}
          onChange={(val: unknown) => setValues((prev) => ({ ...prev, dept: val }))}
          options={departmentOptions}
        />
        <SuperSelectFilterItem
          label="状态（单选）"
          single
          value={values.status}
          onChange={(val: unknown) => setValues((prev) => ({ ...prev, status: val }))}
          options={[
            { value: 'active', label: '启用' },
            { value: 'inactive', label: '停用' },
          ]}
        />
        <SuperSelectFilterItem
          label="角色（全选）"
          value={values.role}
          onChange={(val: unknown) => setValues((prev) => ({ ...prev, role: val }))}
          options={[
            { value: 'admin', label: '管理员' },
            { value: 'editor', label: '编辑者' },
            { value: 'viewer', label: '查看者' },
          ]}
          allowSelectedAll
        />
      </Flex>
      <pre style={{ margin: 0, background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
        {JSON.stringify(values, null, 2)}
      </pre>
    </Flex>
  );
};

const employeeOptions = [
  { id: 'emp_1', name: '张三', department: '技术研发部', position: '工程师' },
  { id: 'emp_2', name: '李四', department: '产品设计部', position: '设计师' },
  { id: 'emp_3', name: '王五', department: '运营部', position: '经理' },
  { id: 'emp_4', name: '赵六', department: '市场部', position: '专员' },
  { id: 'emp_5', name: '钱七', department: '技术研发部', position: '工程师' },
];

const employeeColumns = [
  { name: 'name', title: '姓名', span: 8 },
  { name: 'department', title: '部门', span: 8 },
  { name: 'position', title: '职位', span: 8 },
];

const organizationTree = [
  { id: 'root', parentId: null, name: '集团总部' },
  { id: 'tech', parentId: 'root', name: '技术中心' },
  { id: 'tech-fe', parentId: 'tech', name: '前端开发组' },
  { id: 'tech-be', parentId: 'tech', name: '后端开发组' },
  { id: 'product', parentId: 'root', name: '产品中心' },
  { id: 'product-design', parentId: 'product', name: '产品设计组' },
];

const regionData = [
  {
    id: 'beijing',
    name: '北京市',
    children: [
      { id: 'haidian', name: '海淀区' },
      { id: 'chaoyang', name: '朝阳区' },
    ],
  },
  {
    id: 'guangdong',
    name: '广东省',
    children: [
      {
        id: 'guangzhou',
        name: '广州市',
        children: [
          { id: 'tianhe', name: '天河区' },
          { id: 'yuexiu', name: '越秀区' },
        ],
      },
      {
        id: 'shenzhen',
        name: '深圳市',
        children: [
          { id: 'nanshan', name: '南山区' },
          { id: 'futian', name: '福田区' },
        ],
      },
    ],
  },
];

const SuperSelectVariantsExample: React.FC = () => {
  const [values, setValues] = useState<FieldValueMap>({});

  return (
    <Flex vertical gap={24}>
      <Flex align="center" gap={8}>
        <h4 style={{ margin: 0 }}>SuperSelect 其他选择组件</h4>
        <Tag color="blue">表格</Tag>
        <Tag color="blue">树形</Tag>
        <Tag color="blue">级联</Tag>
      </Flex>
      <p style={{ margin: 0, color: '#666', fontSize: 12 }}>
        基于 @kne/super-select
        的表格、树形、级联选择器筛选项，适用于多列数据、层级结构、级联数据等场景
      </p>
      <Flex wrap gap={16}>
        <SelectTableListFilterItem
          label="员工（表格多选）"
          value={values.employee}
          onChange={(val: unknown) => setValues((prev) => ({ ...prev, employee: val }))}
          options={employeeOptions}
          columns={employeeColumns}
          valueKey="id"
          labelKey="name"
        />
        <SelectTreeFilterItem
          label="部门（树形多选）"
          value={values.department}
          onChange={(val: unknown) => setValues((prev) => ({ ...prev, department: val }))}
          options={organizationTree}
          valueKey="id"
          labelKey="name"
        />
        <SelectCascaderFilterItem
          label="地区（级联多选）"
          value={values.region}
          onChange={(val: unknown) => setValues((prev) => ({ ...prev, region: val }))}
          options={regionData}
          valueKey="id"
          labelKey="name"
        />
        <SelectCascaderFilterItem
          label="地区（级联单选）"
          single
          value={values.singleRegion}
          onChange={(val: unknown) => setValues((prev) => ({ ...prev, singleRegion: val }))}
          options={regionData}
          valueKey="id"
          labelKey="name"
        />
      </Flex>
      <pre style={{ margin: 0, background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
        {JSON.stringify(values, null, 2)}
      </pre>
    </Flex>
  );
};

const BusinessSelectExample: React.FC = () => {
  const [values, setValues] = useState<FieldValueMap>({});

  return (
    <Flex vertical gap={24}>
      <Flex align="center" gap={8}>
        <h4 style={{ margin: 0 }}>业务选择器筛选项</h4>
        <Tag color="blue">多级数据</Tag>
        <Tag color="blue">拼音搜索</Tag>
        <Tag color="blue">国际化</Tag>
      </Flex>
      <p style={{ margin: 0, color: '#666', fontSize: 12 }}>
        基于 @kne/super-select-plus 的职能、行业、城市选择器，支持多级数据、拼音搜索、国际化
      </p>
      <Flex wrap gap={16}>
        <SelectFunctionFilterItem
          label="职能"
          value={values.function}
          onChange={(val: unknown) => setValues((prev) => ({ ...prev, function: val }))}
        />
        <SelectIndustryFilterItem
          label="行业"
          value={values.industry}
          onChange={(val: unknown) => setValues((prev) => ({ ...prev, industry: val }))}
        />
        <SelectAddressFilterItem
          label="城市（多选）"
          value={values.city}
          onChange={(val: unknown) => setValues((prev) => ({ ...prev, city: val }))}
        />
        <SelectAddressFilterItem
          label="城市（单选）"
          single
          value={values.singleCity}
          onChange={(val: unknown) => setValues((prev) => ({ ...prev, singleCity: val }))}
        />
      </Flex>
    </Flex>
  );
};

/**
 * 上游 filter-fields.js：全字段 + SuperSelect 变体 + 业务选择器
 */
const FilterFieldsDemo: React.FC = () => (
  <ReactFilterLayoutPreview>
    <Flex vertical>
      <FilterFieldsExample />
      <Divider />
      <SuperSelectExample />
      <Divider />
      <SuperSelectVariantsExample />
      <Divider />
      <BusinessSelectExample />
    </Flex>
  </ReactFilterLayoutPreview>
);

export default FilterFieldsDemo;
