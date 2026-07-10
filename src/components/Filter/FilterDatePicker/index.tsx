import { DatePicker } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
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

/** 单值快捷选项 */
interface SingleQuickOption {
  key: string;
  label: string;
  getValue: () => Dayjs;
}

interface FilterDatePickerProps extends BaseFilterProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  /** 选择粒度：日 / 月 / 年 */
  picker?: DatePickerGranularity;
  /** 默认值：与默认相同时视为未筛选（除非 showDefaultAsSelected） */
  defaultValue?: string;
  /** 为 true 时，value 等于 defaultValue 仍展示在已选 Tag 中 */
  showDefaultAsSelected?: boolean;
  showQuickOptions?: boolean;
  quickOptions?: SingleQuickOption[];
  placeholder?: string;
  disabledDate?: (current: Dayjs) => boolean;
}

function getBuiltInQuickOptions(picker: DatePickerGranularity): SingleQuickOption[] {
  const now = dayjs();
  if (picker === 'year') {
    return [{ key: 'thisYear', label: '今年', getValue: () => now.startOf('year') }];
  }
  if (picker === 'month') {
    return [{ key: 'thisMonth', label: '本月', getValue: () => now.startOf('month') }];
  }
  return [{ key: 'today', label: '今天', getValue: () => now.startOf('day') }];
}

function isSamePickerValue(a?: string | null, b?: string): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a === b;
}

function findMatchingQuickKey(
  value: string | null | undefined,
  picker: DatePickerGranularity,
  opts: SingleQuickOption[],
): string | null {
  if (!value) return null;
  const current = parsePickerValue(value, picker);
  if (!current.isValid()) return null;
  for (const opt of opts) {
    const candidate = opt.getValue();
    const unit = picker === 'year' ? 'year' : picker === 'month' ? 'month' : 'day';
    if (candidate.isSame(current, unit)) return opt.key;
  }
  return null;
}

const FilterDatePicker: React.FC<FilterDatePickerProps> = ({
  filterKey,
  label,
  value,
  onChange,
  picker = 'date',
  defaultValue,
  showDefaultAsSelected = false,
  showQuickOptions = false,
  quickOptions,
  placeholder,
  disabledDate,
  active,
  hidden,
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Dayjs | null>(value ? parsePickerValue(value, picker) : null);
  const [activeQuickKey, setActiveQuickKey] = useState<string | null>(null);

  const registerFn = useFilterRegister();
  const opts = useMemo(
    () => quickOptions ?? (showQuickOptions ? getBuiltInQuickOptions(picker) : []),
    [quickOptions, showQuickOptions, picker],
  );

  const syncActiveQuickKey = (nextValue: string | null | undefined) => {
    setActiveQuickKey(findMatchingQuickKey(nextValue, picker, opts));
  };

  const revertToCommitted = () => {
    if (value) {
      setDraft(parsePickerValue(value, picker));
      syncActiveQuickKey(value);
    } else {
      setDraft(null);
      setActiveQuickKey(null);
    }
  };

  useEffect(() => {
    if (value) {
      setDraft(parsePickerValue(value, picker));
      syncActiveQuickKey(value);
    } else {
      setDraft(null);
      setActiveQuickKey(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, picker, opts]);

  const hasNonDefaultValue = showDefaultAsSelected
    ? !!value
    : !!value && !isSamePickerValue(value, defaultValue);

  const valueLabel = useMemo(() => {
    if (!hasNonDefaultValue || !value) return '';
    return value;
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
    if (draft) {
      onChange?.(formatPickerValue(draft, picker));
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
      {opts.length > 0 ? (
        <div
          className={classNames(
            'filter-date-picker-quick-options',
            styles['filter-date-picker-quick-options'],
          )}
        >
          {opts.map((opt) => (
            <span
              key={opt.key}
              className={classNames(
                'filter-date-picker-quick-option',
                styles['filter-date-picker-quick-option'],
                activeQuickKey === opt.key && 'filter-date-picker-quick-option-active',
                activeQuickKey === opt.key && styles['filter-date-picker-quick-option-active'],
              )}
              onClick={() => {
                const next = opt.getValue();
                setDraft(next);
                setActiveQuickKey(opt.key);
              }}
            >
              {opt.label}
            </span>
          ))}
        </div>
      ) : null}
      <DatePicker
        className={classNames('filter-date-picker', styles['filter-date-picker'])}
        picker={picker}
        value={draft}
        placeholder={placeholder}
        disabledDate={disabledDate}
        onChange={(next) => {
          setDraft(next);
          setActiveQuickKey(null);
        }}
      />
    </FilterPopover>
  );
};

export default FilterDatePicker;
export type { FilterDatePickerProps, SingleQuickOption };
export { findMatchingQuickKey, getBuiltInQuickOptions, isSamePickerValue };
