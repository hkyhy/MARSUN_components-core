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
  showQuickOptions?: boolean;
  quickOptions?: QuickOption[];
}

const FilterDateRange: React.FC<FilterDateRangeProps> = ({
  filterKey,
  label,
  value,
  onChange,
  showQuickOptions = true,
  quickOptions,
  active,
  hidden,
}) => {
  const [dates, setDates] = useState<[Dayjs | null, Dayjs | null] | null>(
    value ? [dayjs(value[0]), dayjs(value[1])] : null,
  );
  const [activeQuickKey, setActiveQuickKey] = useState<string | null>(null);

  // ── 自动注册到 CommonFilter ──
  const registerFn = useFilterRegister();

  // 同步外部 value 到内部 dates
  useEffect(() => {
    if (value) {
      setDates([dayjs(value[0]), dayjs(value[1])]);
    } else {
      setDates(null);
    }
  }, [value]);

  const valueLabel = useMemo(() => {
    if (!value?.[0] || !value?.[1]) return '';
    return `${value[0]} ~ ${value[1]}`;
  }, [value]);

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

  // hidden 处理 - 必须在所有 hooks 之后
  if (resolveHidden(hidden)) return null;

  const handleConfirm = () => {
    if (dates?.[0] && dates?.[1]) {
      onChange?.([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
    } else {
      onChange?.(null);
    }
  };

  const handleReset = () => {
    setDates(null);
    setActiveQuickKey(null);
    onChange?.(null);
  };

  const opts = quickOptions ?? (showQuickOptions ? BUILT_IN_OPTIONS : []);

  return (
    <FilterPopover
      label={label}
      active={active || !!value?.[0]}
      onConfirm={handleConfirm}
      onReset={handleReset}
    >
      {/* 快捷选项 */}
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
