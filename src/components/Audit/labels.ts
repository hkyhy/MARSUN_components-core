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

/**
 * 摘要与动作中文相同或空 → 展示「—」（列表去重）
 */
export function displaySummary(
  summary: string | null | undefined,
  actionLabelDisplay: string,
): string {
  const s = summary?.trim();
  if (!s) return '—';
  if (s === actionLabelDisplay) return '—';
  return s;
}

export function allActionLabels(): Readonly<Record<string, string>> {
  return LABEL_MAP;
}
