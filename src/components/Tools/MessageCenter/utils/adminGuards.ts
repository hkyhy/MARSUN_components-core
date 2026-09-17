/**
 * 推送规则：切换 eventKey 后解析关联 templateCode（§4.8a 清脏）。
 * 仅当旧 code 仍属于新事件的模板 options 时保留，否则清空。
 */
export function resolveTemplateCodeAfterEventChange(
  prevCode: string | undefined,
  options: Array<{ value: string }>,
): string {
  const prev = String(prevCode || '').trim();
  if (prev && options.some((o) => o.value === prev)) return prev;
  return '';
}

/**
 * 租户变量：基线（catalog / baseline）不可删。
 */
export function canDeleteTenantVariable(r: { source?: string; baseline?: boolean }): boolean {
  if (r.source === 'catalog' || r.baseline) return false;
  return true;
}
