// @ts-nocheck
import PopoverItem from '../PopoverItem';
import TypeDateRangePickerField from '../common/TypeDateRangePickerField';
import get from 'lodash/get';
import style from '../style.module.scss';
import dayjs from 'dayjs';
import withLocale from '../withLocale';

const TypeDateRangePickerFilterItem = withLocale(({ label, value, onChange, ...props }) => {
  return (
    <PopoverItem
      label={label}
      value={value}
      onChange={onChange}
      onValidate={(item) => {
        const itemValue = item?.value;
        return itemValue?.type && Array.isArray(itemValue?.value) && itemValue.value.length === 2;
      }}
    >
      {({ value, onChange }) => (
        <TypeDateRangePickerField
          {...props}
          inputReadOnly
          className={style['filter-item-text']}
          value={get(value, 'value')}
          onChange={(pickerValue) => {
            const { format = 'YYYY-MM-DD' } = props;
            const val = pickerValue?.value || [];
            let displayLabel = '';
            if (val[0] && !val[1]) {
              displayLabel = `${dayjs(val[0]).format(format)}以后`;
            } else if (!val[0] && val[1]) {
              displayLabel = `${dayjs(val[1]).format(format)}以前`;
            } else if (val[0] && val[1]) {
              displayLabel = `${dayjs(val[0]).format(format)}~${dayjs(val[1]).format(format)}`;
            }
            onChange({
              label: displayLabel,
              value: pickerValue,
            });
          }}
        />
      )}
    </PopoverItem>
  );
});

export default TypeDateRangePickerFilterItem;
