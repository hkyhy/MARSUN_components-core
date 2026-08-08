// @ts-nocheck
import { DatePicker, Select, Space, Flex } from 'antd';
import { useIntl } from '@kne/react-intl';
import { useRef, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import classnames from 'classnames';
import style from './style.module.scss';
import useFilterPopupContainer from '../../hooks/useFilterPopupContainer';
import { MOBILE_POPUP_Z_INDEX } from '../../constants/mobilePopup';

const FIELD_MOBILE_POPUP_CLASS = 'react-filter-field-mobile-popup';

const TypeDateRangePickerField = ({
  value: valueProp,
  onChange: onChangeProp,
  defaultValue,
  shortcuts = true,
  shortcutOptions,
  ...props
}) => {
  const { formatMessage } = useIntl({ moduleName: 'Filter' });
  const { isMobile, fixedModeClass, getPopupContainer } = useFilterPopupContainer();
  const nestedPopupClassName = classnames(
    style['field-item-mobile-popup'],
    FIELD_MOBILE_POPUP_CLASS,
    fixedModeClass,
  );
  const nestedPopupStyle = isMobile ? { zIndex: MOBILE_POPUP_Z_INDEX } : undefined;

  const typeList = new Map([
    ['date', formatMessage({ id: 'customTime' })],
    ['month', formatMessage({ id: 'monthly' })],
    ['week', formatMessage({ id: 'weekly' })],
  ]);

  const defaultShortcuts = useMemo(
    () => [
      {
        label: formatMessage({ id: 'last7Days' }),
        getValue: () => [dayjs().subtract(7, 'day').startOf('day'), dayjs().endOf('day')],
      },
      {
        label: formatMessage({ id: 'thisMonth' }),
        getValue: () => [dayjs().startOf('month'), dayjs().endOf('month')],
      },
      {
        label: formatMessage({ id: 'last3Months' }),
        getValue: () => [dayjs().subtract(3, 'month').startOf('day'), dayjs().endOf('day')],
      },
      {
        label: formatMessage({ id: 'thisYear' }),
        getValue: () => [dayjs().startOf('year'), dayjs().endOf('day')],
      },
      {
        label: formatMessage({ id: 'fullYear' }),
        getValue: () => [dayjs().startOf('year'), dayjs().endOf('year')],
      },
    ],
    [formatMessage],
  );

  const currentShortcuts =
    shortcutOptions !== undefined ? shortcutOptions : shortcuts ? defaultShortcuts : null;

  const isControlled = valueProp !== undefined;
  const innerValueRef = useRef(defaultValue || { type: 'date', value: null });

  const value = isControlled ? valueProp : innerValueRef.current;

  const onChange = useCallback(
    (newValue) => {
      if (!isControlled) {
        innerValueRef.current =
          typeof newValue === 'function' ? newValue(innerValueRef.current) : newValue;
      }
      onChangeProp?.(typeof newValue === 'function' ? newValue(value) : newValue);
    },
    [isControlled, onChangeProp, value],
  );

  const handleShortcutClick = useCallback(
    (shortcut) => {
      const [start, end] = shortcut.getValue();
      const type = 'date';
      onChange({
        type,
        value: [start.startOf(type).toDate(), end.endOf(type).toDate()],
      });
    },
    [onChange],
  );

  const isShortcutActive = useCallback(
    (shortcut) => {
      if (!value?.value || !Array.isArray(value.value) || value.value.length !== 2) {
        return false;
      }
      const [start, end] = shortcut.getValue();
      const type = value?.type || 'date';
      const valueStart = dayjs(value.value[0]).startOf(type);
      const valueEnd = dayjs(value.value[1]).endOf(type);
      const shortcutStart = start.startOf(type);
      const shortcutEnd = end.endOf(type);
      return valueStart.isSame(shortcutStart, type) && valueEnd.isSame(shortcutEnd, type);
    },
    [value],
  );

  const renderShortcuts = useMemo(() => {
    if (!currentShortcuts || currentShortcuts.length === 0) {
      return null;
    }
    return (
      <div className={style['shortcuts-container']}>
        {currentShortcuts.map((shortcut, index) => (
          <span
            key={index}
            className={classnames(style['shortcut-item'], {
              [style['is-active']]: isShortcutActive(shortcut),
            })}
            onClick={() => handleShortcutClick(shortcut)}
          >
            {shortcut.label}
          </span>
        ))}
      </div>
    );
  }, [currentShortcuts, handleShortcutClick, isShortcutActive]);

  return (
    <Flex vertical gap={0}>
      <Space.Compact>
        <Select
          style={{ width: '120px' }}
          getPopupContainer={getPopupContainer}
          popupClassName={isMobile ? nestedPopupClassName : undefined}
          classNames={isMobile ? { popup: { root: nestedPopupClassName } } : undefined}
          popupStyle={nestedPopupStyle}
          styles={isMobile ? { popup: { root: nestedPopupStyle } } : undefined}
          value={value?.type || 'date'}
          onChange={(typeValue) => {
            onChange((currentValue) => {
              if (!currentValue?.value?.length) {
                return { value: null, type: typeValue || 'date' };
              }
              const startTime = dayjs(currentValue.value[0]);
              const endTime = dayjs(currentValue.value[1]);
              return {
                value: [
                  startTime.isValid() ? startTime.startOf(typeValue || 'date').toDate() : null,
                  endTime.isValid() ? endTime.endOf(typeValue || 'date').toDate() : null,
                ],
                type: typeValue || 'date',
              };
            });
          }}
          options={Array.from(typeList).map(([val, label]) => ({
            label,
            value: val,
          }))}
        />
        <DatePicker.RangePicker
          {...props}
          getPopupContainer={getPopupContainer}
          classNames={
            isMobile
              ? {
                  ...props.classNames,
                  popup: {
                    ...props.classNames?.popup,
                    root: classnames(props.classNames?.popup?.root, nestedPopupClassName),
                  },
                }
              : props.classNames
          }
          styles={
            isMobile
              ? {
                  ...props.styles,
                  popup: {
                    ...props.styles?.popup,
                    root: Object.assign({}, props.styles?.popup?.root, nestedPopupStyle),
                  },
                }
              : props.styles
          }
          popupStyle={nestedPopupStyle}
          picker={value?.type || 'date'}
          value={
            Array.isArray(value?.value) && value.value.length === 2
              ? value.value.map((item) => item && dayjs(item))
              : null
          }
          onChange={(dateValue) => {
            onChange((currentValue) => {
              return Object.assign({ type: 'date' }, currentValue, {
                value:
                  dateValue && dateValue[0] && dateValue[1]
                    ? [
                        dateValue[0].startOf(currentValue?.type || 'date').toDate(),
                        dateValue[1].endOf(currentValue?.type || 'date').toDate(),
                      ]
                    : null,
              });
            });
          }}
        />
      </Space.Compact>
      {renderShortcuts}
    </Flex>
  );
};

export default TypeDateRangePickerField;
