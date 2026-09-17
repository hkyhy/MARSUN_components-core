/**
 * 变量 Mention 共用工具：触发符 `/`，存盘占位 `{{key}}`（与 marsun_msg_center render 对齐）。
 * Input / RichTextEditor 共用，禁止平行 DEFAULT_VARS。
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
 * 将 CKEditor mention 节点规范为字面 `{{key}}`（可带色块 span）。
 */
export function normalizeMentionHtmlToVarTokens(html: string): string {
  return String(html || '').replace(
    /<span\b[^>]*\bdata-mention="\/(\w+)"[^>]*>[\s\S]*?<\/span>/gi,
    (_m, key: string) => `<span class="${MSG_VAR_TOKEN_CLASS}">{{${key}}}</span>`,
  );
}

/** 读入编辑器前：token span / 纯文本 `{{key}}` → mention（仅初始化用，勿每键受控回写） */
export function upliftVarTokensToMentions(html: string): string {
  let s = String(html || '');
  const tokenSpanRe = new RegExp(
    `<span\\b[^>]*\\bclass="[^"]*${MSG_VAR_TOKEN_CLASS}[^"]*"[^>]*>\\{\\{(\\w+)\\}\\}<\\/span>`,
    'gi',
  );
  s = s.replace(
    tokenSpanRe,
    (_m, key: string) => `<span class="mention" data-mention="/${key}">{{${key}}}</span>`,
  );
  s = s.replace(/(^|>)([^<]*)/g, (_full, prefix: string, text: string) => {
    const next = text.replace(
      /\{\{(\w+)\}\}/g,
      (_m, key: string) => `<span class="mention" data-mention="/${key}">{{${key}}}</span>`,
    );
    return `${prefix}${next}`;
  });
  return s;
}

/** 在纯文本光标处插入 `{{key}}` */
export function insertVarTokenAt(text: string, key: string, caret = -1): string {
  const token = toVarToken(key);
  const src = String(text || '');
  if (caret < 0 || caret > src.length) return `${src}${token}`;
  return `${src.slice(0, caret)}${token}${src.slice(caret)}`;
}
