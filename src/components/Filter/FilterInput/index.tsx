import { Input } from 'antd';
import React, { useEffect, useState } from 'react';
import FilterPopover from '../FilterPopover';
import { useFilterRegister } from '../useFilterState';
import type { BaseFilterProps } from '../types';
import { resolveHidden } from '../types';

interface FilterInputProps extends BaseFilterProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
}

const FilterInput: React.FC<FilterInputProps> = ({
  filterKey,
  label,
  value,
  onChange,
  placeholder,
  active,
  hidden,
}) => {
  const [inputValue, setInputValue] = useState(value ?? '');

  // ── 自动注册到 CommonFilter ──
  const registerFn = useFilterRegister();

  // 同步外部 value 到内部 inputValue
  useEffect(() => {
    setInputValue(value ?? '');
  }, [value]);

  useEffect(() => {
    if (!registerFn) return;
    if (resolveHidden(hidden)) {
      registerFn.unregister(filterKey);
      return;
    }
    if (value) {
      registerFn.register(filterKey, { label, valueLabel: value, onRemove: () => onChange?.(undefined) });
    } else {
      registerFn.unregister(filterKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, filterKey, label, hidden]);

  // hidden 处理 - 必须在所有 hooks 之后
  if (resolveHidden(hidden)) return null;

  const handleConfirm = () => {
    onChange?.(inputValue || undefined);
  };

  const handleReset = () => {
    setInputValue('');
    onChange?.(undefined);
  };

  return (
    <FilterPopover
      label={label}
      active={active || !!value}
      onConfirm={handleConfirm}
      onReset={handleReset}
    >
      <Input
        placeholder={placeholder ?? `请输入${label}`}
        allowClear
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onPressEnter={handleConfirm}
      />
    </FilterPopover>
  );
};

export default FilterInput;
export type { FilterInputProps };
