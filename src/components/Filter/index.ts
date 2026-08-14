// 类型
export type { CommonFilterProps } from './CommonFilter';
export type {
  BaseFilterProps,
  FilterOption,
  FilterLabel,
  FilterLabelContext,
  FilterLoadDataContext,
  PersonOption,
  SelectedItem,
} from './types';
export {
  resolveHidden,
  resolveFilterLabel,
  resolveFilterVisible,
  normalizeDependsOn,
  buildDepsKey,
} from './types';
export { CommonFilter };

// 容器
import CommonFilter from './CommonFilter';

export { useFilterLayoutMode, FILTER_MOBILE_BREAKPOINT } from './useFilterLayoutMode';
export { useHorizontalScrollShadows } from './useHorizontalScrollShadows';
export { FilterLayoutProvider, useFilterLayout } from './FilterLayoutContext';
export type { FilterLayoutContextValue } from './FilterLayoutContext';

// 触发器
import FilterTrigger from './FilterTrigger';
export type { FilterTriggerProps } from './FilterTrigger';
export { FilterTrigger };

// 面板
import FilterPanel from './FilterPanel';
export type { FilterPanelProps } from './FilterPanel';
export { FilterPanel };

// Popover 包装器
import FilterPopover from './FilterPopover';
export type { FilterPopoverProps } from './FilterPopover';
export { FilterPopover };

// 下拉选择
import FilterSelect from './FilterSelect';
export type { FilterSelectProps, FilterSelectValue } from './FilterSelect';
export { FilterSelect };

// 输入框
import FilterInput from './FilterInput';
export type { FilterInputProps } from './FilterInput';
export { FilterInput };

// 日期范围
import FilterDateRange from './FilterDateRange';
export type { FilterDateRangeProps, QuickOption } from './FilterDateRange';
export { FilterDateRange };

// 单日期（日 / 月 / 年）
import FilterDatePicker from './FilterDatePicker';
export type { FilterDatePickerProps, SingleQuickOption } from './FilterDatePicker';
export { FilterDatePicker };

// 数字范围
import FilterNumberRange from './FilterNumberRange';
export type { FilterNumberRangeProps } from './FilterNumberRange';
export { FilterNumberRange };

// 树形选择
import FilterTreeSelect from './FilterTreeSelect';
export type { FilterTreeSelectProps, TreeFilterNode } from './FilterTreeSelect';
export { FilterTreeSelect };

// 级联路径选择（分厂→品种等；与 TreeSelect 分工：路径 Cascader vs 任意深树勾选）
import FilterCascader, { treeToCascaderOptions } from './FilterCascader';
export type { FilterCascaderProps, CascaderPath } from './FilterCascader';
export { FilterCascader, treeToCascaderOptions };

// 类型日期范围（对位 TypeDateRangePickerFilterItem）
import FilterTypeDateRange from './FilterTypeDateRange';
export type {
  FilterTypeDateRangeProps,
  FilterTypeDateRangeType,
  FilterTypeDateRangeValue,
} from './FilterTypeDateRange';
export { FilterTypeDateRange };

// Tag 列表（对位 AdvancedFilter ListFilterItem）
import FilterList from './FilterList';
export type { FilterListProps, FilterListValue } from './FilterList';
export { FilterList };

// 热门城市 + 更多地址（对位 CityFilterItem）
import FilterCity from './FilterCity';
export type { FilterCityProps } from './FilterCity';
export { FilterCity };

// kne SuperSelect / plus 适配（Marsun 值）
import FilterSuperSelect from './FilterSuperSelect';
export type { FilterSuperSelectProps } from './FilterSuperSelect';
export { FilterSuperSelect };

import FilterSelectTableList from './FilterSelectTableList';
export type { FilterSelectTableListProps } from './FilterSelectTableList';
export { FilterSelectTableList };

import FilterSelectFunction from './FilterSelectFunction';
export type { FilterSelectFunctionProps } from './FilterSelectFunction';
export { FilterSelectFunction };

import FilterSelectIndustry from './FilterSelectIndustry';
export type { FilterSelectIndustryProps } from './FilterSelectIndustry';
export { FilterSelectIndustry };

import FilterSelectAddress from './FilterSelectAddress';
export type { FilterSelectAddressProps } from './FilterSelectAddress';
export { FilterSelectAddress };

export {
  kneToMarsun,
  marsunToKne,
  kneValueLabel,
  marsunValueLabel,
  mergeKneLabelMaps,
} from './kneValueAdapter';
export type { KneSelectItem, MarsunSelectValue } from './kneValueAdapter';

// 筛选状态 Hook
export {
  useFilterState,
  useFilterRegister,
  useFilterDeps,
  useFilterFieldBridge,
  FilterProvider,
} from './useFilterState';
export type { FilterContextValue } from './useFilterState';
