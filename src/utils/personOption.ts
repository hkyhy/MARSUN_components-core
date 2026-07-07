import type { PersonOption } from '@/components/Filter/types';
import type { DepartmentPathMaps } from '@/utils/department/departmentPath';

/** 人员选项 API 返回结构（uploaders / assignee-options 等统一形态） */
export interface PersonOptionDto {
  value: string;
  label: string;
  departmentId?: string;
  departmentName?: string;
  email?: string;
  phone?: string;
  employeeId?: string;
}

/** @deprecated 使用 PersonOptionDto，保留兼容 reviewers 旧字段 */
export interface ReviewerOptionDto {
  id: string;
  displayName: string;
  departmentId?: string;
  departmentName?: string;
  email?: string;
  phone?: string;
  employeeId?: string;
}

/** 从接口返回值中取出人员数组 */
export function normalizeRawPersonList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && Array.isArray((raw as { data?: unknown }).data)) {
    return (raw as { data: unknown[] }).data;
  }
  return [];
}

/** 统一 uploaders（value/label）与 assignee-options / reviewers（id/displayName） */
export function normalizePersonDtos(raw: unknown[]): PersonOptionDto[] {
  return raw.map((item) => {
    const r = item as Record<string, unknown>;
    return {
      value: String(r.value ?? r.id ?? ''),
      label: String(r.label ?? r.displayName ?? ''),
      departmentId: r.departmentId != null ? String(r.departmentId) : undefined,
      departmentName: r.departmentName != null ? String(r.departmentName) : undefined,
      email: r.email != null ? String(r.email) : undefined,
      phone: r.phone != null ? String(r.phone) : undefined,
      employeeId: r.employeeId != null ? String(r.employeeId) : undefined,
    };
  });
}

/** 解析人员选项中的部门完整路径（父/子） */
export function resolvePersonDepartmentName(
  maps: DepartmentPathMaps | undefined,
  departmentId?: string,
  departmentName?: string,
): string | undefined {
  if (!departmentId && !departmentName) return undefined;
  if (departmentName?.includes('/')) return departmentName;

  if (maps) {
    if (departmentId) {
      const byId = maps.byId.get(departmentId);
      if (byId) return byId;
    }
    if (departmentName) {
      const byLeaf = maps.byUniqueLeaf.get(departmentName);
      if (byLeaf) return byLeaf;
    }
  }
  return departmentName;
}

export function toPersonOptions(
  data: PersonOptionDto[] | undefined,
  maps?: DepartmentPathMaps,
): PersonOption[] {
  return (data || []).map((item) => ({
    value: item.value,
    label: item.label,
    departmentId: item.departmentId,
    departmentName: resolvePersonDepartmentName(maps, item.departmentId, item.departmentName),
    email: item.email,
    phone: item.phone,
    employeeId: item.employeeId,
  }));
}

/** @deprecated 使用 normalizePersonDtos + toPersonOptions */
export function toReviewerPersonOptions(
  data: ReviewerOptionDto[] | undefined,
  maps?: DepartmentPathMaps,
): PersonOption[] {
  return toPersonOptions(normalizePersonDtos(data ?? []), maps);
}

export function formatPersonValueLabel(opt: PersonOption): string {
  return opt.departmentName ? `${opt.label} · ${opt.departmentName}` : opt.label;
}

/** antd Select 人员选项（含选中后展示的 optionLabel） */
export type PersonSelectOption = PersonOption & { optionLabel: string };

export function toPersonSelectOptions(options: PersonOption[]): PersonSelectOption[] {
  return options.map((opt) => ({
    ...opt,
    optionLabel: formatPersonValueLabel(opt),
  }));
}

/** 按 value 索引人员选项，供 antd Select filterOption 反查完整数据 */
export function buildPersonOptionLookup(options: PersonOption[]): Map<string, PersonOption> {
  return new Map(options.map((opt) => [String(opt.value), opt]));
}

/** 从 antd Select 内部 option 还原完整人员数据 */
export function resolveSelectPersonOption(
  oriOption: { value?: string | number; data?: unknown } | undefined,
  lookup: Map<string, PersonOption>,
): PersonOption | undefined {
  if (!oriOption) return undefined;
  const value = String(oriOption.value ?? '');
  if (value && lookup.has(value)) return lookup.get(value);
  return (oriOption.data ?? oriOption) as PersonOption;
}

export function createPersonSelectFilter(lookup: Map<string, PersonOption>) {
  return (input: string, option?: { value?: string | number; data?: unknown }) => {
    const data = resolveSelectPersonOption(option, lookup);
    return data ? matchPersonOptionSearch(data, input) : false;
  };
}

export function matchPersonOptionSearch(opt: PersonOption, text: string): boolean {
  const q = text.trim().toLowerCase();
  if (!q) return true;
  return [opt.label, opt.departmentName, opt.email, opt.phone, opt.employeeId].some((field) =>
    field?.toLowerCase().includes(q),
  );
}
