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
 * CKEditor Classic 根级必须是块级；库内/seed 常为纯文本 `{{x}}你好…`，
 * 直接 setData 会被丢掉 → 编辑区空白而 Form/预览仍有值。
 */
export function ensureRichTextBlockHtml(html: string): string {
  const s = String(html || '').trim();
  if (!s) return '';
  if (/<(p|div|ul|ol|h[1-6]|table|blockquote|pre)\b/i.test(s)) return s;
  if (/[\r\n]/.test(s)) {
    return s
      .split(/\r?\n/)
      .map((line) => `<p>${line || '<br>'}</p>`)
      .join('');
  }
  return `<p>${s}</p>`;
}

function injectAttrOnMsgVarEl(el: Element, attr: string, value: string): void {
  if (!el.getAttribute(attr)) el.setAttribute(attr, value);
}

/**
 * CKEditor 模型里 bold/color 等 attribute 不能包住 $inlineObject（msgVar）。
 * 若 `<strong>/<span style=color>` 内含色块，setData 会整段丢掉样式。
 * 用 DOM 拆开（禁非贪婪正则，嵌套 span 会截断错误）。
 */
export function splitInlineFormatAroundMsgVars(html: string): string {
  const src = String(html || '');
  if (!src.includes(MSG_VAR_TOKEN_CLASS)) return src;
  if (typeof DOMParser === 'undefined') return splitFormatChipOnlyWrappers(src);

  const doc = new DOMParser().parseFromString(`<div id="__rte_root">${src}</div>`, 'text/html');
  const root = doc.getElementById('__rte_root');
  if (!root) return src;

  let guard = 0;
  while (guard < 12) {
    guard += 1;
    const host = findFormatHostWithMsgVar(root);
    if (!host) break;
    explodeFormatHost(host);
  }
  return root.innerHTML;
}

function findFormatHostWithMsgVar(root: Element): Element | null {
  const candidates = root.querySelectorAll('strong, b, em, i, u, span[style]');
  for (const el of Array.from(candidates)) {
    if (el.classList?.contains(MSG_VAR_TOKEN_CLASS)) continue;
    if (el.querySelector?.(`.${MSG_VAR_TOKEN_CLASS}`)) return el;
  }
  return null;
}

function explodeFormatHost(host: Element): void {
  const parent = host.parentNode;
  if (!parent) return;
  const tag = host.tagName.toLowerCase();
  const style = host.getAttribute('style') || '';
  const color = /(?:^|;)\s*color\s*:\s*([^;]+)/i.exec(style)?.[1]?.trim();
  const bg = /(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i.exec(style)?.[1]?.trim();
  const doc = host.ownerDocument;

  const frag = doc.createDocumentFragment();
  const children = Array.from(host.childNodes);
  for (const node of children) {
    if (node.nodeType === 1) {
      const el = node as Element;
      if (el.classList?.contains(MSG_VAR_TOKEN_CLASS)) {
        if (tag === 'strong' || tag === 'b') injectAttrOnMsgVarEl(el, 'data-bold', '1');
        if (tag === 'em' || tag === 'i') injectAttrOnMsgVarEl(el, 'data-italic', '1');
        if (tag === 'u') injectAttrOnMsgVarEl(el, 'data-underline', '1');
        if (color) injectAttrOnMsgVarEl(el, 'data-font-color', color);
        if (bg) injectAttrOnMsgVarEl(el, 'data-font-bg', bg);
        frag.appendChild(el);
        continue;
      }
    }
    // 非色块：保留原格式壳
    const wrap = doc.createElement(tag === 'span' ? 'span' : tag);
    if (tag === 'span' && style) wrap.setAttribute('style', style);
    wrap.appendChild(node);
    frag.appendChild(wrap);
  }
  parent.replaceChild(frag, host);
}

/** Node 无 DOMParser 时的兜底：只处理「格式壳内仅一颗色块」 */
function splitFormatChipOnlyWrappers(html: string): string {
  let s = html;
  const chip = `<span\\b[^>]*\\b${MSG_VAR_TOKEN_CLASS}\\b[^>]*>\\s*\\{\\{\\w+\\}\\}\\s*<\\/span>`;
  s = s.replace(
    new RegExp(`<(strong|b)(?:\\s[^>]*)?>\\s*(${chip})\\s*<\\/\\1>`, 'gi'),
    (_m, _t, c: string) =>
      c.includes('data-bold=') ? c : c.replace(/<span\b/i, '<span data-bold="1"'),
  );
  s = s.replace(
    new RegExp(`<(em|i)(?:\\s[^>]*)?>\\s*(${chip})\\s*<\\/\\1>`, 'gi'),
    (_m, _t, c: string) =>
      c.includes('data-italic=') ? c : c.replace(/<span\b/i, '<span data-italic="1"'),
  );
  s = s.replace(new RegExp(`<u(?:\\s[^>]*)?>\\s*(${chip})\\s*<\\/u>`, 'gi'), (_m, c: string) =>
    c.includes('data-underline=') ? c : c.replace(/<span\b/i, '<span data-underline="1"'),
  );
  s = s.replace(
    new RegExp(
      `<span(\\s[^>]*\\bstyle\\s*=\\s*["'][^"']*["'][^>]*)>\\s*(${chip})\\s*<\\/span>`,
      'gi',
    ),
    (_m, attrs: string, c: string) => {
      if (new RegExp(`\\b${MSG_VAR_TOKEN_CLASS}\\b`, 'i').test(attrs)) return _m;
      const style = /style\s*=\s*["']([^"']*)["']/i.exec(attrs)?.[1] || '';
      const color = /(?:^|;)\s*color\s*:\s*([^;]+)/i.exec(style)?.[1]?.trim();
      const bg = /(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i.exec(style)?.[1]?.trim();
      let next = c;
      if (color && !/data-font-color=/.test(next)) {
        next = next.replace(/<span\b/i, `<span data-font-color="${color}"`);
      }
      if (bg && !/data-font-bg=/.test(next)) {
        next = next.replace(/<span\b/i, `<span data-font-bg="${bg}"`);
      }
      return next;
    },
  );
  return s;
}

/**
 * 读入编辑器前：裸 `{{key}}` / 旧色块 → 带 data-var 的 span，供 MsgVarWidget upcast；
 * 拆开「格式壳包色块」；保证块级包裹。
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
  s = ensureRichTextBlockHtml(s);
  return splitInlineFormatAroundMsgVars(s);
}

/** 挂载/回填编辑器统一入口（含非变量模式） */
export function prepareEditorHtml(html: string, enableVariableMention: boolean): string {
  const raw = String(html || '');
  if (enableVariableMention) return wrapVarTokensForDisplay(raw);
  return ensureRichTextBlockHtml(raw);
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

/**
 * 存盘前：去掉 msg-var-token 色块壳，保留外层 strong/em/color 与字面 `{{key}}`。
 * 样式以外层语义标签为准（dataDowncast 已包 strong/color）；勿再按 data-* 套一层以免双重标签。
 */
export function unwrapMsgVarSpansForStorage(html: string): string {
  return String(html || '').replace(
    /<span\b[^>]*\bmsg-var-token\b[^>]*>\s*\{\{(\w+)\}\}\s*<\/span>/gi,
    (_m, key: string) => `{{${key}}}`,
  );
}
