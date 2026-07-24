import type { MaybeFn, Visibility } from '@/utils/resolveMaybeFn';
import { resolveMaybeFn } from '@/utils/resolveMaybeFn';

/** 筛选选项基础类型 */
export interface FilterOption {
  label: string;
  value: string | number;
}

/** 人员展示选项（仅 UI 字段，数据由消费方提供） */
export interface PersonOption extends FilterOption {
  departmentId?: string;
  departmentName?: string;
  email?: string;
  phone?: string;
  employeeId?: string;
}

/** 已选项 */
export interface SelectedItem {
  key: string;
  label: string;
  valueLabel: string;
  onRemove: () => void;
  /** 为 false 时不允许移除（如多选至少保留一项） */
  removable?: boolean;
}

/** 动态 label 上下文（可读其它筛选项当前值） */
export type FilterLabelContext = {
  values: Record<string, unknown>;
};

/** label：静态文案，或根据其它筛选项值动态生成 */
export type FilterLabel = string | ((ctx: FilterLabelContext) => string);

/** loadData 回调上下文 */
export type FilterLoadDataContext = {
  values: Record<string, unknown>;
  keyword?: string;
};

/** 所有筛选组件共用的 Props */
export interface BaseFilterProps {
  filterKey: string;
  label: FilterLabel;
  active?: boolean;
  /** 隐藏；支持 boolean 或 (ctx) => boolean */
  hidden?: Visibility;
  /** 展示；与 hidden 二选一，display 优先 */
  display?: Visibility;
  /**
   * 声明式依赖：其它筛选项的 filterKey。
   * 依赖值变化时，默认清空本项（见 clearOnDepsChange），并触发 loadData（若有）。
   */
  dependsOn?: string | string[];
  /** 依赖变化时是否清空本项；默认 true */
  clearOnDepsChange?: boolean;
  /** 可选分组标记（文档/示例语义；不做强布局） */
  filterGroup?: string;
}

export type FilterVisibilityContext = Record<string, unknown>;

/** 解析动态 / 静态 label */
export function resolveFilterLabel(
  label: FilterLabel,
  values: Record<string, unknown> = {},
): string {
  if (typeof label === 'function') {
    return label({ values });
  }
  return label;
}

/** 规范化 dependsOn 为 key 列表 */
export function normalizeDependsOn(dependsOn?: string | string[]): string[] {
  if (!dependsOn) return [];
  return Array.isArray(dependsOn) ? dependsOn.filter(Boolean) : [dependsOn];
}

/** 从 values 提取依赖快照 key（稳定序列化） */
export function buildDepsKey(
  dependsOn: string | string[] | undefined,
  values: Record<string, unknown>,
): string {
  const keys = normalizeDependsOn(dependsOn);
  if (!keys.length) return '';
  const picked: Record<string, unknown> = {};
  for (const k of keys) {
    picked[k] = values[k];
  }
  return JSON.stringify(picked);
}

/** 解析 hidden（兼容旧 API，支持 MaybeFn） */
export function resolveHidden(
  hidden: MaybeFn<boolean, FilterVisibilityContext> | undefined,
  ctx: FilterVisibilityContext = {},
): boolean {
  if (hidden === undefined) return false;
  return resolveMaybeFn(hidden, ctx, false);
}

/** 根据 display / hidden 计算筛选项是否可见 */
export function resolveFilterVisible(
  props: Pick<BaseFilterProps, 'display' | 'hidden'>,
  ctx: FilterVisibilityContext = {},
): boolean {
  if (props.display !== undefined) {
    return resolveMaybeFn(props.display, ctx, true);
  }
  return !resolveHidden(props.hidden, ctx);
}
