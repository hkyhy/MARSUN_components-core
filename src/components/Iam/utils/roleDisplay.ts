/** 角色展示：优先中文名；code 仅 Tooltip */

export function roleDisplayName(r: { name?: string | null; code?: string | null }): string {
  const name = (r.name || '').trim();
  const code = (r.code || '').trim();
  return name || code || '—';
}

export function roleSelectOption(r: { name?: string | null; code?: string | null }): {
  value: string;
  label: string;
  title: string;
} {
  const code = (r.code || '').trim();
  return {
    value: code,
    label: roleDisplayName(r),
    title: code ? `编码：${code}` : roleDisplayName(r),
  };
}
