// @ts-nocheck
import { Provider } from './context';
import clone from 'lodash/clone';
import { useMemo } from 'react';

const isNotEmpty = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
};

const FilterProvider = ({ children, value: valueBase, onChange, defaultValue = [] }) => {
  const value = useMemo(() => {
    return (valueBase || defaultValue).filter((item) => isNotEmpty(item.value));
  }, [valueBase, defaultValue]);

  const filterValue = useMemo(() => {
    return new Map(value.map((item) => [item.name, item]));
  }, [value]);

  return (
    <Provider
      value={{
        value: filterValue,
        onChange: (item) => {
          const newFilterValue = clone(filterValue);
          // 多选清空为 [] 时 [] 仍为 truthy，必须用 isNotEmpty，否则会残留「角色:」空标签
          const kept = isNotEmpty(item?.value);
          if (kept) {
            newFilterValue.set(item.name, item);
          } else {
            newFilterValue.delete(item.name);
          }
          const next = Array.from(newFilterValue.values());
          onChange?.(next);
        },
      }}
    >
      {typeof children === 'function' ? children({ value, onChange }) : children}
    </Provider>
  );
};

export default FilterProvider;
