import type { ActionListFilters } from './listTypes';

function fmtYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 默认可查窗：近 N 天创建时间（含今天；EAM/S3 D10 = 30）。
 * F1：列表请求须带此窗，禁无条件扫全表。
 */
export function defaultCreatedRange(
  now = new Date(),
  daySpan = 30,
): Pick<ActionListFilters, 'from' | 'to'> {
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const from = new Date(to);
  from.setDate(from.getDate() - Math.max(1, daySpan) + 1);
  return { from: fmtYmd(from), to: fmtYmd(to) };
}

/** 清理空字段 */
export function normalizeActionFilters(raw: ActionListFilters): ActionListFilters {
  const next: ActionListFilters = { ...raw };
  (Object.keys(next) as (keyof ActionListFilters)[]).forEach((k) => {
    if (!next[k]) delete next[k];
  });
  return next;
}

/**
 * F1 门禁：须有创建时间 from+to 才可查。
 * 弱条件（仅状态/执行人等）不可单独成门。
 */
export function canQueryActionList(filters: ActionListFilters): boolean {
  return Boolean(String(filters.from || '').trim() && String(filters.to || '').trim());
}

/** 清空后回落到默认窗（禁 `{}` 全表） */
export function resetActionFiltersToDefault(now = new Date(), daySpan = 30): ActionListFilters {
  return normalizeActionFilters(defaultCreatedRange(now, daySpan));
}
