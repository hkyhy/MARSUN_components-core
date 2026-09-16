/** 模板编号：MEQ + yyyyMMdd + 5 位随机数（对齐 EAM createBlankTemplate） */
export function generateTemplateCode(prefix = 'MEQ'): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(10000 + Math.random() * 90000));
  return `${prefix}${y}${m}${d}${rand}`;
}

/** 占位符统一 `{var}`；兼容旧 `{{var}}` 读入 */
export function normalizeTemplatePlaceholders(text: string): string {
  return String(text || '').replace(/\{\{(\w+)\}\}/g, '{$1}');
}

export function applyTemplateVars(
  text: string,
  vars: Record<string, string | number | undefined>,
): string {
  const src = normalizeTemplatePlaceholders(text);
  return src.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = vars[key];
    return v === undefined || v === null ? `{${key}}` : String(v);
  });
}

export function stripHtmlToText(html: string): string {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}
