import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { SelectedItem } from './types';

/**
 * 筛选项注册信息
 */
interface FilterRegistration {
  /** 筛选项标签 */
  label: string;
  /** 当前值的展示文案（如 "技术中心" / "审核员"），为空则不显示该条目 */
  valueLabel: string;
  /** 移除回调 */
  onRemove: () => void;
}

/** Context 类型 */
interface FilterContextValue {
  /** 注册筛选条件（有值时调用） */
  register: (key: string, reg: FilterRegistration) => void;
  /** 注销筛选条件（组件卸载或值清空时调用） */
  unregister: (key: string) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

/** 供子组件使用 —— 在 CommonFilter 内部注册自身状态（不在 CommonFilter 内时安全返回 null） */
export function useFilterRegister(): FilterContextValue | null {
  return useContext(FilterContext);
}

// ──────────────────── Hook ────────────────────

interface UseFilterStateReturn {
  /** 所有已注册的筛选项 */
  registrations: Record<string, FilterRegistration>;
  /** 已选条目数组（过滤掉无 valueLabel 的项） */
  selectedItems: SelectedItem[];
  /** 注册方法 */
  register: (key: string, reg: FilterRegistration) => void;
  /** 注销方法 */
  unregister: (key: string) => void;
  /** 清空全部 */
  clearAll: () => void;
}

/**
 * 筛选状态管理 Hook
 *
 * 各 Filter 子组件通过 `register(key, { label, valueLabel, onRemove })` 注册，
 * CommonFilter 自动聚合成 `selectedItems` 展示。
 */
export function useFilterState(): UseFilterStateReturn {
  const [registrations, setRegistrations] = useState<Record<string, FilterRegistration>>({});

  const register = useCallback((key: string, reg: FilterRegistration) => {
    setRegistrations((prev) => {
      const existing = prev[key];
      if (existing?.label === reg.label && existing?.valueLabel === reg.valueLabel) {
        return prev;
      }
      return { ...prev, [key]: reg };
    });
  }, []);

  const unregister = useCallback((key: string) => {
    setRegistrations((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    // 依次调用每项的 onRemove
    Object.values(registrations).forEach((r) => r.onRemove());
    setRegistrations({});
  }, [registrations]);

  const selectedItems = useMemo<SelectedItem[]>(() => {
    return Object.entries(registrations)
      .filter(([, r]) => !!r.valueLabel)
      .map(([key, r]) => ({
        key,
        label: r.label,
        valueLabel: r.valueLabel,
        onRemove: r.onRemove,
      }));
  }, [registrations]);

  return { registrations, selectedItems, register, unregister, clearAll };
}

// ──────────────────── Provider ────────────────────

interface FilterProviderProps {
  children: React.ReactNode;
  /** register / unregister 方法 */
  ctx: Pick<UseFilterStateReturn, 'register' | 'unregister'>;
}

/** 内部 Provider，将 register/unregister 注入给子组件 */
export const FilterProvider: React.FC<FilterProviderProps> = ({ children, ctx }) => (
  <FilterContext.Provider value={ctx}>{children}</FilterContext.Provider>
);

export default useFilterState;
