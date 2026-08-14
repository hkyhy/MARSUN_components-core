// @ts-nocheck — kne SuperSelect demo
import {
  CommonFilter,
  FilterCity,
  FilterSelectAddress,
  FilterSelectFunction,
  FilterSelectIndustry,
  FilterSelectTableList,
  FilterSuperSelect,
} from '@/components';
import React, { useState } from 'react';
import FilterLayoutPreview from './FilterLayoutPreview';

const DEPT = [
  { value: 'tech', label: '技术研发部' },
  { value: 'product', label: '产品设计部' },
  { value: 'ops', label: '运营管理部' },
];

const EMPLOYEES = [
  { id: '1', name: '张三', department: '技术', position: '工程师' },
  { id: '2', name: '李四', department: '产品', position: '设计师' },
  { id: '3', name: '王五', department: '运营', position: '经理' },
];

const COLUMNS = [
  { name: 'name', title: '姓名', span: 8 },
  { name: 'department', title: '部门', span: 8 },
  { name: 'position', title: '职位', span: 8 },
];

/**
 * SuperSelect / TableList / plus / City — Marsun 值适配 Demo
 */
const FilterKneSelectDemo: React.FC = () => {
  const [dept, setDept] = useState<string | string[] | undefined>(undefined);
  const [emp, setEmp] = useState<string | string[] | undefined>(undefined);
  const [fn, setFn] = useState<string | string[] | undefined>(undefined);
  const [industry, setIndustry] = useState<string | string[] | undefined>(undefined);
  const [addr, setAddr] = useState<string | string[] | undefined>(undefined);
  const [city, setCity] = useState<string | string[] | undefined>(undefined);

  return (
    <FilterLayoutPreview provideLayout={false}>
      {(layout) => (
        <CommonFilter
          layoutMode={layout}
          onClearAll={() => {
            setDept(undefined);
            setEmp(undefined);
            setFn(undefined);
            setIndustry(undefined);
            setAddr(undefined);
            setCity(undefined);
          }}
        >
          <FilterSuperSelect
            filterKey="dept"
            label="部门"
            options={DEPT}
            value={dept}
            onChange={setDept}
          />
          <FilterSelectTableList
            filterKey="emp"
            label="员工"
            single
            options={EMPLOYEES}
            columns={COLUMNS}
            valueKey="id"
            labelKey="name"
            value={emp}
            onChange={setEmp}
          />
          <FilterSelectFunction filterKey="fn" label="职能" value={fn} onChange={setFn} />
          <FilterSelectIndustry
            filterKey="industry"
            label="行业"
            value={industry}
            onChange={setIndustry}
          />
          <FilterSelectAddress
            filterKey="addr"
            label="城市(Address)"
            value={addr}
            onChange={setAddr}
          />
          <FilterCity filterKey="city" label="城市(热门)" value={city} onChange={setCity} />
        </CommonFilter>
      )}
    </FilterLayoutPreview>
  );
};

export default FilterKneSelectDemo;
