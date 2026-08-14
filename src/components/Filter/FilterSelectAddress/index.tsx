// @ts-nocheck — @kne/super-select-plus 无完整 TS 类型
import { SelectAddress } from '@kne/super-select-plus';
import '@kne/super-select-plus/dist/index.css';
import { createKneFilterField } from '../createKneFilterField';

/** 城市/地址选择筛选项（对位 SelectAddressFilterItem） */
const FilterSelectAddress = createKneFilterField(SelectAddress, { panelWidth: 480 });

export default FilterSelectAddress;
export type { KneFilterFieldProps as FilterSelectAddressProps } from '../createKneFilterField';
