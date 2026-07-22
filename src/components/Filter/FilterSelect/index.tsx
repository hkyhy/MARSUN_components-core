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

function arraysEqual(a?: (string | number)[], b?: (string | number)[]): boolean {
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
  /** 默认值：与默认值相同时视为未筛选（除非 showDefaultAsSelected） */
  defaultValue?: string | number;
  /** 多选默认值：与默认集合相同时视为未筛选（除非 showDefaultAsSelected） */
  defaultValues?: (string | number)[];
  /** 为 true 时，value 等于默认仍展示在「您已选择」并保持选中态 */
  showDefaultAsSelected?: boolean;
  placeholder?: string;
  searchable?: boolean;
  /** 是否多选 */
  multiple?: boolean;
  /** 多选至少保留项数；达到下限时不允许移除已选标签 */
  minSelection?: number;
  /** 人员选项：展示部门与联系方式 */
  variant?: 'default' | 'person';
}

function toMultiArray(value: FilterSelectValue): (string | number)[] {
  if (Array.isArray(value)) return value;
  if (value != null && value !== '') return [value];
  return [];
}

function toDisplayValue(
  value: FilterSelectValue,
  defaultValue: string | number | undefined,
  defaultValues: (string | number)[] | undefined,
  multiple: boolean,
  showDefaultAsSelected: boolean,
): string | number | (string | number)[] | undefined {
  if (multiple) {
    const arr = toMultiArray(value);
    // 等于默认集合时：对外视为「未筛选」（不亮 trigger / 不进「您已选择」）
    if (!showDefaultAsSelected && defaultValues?.length && arraysEqual(arr, defaultValues)) {
      return [];
    }
    return arr;
  }
  if (!showDefaultAsSelected && defaultValue !== undefined && value === defaultValue) {
    return undefined;
  }
  return value;
}

/** 草稿/面板用真实 value，避免 defaultValues 折叠成 [] 后全选勾选丢失 */
function toDraftValue(
  value: FilterSelectValue,
  defaultValue: string | number | undefined,
  defaultValues: (string | number)[] | undefined,
  multiple: boolean,
): string | number | (string | number)[] | undefined {
  if (multiple) return toMultiArray(value);
  return toDisplayValue(value, defaultValue, defaultValues, false, true);
}

function formatValueLabel(
  displayVal: string | number | (string | number)[] | undefined,
  options: FilterOption[],
  multiple: boolean,
  isPersonVariant: boolean,
  defaultValues?: (string | number)[],
): string {
  if (multiple) {
    const arr = (displayVal as (string | number)[]) || [];
    if (!arr.length) return '';
    // 全选默认集合时用「全部」，避免「您已选择」被几十个厂名撑满
    if (defaultValues?.length && arraysEqual(arr, defaultValues)) {
      return '全部';
    }
    return arr
      .map((v) => options.find((o) => String(o.value) === String(v))?.label ?? String(v))
      .join('、');
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
  showDefaultAsSelected = false,
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
  const displayValue = toDisplayValue(
    value,
    defaultValue,
    defaultValues,
    multiple,
    showDefaultAsSelected,
  );
  const [localValue, setLocalValue] = useState<string | number | (string | number)[] | undefined>(
    () => toDraftValue(value, defaultValue, defaultValues, multiple) ?? (multiple ? [] : undefined),
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
    const canRemove = !multiple || minSelection == null || selectedArr.length > minSelection;
    return () => {
      if (!canRemove) return;
      onChangeRef.current?.(undefined);
    };
  }, [displayValue, minSelection, multiple]);

  const revertToCommitted = () => {
    setLocalValue(
      toDraftValue(value, defaultValue, defaultValues, multiple) ?? (multiple ? [] : undefined),
    );
    setSearchText('');
  };

  // 同步外部 value 到内部 localValue（多选用真实 value，保留 defaultValues 全选勾选）
  useEffect(() => {
    const nextDraft = toDraftValue(value, defaultValue, defaultValues, multiple);
    setLocalValue(nextDraft ?? (multiple ? [] : undefined));
    const nextDisplay = toDisplayValue(
      value,
      defaultValue,
      defaultValues,
      multiple,
      showDefaultAsSelected,
    );
    if (
      nextDisplay === undefined ||
      nextDisplay === null ||
      (Array.isArray(nextDisplay) && nextDisplay.length === 0)
    ) {
      setSearchText('');
    }
  }, [value, defaultValue, defaultValues, multiple, showDefaultAsSelected]);

  const committedValueLabel = useMemo(
    () => formatValueLabel(displayValue, options, multiple, isPersonVariant, defaultValues),
    [options, displayValue, multiple, isPersonVariant, defaultValues],
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
      const removable = !multiple || minSelection == null || selectedArr.length > minSelection;
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
    const has = arr.some((v) => String(v) === String(optVal));
    if (has && minSelection != null && arr.length <= minSelection) {
      return;
    }
    const next = has ? arr.filter((v) => String(v) !== String(optVal)) : [...arr, optVal];
    setLocalValue(next);
  };

  const localMultiArr = (Array.isArray(localValue) ? localValue : []) as (string | number)[];
  const filteredSelectedCount = filteredOptions.filter((opt) =>
    localMultiArr.some((v) => String(v) === String(opt.value)),
  ).length;
  const allFilteredSelected =
    filteredOptions.length > 0 && filteredSelectedCount === filteredOptions.length;
  const someFilteredSelected = filteredSelectedCount > 0 && !allFilteredSelected;

  const handleToggleAll = (checked: boolean) => {
    const arr = localMultiArr;
    const filteredVals = filteredOptions.map((o) => o.value);
    if (checked) {
      const seen = new Set(arr.map(String));
      const next = [...arr];
      for (const v of filteredVals) {
        if (!seen.has(String(v))) {
          next.push(v);
          seen.add(String(v));
        }
      }
      setLocalValue(next);
      return;
    }
    const removeSet = new Set(filteredVals.map(String));
    let next = arr.filter((v) => !removeSet.has(String(v)));
    if (minSelection != null && next.length < minSelection) {
      next = arr.slice(0, minSelection);
    }
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
        {multiple && filteredOptions.length > 0 && (
          <div
            className={classNames(
              'filter-select-option',
              styles['filter-select-option'],
              'filter-select-select-all',
              styles['filter-select-select-all'],
            )}
            onClick={() => handleToggleAll(!allFilteredSelected)}
          >
            <Checkbox
              checked={allFilteredSelected}
              indeterminate={someFilteredSelected}
              onChange={(e) => handleToggleAll(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
            />
            <span>全选</span>
          </div>
        )}
        {filteredOptions.map((opt) => (
          <div
            key={String(opt.value)}
            className={classNames(
              'filter-select-option',
              styles['filter-select-option'],
              !multiple &&
                localValue === opt.value &&
                classNames(
                  'filter-select-option-selected',
                  styles['filter-select-option-selected'],
                ),
            )}
            onClick={() => (multiple ? handleToggleMulti(opt.value) : handleClickOption(opt.value))}
          >
            {multiple && (
              <Checkbox
                checked={localMultiArr.some((v) => String(v) === String(opt.value))}
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
              <Check
                className={classNames(
                  'filter-select-option-check',
                  styles['filter-select-option-check'],
                )}
              />
            )}
          </div>
        ))}
        {filteredOptions.length === 0 && (
          <div className={classNames('filter-select-empty', styles['filter-select-empty'])}>
            暂无数据
          </div>
        )}
      </div>

      {multiple && localMultiArr.length > 0 && (
        <div
          className={classNames('filter-select-selected-bar', styles['filter-select-selected-bar'])}
        >
          <div
            className={classNames(
              'filter-select-selected-label',
              styles['filter-select-selected-label'],
            )}
          >
            已选：
          </div>
          <div
            className={classNames(
              'filter-select-selected-tags',
              styles['filter-select-selected-tags'],
            )}
          >
            <Space size={[4, 4]} wrap>
              {localMultiArr.map((v) => {
                const opt = options.find((o) => String(o.value) === String(v));
                const tagRemovable = minSelection == null || localMultiArr.length > minSelection;
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
        </div>
      )}
    </FilterPopover>
  );
};

export default FilterSelect;
export type { FilterSelectProps };
