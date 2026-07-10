import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import {
  formatPickerValue,
  parsePickerValue,
  type DatePickerGranularity,
} from '@/utils/pickerDate';
import FilterPopover from '../FilterPopover';
import type { BaseFilterProps } from '../types';
import { resolveHidden } from '../types';
import { useFilterRegister } from '../useFilterState';
import styles from './style.module.scss';
import classNames from 'classnames';

const { RangePicker } = DatePicker;

/** 快捷选项配置类型 */
interface QuickOption {
  key: string;
  label: string;
  getValue: () => [Dayjs, Dayjs] | null;
}

/** 内置快捷选项（日粒度） */
const BUILT_IN_DAY_OPTIONS: QuickOption[] = [
  {
    key: 'lastWeek',
    label: '上周',
    getValue: () => [
      dayjs().subtract(1, 'week').startOf('week'),
      dayjs().subtract(1, 'week').endOf('week'),
    ],
  },
  {
    key: 'thisWeek',
    label: '本周',
    getValue: () => [dayjs().startOf('week'), dayjs().endOf('week')],
  },
];

function getBuiltInMonthOptions(): QuickOption[] {
  const end = dayjs().startOf('month');
  return [
    { key: '1m', label: '近1月', getValue: () => [end, end] },
    {
      key: '3m',
      label: '近3月',
      getValue: () => [end.subtract(2, 'month'), end],
    },
    {
      key: '6m',
      label: '近6月',
      getValue: () => [end.subtract(5, 'month'), end],
    },
  ];
}

interface FilterDateRangeProps extends BaseFilterProps {
  value?: [string, string] | null;
  onChange?: (value: [string, string] | null) => void;
  /** 选择粒度：日 / 月 / 年 */
  picker?: DatePickerGranularity;
  /** 默认区间：与默认相同时视为未筛选（除非 showDefaultAsSelected） */
  defaultValue?: [string, string];
  /** 为 true 时，value 等于 defaultValue 仍展示在已选 Tag 中 */
  showDefaultAsSelected?: boolean;
  showQuickOptions?: boolean;
  quickOptions?: QuickOption[];
  disabledDate?: (current: Dayjs) => boolean;
}

function isSameRange(a?: [string, string] | null, b?: [string, string]): boolean {
  if (!a?.[0] || !a?.[1]) return !b?.[0] || !b?.[1];
  if (!b?.[0] || !b?.[1]) return false;
  return a[0] === b[0] && a[1] === b[1];
}

function rangeUnit(picker: DatePickerGranularity): 'day' | 'month' | 'year' {
  if (picker === 'month') return 'month';
  if (picker === 'year') return 'year';
  return 'day';
}

function findMatchingQuickKey(
  range: [string, string] | null | undefined,
  opts: QuickOption[],
  picker: DatePickerGranularity,
): string | null {
  if (!range?.[0] || !range?.[1]) return null;
  const start = parsePickerValue(range[0], picker);
  const end = parsePickerValue(range[1], picker);
  const unit = rangeUnit(picker);
  for (const opt of opts) {
    const v = opt.getValue();
    if (v && v[0].isSame(start, unit) && v[1].isSame(end, unit)) {
      return opt.key;
    }
  }
  return null;
}

const FilterDateRange: React.FC<FilterDateRangeProps> = ({
  filterKey,
  label,
  value,
  onChange,
  picker = 'date',
  defaultValue,
  showDefaultAsSelected = false,
  showQuickOptions = true,
  quickOptions,
  disabledDate,
  active,
  hidden,
}) => {
  const [open, setOpen] = useState(false);
  const [dates, setDates] = useState<[Dayjs | null, Dayjs | null] | null>(
    value ? [parsePickerValue(value[0], picker), parsePickerValue(value[1], picker)] : null,
  );
  const [activeQuickKey, setActiveQuickKey] = useState<string | null>(null);

  const registerFn = useFilterRegister();
  const opts = useMemo(
    () =>
      quickOptions ??
      (showQuickOptions
        ? picker === 'month'
          ? getBuiltInMonthOptions()
          : BUILT_IN_DAY_OPTIONS
        : []),
    [quickOptions, showQuickOptions, picker],
  );

  const syncActiveQuickKey = (range: [string, string] | null | undefined) => {
    setActiveQuickKey(findMatchingQuickKey(range, opts, picker));
  };

  const revertToCommitted = () => {
    if (value?.[0] && value?.[1]) {
      setDates([parsePickerValue(value[0], picker), parsePickerValue(value[1], picker)]);
      syncActiveQuickKey(value);
    } else {
      setDates(null);
      setActiveQuickKey(null);
    }
  };

  useEffect(() => {
    if (value?.[0] && value?.[1]) {
      setDates([parsePickerValue(value[0], picker), parsePickerValue(value[1], picker)]);
      syncActiveQuickKey(value);
    } else {
      setDates(null);
      setActiveQuickKey(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, opts, picker]);

  const hasNonDefaultValue = showDefaultAsSelected
    ? !!value?.[0]
    : !!value?.[0] && !isSameRange(value, defaultValue);

  const valueLabel = useMemo(() => {
    if (!hasNonDefaultValue || !value?.[0] || !value?.[1]) return '';
    return `${value[0]} ~ ${value[1]}`;
  }, [hasNonDefaultValue, value]);

  useEffect(() => {
    if (!registerFn) return;
    if (resolveHidden(hidden)) {
      registerFn.unregister(filterKey);
      return;
    }
    if (valueLabel) {
      registerFn.register(filterKey, { label, valueLabel, onRemove: () => onChange?.(null) });
    } else {
      registerFn.unregister(filterKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueLabel, filterKey, label, hidden]);

  if (resolveHidden(hidden)) return null;

  const handleConfirm = () => {
    if (dates?.[0] && dates?.[1]) {
      onChange?.([formatPickerValue(dates[0], picker), formatPickerValue(dates[1], picker)]);
    } else {
      onChange?.(null);
    }
    setOpen(false);
  };

  const handleDiscardDraft = () => {
    revertToCommitted();
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    revertToCommitted();
    setOpen(nextOpen);
  };

  return (
    <FilterPopover
      label={label}
      active={active || hasNonDefaultValue}
      open={open}
      onOpenChange={handleOpenChange}
      onConfirm={handleConfirm}
      onReset={handleDiscardDraft}
    >
      {opts.length > 0 && (
        <div
          className={classNames(
            'filter-date-range-quick-options',
            styles['filter-date-range-quick-options'],
          )}
        >
          {opts.map((opt) => (
            <span
              key={opt.key}
              className={classNames(
                'filter-date-range-quick-option',
                styles['filter-date-range-quick-option'],
                activeQuickKey === opt.key && 'filter-date-range-quick-option-active',
                activeQuickKey === opt.key && styles['filter-date-range-quick-option-active'],
              )}
              onClick={() => {
                const v = opt.getValue();
                if (v) {
                  setDates(v);
                  setActiveQuickKey(opt.key);
                }
              }}
            >
              {opt.label}
            </span>
          ))}
        </div>
      )}
      <RangePicker
        className={classNames('filter-date-range-picker', styles['filter-date-range-picker'])}
        picker={picker}
        value={dates}
        disabledDate={disabledDate}
        onChange={(vals) => {
          setDates(vals as [Dayjs | null, Dayjs | null] | null);
          setActiveQuickKey(null);
        }}
      />
    </FilterPopover>
  );
};

export default FilterDateRange;
export type { FilterDateRangeProps, QuickOption };
export { findMatchingQuickKey, isSameRange, getBuiltInMonthOptions };
