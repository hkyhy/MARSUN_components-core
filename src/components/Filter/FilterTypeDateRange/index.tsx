import { DatePicker, Select, Space } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import classNames from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import FilterPopover from '../FilterPopover';
import type { BaseFilterProps } from '../types';
import { resolveFilterVisible } from '../types';
import { useFilterFieldBridge, useFilterRegister } from '../useFilterState';
import styles from './style.module.scss';

export type FilterTypeDateRangeType = 'date' | 'month' | 'week';

export type FilterTypeDateRangeValue = {
  type: FilterTypeDateRangeType;
  range: [string, string] | null;
} | null;

export type FilterTypeDateRangeProps = BaseFilterProps & {
  value?: FilterTypeDateRangeValue;
  onChange?: (value: FilterTypeDateRangeValue) => void;
  showShortcuts?: boolean;
};

const TYPE_OPTIONS: { label: string; value: FilterTypeDateRangeType }[] = [
  { label: '自定义时间', value: 'date' },
  { label: '按月', value: 'month' },
  { label: '按周', value: 'week' },
];

type Shortcut = { key: string; label: string; getRange: () => [Dayjs, Dayjs] };

const SHORTCUTS: Shortcut[] = [
  {
    key: 'last7',
    label: '近7天',
    getRange: () => [dayjs().subtract(7, 'day').startOf('day'), dayjs().endOf('day')],
  },
  {
    key: 'thisMonth',
    label: '本月',
    getRange: () => [dayjs().startOf('month'), dayjs().endOf('month')],
  },
  {
    key: 'last3m',
    label: '近3月',
    getRange: () => [dayjs().subtract(3, 'month').startOf('day'), dayjs().endOf('day')],
  },
  {
    key: 'thisYear',
    label: '今年至今',
    getRange: () => [dayjs().startOf('year'), dayjs().endOf('day')],
  },
];

function formatBound(d: Dayjs, type: FilterTypeDateRangeType): string {
  if (type === 'month') return d.format('YYYY-MM');
  return d.format('YYYY-MM-DD');
}

function toDayjsPair(
  range: [string, string] | null | undefined,
  type: FilterTypeDateRangeType,
): [Dayjs, Dayjs] | null {
  if (!range?.[0] || !range?.[1]) return null;
  const a = dayjs(range[0]);
  const b = dayjs(range[1]);
  if (!a.isValid() || !b.isValid()) return null;
  return [a.startOf(type === 'week' ? 'week' : type), b.endOf(type === 'week' ? 'week' : type)];
}

function formatValueLabel(v: FilterTypeDateRangeValue): string {
  if (!v?.range?.[0] || !v.range[1]) return '';
  const [a, b] = v.range;
  if (v.type === 'month') return `${a} ~ ${b}`;
  return `${a} ~ ${b}`;
}

const FilterTypeDateRange: React.FC<FilterTypeDateRangeProps> = ({
  filterKey,
  label,
  value,
  onChange,
  showShortcuts = true,
  active,
  hidden,
  display,
  dependsOn,
  clearOnDepsChange = true,
}) => {
  const [type, setType] = useState<FilterTypeDateRangeType>(value?.type ?? 'date');
  const [range, setRange] = useState<[string, string] | null>(value?.range ?? null);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const { resolvedLabel } = useFilterFieldBridge({
    filterKey,
    value,
    label,
    dependsOn,
    clearOnDepsChange,
    onDepsClear: () => onChangeRef.current?.(null),
  });

  const registerFn = useFilterRegister();
  const visible = resolveFilterVisible({ display, hidden });

  useEffect(() => {
    setType(value?.type ?? 'date');
    setRange(value?.range ?? null);
  }, [value]);

  const valueLabel = useMemo(() => formatValueLabel(value ?? null), [value]);

  useEffect(() => {
    if (!registerFn) return;
    if (!visible) {
      registerFn.unregister(filterKey);
      return;
    }
    if (valueLabel) {
      registerFn.register(filterKey, {
        label: resolvedLabel,
        valueLabel,
        onRemove: () => onChange?.(null),
      });
    } else {
      registerFn.unregister(filterKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueLabel, filterKey, resolvedLabel, visible]);

  if (!visible) return null;

  const pickerValue = toDayjsPair(range, type);

  const applyRange = (nextType: FilterTypeDateRangeType, nextPair: [Dayjs, Dayjs] | null) => {
    if (!nextPair) {
      setRange(null);
      return;
    }
    setRange([formatBound(nextPair[0], nextType), formatBound(nextPair[1], nextType)]);
  };

  return (
    <FilterPopover
      label={resolvedLabel}
      active={active || Boolean(value?.range?.[0] && value.range[1])}
      width={420}
      onOpenChange={(open) => {
        if (open) {
          setType(value?.type ?? 'date');
          setRange(value?.range ?? null);
        }
      }}
      onConfirm={() => {
        if (range?.[0] && range[1]) {
          onChange?.({ type, range });
        } else {
          onChange?.(null);
        }
      }}
      onReset={() => {
        setType('date');
        setRange(null);
        onChange?.(null);
      }}
    >
      <div
        className={classNames('filter-type-date-range-body', styles['filter-type-date-range-body'])}
      >
        <Space.Compact className={styles['filter-type-date-range-compact']}>
          <Select
            style={{ width: 120 }}
            value={type}
            options={TYPE_OPTIONS}
            onChange={(t: FilterTypeDateRangeType) => {
              setType(t);
              if (pickerValue) {
                applyRange(t, [
                  pickerValue[0].startOf(t === 'week' ? 'week' : t),
                  pickerValue[1].endOf(t === 'week' ? 'week' : t),
                ]);
              }
            }}
          />
          <DatePicker.RangePicker
            className={styles['filter-type-date-range-picker']}
            picker={type}
            value={pickerValue}
            onChange={(dates) => {
              if (!dates?.[0] || !dates[1]) {
                setRange(null);
                return;
              }
              applyRange(type, [
                dates[0].startOf(type === 'week' ? 'week' : type),
                dates[1].endOf(type === 'week' ? 'week' : type),
              ]);
            }}
          />
        </Space.Compact>
        {showShortcuts ? (
          <div
            className={classNames(
              'filter-type-date-range-shortcuts',
              styles['filter-type-date-range-shortcuts'],
            )}
          >
            {SHORTCUTS.map((s) => {
              const [a, b] = s.getRange();
              const candidate: [string, string] = [formatBound(a, 'date'), formatBound(b, 'date')];
              const isActive =
                type === 'date' && range?.[0] === candidate[0] && range?.[1] === candidate[1];
              return (
                <span
                  key={s.key}
                  className={classNames(
                    styles['filter-type-date-range-shortcut'],
                    isActive && styles['filter-type-date-range-shortcut-active'],
                  )}
                  onClick={() => {
                    setType('date');
                    setRange(candidate);
                  }}
                >
                  {s.label}
                </span>
              );
            })}
          </div>
        ) : null}
      </div>
    </FilterPopover>
  );
};

export default FilterTypeDateRange;
