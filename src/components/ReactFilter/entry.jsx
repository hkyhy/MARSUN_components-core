// @ts-nocheck
// Ported from @kne/react-filter (ISC) https://github.com/kne-union/react-filter
/** 弹层全局修补：保证从包入口 / fields 引用时都能打进 `/styles` 产物 */
import './superSelectPopup.scss';
import Filter from './Filter';
import * as fields from './fields';
import getFilterValue from './getFilterValue';
import { useContext as useFilter } from './context';
import withFilterValue from './withFilterValue';
import SearchInput from './SearchInput';
import FilterProvider from './FilterProvider';
import FilterOuter from './FilterOuter';
import pickSelectValues from './pickSelectValues';
import createFilterValueMapper from './createFilterValueMapper';
import useSearchParamsValue from './useSearchParamsValue';
import filterInterceptors, {
  singleSelectInterceptor,
  multiSelectInterceptor,
} from './filterInterceptors';
import { FILTER_CLASS } from './filterClassNames';

Filter.fields = fields;
Filter.getFilterValue = getFilterValue;
Filter.useFilter = useFilter;
Filter.SearchInput = SearchInput;
Filter.withFilterValue = withFilterValue;
Filter.FilterProvider = FilterProvider;
Filter.FilterOuter = FilterOuter;

Filter.pickSelectValues = pickSelectValues;
Filter.createFilterValueMapper = createFilterValueMapper;
Filter.useSearchParamsValue = useSearchParamsValue;
Filter.filterInterceptors = filterInterceptors;
Filter.singleSelectInterceptor = singleSelectInterceptor;
Filter.multiSelectInterceptor = multiSelectInterceptor;
Filter.FILTER_CLASS = FILTER_CLASS;

export default Filter;
export {
  fields,
  getFilterValue,
  useFilter,
  withFilterValue,
  SearchInput,
  FilterProvider,
  pickSelectValues,
  createFilterValueMapper,
  useSearchParamsValue,
  filterInterceptors,
  singleSelectInterceptor,
  multiSelectInterceptor,
  FILTER_CLASS,
};
export { default as AdvancedFilter } from './AdvancedFilter';
export { default as FilterValueDisplay } from './FilterValueDisplay';
export { default as FilterItem } from './FilterItem';
export { default as FilterLines } from './FilterLines';
export { default as FilterOuter } from './FilterOuter';
export { default as PopoverItem } from './PopoverItem';
export { default as withFieldItem } from './withFieldItem';
export { default as FilterItemContainer } from './FilterItemContainer';
export { default as TypeDateRangePickerField } from './common/TypeDateRangePickerField';
export {
  NumberRangeFilterItem,
  InputFilterItem,
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
} from './fields';
/** PopoverItem 自定义面板内嵌级联时使用（Filter 字段壳请用 SelectCascaderFilterItem） */
export { SelectCascader } from '@kne/super-select';
