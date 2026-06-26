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

interface FilterSelectProps extends BaseFilterProps {
  options: FilterOption[];
  value?: string | number | undefined;
  onChange?: (value: string | number | undefined) => void;
  /** 默认值：与默认值相同时视为未筛选（不展示已选标签与选中态） */
  defaultValue?: string | number;
  placeholder?: string;
  searchable?: boolean;
  /** 是否多选 */
  multiple?: boolean;
  /** 人员选项：展示部门与联系方式 */
  variant?: 'default' | 'person';
}

function toDisplayValue(
  value: string | number | undefined,
  defaultValue: string | number | undefined,
  multiple: boolean,
): string | number | (string | number)[] | undefined {
  if (multiple) return value ?? [];
  if (defaultValue !== undefined && value === defaultValue) return undefined;
  return value;
}

const FilterSelect: React.FC<FilterSelectProps> = ({
  filterKey,
  label,
  options = [],
  value,
  onChange,
  defaultValue,
  searchable = false,
  multiple = false,
  variant = 'default',
  active,
  hidden,
  display,
}) => {
  const isPersonVariant = variant === 'person';
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const displayValue = toDisplayValue(value, defaultValue, multiple);
  const [localValue, setLocalValue] = useState<string | number | (string | number)[] | undefined>(
    displayValue ?? (multiple ? [] : undefined),
  );

  // ── 自动注册到 CommonFilter ──
  const registerFn = useFilterRegister();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handleRemove = useMemo(
    () => () => {
      onChangeRef.current?.(undefined);
    },
    [],
  );

  // 同步外部 value 到内部 localValue
  useEffect(() => {
    const nextDisplayValue = toDisplayValue(value, defaultValue, multiple);
    setLocalValue(nextDisplayValue ?? (multiple ? [] : undefined));
    // 外部清空时同时清空搜索文本
    if (
      nextDisplayValue === undefined ||
      nextDisplayValue === null ||
      (Array.isArray(nextDisplayValue) && nextDisplayValue.length === 0)
    ) {
      setSearchText('');
    }
  }, [value, defaultValue, multiple]);

  // 从 options 反查 valueLabel
  const valueLabel = useMemo(() => {
    if (multiple) {
      const arr = (localValue as (string | number)[]) || [];
      return arr.length > 0
        ? arr.map((v) => options.find((o) => o.value === v)?.label ?? String(v)).join('、')
        : '';
    }
    if (localValue == null) return '';
    const opt = options.find((o) => o.value === localValue);
    if (!opt) return String(localValue);
    return isPersonVariant ? formatPersonValueLabel(opt as PersonOption) : opt.label;
  }, [options, localValue, multiple, isPersonVariant]);

  useEffect(() => {
    if (!registerFn) return;
    const ctx = { filterKey, label, value };
    if (!resolveFilterVisible({ display, hidden }, ctx)) {
      registerFn.unregister(filterKey);
      return;
    }
    if (valueLabel && !multiple) {
      // 多选由 CommonFilter 的 clearAll 统一处理，单选直接注册
      registerFn.register(filterKey, {
        label,
        valueLabel,
        onRemove: handleRemove,
      });
    } else {
      registerFn.unregister(filterKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueLabel, filterKey, label, hidden, display, multiple, handleRemove]);

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
    onChange?.(localValue as string | number | undefined);
    setOpen(false);
  };

  const handleReset = () => {
    setLocalValue(multiple ? [] : undefined);
    setSearchText('');
    onChange?.(undefined);
    setOpen(false);
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
      setOpen(false); // 单选自动收起
    }
  };

  const handleToggleMulti = (optVal: string | number) => {
    const arr = (localValue as (string | number)[]) || [];
    const next = arr.includes(optVal) ? arr.filter((v) => v !== optVal) : [...arr, optVal];
    setLocalValue(next);
  };

  return (
    <FilterPopover
      label={label}
      active={
        active ||
        (multiple
          ? Array.isArray(localValue) && localValue.length > 0
          : localValue != null && localValue !== '')
      }
      open={open}
      onOpenChange={setOpen}
      onConfirm={multiple ? handleConfirm : undefined}
      onReset={multiple ? handleReset : undefined}
    >
      {/* 搜索框 */}
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

      {/* 选项列表 */}
      <div className={classNames('filter-select-options', styles['filter-select-options'])}>
        {filteredOptions.map((opt) => (
          <div
            key={String(opt.value)}
            className={classNames('filter-select-option', styles['filter-select-option'],
              !multiple &&
                localValue === opt.value &&
                classNames('filter-select-option-selected', styles['filter-select-option-selected']),
            )}
            onClick={() => handleClickOption(opt.value)}
          >
            {multiple && (
              <Checkbox checked={(localValue as (string | number)[])?.includes(opt.value)} />
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

      {/* 多选已选 */}
      {multiple && (localValue as (string | number)[])?.length > 0 && (
        <div className={classNames('filter-select-selected-bar', styles['filter-select-selected-bar'])}>
          <div className={classNames('filter-select-selected-label', styles['filter-select-selected-label'])}>已选：</div>
          <Space size={[4, 4]} wrap>
            {(localValue as (string | number)[]).map((v) => {
              const opt = options.find((o) => o.value === v);
              return (
                <span
                  key={String(v)}
                  className={classNames('filter-select-selected-tag', styles['filter-select-selected-tag'])}
                  onClick={() => handleToggleMulti(v)}
                >
                  {opt?.label ?? String(v)}
                  <X className={classNames('filter-select-selected-remove', styles['filter-select-selected-remove'])} />
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
