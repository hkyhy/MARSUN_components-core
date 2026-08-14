// @ts-nocheck — @kne/super-select 无完整 TS 类型
import SuperSelect from '@kne/super-select';
import '@kne/super-select/dist/index.css';
import { createKneFilterField } from '../createKneFilterField';

/**
 * Marsun 适配版 SuperSelect 筛选项（对位 ReactFilter SuperSelectFilterItem）。
 * 对外 value 为 string | string[]；面板内 wrap kne SuperSelect。
 */
const FilterSuperSelect = createKneFilterField(SuperSelect, { panelWidth: 420 });

export default FilterSuperSelect;
export type { KneFilterFieldProps as FilterSuperSelectProps } from '../createKneFilterField';
