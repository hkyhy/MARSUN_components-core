import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  buildDepsKey,
  normalizeDependsOn,
  resolveFilterLabel,
  type FilterLabel,
  type SelectedItem,
} from './types';

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
  /** 是否允许移除标签，默认 true */
  removable?: boolean;
}

/** Context 类型 */
export interface FilterContextValue {
  /** 注册筛选条件（有值时调用） */
  register: (key: string, reg: FilterRegistration) => void;
  /** 注销筛选条件（组件卸载或值清空时调用） */
  unregister: (key: string) => void;
  /** 各筛选项原始值（供 dependsOn / 动态 label / loadData） */
  values: Record<string, unknown>;
  /** 上报本项原始值 */
  setFieldValue: (key: string, value: unknown) => void;
  /** 清除本项原始值（卸载 / 隐藏） */
  clearFieldValue: (key: string) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

/** 供子组件使用 —— 在 CommonFilter 内部注册自身状态（不在 CommonFilter 内时安全返回 null） */
export function useFilterRegister(): FilterContextValue | null {
  return useContext(FilterContext);
}

/** 读取依赖筛选项当前值与稳定 depsKey */
export function useFilterDeps(dependsOn?: string | string[]): {
  values: Record<string, unknown>;
  depsKey: string;
  depKeys: string[];
} {
  const ctx = useFilterRegister();
  const values = ctx?.values ?? EMPTY_VALUES;
  const depKeys = useMemo(() => normalizeDependsOn(dependsOn), [dependsOn]);
  const depsKey = useMemo(() => buildDepsKey(depKeys, values), [depKeys, values]);
  return { values, depsKey, depKeys };
}

const EMPTY_VALUES: Record<string, unknown> = {};

/**
 * 字段桥接：上报 value、解析动态 label、依赖变化时清空。
 */
export function useFilterFieldBridge(opts: {
  filterKey: string;
  value: unknown;
  label: FilterLabel;
  dependsOn?: string | string[];
  clearOnDepsChange?: boolean;
  /** 依赖变化时调用（应清空受控 value） */
  onDepsClear?: () => void;
}): {
  resolvedLabel: string;
  values: Record<string, unknown>;
  depsKey: string;
} {
  const { filterKey, value, label, dependsOn, clearOnDepsChange = true, onDepsClear } = opts;
  const ctx = useFilterRegister();
  const values = ctx?.values ?? EMPTY_VALUES;
  const resolvedLabel = useMemo(() => resolveFilterLabel(label, values), [label, values]);
  const { depsKey } = useFilterDeps(dependsOn);

  const setFieldValue = ctx?.setFieldValue;
  const clearFieldValue = ctx?.clearFieldValue;

  useEffect(() => {
    if (!setFieldValue || !clearFieldValue) return;
    setFieldValue(filterKey, value);
    return () => clearFieldValue(filterKey);
  }, [filterKey, value, setFieldValue, clearFieldValue]);

  const prevDepsKeyRef = useRef<string | null>(null);
  const onDepsClearRef = useRef(onDepsClear);
  onDepsClearRef.current = onDepsClear;

  useEffect(() => {
    if (!dependsOn || normalizeDependsOn(dependsOn).length === 0) return;
    if (prevDepsKeyRef.current === null) {
      prevDepsKeyRef.current = depsKey;
      return;
    }
    if (prevDepsKeyRef.current === depsKey) return;
    prevDepsKeyRef.current = depsKey;
    if (clearOnDepsChange) {
      onDepsClearRef.current?.();
    }
  }, [depsKey, dependsOn, clearOnDepsChange]);

  return { resolvedLabel, values, depsKey };
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
  /** 字段原始值 */
  values: Record<string, unknown>;
  setFieldValue: (key: string, value: unknown) => void;
  clearFieldValue: (key: string) => void;
}

/**
 * 筛选状态管理 Hook
 *
 * 各 Filter 子组件通过 `register(key, { label, valueLabel, onRemove })` 注册，
 * CommonFilter 自动聚合成 `selectedItems` 展示。
 * 同时维护 `values` 供声明式 dependsOn / 动态 label / loadData。
 */
export function useFilterState(): UseFilterStateReturn {
  const [registrations, setRegistrations] = useState<Record<string, FilterRegistration>>({});
  const [values, setValues] = useState<Record<string, unknown>>({});

  const register = useCallback((key: string, reg: FilterRegistration) => {
    setRegistrations((prev) => {
      const existing = prev[key];
      if (
        existing &&
        existing.label === reg.label &&
        existing.valueLabel === reg.valueLabel &&
        (existing.removable ?? true) === (reg.removable ?? true) &&
        existing.onRemove === reg.onRemove
      ) {
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

  const setFieldValue = useCallback((key: string, value: unknown) => {
    setValues((prev) => {
      if (Object.is(prev[key], value)) return prev;
      // 浅比较数组：同内容不触发更新
      if (Array.isArray(value) && Array.isArray(prev[key])) {
        const a = value as unknown[];
        const b = prev[key] as unknown[];
        if (a.length === b.length && a.every((v, i) => Object.is(v, b[i]))) {
          return prev;
        }
      }
      return { ...prev, [key]: value };
    });
  }, []);

  const clearFieldValue = useCallback((key: string) => {
    setValues((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
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
        removable: r.removable ?? true,
      }));
  }, [registrations]);

  return {
    registrations,
    selectedItems,
    register,
    unregister,
    clearAll,
    values,
    setFieldValue,
    clearFieldValue,
  };
}

// ──────────────────── Provider ────────────────────

interface FilterProviderProps {
  children: React.ReactNode;
  ctx: Pick<
    UseFilterStateReturn,
    'register' | 'unregister' | 'values' | 'setFieldValue' | 'clearFieldValue'
  >;
}

/** 内部 Provider，将 register/unregister/values 注入给子组件 */
export const FilterProvider: React.FC<FilterProviderProps> = ({ children, ctx }) => (
  <FilterContext.Provider value={ctx}>{children}</FilterContext.Provider>
);

export default useFilterState;
