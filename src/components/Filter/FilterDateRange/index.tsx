import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
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

/** 内置快捷选项 */
const BUILT_IN_OPTIONS: QuickOption[] = [
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

interface FilterDateRangeProps extends BaseFilterProps {
  value?: [string, string] | null;
  onChange?: (value: [string, string] | null) => void;
  /** 默认区间：与默认相同时视为未筛选 */
  defaultValue?: [string, string];
  showQuickOptions?: boolean;
  quickOptions?: QuickOption[];
}

function isSameRange(a?: [string, string] | null, b?: [string, string]): boolean {
  if (!a?.[0] || !a?.[1]) return !b?.[0] || !b?.[1];
  if (!b?.[0] || !b?.[1]) return false;
  return a[0] === b[0] && a[1] === b[1];
}

const FilterDateRange: React.FC<FilterDateRangeProps> = ({
  filterKey,
  label,
  value,
  onChange,
  defaultValue,
  showQuickOptions = true,
  quickOptions,
  active,
  hidden,
}) => {
  const [open, setOpen] = useState(false);
  const [dates, setDates] = useState<[Dayjs | null, Dayjs | null] | null>(
    value ? [dayjs(value[0]), dayjs(value[1])] : null,
  );
  const [activeQuickKey, setActiveQuickKey] = useState<string | null>(null);

  const registerFn = useFilterRegister();

  const revertToCommitted = () => {
    if (value?.[0] && value?.[1]) {
      setDates([dayjs(value[0]), dayjs(value[1])]);
    } else {
      setDates(null);
    }
    setActiveQuickKey(null);
  };

  useEffect(() => {
    if (value?.[0] && value?.[1]) {
      setDates([dayjs(value[0]), dayjs(value[1])]);
    } else {
      setDates(null);
    }
  }, [value]);

  const hasNonDefaultValue = !!value?.[0] && !isSameRange(value, defaultValue);

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
      onChange?.([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
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
    if (!nextOpen) {
      revertToCommitted();
    }
    setOpen(nextOpen);
  };

  const opts = quickOptions ?? (showQuickOptions ? BUILT_IN_OPTIONS : []);

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
        <div className={classNames('filter-date-range-quick-options', styles['filter-date-range-quick-options'])}>
          {opts.map((opt) => (
            <span
              key={opt.key}
              className={classNames('filter-date-range-quick-option', styles['filter-date-range-quick-option'],
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
        value={dates}
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
