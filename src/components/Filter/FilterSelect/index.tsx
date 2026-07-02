import { Check, X } from '@/components/Icons';
import { Checkbox, Input, Space } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import PersonOptionRow from '../../Form/PersonOptionRow';
import FilterPopover from '../FilterPopover';
import type { BaseFilterProps, FilterOption, PersonOption } from '../types';
import { resolveFilterVisible } from '../types';
import { useFilterRegister } from '../useFilterState';
import styles from './style.module.scss';
import classNames from 'classnames';

const { Search } = Input;

function formatPersonValueLabel(opt: PersonOption): string {
  const parts = [opt.label];
  if (opt.departmentName) parts.push(opt.departmentName);
  return parts.join(' · ');
}

function matchPersonOptionSearch(opt: PersonOption, keyword: string): boolean {
  const lower = keyword.toLowerCase();
  return [opt.label, opt.departmentName, opt.email, opt.phone, opt.employeeId]
    .filter(Boolean)
    .some((s) => String(s).toLowerCase().includes(lower));
}

type FilterSelectValue = string | number | (string | number)[] | undefined;

export type { FilterSelectValue };

function arraysEqual(
  a?: (string | number)[],
  b?: (string | number)[],
): boolean {
  if (!a?.length && !b?.length) return true;
  if (!a || !b || a.length !== b.length) return false;
  const sortedA = [...a].map(String).sort();
  const sortedB = [...b].map(String).sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

interface FilterSelectProps extends BaseFilterProps {
  options: FilterOption[];
  value?: FilterSelectValue;
  onChange?: (value: FilterSelectValue) => void;
  /** 默认值：与默认值相同时视为未筛选（不展示已选标签与选中态） */
  defaultValue?: string | number;
  /** 多选默认值：与默认集合相同时视为未筛选 */
  defaultValues?: (string | number)[];
  placeholder?: string;
  searchable?: boolean;
  /** 是否多选 */
  multiple?: boolean;
  /** 多选至少保留项数；达到下限时不允许移除已选标签 */
  minSelection?: number;
  /** 人员选项：展示部门与联系方式 */
  variant?: 'default' | 'person';
}

function toDisplayValue(
  value: FilterSelectValue,
  defaultValue: string | number | undefined,
  defaultValues: (string | number)[] | undefined,
  multiple: boolean,
): string | number | (string | number)[] | undefined {
  if (multiple) {
    const arr = Array.isArray(value) ? value : value != null && value !== '' ? [value] : [];
    if (defaultValues?.length && arraysEqual(arr, defaultValues)) {
      return [];
    }
    return arr;
  }
  if (defaultValue !== undefined && value === defaultValue) return undefined;
  return value;
}

function formatValueLabel(
  displayVal: string | number | (string | number)[] | undefined,
  options: FilterOption[],
  multiple: boolean,
  isPersonVariant: boolean,
): string {
  if (multiple) {
    const arr = (displayVal as (string | number)[]) || [];
    return arr.length > 0
      ? arr.map((v) => options.find((o) => String(o.value) === String(v))?.label ?? String(v)).join('、')
      : '';
  }
  if (displayVal == null) return '';
  const opt = options.find((o) => String(o.value) === String(displayVal));
  if (!opt) return String(displayVal);
  return isPersonVariant ? formatPersonValueLabel(opt as PersonOption) : opt.label;
}

const FilterSelect: React.FC<FilterSelectProps> = ({
  filterKey,
  label,
  options = [],
  value,
  onChange,
  defaultValue,
  defaultValues,
  searchable = false,
  multiple = false,
  minSelection,
  variant = 'default',
  active,
  hidden,
  display,
}) => {
  const isPersonVariant = variant === 'person';
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const displayValue = toDisplayValue(value, defaultValue, defaultValues, multiple);
  const [localValue, setLocalValue] = useState<string | number | (string | number)[] | undefined>(
    displayValue ?? (multiple ? [] : undefined),
  );

  // ── 自动注册到 CommonFilter ──
  const registerFn = useFilterRegister();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handleRemove = useMemo(() => {
    const selectedArr = Array.isArray(displayValue)
      ? displayValue
      : displayValue != null && displayValue !== ''
        ? [displayValue]
        : [];
    const canRemove =
      !multiple ||
      minSelection == null ||
      selectedArr.length > minSelection;
    return () => {
      if (!canRemove) return;
      onChangeRef.current?.(undefined);
    };
  }, [displayValue, minSelection, multiple]);

  const revertToCommitted = () => {
    const next = displayValue ?? (multiple ? [] : undefined);
    setLocalValue(next);
    setSearchText('');
  };

  // 同步外部 value 到内部 localValue
  useEffect(() => {
    const nextDisplayValue = toDisplayValue(value, defaultValue, defaultValues, multiple);
    setLocalValue(nextDisplayValue ?? (multiple ? [] : undefined));
    if (
      nextDisplayValue === undefined ||
      nextDisplayValue === null ||
      (Array.isArray(nextDisplayValue) && nextDisplayValue.length === 0)
    ) {
      setSearchText('');
    }
  }, [value, defaultValue, defaultValues, multiple]);

  const committedValueLabel = useMemo(
    () => formatValueLabel(displayValue, options, multiple, isPersonVariant),
    [options, displayValue, multiple, isPersonVariant],
  );

  useEffect(() => {
    if (!registerFn) return;
    const ctx = { filterKey, label, value };
    if (!resolveFilterVisible({ display, hidden }, ctx)) {
      registerFn.unregister(filterKey);
      return;
    }
    if (committedValueLabel) {
      const selectedArr = Array.isArray(displayValue)
        ? displayValue
        : displayValue != null && displayValue !== ''
          ? [displayValue]
          : [];
      const removable =
        !multiple || minSelection == null || selectedArr.length > minSelection;
      registerFn.register(filterKey, {
        label,
        valueLabel: committedValueLabel,
        onRemove: handleRemove,
        removable,
      });
    } else {
      registerFn.unregister(filterKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [committedValueLabel, filterKey, label, hidden, display, handleRemove]);

  const visibilityCtx = { filterKey, label, value };
  if (!resolveFilterVisible({ display, hidden }, visibilityCtx)) return null;

  const filteredOptions = searchText
    ? options.filter((opt) =>
        isPersonVariant
          ? matchPersonOptionSearch(opt as PersonOption, searchText)
          : opt.label.toLowerCase().includes(searchText.toLowerCase()),
      )
    : options;

  const handleConfirm = () => {
    onChange?.(localValue as FilterSelectValue);
    setOpen(false);
  };

  const handleDiscardDraft = () => {
    revertToCommitted();
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && multiple) {
      revertToCommitted();
    }
    setOpen(nextOpen);
  };

  const handleClickOption = (optVal: string | number) => {
    if (!multiple) {
      const isDefaultOption = defaultValue !== undefined && optVal === defaultValue;
      let next: string | number | undefined;
      if (localValue === optVal || isDefaultOption) {
        next = undefined;
      } else {
        next = optVal;
      }
      setLocalValue(next);
      onChange?.(next);
      setOpen(false);
    }
  };

  const handleToggleMulti = (optVal: string | number) => {
    const arr = (localValue as (string | number)[]) || [];
    if (arr.includes(optVal) && minSelection != null && arr.length <= minSelection) {
      return;
    }
    const next = arr.includes(optVal) ? arr.filter((v) => v !== optVal) : [...arr, optVal];
    setLocalValue(next);
  };

  const isActive = multiple
    ? Array.isArray(displayValue) && displayValue.length > 0
    : displayValue != null && displayValue !== '';

  return (
    <FilterPopover
      label={label}
      active={active || isActive}
      open={open}
      onOpenChange={handleOpenChange}
      onConfirm={multiple ? handleConfirm : undefined}
      onReset={multiple ? handleDiscardDraft : undefined}
    >
      {searchable && (
        <Search
          placeholder={`搜索${label}`}
          allowClear
          size="middle"
          className={classNames('filter-select-search', styles['filter-select-search'])}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      )}

      <div className={classNames('filter-select-options', styles['filter-select-options'])}>
        {filteredOptions.map((opt) => (
          <div
            key={String(opt.value)}
            className={classNames('filter-select-option', styles['filter-select-option'],
              !multiple &&
                localValue === opt.value &&
                classNames('filter-select-option-selected', styles['filter-select-option-selected']),
            )}
            onClick={() =>
              multiple ? handleToggleMulti(opt.value) : handleClickOption(opt.value)
            }
          >
            {multiple && (
              <Checkbox
                checked={(localValue as (string | number)[])?.includes(opt.value)}
                onChange={() => handleToggleMulti(opt.value)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            {isPersonVariant ? (
              <PersonOptionRow option={opt as PersonOption} />
            ) : (
              <span>{opt.label}</span>
            )}
            {!multiple && !isPersonVariant && localValue === opt.value && (
              <Check className={classNames('filter-select-option-check', styles['filter-select-option-check'])} />
            )}
          </div>
        ))}
        {filteredOptions.length === 0 && (
          <div className={classNames('filter-select-empty', styles['filter-select-empty'])}>暂无数据</div>
        )}
      </div>

      {multiple && (localValue as (string | number)[])?.length > 0 && (
        <div className={classNames('filter-select-selected-bar', styles['filter-select-selected-bar'])}>
          <div className={classNames('filter-select-selected-label', styles['filter-select-selected-label'])}>已选：</div>
          <Space size={[4, 4]} wrap>
            {(localValue as (string | number)[]).map((v) => {
              const opt = options.find((o) => String(o.value) === String(v));
              const arr = (localValue as (string | number)[]) || [];
              const tagRemovable = minSelection == null || arr.length > minSelection;
              return (
                <span
                  key={String(v)}
                  className={classNames(
                    'filter-select-selected-tag',
                    styles['filter-select-selected-tag'],
                    !tagRemovable && styles['filter-select-selected-tag-disabled'],
                  )}
                  onClick={() => tagRemovable && handleToggleMulti(v)}
                >
                  {opt?.label ?? String(v)}
                  <X
                    className={classNames(
                      'filter-select-selected-remove',
                      styles['filter-select-selected-remove'],
                      !tagRemovable && styles['filter-select-selected-remove-disabled'],
                    )}
                  />
                </span>
              );
            })}
          </Space>
        </div>
      )}
    </FilterPopover>
  );
};

export default FilterSelect;
export type { FilterSelectProps };
