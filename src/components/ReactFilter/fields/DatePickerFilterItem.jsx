// @ts-nocheck
import { DatePicker } from 'antd';
import withFieldItem from '../withFieldItem';
import dayjs from 'dayjs';
import withLocale from '../withLocale';
import style from '../style.module.scss';
import classnames from 'classnames';

const DatePickerFilterItem = withLocale(
  withFieldItem(({ value, onChange, picker = 'date', ...props }) => {
    return (
      <DatePicker
        {...props}
        inputReadOnly
        picker={picker}
        classNames={{
          ...props.classNames,
          popup: {
            ...props.classNames?.popup,
            root: classnames(props.classNames?.popup?.root, style['date-picker-popup']),
          },
        }}
        value={value && dayjs(value.value)}
        onChange={(value) => {
          const { format } = Object.assign({ format: 'YYYY-MM-DD' }, props);
          value &&
            onChange({
              label:
                picker !== 'date'
                  ? `${value.startOf(picker).format(format)}~${value.endOf(picker).format(format)}`
                  : value.format(format),
              value: new Date(value.startOf(picker).valueOf()),
            });
        }}
      />
    );
  }),
);

export default DatePickerFilterItem;
