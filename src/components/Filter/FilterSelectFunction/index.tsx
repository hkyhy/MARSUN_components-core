// @ts-nocheck — @kne/super-select-plus 无完整 TS 类型
import { SelectFunction } from '@kne/super-select-plus';
import '@kne/super-select-plus/dist/index.css';
import { createKneFilterField } from '../createKneFilterField';

/** 职能选择筛选项（对位 SelectFunctionFilterItem） */
const FilterSelectFunction = createKneFilterField(SelectFunction, { panelWidth: 480 });

export default FilterSelectFunction;
export type { KneFilterFieldProps as FilterSelectFunctionProps } from '../createKneFilterField';
