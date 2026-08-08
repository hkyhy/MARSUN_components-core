// @ts-nocheck
import { DatePicker, Flex } from 'antd';
import withFieldItem from '../withFieldItem';
import dayjs from 'dayjs';
import style from '../style.module.scss';
import withLocale from '../withLocale';
import classnames from 'classnames';

const DateRangePickerFilterItem = withLocale(
  withFieldItem(({ value, onChange, header, ...props }) => {
    return (
      <Flex vertical>
        {typeof header === 'function' ? header({ value, onChange }) : header}
        <DatePicker.RangePicker
          {...props}
          inputReadOnly
          allowEmpty={[false, false]}
          classNames={{
            ...props.classNames,
            popup: {
              ...props.classNames?.popup,
              root: classnames(props.classNames?.popup?.root, style['date-range-picker-popup']),
            },
          }}
          value={
            value &&
            Array.isArray(value.value) &&
            value.value.length === 2 &&
            value.value.map((item) => dayjs(item))
          }
          onChange={(value) => {
            const { format } = Object.assign({ format: 'YYYY-MM-DD' }, props);
            onChange({
              label: value.map((item) => item.format(format)).join('~'),
              value: value.map((item) => new Date(item.valueOf())),
            });
          }}
        />
      </Flex>
    );
  }),
);

export default DateRangePickerFilterItem;
