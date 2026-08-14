// @ts-nocheck — @kne/super-select 无完整 TS 类型
import { SelectTableList } from '@kne/super-select';
import '@kne/super-select/dist/index.css';
import { createKneFilterField } from '../createKneFilterField';

/**
 * Marsun 适配版表格列表选择筛选项（对位 SelectTableListFilterItem）。
 */
const FilterSelectTableList = createKneFilterField(SelectTableList, { panelWidth: 560 });

export default FilterSelectTableList;
export type { KneFilterFieldProps as FilterSelectTableListProps } from '../createKneFilterField';
