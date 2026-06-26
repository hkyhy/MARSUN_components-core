import { Input } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import FilterPopover from '../FilterPopover';
import { useFilterRegister } from '../useFilterState';
import type { BaseFilterProps } from '../types';
import { resolveHidden } from '../types';
import styles from './style.module.scss';
import classNames from 'classnames';

interface FilterNumberRangeProps extends BaseFilterProps {
  value?: [number | undefined, number | undefined] | null;
  onChange?: (value: [number | undefined, number | undefined] | null) => void;
  unit?: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
}

const FilterNumberRange: React.FC<FilterNumberRangeProps> = ({
  filterKey,
  label,
  value,
  onChange,
  unit,
  minPlaceholder = '最低...',
  maxPlaceholder = '最高...',
  active,
  hidden,
}) => {
  const [minVal, setMinVal] = useState<number | undefined>(value?.[0]);
  const [maxVal, setMaxVal] = useState<number | undefined>(value?.[1]);

  // ── 自动注册到 CommonFilter ──
  const registerFn = useFilterRegister();

  // 同步外部 value 到内部 minVal/maxVal
  useEffect(() => {
    setMinVal(value?.[0]);
    setMaxVal(value?.[1]);
  }, [value]);

  const valueLabel = useMemo(() => {
    if (minVal === undefined && maxVal === undefined) return '';
    const min = minVal !== undefined ? String(minVal) : '—';
    const max = maxVal !== undefined ? String(maxVal) : '—';
    return `${min} ~ ${max}${unit ?? ''}`;
  }, [minVal, maxVal, unit]);

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
    if (minVal !== undefined || maxVal !== undefined) {
      onChange?.([minVal, maxVal]);
    } else {
      onChange?.(null);
    }
  };

  const handleReset = () => {
    setMinVal(undefined);
    setMaxVal(undefined);
    onChange?.(null);
  };

  return (
    <FilterPopover
      label={label}
      active={active || !!value?.[0] || !!value?.[1]}
      onConfirm={handleConfirm}
      onReset={handleReset}
      width={380}
    >
      <div className={classNames('filter-number-range-inputs', styles['filter-number-range-inputs'])}>
        <Input
          size="middle"
          placeholder={minPlaceholder}
          type="number"
          value={minVal}
          onChange={(e) => setMinVal(e.target.value ? Number(e.target.value) : undefined)}
        />
        <span className={classNames('filter-number-range-separator', styles['filter-number-range-separator'])}>-</span>
        <Input
          size="middle"
          placeholder={maxPlaceholder}
          type="number"
          value={maxVal}
          onChange={(e) => setMaxVal(e.target.value ? Number(e.target.value) : undefined)}
        />
        {unit && <span className={classNames('filter-number-range-unit', styles['filter-number-range-unit'])}>{unit}</span>}
      </div>
    </FilterPopover>
  );
};

export default FilterNumberRange;
export type { FilterNumberRangeProps };
