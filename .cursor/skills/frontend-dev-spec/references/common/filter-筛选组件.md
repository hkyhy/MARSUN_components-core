# 筛选组件 Filter

### 5.0 ReactFilter vs CommonFilter（共存 · 新页默认 ReactFilter）

| 体系                        | 包内路径                  | 适用场景                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ReactFilter（`Filter`）** | `components/ReactFilter/` | **Marsun 业务列表筛选栏 SSOT（新页默认）**；厂商移植自 `@kne/react-filter`。运行时依赖 `@kne/super-select` / `@kne/super-select-plus` / `@kne/overflow-items`（须在 core `package.json` + lib `external`，见 [component-mapping · 运行时依赖](component-mapping-组件映射.md)）。`ModulePageShell` toolbar、页内 filter 条新建/改造优先用此。禁止直连 antd Select/DatePicker 等。 |
| **CommonFilter + Filter\*** | `components/Filter/`      | **存量过渡**：既有页可继续用；逐步替换为 ReactFilter。值模型为 Marsun plain（`string` / `string[]` 等）。                                                                                                                                                                                                                                                                        |

```tsx
// Marsun 列表页（新页推荐 / 硬约束）
import {
  Filter,
  getFilterValue,
  ReactInputFilterItem,
  type FilterValue,
} from '@hkyhy/marsun-components-core';

// 存量 CommonFilter（过渡，勿用于新页默认）
import { CommonFilter, FilterSelect, FilterInput } from '@hkyhy/marsun-components-core';
```

根导出对易冲突符号做了别名：`FilterProvider` → `ReactFilterProvider`，`useFilter` → `useReactFilter`，`FilterItem` → `ReactFilterItem`，以及部分 `*FilterItem` 字段组件加 `React` 前缀（如 `ReactInputFilterItem`）；完整 fields 见 `reactFilterFields` / `Filter.fields`。取值用 `getFilterValue(filterValue)` 将 kne `{ label, value }` 压成扁平字段对象。

#### 字段对位（存量迁移参考）

| ReactFilter `*FilterItem`（根导出常带 `React` 前缀）           | CommonFilter 对位（存量）                                               |
| -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `InputFilterItem` / `ReactInputFilterItem`                     | `FilterInput`                                                           |
| `NumberRangeFilterItem`                                        | `FilterNumberRange`                                                     |
| `DatePickerFilterItem` / `ReactDatePickerFilterItem`           | `FilterDatePicker`                                                      |
| `DateRangePickerFilterItem` / `ReactDateRangePickerFilterItem` | `FilterDateRange`                                                       |
| `TypeDateRangePickerFilterItem`                                | `FilterTypeDateRange`（`{ type, range }`）                              |
| `SuperSelectFilterItem`                                        | `FilterSuperSelect`                                                     |
| `SelectTableListFilterItem`                                    | `FilterSelectTableList`                                                 |
| `SelectTreeFilterItem`                                         | `FilterTreeSelect`                                                      |
| `SelectCascaderFilterItem`                                     | `FilterCascader`                                                        |
| `SelectFunction` / `Industry` / `Address`                      | `FilterSelectFunction` / `FilterSelectIndustry` / `FilterSelectAddress` |
| AdvancedFilter `ListFilterItem`                                | `FilterList`                                                            |
| AdvancedFilter `CityFilterItem`                                | `FilterCity`                                                            |

CommonFilter **自有**：`FilterSelect`、`FilterTrigger`、`FilterPanel`、`FilterPopover`，以及 `dependsOn` / `loadData`。适配器：`kneToMarsun` / `marsunToKne`（`Filter/kneValueAdapter.ts`）。

- **新建 / 本任务新建列表筛选**：用 `Filter`（ReactFilter）+ `React*FilterItem` + `getFilterValue`。
- **存量 CommonFilter 页**：触及任务时可迁；未触及不强制本任务全仓替换。
- **仍禁止**：列表筛选栏直连 antd `Select` / `DatePicker` / `RangePicker` / `TreeSelect` / `Cascader`。

#### CommonFilter 主题 / 移动交互（对齐 ReactFilter 壳 · 存量）

#### CommonFilter 主题 / 移动交互（对齐 ReactFilter 壳）

CommonFilter **保留**受控字段 + 注册制；视觉与交互壳对齐 kne ReactFilter：

| 能力     | 行为                                                                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 窄屏检测 | 默认跟**视口**（`max-width: 767px`）；根节点 `is-mobile`。半栏 showcase 不误判。需跟容器时显式 `measureContainer`                                    |
| 筛选项   | 移动：单行横滑 + pill；桌面：既有 Trigger                                                                                                            |
| 打开态   | `visited`：实心主色底 + 白字（对齐 ReactFilter `is-visited`）                                                                                        |
| 弹出     | 桌面 Popover；移动 sheet（`max-height` 限制，内容可滚）+ 遮罩 + 确认/取消                                                                            |
| 已选区   | 移动横滑 + 可选展开/收起 + 边缘阴影                                                                                                                  |
| 过多项   | 可选 `displayLine` /「更多」（默认兼容现网全展示）                                                                                                   |
| 布局切换 | `layoutMode`: `auto` \| `mobile` \| `desktop`；Showcase 用 `FilterLayoutPreview`（Segmented）包交互 Demo，示例见「桌面 / 移动切换」及各 Filter* Demo |
| iOS      | picker/input 字号 ≥16px，避免聚焦缩放                                                                                                                |

**双端验收**（SKILL #46）：窄屏下筛选可横滑、项可打开确认、已选可清除；桌面既有行为不回退。

### 5.1 组件体系

筛选组件采用 **CommonFilter 容器 + 子组件自动注册** 的架构：

| 组件                                            | 说明                                                             | 必选/可选 |
| ----------------------------------------------- | ---------------------------------------------------------------- | --------- |
| `CommonFilter`                                  | 筛选栏容器，管理已选标签展示和清空                               | 必选      |
| `FilterInput`                                   | 文本输入筛选（label 用语义化字段名，见 §5.1.1）                  | 可选      |
| `FilterSelect`                                  | 下拉选择筛选（支持单选/多选/搜索；可选 loadData）                | 可选      |
| `FilterTreeSelect`                              | 树形选择筛选（部门树等任意深勾选；亦支持 leafOnly 级联）         | 可选      |
| `FilterCascader`                                | 级联路径筛选（分厂→品种两列；leafOnly 只写叶子；`onChangePath`） | 可选      |
| `FilterDatePicker`                              | 单日期筛选（日 / 月 / 年）                                       | 可选      |
| `FilterDateRange`                               | 日期范围筛选                                                     | 可选      |
| `FilterTypeDateRange`                           | 类型日期范围（date/month/week；`{ type, range }`）               | 可选      |
| `FilterNumberRange`                             | 数字范围筛选                                                     | 可选      |
| `FilterList`                                    | Tag 列表（popover / inline）                                     | 可选      |
| `FilterCity`                                    | 热门城市 + 更多地址                                              | 可选      |
| `FilterSuperSelect` / `FilterSelectTableList`   | kne SuperSelect 适配（Marsun 值）                                | 可选      |
| `FilterSelectFunction` / `Industry` / `Address` | kne plus 业务选择器适配                                          | 可选      |

**导入方式**：

```tsx
import {
  CommonFilter,
  FilterInput,
  FilterSelect,
  FilterDateRange,
  FilterTypeDateRange,
  FilterNumberRange,
  FilterList,
  FilterTreeSelect,
  FilterCascader,
  FilterSuperSelect,
} from '@/components/Common';
import type { FilterOption } from '@/components/Common';
```

**FilterTreeSelect vs FilterCascader**：任意深树勾选 / 半选父节点用 `FilterTreeSelect`；固定路径列（如分厂→品种）点选用 `FilterCascader`（antd Cascader.Panel）。二者 `treeData` 同构（`TreeFilterNode`），`leafOnly` 时对外 `value` 均为叶子 id。

### 5.1.1 Filter label 语义化

`FilterInput` / `FilterSelect` / `FilterDateRange` 等的 **`label` 禁止使用「关键词」「筛选条件」等抽象词**；须使用**字段业务语义**（可与原 placeholder 相同）。

| 禁止                                            | 推荐                   |
| ----------------------------------------------- | ---------------------- |
| `label="关键词"` + `placeholder="指标/摘要/ID"` | `label="指标/摘要/ID"` |
| `label="来源"`                                  | `label="预警或沙盘"`   |
| `label="生成日期"`                              | `label="报告生成日期"` |

`CommonFilter` 容器级 `label="筛选"` 可保留。已选 Tag 展示的是各子项 `label`，因此 label 必须对用户可读。

### 5.2 自动注册机制

子组件（FilterInput/FilterSelect/FilterDateRange/FilterNumberRange/FilterTreeSelect/FilterCascader）通过 `useFilterRegister()` 自动注册到父级 `CommonFilter`，无需手动维护 `selectedItems`：

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

- 支持动态增减筛选项（如按权限 / 分类显示隐藏）
- 与 `hidden` / `display` 属性配合控制可见性（容器会跳过不可见 item）
- JSX 数组形式，类型安全，无需额外配置类型

### 5.4 hidden / display 属性

所有 Filter 子组件均支持 `hidden` / `display` 控制可见性（`display` 优先）：`hidden===true` 或 `display===false` 时不渲染。`CommonFilter` 的 **list 模式**也会读取 item 的这两项 props，跳过不可见项。

```tsx
// boolean 形式
<FilterSelect filterKey="role" label="角色" options={roleOptions} hidden={!isAdmin} />

// display 形式（与 hidden 等价语义，display 优先）
<FilterSelect filterKey="level" label="质量等级" options={levelOptions} display={category === 'AI_QUALITY'} />

// 函数形式（每次渲染时动态计算）
<FilterSelect filterKey="role" label="角色" options={roleOptions} hidden={() => !hasAnyRole([UserRole.SYSTEM_ADMIN])} />

// list 模式中使用（推荐：扁平数组 + hidden，禁止条件 push 不同 list）
const filterList = [
  <FilterInput key="q" filterKey="q" label="指标/摘要/ID" value={value} onChange={onChange} />,
  <FilterSelect key="level" filterKey="level" label="质量等级" options={levelOptions} value={level} onChange={onLevelChange} hidden={category === 'STORAGE_SYNC'} />,
  <FilterSelect key="status" filterKey="status" label="状态" options={statusOptions} value={value} onChange={onChange} hidden={() => !isReviewer} />,
];
```

> **核心原则**：与 `ButtonGroup` listArray 的 `hidden` 保持一致，统一使用 `hidden` / `display` 控制可见性，禁止使用 `{condition && <FilterXxx />}` 或条件 `push` 不同数组。

### 5.4.1 声明式依赖 `dependsOn` / `loadData` / `panelExtra`

跨字段联动（如「月份驱动主对标选项」「属性筛 → 对比品种」）由 CommonFilter 的 **values 广播** + 子项声明完成；从属条件应**内嵌**在目标筛选项 `panelExtra` 内（与 search 同层），避免顶栏平铺看不出关系：

| Props               | 说明                                                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `dependsOn`         | 依赖的其它 `filterKey`（`string \| string[]`）                                                                                   |
| `clearOnDepsChange` | 依赖变化时是否清空本项（默认 `true`）                                                                                            |
| `label`             | 可为 `(ctx: { values }) => string`，如「主对标（参考 2026-07）」                                                                 |
| `loadData`          | `(ctx: { values, keyword? }) => Promise<选项>`，依赖变化时自动拉取                                                               |
| `panelExtra`        | 面板内嵌从属 UI（search 下方、列表上方）；**禁止**再嵌 `Filter*`（双重 Popover），用 antd `DatePicker`/`Select`/`InputNumber` 等 |
| `panelWidth`        | 面板宽度；有 `panelExtra` 时默认 `460`                                                                                           |
| `filterGroup`       | 可选分组标记（文档语义，不做强布局）                                                                                             |

```tsx
<CommonFilter label="筛选">
  <FilterTreeSelect
    filterKey="primary"
    label={month ? `主对标分厂×品种（参考 ${month})` : '主对标分厂×品种'}
    loadData={async () => fetchPrimaryTree(month)}
    panelExtra={
      <DatePicker
        picker="month"
        size="small"
        value={month ? dayjs(`${month}-01`) : undefined}
        onChange={(v) => setMonth(v ? v.format('YYYY-MM') : '')}
        getPopupContainer={(n) => n.parentElement || document.body}
      />
    }
    value={primary}
    onChange={setPrimary}
    leafOnly
    showSearch
  />
  <FilterTreeSelect
    filterKey="compare"
    label="对比分厂×品种"
    loadData={async () => fetchCompareTree({ spinMethod })}
    panelExtra={
      <Select
        size="small"
        placeholder="纺纱方法"
        options={methodOpts}
        value={spinMethod}
        onChange={setSpinMethod}
        getPopupContainer={(n) => n.parentElement || document.body}
      />
    }
    multiple
    leafOnly
    showSearch
  />
</CommonFilter>
```

> **原则**：从属条件（月份、纺纱属性）放进目标项的 `panelExtra`，**不要**与主对标/对比平铺在顶栏。业务 URL / 参数拼装仍在页面的 `loadData` / 父级 effect 内；core 只负责依赖感知、清空与刷新时机。静态 `treeData` / `options` 仍可受控覆盖 `loadData` 结果。`panelExtra` 内用 antd `DatePicker`/`Select`/`InputNumber`，禁止再嵌 `Filter*`。

**S3 质量分析**：业务顶栏 `VarietyHistorySearchBar` 已用 **ReactFilter**（`Filter` + `PopoverItem` + 面板内 antd `Cascader.Panel` leafOnly；月份/新品种属性内嵌）。Showcase：「S3 质量分析 · ReactFilter」；CommonFilter 对照见 Filter「S3 质量分析筛选」（`FilterCascader` + `panelExtra`）。

**已选 Tag**：`FilterValueDisplay` / CommonFilter 已选区对长文案设 `max-width` + `text-overflow: ellipsis`，hover 可看全文。

**SuperSelect 列表弹层**：桌面根 `.ant-dropdown[class*=kne-super-select]`。列表宽度修补只作用在 `.select-list-scroll-list` / `.select-tree-scroll-list`，**禁止**作用到 `.select-cascader-content`（级联行是横向 Space）。见 `ReactFilter/superSelectPopup.scss`。业务须 `import '@hkyhy/marsun-components-core/styles'`。

**QA 质量分析 PopoverItem 内级联**：勿嵌 kne `SelectCascader`（会套弹层 / Modal，且父级勾选与 leafOnly 不一致）。用 antd **`Cascader.Panel`** + `changeOnSelect={false}`（对齐原 `FilterCascader` `leafOnly`：不可只选分厂；主对标单选、对比多选 + `SHOW_CHILD`）。`options=[]` 时用 core `Empty`。

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

| 属性            | 类型                                                    | 说明                                                                        | 必填 |
| --------------- | ------------------------------------------------------- | --------------------------------------------------------------------------- | ---- |
| `options`       | `FilterOption[]`                                        | 选项列表                                                                    | 是   |
| `value`         | `string \| number \| (string \| number)[] \| undefined` | 当前值（多选为数组）                                                        | 否   |
| `onChange`      | `(v: FilterSelectValue) => void`                        | 值变化回调                                                                  | 否   |
| `defaultValue`  | `string \| number`                                      | 单选默认值（等于默认时不视为已筛选）                                        | 否   |
| `defaultValues` | `(string \| number)[]`                                  | 多选默认集合                                                                | 否   |
| `searchable`    | `boolean`                                               | 是否可搜索                                                                  | 否   |
| `multiple`      | `boolean`                                               | 多选：顶部「全选」、底部「已选」标签（`max-height: 120px` 滚动）、确定/取消 | 否   |
| `minSelection`  | `number`                                                | 多选至少保留项数；全不选/移除标签时生效                                     | 否   |
| `variant`       | `'default' \| 'person'`                                 | 人员选项展示部门与联系方式                                                  | 否   |

**FilterTreeSelect**：

| 属性           | 类型                                           | 说明                                                          | 必填 |
| -------------- | ---------------------------------------------- | ------------------------------------------------------------- | ---- |
| `value`        | `string \| string[] \| undefined`              | 当前值（节点 `id`）                                           | 否   |
| `onChange`     | `(v: string \| string[] \| undefined) => void` | 值变化回调                                                    | 否   |
| `treeData`     | `TreeFilterNode[]`                             | 外部树数据 `{ id, name, children? }`                          | 否   |
| `showSearch`   | `boolean`                                      | 是否可搜索                                                    | 否   |
| `multiple`     | `boolean`                                      | 是否多选                                                      | 否   |
| `leafOnly`     | `boolean`                                      | 仅叶子写入值；多选时点父节点全选/取消子叶子，父勾选框支持半选 | 否   |
| `getNodeLabel` | `(node) => string`                             | 自定义节点展示 / 已选 Tag 文案                                | 否   |

**FilterCascader**（路径级联；与 TreeSelect 分工见 §5.1）：

| 属性           | 类型                                                   | 说明                                                                                               | 必填 |
| -------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ---- |
| `value`        | `string \| string[] \| undefined`                      | 叶子 id（`leafOnly` 默认 true）                                                                    | 否   |
| `onChange`     | `(v: string \| string[] \| undefined) => void`         | 叶子值变化                                                                                         | 否   |
| `onChangePath` | `(paths: string[] \| string[][] \| undefined) => void` | 完整路径；业务可用 `path[0]` 取一级 Code（如分厂）                                                 | 否   |
| `treeData`     | `TreeFilterNode[]`                                     | 同 TreeSelect；亦可用 `options` / `loadData`                                                       | 否   |
| `leafOnly`     | `boolean`                                              | 默认 true；`changeOnSelect=false`，父级不可单独作为已选值                                          | 否   |
| `multiple`     | `boolean`                                              | 多选 = 多条路径；勾选为草稿，点「确定」才 `onChange`，「取消」/点外面关闭回滚（对齐 FilterSelect） | 否   |
| `showSearch`   | `boolean`                                              | 面板内搜索                                                                                         | 否   |
| `panelExtra`   | `ReactNode`                                            | 面板内嵌从属条件（禁再嵌 Filter*）                                                                 | 否   |
| `loading`      | `boolean`                                              | Item spin + 面板 Spin                                                                              | 否   |

**FilterDateRange**：

| 属性               | 类型                                    | 说明                      | 必填 |
| ------------------ | --------------------------------------- | ------------------------- | ---- |
| `value`            | `[string, string] \| null`              | 当前值（YYYY-MM-DD 格式） | 否   |
| `onChange`         | `(v: [string, string] \| null) => void` | 值变化回调                | 否   |
| `showQuickOptions` | `boolean`                               | 显示快捷选项（默认 true） | 否   |

**FilterNumberRange**：

| 属性             | 类型                                                 | 说明                                                 | 必填 |
| ---------------- | ---------------------------------------------------- | ---------------------------------------------------- | ---- |
| `value`          | `[number \| undefined, number \| undefined] \| null` | 当前值 [min, max]                                    | 否   |
| `onChange`       | `(v: [...] \| null) => void`                         | 值变化回调                                           | 否   |
| `unit`           | `string`                                             | 单位文本                                             | 否   |
| `min`            | `number`                                             | 绝对值下限（左右输入框共用）                         | 否   |
| `max`            | `number`                                             | 绝对值上限（左右输入框共用）                         | 否   |
| `precision`      | `number`                                             | 小数位数（antd `InputNumber`）                       | 否   |
| `step`           | `number`                                             | 步进；未传且有 `precision` 时按 `10^-precision` 推导 | 否   |
| `minPlaceholder` | `string`                                             | 左框 placeholder（默认「最低...」）                  | 否   |
| `maxPlaceholder` | `string`                                             | 右框 placeholder（默认「最高...」）                  | 否   |

> **左右序**：点「确定」时若两侧均有值且左 > 右，`message.warning` 且弹层不关闭（`FilterPopover.onConfirm` 返回 `false`）。

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

### 5.8 FilterSelect 交互规范

**单选**：选中项右侧显示 Check（对号），点击选项自动收起 Popover。取消选中通过「重置」/清除，不通过点击对号。

**多选**（`multiple`）：

1. 选项列表顶部固定「全选」checkbox；作用域为当前搜索过滤后的 `filteredOptions`（可半选 `indeterminate`）。
2. 勾选全选 → 并入过滤结果；取消全选 → 去掉过滤结果；若设 `minSelection`，全不选后不足则保留原数组前 `minSelection` 项。
3. 面板底部「已选：」标签区限高（`max-height: 120px`）超出滚动；标签文案固定在滚动区外。
4. 须点「确定」才提交草稿；「取消」或关闭 Popover 丢弃草稿。
5. **默认全选**：业务侧 `value` 设为全部 code，并传 `defaultValues={全部 code}`——默认不亮 trigger、不进「您已选择」；需展示时加 `showDefaultAsSelected`（标签文案为「全部」）。打开面板仍勾满（草稿用真实 value）。

### 5.9 筛选项加载态与失败（公用）

筛选栏依赖的 meta / options（如分厂、状态枚举）加载是**公用 UX**，与具体业务页无关。分 **Filter Item loading**、**面板列表 loading**、**落定空态**、**失败** 四态，口径统一：

| 阶段                    | 行为                                                                                                                                                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Filter Item loading** | 传 `loading` 给 `FilterSelect` / `FilterTreeSelect` / `FilterCascader`（或内部 `loadData`/`fetchUrl` pending）：**Trigger 右侧用 `Loader2 spin` 替换 chevron**（仍可点击打开面板）；筛选栏始终占位，禁止整栏 `return null`。 |
| **面板列表 loading**    | 打开面板且 options 仍在加载：列表区显示 antd `Spin`，**禁止**此时渲染「暂无数据」/ Empty。                                                                                                                                   |
| **落定空态**            | `!loading` 且 options/树为空：`<Empty iconType="simple" description="暂无数据" />`（禁止纯文字「暂无数据」）。                                                                                                               |
| **失败**                | 仅 antd `message.error` 友好文案；options 置空 → 落定 Empty；**禁止**内联错误区替换整栏。                                                                                                                                    |
| **与 PageSpin**         | 筛选栏挂 `ModulePageShell` 的 **`toolbar`**（Spin 外）；**选项 loading 禁止 OR 进内容区 `pageLoading`/`spinning`**（应由 Filter Item + 面板表达）。见 [shell-layout-页面壳与布局.md](shell-layout-页面壳与布局.md)。         |

#### Loading

1. **始终占位**：`metaLoading === true` / 选项 loading 时仍渲染完整筛选栏；可用默认日期/「全部」等已有默认值。
2. **禁止** `if (metaLoading) return null`。
3. **`suppressLoadingText` 已废弃**：不得再靠该 prop（或不渲染整栏）隐藏筛选；历史调用方可保留 prop 但不生效。
4. **业务接线**：选项请求 loading 传给对应 Filter* 的 `loading`（如 `primaryOptionsLoading` → 主对标 `FilterTreeSelect`）；**不要**把 `primaryOptionsLoading` / `searchLoading` 等并入 `pageLoading`。

#### 失败

1. **用 antd `message.error` 提示**，文案须为用户可读业务句（如「筛选加载失败」「分厂选项加载失败」）。**禁止**拼接 `HTTP 500`、`Network Error`、接口 raw body、stack 等技术细节；状态码与异常只打日志，不进 toast。
2. **禁止**用内联错误区（如 `<p className="error">筛选加载失败：…</p>`）替换整块筛选栏。
3. **失败后筛选栏仍须渲染**：`CommonFilter` + 各筛选项保持可见；选项列表为空（`[]`）且 `!loading` 时由 Filter* 自带 **Empty**，勿因 `!meta` / `!options` 整栏 `return null`。
4. **默认值来自 meta/options**：分厂等选项的初始值与清空回退须取自接口返回的列表（如 `meta.factories[0]`）；无选项则为空数组。**禁止**业务常量硬编码工厂 code（如 `1001`）作为生产默认选中。

```tsx
// ❌ 禁止：内联错误区 + 拼 HTTP 状态码
if (metaError) {
  return <p className="error">筛选加载失败：{metaError}</p>;
}

// ❌ 禁止：loading / 失败后因 !meta 整栏消失
if (!meta || metaLoading) return null;

// ❌ 禁止：硬编码工厂 code 作默认选中
const [factories, setFactories] = useState(['1001']);

// ❌ 禁止：选项 loading 并入内容区 PageSpin
const pageLoading = metaLoading || primaryOptionsLoading || searchLoading;

// ✅ hook：友好文案 toast；失败后 meta 可为空、options 为空
.catch(() => setMetaError('筛选加载失败'));
useEffect(() => {
  if (!metaError) return;
  message.error(metaError);
}, [metaError]);

// ✅ meta 成功后默认取首项；无列表则 []
setFactories(
  meta.factories?.[0]?.code != null ? [String(meta.factories[0].code)] : [],
);

// ✅ 选项 loading 交给 Filter Item；pageLoading 仅内容区
const pageLoading = metaLoading || matrixLoading;
return (
  <CommonFilter label="筛选">
    <FilterSelect
      filterKey="factories"
      label="分厂"
      options={options}
      loading={optionsLoading}
      ...
    />
  </CommonFilter>
);
```
