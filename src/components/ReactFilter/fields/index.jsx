// @ts-nocheck
import { useIntl } from '@kne/react-intl';
import withFieldItem from '../withFieldItem';
import InputFilterItemField from './InputFilterItem';
import NumberRangeFilterItemField from './NumberRangeFilterItem';
import withLocale from '../withLocale';
import SuperSelect, { SelectCascader, SelectTableList } from '@kne/super-select';
import { SelectAddress, SelectFunction, SelectIndustry } from '@kne/super-select-plus';
import '@kne/super-select/dist/index.css';
import '@kne/super-select-plus/dist/index.css';
/** SuperSelect / SelectTree 弹层全局修补（选项撑满、checkbox、叶子 switcher-noop） */
import '../superSelectPopup.scss';

const withInputDefaultPlaceholder = (WrappedComponent) =>
  withLocale(({ placeholder, label, ...props }) => {
    const { formatMessage } = useIntl({ moduleName: 'Filter' });
    return (
      <WrappedComponent
        {...props}
        label={label}
        placeholder={placeholder || formatMessage({ id: 'defaultInputPlaceholder' }, { label })}
      />
    );
  });

export const InputFilterItem = withInputDefaultPlaceholder(InputFilterItemField);
export const NumberRangeFilterItem = withInputDefaultPlaceholder(NumberRangeFilterItemField);

export { default as DatePickerFilterItem } from './DatePickerFilterItem';
export { default as DateRangePickerFilterItem } from './DateRangePickerFilterItem';
export { default as TypeDateRangePickerFilterItem } from './TypeDateRangePickerFilterItem';

export const SuperSelectFilterItem = withFieldItem(SuperSelect, { forcePopup: true });
export const SelectTableListFilterItem = withFieldItem(SelectTableList, { forcePopup: true });
export { default as SelectTreeFilterItem } from './SelectTreeFilterItem';
export const SelectCascaderFilterItem = withFieldItem(SelectCascader, { forcePopup: true });
export const SelectFunctionFilterItem = withFieldItem(SelectFunction, { forcePopup: true });
export const SelectIndustryFilterItem = withFieldItem(SelectIndustry, { forcePopup: true });
export const SelectAddressFilterItem = withFieldItem(SelectAddress, { forcePopup: true });
