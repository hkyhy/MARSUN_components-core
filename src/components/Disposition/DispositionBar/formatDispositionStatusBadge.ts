/**
 * 处置条状态徽章：条上只留短文案；时间/备注进 detail（Tooltip）。
 * 对齐 S4「已关闭」短徽章，避免数百字备注撑破条。
 */
export type DispositionStatusBadgeParts = {
  statusLabel?: string;
  /** 误报 / 暂缓 / 系统外原因等 */
  typeLabel?: string;
  updatedAt?: string;
  note?: string;
  /**
   * 是否把 typeLabel 拼进短徽章（默认 true；与 statusLabel 相同时自动省略）。
   */
  includeType?: boolean;
};

export type DispositionStatusBadgeFormatted = {
  /** 条上展示 */
  short: string;
  /** 完整细节（时间 · 备注）；无则 undefined */
  detail?: string;
};

export function formatDispositionStatusBadge(
  parts: DispositionStatusBadgeParts,
): DispositionStatusBadgeFormatted {
  const base = String(parts.statusLabel || '').trim() || '已处置';
  const type = String(parts.typeLabel || '').trim();
  const includeType = parts.includeType !== false;
  const short = includeType && type && type !== base ? `${base} · ${type}` : base;
  const detailParts = [
    String(parts.updatedAt || '').trim(),
    String(parts.note || '').trim(),
  ].filter(Boolean);
  return {
    short,
    detail: detailParts.length ? detailParts.join(' · ') : undefined,
  };
}
