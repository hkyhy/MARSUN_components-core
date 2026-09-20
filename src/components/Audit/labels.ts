import labels from './labels.json';

const LABEL_MAP = labels as Record<string, string>;

/** 与 SSOT / audit labels.json / Java AuditActionLabels 同表；禁平行造词 */
export function labelOfAction(action: string | null | undefined): string | null {
  if (!action || !String(action).trim()) return null;
  return LABEL_MAP[String(action).trim()] ?? null;
}

/** 展示用：actionLabel → shared labels → 码 */
export function displayActionLabel(action: string, actionLabel?: string | null): string {
  const fromApi = actionLabel?.trim();
  if (fromApi) return fromApi;
  return labelOfAction(action) || action;
}

export type DisplaySummaryRoute = {
  httpMethod?: string | null;
  path?: string | null;
};

/**
 * 摘要与动作中文相同或空 → 尝试 METHOD+path 回落；再空则「—」（列表去重）
 */
export function displaySummary(
  summary: string | null | undefined,
  actionLabelDisplay: string,
  route?: DisplaySummaryRoute,
): string {
  const s = summary?.trim();
  if (s && s !== actionLabelDisplay) return s;
  const method = route?.httpMethod?.trim() || '';
  const path = route?.path?.trim() || '';
  const fallback = [method, path].filter(Boolean).join(' ').trim();
  if (fallback) return fallback;
  return '—';
}

export function allActionLabels(): Readonly<Record<string, string>> {
  return LABEL_MAP;
}
