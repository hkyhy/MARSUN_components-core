/**
 * 变量占位工具：存盘 `{{key}}`（与 marsun_msg_center render 对齐）。
 * 插入走「插入变量」按钮（VariablePicker）；正文为原子 widget。
 * 禁止 FE DEFAULT_VARS。
 */

export type VariableMentionItem = {
  key: string;
  label?: string;
  type?: string;
};

/** 编辑区色块 class（RTE content + Input 展示） */
export const MSG_VAR_TOKEN_CLASS = 'msg-var-token';

/** 双花括号占位 */
export const VAR_PLACEHOLDER_RE = /\{\{(\w+)\}\}/g;

export function toVarToken(key: string): string {
  return `{{${String(key || '').trim()}}}`;
}

/** 下拉展示：中文 label + code（无前导 /） */
export function formatVariableOptionLabel(v: VariableMentionItem): string {
  const key = String(v.key || '').trim();
  const label = String(v.label || '').trim();
  if (label && label !== key) return `${label}  ${key}`;
  return key;
}

export function filterVariableFeed(
  variables: VariableMentionItem[] | undefined,
  query: string,
): VariableMentionItem[] {
  const list = Array.isArray(variables) ? variables : [];
  const q = String(query || '')
    .replace(/^\//, '')
    .trim()
    .toLowerCase();
  if (!q) return list;
  return list.filter((v) => {
    const key = String(v.key || '').toLowerCase();
    const label = String(v.label || '').toLowerCase();
    return key.includes(q) || label.includes(q);
  });
}

/** CKEditor Mention feed item：id 须以 marker 开头；text 为插入的 {{key}} */
export function toMentionFeedItem(v: VariableMentionItem): {
  id: string;
  text: string;
  key: string;
  label?: string;
} {
  const key = String(v.key || '').trim();
  return {
    id: `/${key}`,
    text: toVarToken(key),
    key,
    label: v.label,
  };
}

/**
 * 将 CKEditor mention 节点规范为字面 `{{key}}` 色块 span（存盘/预览用）。
 */
export function normalizeMentionHtmlToVarTokens(html: string): string {
  return String(html || '').replace(
    /<span\b[^>]*\bdata-mention="\/(\w+)"[^>]*>[\s\S]*?<\/span>/gi,
    (_m, key: string) => `<span class="${MSG_VAR_TOKEN_CLASS}" data-var="${key}">{{${key}}}</span>`,
  );
}

/**
 * 读入编辑器前：裸 `{{key}}` / 旧色块 → 带 data-var 的 span，供 MsgVarWidget upcast。
 */
export function wrapVarTokensForDisplay(html: string): string {
  let s = normalizeMentionHtmlToVarTokens(String(html || ''));
  const tokenSpanRe = new RegExp(
    `<span\\b([^>]*\\bclass="[^"]*${MSG_VAR_TOKEN_CLASS}[^"]*"[^>]*)>\\{\\{(\\w+)\\}\\}<\\/span>`,
    'gi',
  );
  s = s.replace(tokenSpanRe, (_m, attrs: string, key: string) => {
    if (/\bdata-var=/.test(attrs)) return `<span${attrs}>{{${key}}}</span>`;
    return `<span class="${MSG_VAR_TOKEN_CLASS}" data-var="${key}">{{${key}}}</span>`;
  });
  s = s.replace(/(^|>)([^<]*)/g, (_full, prefix: string, text: string) => {
    const next = text.replace(
      /\{\{(\w+)\}\}/g,
      (_m, key: string) =>
        `<span class="${MSG_VAR_TOKEN_CLASS}" data-var="${key}">{{${key}}}</span>`,
    );
    return `${prefix}${next}`;
  });
  return s;
}

/** @deprecated 兼容旧名；等同 wrapVarTokensForDisplay */
export function upliftVarTokensToMentions(html: string): string {
  return wrapVarTokensForDisplay(html);
}

/** 在纯文本光标处插入 `{{key}}` */
export function insertVarTokenAt(text: string, key: string, caret = -1): string {
  const token = toVarToken(key);
  const src = String(text || '');
  if (caret < 0 || caret > src.length) return `${src}${token}`;
  return `${src.slice(0, caret)}${token}${src.slice(caret)}`;
}
