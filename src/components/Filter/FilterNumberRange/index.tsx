import { InputNumber, message } from 'antd';
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
  /** 绝对值下限（左右输入框共用） */
  min?: number;
  /** 绝对值上限（左右输入框共用） */
  max?: number;
  /** 小数位数 */
  precision?: number;
  /** 步进；未传且有 precision 时按 10^-precision 推导 */
  step?: number;
}

function formatNumber(n: number, precision?: number): string {
  if (precision != null && precision >= 0) return n.toFixed(precision);
  return String(n);
}

function resolveStep(step: number | undefined, precision: number | undefined): number | undefined {
  if (step != null) return step;
  if (precision != null && precision >= 0) return 10 ** -precision;
  return undefined;
}

const FilterNumberRange: React.FC<FilterNumberRangeProps> = ({
  filterKey,
  label,
  value,
  onChange,
  unit,
  minPlaceholder = '最低...',
  maxPlaceholder = '最高...',
  min,
  max,
  precision,
  step,
  active,
  hidden,
}) => {
  const [minVal, setMinVal] = useState<number | undefined>(value?.[0]);
  const [maxVal, setMaxVal] = useState<number | undefined>(value?.[1]);
  const [rangeError, setRangeError] = useState('');

  const resolvedStep = resolveStep(step, precision);

  // ── 自动注册到 CommonFilter ──
  const registerFn = useFilterRegister();

  // 同步外部 value 到内部 minVal/maxVal
  useEffect(() => {
    setMinVal(value?.[0]);
    setMaxVal(value?.[1]);
    setRangeError('');
  }, [value]);

  const valueLabel = useMemo(() => {
    if (minVal === undefined && maxVal === undefined) return '';
    const minText = minVal !== undefined ? formatNumber(minVal, precision) : '—';
    const maxText = maxVal !== undefined ? formatNumber(maxVal, precision) : '—';
    return `${minText} ~ ${maxText}${unit ?? ''}`;
  }, [minVal, maxVal, unit, precision]);

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

  const handleConfirm = (): boolean | void => {
    if (minVal !== undefined && maxVal !== undefined && minVal > maxVal) {
      const msg = '最小值不能大于最大值';
      setRangeError(msg);
      message.warning(msg);
      return false;
    }
    setRangeError('');
    if (minVal !== undefined || maxVal !== undefined) {
      onChange?.([minVal, maxVal]);
    } else {
      onChange?.(null);
    }
  };

  const handleReset = () => {
    setMinVal(undefined);
    setMaxVal(undefined);
    setRangeError('');
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
      <div className={classNames('filter-number-range-body', styles['filter-number-range-body'])}>
        <div
          className={classNames('filter-number-range-inputs', styles['filter-number-range-inputs'])}
        >
          <InputNumber
            size="middle"
            placeholder={minPlaceholder}
            value={minVal}
            min={min}
            max={max}
            precision={precision}
            step={resolvedStep}
            onChange={(v) => {
              setMinVal(v === null ? undefined : v);
              setRangeError('');
            }}
          />
          <span
            className={classNames(
              'filter-number-range-separator',
              styles['filter-number-range-separator'],
            )}
          >
            -
          </span>
          <InputNumber
            size="middle"
            placeholder={maxPlaceholder}
            value={maxVal}
            min={min}
            max={max}
            precision={precision}
            step={resolvedStep}
            onChange={(v) => {
              setMaxVal(v === null ? undefined : v);
              setRangeError('');
            }}
          />
          {unit ? (
            <span
              className={classNames('filter-number-range-unit', styles['filter-number-range-unit'])}
            >
              {unit}
            </span>
          ) : null}
        </div>
        {rangeError ? (
          <div
            className={classNames('filter-number-range-error', styles['filter-number-range-error'])}
            role="alert"
          >
            {rangeError}
          </div>
        ) : null}
      </div>
    </FilterPopover>
  );
};

export default FilterNumberRange;
export type { FilterNumberRangeProps };
