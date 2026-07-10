# 筛选组件（Filter）规范

### 5.1 组件体系

筛选组件采用 **CommonFilter 容器 + 子组件自动注册** 的架构：

| 组件                | 说明                                            | 必选/可选 |
| ------------------- | ----------------------------------------------- | --------- |
| `CommonFilter`      | 筛选栏容器，管理已选标签展示和清空              | 必选      |
| `FilterInput`       | 文本输入筛选（label 用语义化字段名，见 §5.1.1） | 可选      |
| `FilterSelect`      | 下拉选择筛选（支持单选/多选/搜索）              | 可选      |
| `FilterTreeSelect`  | 树形选择筛选（如部门树，支持单选/多选/搜索）    | 可选      |
| `FilterDateRange`   | 日期范围筛选                                    | 可选      |
| `FilterNumberRange` | 数字范围筛选                                    | 可选      |

**导入方式**：

```tsx
import {
  CommonFilter,
  FilterInput,
  FilterSelect,
  FilterDateRange,
  FilterNumberRange,
  FilterTreeSelect,
} from '@/components/Common';
import type { FilterOption } from '@/components/Common';
```

### 5.1.1 Filter label 语义化

`FilterInput` / `FilterSelect` / `FilterDateRange` 等的 **`label` 禁止使用「关键词」「筛选条件」等抽象词**；须使用**字段业务语义**（可与原 placeholder 相同）。

| 禁止                                            | 推荐                   |
| ----------------------------------------------- | ---------------------- |
| `label="关键词"` + `placeholder="指标/摘要/ID"` | `label="指标/摘要/ID"` |
| `label="来源"`                                  | `label="预警或沙盘"`   |
| `label="生成日期"`                              | `label="报告生成日期"` |

`CommonFilter` 容器级 `label="筛选"` 可保留。已选 Tag 展示的是各子项 `label`，因此 label 必须对用户可读。

### 5.2 自动注册机制

子组件（FilterInput/FilterSelect/FilterDateRange/FilterNumberRange/FilterTreeSelect）通过 `useFilterRegister()` 自动注册到父级 `CommonFilter`，无需手动维护 `selectedItems`：

1. 子组件设置 `filterKey` + `label` + `value`/`onChange`
2. 子组件内部根据 `value` 计算 `valueLabel`，自动调用 `register()`
3. `CommonFilter` 自动展示已选标签（Tag），支持逐个删除和清空全部
4. 删除标签时自动调用子组件的 `onRemove` → `onChange(undefined)`

### 5.3 两种使用模式

CommonFilter 支持两种使用模式：**children 模式**（声明式 JSX）和 **list 模式**（JSX 数组）。

#### children 模式（推荐简单场景）

```tsx
<CommonFilter label="筛选">
  <FilterInput filterKey="q" label="指标/摘要/ID" value={q} onChange={setQ} />
  <FilterSelect
    filterKey="status"
    label="状态"
    options={options}
    value={status}
    onChange={setStatus}
  />
</CommonFilter>
```

#### list 模式（推荐动态/复杂场景）

```tsx
const filterList = [
  <FilterInput
    key="keyword"
    filterKey="q"
    label="指标/摘要/ID"
    value={keyword}
    onChange={(v) => setKeyword(v ?? '')}
  />,
  <FilterSelect
    key="status"
    filterKey="status"
    label="状态"
    options={statusOptions}
    value={status}
    onChange={(v) => setStatus(v as string | undefined)}
  />,
  <FilterTreeSelect
    key="dept"
    filterKey="dept"
    label="部门"
    value={deptId}
    onChange={(v) => setDeptId(v as string | undefined)}
    showSearch
  />,
  <FilterDateRange
    key="dateRange"
    filterKey="dateRange"
    label="日期范围"
    value={dateRange}
    onChange={setDateRange}
  />,
  <FilterNumberRange
    key="amount"
    filterKey="amount"
    label="金额范围"
    value={amountRange}
    onChange={setAmountRange}
    unit="元"
  />,
];

<CommonFilter label="筛选" list={filterList} />;
```

**list 模式优势**：

- 支持动态增减筛选项（如按权限显示/隐藏）
- 与 `hidden` 属性配合控制可见性
- JSX 数组形式，类型安全，无需额外配置类型

### 5.4 hidden 属性

所有 Filter 子组件均支持 `hidden` 属性，控制筛选项的可见性：

```tsx
// boolean 形式
<FilterSelect filterKey="role" label="角色" options={roleOptions} hidden={!isAdmin} />

// 函数形式（每次渲染时动态计算）
<FilterSelect filterKey="role" label="角色" options={roleOptions} hidden={() => !hasAnyRole([UserRole.SYSTEM_ADMIN])} />

// list 模式中使用
const filterList = [
  <FilterInput key="q" filterKey="q" label="指标/摘要/ID" value={value} onChange={onChange} />,
  <FilterSelect key="role" filterKey="role" label="角色" options={roleOptions} value={value} onChange={onChange} hidden={!isAdmin} />,
  <FilterSelect key="status" filterKey="status" label="状态" options={statusOptions} value={value} onChange={onChange} hidden={() => !isReviewer} />,
];
```

> **核心原则**：与 `ButtonGroup` listArray 的 `hidden` 保持一致，统一使用 `hidden` 属性控制可见性，禁止使用 `{condition && <FilterXxx />}` 条件渲染。

### 5.5 extra 属性

CommonFilter 支持 `extra` 属性，在筛选栏右侧渲染额外内容（如操作按钮、额外筛选等），与左侧筛选项两端对齐：

```tsx
<CommonFilter
  label="筛选"
  list={filterList}
  extra={
    <div className={classNames('common-filter-extra', styles['common-filter-extra'])}>
      <Button type="primary" onClick={handleExport}>
        导出
      </Button>
    </div>
  }
/>
```

**布局结构**：

```
[筛选] [筛选项1] [筛选项2] [筛选项3]          [extra 内容]
 ←─────────── 左对齐 ────────────→  ←── 右对齐 ──→
```

> `extra` 中的 Filter 子组件也会自动注册到 CommonFilter，支持已选标签展示和清空。

### 5.6 用法模板

```tsx
// List/FilterBar.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  CommonFilter,
  FilterInput,
  FilterSelect,
  FilterDateRange,
  FilterTreeSelect,
} from '@/components/Common';
import type { FilterOption } from '@/components/Common';

interface FilterBarProps {
  keyword: string;
  status?: string;
  deptId?: string;
  dateRange: [string, string] | null;
  onKeywordChange: (v: string) => void;
  onStatusChange: (v?: string) => void;
  onDeptChange: (v?: string) => void;
  onDateRangeChange: (v: [string, string] | null) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  keyword,
  status,
  deptId,
  dateRange,
  onKeywordChange,
  onStatusChange,
  onDeptChange,
  onDateRangeChange,
}) => {
  const [statusOptions] = useState<FilterOption[]>([
    { label: '草稿', value: 'DRAFT' },
    { label: '已通过', value: 'APPROVED' },
  ]);

  // 日期格式转换示例（FilterDateRange 输出 YYYY-MM-DD，后端可能需要 YYYY-MM-DD HH:mm:ss）
  const handleDateRangeChange = useCallback(
    (range: [string, string] | null) => {
      if (!range) {
        onDateRangeChange(null);
        return;
      }
      onDateRangeChange([`${range[0]} 00:00:00`, `${range[1]} 23:59:59`]);
    },
    [onDateRangeChange],
  );

  return (
    <CommonFilter label="筛选">
      <FilterInput
        filterKey="q"
        label="指标/摘要/ID"
        value={keyword || undefined}
        onChange={(v) => onKeywordChange(v ?? '')}
      />
      <FilterSelect
        filterKey="status"
        label="状态"
        options={statusOptions}
        value={status}
        onChange={(v) => onStatusChange(v as string | undefined)}
      />
      <FilterTreeSelect
        filterKey="department"
        label="部门"
        value={deptId}
        onChange={(v) => onDeptChange(v as string | undefined)}
        showSearch
      />
      <FilterDateRange
        filterKey="dateRange"
        label="日期范围"
        value={dateRange}
        onChange={handleDateRangeChange}
      />
    </CommonFilter>
  );
};
```

### 5.4 子组件 Props 速查

**通用 Props（BaseFilterProps）**：

| 属性        | 类型                       | 说明           | 必填 |
| ----------- | -------------------------- | -------------- | ---- |
| `filterKey` | `string`                   | 筛选项唯一标识 | 是   |
| `label`     | `string`                   | 显示标签       | 是   |
| `active`    | `boolean`                  | 强制选中态样式 | 否   |
| `hidden`    | `boolean \| () => boolean` | 是否隐藏       | 否   |

**FilterInput**：

| 属性          | 类型                               | 说明       | 必填 |
| ------------- | ---------------------------------- | ---------- | ---- |
| `value`       | `string \| undefined`              | 当前值     | 否   |
| `onChange`    | `(v: string \| undefined) => void` | 值变化回调 | 否   |
| `placeholder` | `string`                           | 输入提示   | 否   |

**FilterSelect**：

| 属性　　　　  | 类型　　　　　　  | 说明　　　 | 必填　　　　　　　　 | 　　　　　 | 　　 |
| ------------- | ----------------- | ---------- | -------------------- | ---------- | ---- |
| `options`　　 | `FilterOption[]`  | 选项列表　 | 是　　　　　　　　　 | 　　　　　 | 　　 |
| `value`　　　 | `string \　　　　 | number \　 | undefined`　　　　　 | 当前值　　 | 否　 |
| `onChange`　  | `(v: string \　　 | number \　 | undefined) => void`  | 值变化回调 | 否　 |
| `searchable`  | `boolean`　　　　 | 是否可搜索 | 否　　　　　　　　　 | 　　　　　 | 　　 |
| `multiple`　  | `boolean`　　　　 | 是否多选　 | 否　　　　　　　　　 | 　　　　　 | 　　 |

**FilterTreeSelect**：

| 属性           | 类型                                           | 说明                         | 必填 |
| -------------- | ---------------------------------------------- | ---------------------------- | ---- |
| `value`        | `string \| string[] \| undefined`              | 当前值                       | 否   |
| `onChange`     | `(v: string \| string[] \| undefined) => void` | 值变化回调                   | 否   |
| `treeData`     | `Department[]`                                 | 外部树数据（优先于自动加载） | 否   |
| `autoLoadDept` | `boolean`                                      | 自动加载部门树（默认 true）  | 否   |
| `showSearch`   | `boolean`                                      | 是否可搜索                   | 否   |
| `multiple`     | `boolean`                                      | 是否多选                     | 否   |

**FilterDateRange**：

| 属性               | 类型                                    | 说明                      | 必填 |
| ------------------ | --------------------------------------- | ------------------------- | ---- |
| `value`            | `[string, string] \| null`              | 当前值（YYYY-MM-DD 格式） | 否   |
| `onChange`         | `(v: [string, string] \| null) => void` | 值变化回调                | 否   |
| `showQuickOptions` | `boolean`                               | 显示快捷选项（默认 true） | 否   |

**FilterNumberRange**：

| 属性       | 类型                                                 | 说明              | 必填 |
| ---------- | ---------------------------------------------------- | ----------------- | ---- |
| `value`    | `[number \| undefined, number \| undefined] \| null` | 当前值 [min, max] | 否   |
| `onChange` | `(v: [...] \| null) => void`                         | 值变化回调        | 否   |
| `unit`     | `string`                                             | 单位文本          | 否   |

### 5.7 页面集成要点

> **重要**：页面必须维护筛选 state，并将筛选参数传入 API 请求。禁止硬编码 value 或使用空函数 `() => {}` 作为 onChange。

```tsx
// ❌ 禁止：硬编码 value 和空函数
<FilterBar keyword="" onKeywordChange={() => {}} onDateRangeChange={() => {}} />;

// ✅ 正确：维护筛选 state，筛选变化时重置分页
const [keyword, setKeyword] = useState('');
const [dateRange, setDateRange] = useState<[string, string] | null>();

<FilterBar
  keyword={keyword}
  dateRange={dateRange}
  onKeywordChange={(v) => {
    setKeyword(v);
    setPage(1);
  }}
  onDateRangeChange={(v) => {
    setDateRange(v);
    setPage(1);
  }}
/>;

// fetchData 中将筛选参数传给 API
const fetchData = useCallback(async () => {
  const params: Record<string, unknown> = { page, pageSize };
  if (keyword) params.keyword = keyword;
  if (dateRange) {
    params.startDate = dateRange[0];
    params.endDate = dateRange[1];
  }
  const res = await api.list(params);
}, [page, pageSize, keyword, dateRange]);
```

### 5.8 FilterSelect 单选交互规范

单选模式下，选中项右侧显示 `CheckOutlined`（对号），点击选项自动收起 Popover。取消选中通过"重置"按钮操作，不通过点击对号。
