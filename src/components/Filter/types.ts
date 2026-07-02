import type { MaybeFn, Visibility } from '@/utils/resolveMaybeFn';
import { resolveMaybeFn } from '@/utils/resolveMaybeFn';

/** 筛选选项基础类型 */
export interface FilterOption {
  label: string;
  value: string | number;
}

/** 人员展示选项（仅 UI 字段，数据由消费方提供） */
export interface PersonOption extends FilterOption {
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

/** 所有筛选组件共用的 Props */
export interface BaseFilterProps {
  filterKey: string;
  label: string;
  active?: boolean;
  /** 隐藏；支持 boolean 或 (ctx) => boolean */
  hidden?: Visibility;
  /** 展示；与 hidden 二选一，display 优先 */
  display?: Visibility;
}

export type FilterVisibilityContext = Record<string, unknown>;

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
