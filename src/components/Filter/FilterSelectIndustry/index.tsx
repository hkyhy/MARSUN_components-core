// @ts-nocheck — @kne/super-select-plus 无完整 TS 类型
import { SelectIndustry } from '@kne/super-select-plus';
import '@kne/super-select-plus/dist/index.css';
import { createKneFilterField } from '../createKneFilterField';

/** 行业选择筛选项（对位 SelectIndustryFilterItem） */
const FilterSelectIndustry = createKneFilterField(SelectIndustry, { panelWidth: 480 });

export default FilterSelectIndustry;
export type { KneFilterFieldProps as FilterSelectIndustryProps } from '../createKneFilterField';
