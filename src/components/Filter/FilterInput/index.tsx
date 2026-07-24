import { Input } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import FilterPopover from '../FilterPopover';
import { useFilterFieldBridge, useFilterRegister } from '../useFilterState';
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
  dependsOn,
  clearOnDepsChange = true,
}) => {
  const [inputValue, setInputValue] = useState(value ?? '');

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const { resolvedLabel } = useFilterFieldBridge({
    filterKey,
    value,
    label,
    dependsOn,
    clearOnDepsChange,
    onDepsClear: () => onChangeRef.current?.(undefined),
  });

  const registerFn = useFilterRegister();

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
      registerFn.register(filterKey, {
        label: resolvedLabel,
        valueLabel: value,
        onRemove: () => onChange?.(undefined),
      });
    } else {
      registerFn.unregister(filterKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, filterKey, resolvedLabel, hidden]);

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
      label={resolvedLabel}
      active={active || !!value}
      onConfirm={handleConfirm}
      onReset={handleReset}
    >
      <Input
        placeholder={placeholder ?? `请输入${resolvedLabel}`}
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
