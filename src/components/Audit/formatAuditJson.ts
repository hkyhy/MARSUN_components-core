/**
 * 审计步骤里常见「body 为 JSON 字符串」或双层转义；展示前递归解包再 pretty-print。
 * 截断串（…[truncated]）尽量修复括号后再格式化；**禁止**对纯字符串再 JSON.stringify（会多包一层引号/转义）。
 */

export function isTruncatedAuditText(value: unknown): boolean {
  if (typeof value === 'string') return value.includes('…[truncated]');
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const o = value as Record<string, unknown>;
    if (o._truncated === true) return true;
    return Object.values(o).some(isTruncatedAuditText);
  }
  return false;
}

export function unwrapAuditJson(value: unknown, depth = 0): unknown {
  if (depth > 8) return value;
  if (typeof value === 'string') {
    const t = value.trim();
    if (t.length < 2) return value;
    const looksJson =
      (t.startsWith('{') && t.includes('}')) ||
      (t.startsWith('[') && t.includes(']')) ||
      (t.startsWith('"') && (t.includes('{') || t.includes('[')));
    if (!looksJson) return value;
    try {
      return unwrapAuditJson(JSON.parse(t), depth + 1);
    } catch {
      return value;
    }
  }
  if (Array.isArray(value)) {
    return value.map((v) => unwrapAuditJson(v, depth + 1));
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = unwrapAuditJson(v, depth + 1);
    }
    return out;
  }
  return value;
}

/** 尽量闭合截断 JSON 的括号/引号，便于 parse */
export function repairTruncatedJson(raw: string): string {
  let t = raw.replace(/\s*…\[truncated\]\s*$/, '').trim();
  // 丢掉末尾不完整的 key / 片段
  t = t.replace(/,\s*"[^"]*$/s, '');
  t = t.replace(/,\s*\{[^}]*$/s, '');
  t = t.replace(/:\s*"[^"]*$/s, ': null');
  t = t.replace(/,\s*$/, '');

  let inStr = false;
  let esc = false;
  const stack: Array<'{' | '['> = [];
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (inStr) {
      if (esc) {
        esc = false;
        continue;
      }
      if (ch === '\\') {
        esc = true;
        continue;
      }
      if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === '{' || ch === '[') stack.push(ch);
    else if (ch === '}' || ch === ']') stack.pop();
  }
  if (inStr) t += '"';
  while (stack.length) {
    const open = stack.pop();
    t += open === '{' ? '}' : ']';
  }
  return t;
}

/** 无法 parse 时的轻量缩进（不包外层引号） */
export function indentJsonLike(s: string): string {
  let out = '';
  let depth = 0;
  let inStr = false;
  let esc = false;
  const nl = () => `\n${'  '.repeat(Math.max(depth, 0))}`;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      out += ch;
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      out += ch;
      continue;
    }
    if (ch === '{' || ch === '[') {
      out += ch;
      depth += 1;
      out += nl();
      continue;
    }
    if (ch === '}' || ch === ']') {
      depth = Math.max(0, depth - 1);
      out += nl() + ch;
      continue;
    }
    if (ch === ',') {
      out += `,${nl()}`;
      continue;
    }
    if (ch === ':') {
      out += ': ';
      continue;
    }
    if (ch === ' ' || ch === '\n' || ch === '\t' || ch === '\r') continue;
    out += ch;
  }
  return out;
}

function prettyJsonText(raw: string): string {
  const truncated = /…\[truncated\]/.test(raw);
  const core = raw.replace(/\s*…\[truncated\]\s*$/, '').trim();
  const suffix = truncated ? '\n…[truncated]' : '';

  try {
    return `${JSON.stringify(JSON.parse(core), null, 2)}${suffix}`;
  } catch {
    /* continue */
  }
  try {
    const repaired = repairTruncatedJson(core);
    return `${JSON.stringify(JSON.parse(repaired), null, 2)}${suffix}`;
  } catch {
    /* continue */
  }
  return `${indentJsonLike(core)}${suffix}`;
}

export function formatAuditJson(value: unknown): string {
  // agents 超限瘦身：{ _truncated, preview }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const o = value as Record<string, unknown>;
    if (o._truncated === true && typeof o.preview === 'string') {
      const text = prettyJsonText(o.preview);
      return text.includes('…[truncated]') ? text : `${text}\n…[truncated]`;
    }
  }

  const unwrapped = unwrapAuditJson(value);
  if (typeof unwrapped === 'string') {
    return prettyJsonText(unwrapped);
  }
  try {
    return JSON.stringify(unwrapped, null, 2);
  } catch {
    return String(unwrapped);
  }
}

/**
 * 复制到 bash：修复历史粘连 header，Authorization 占位（禁止落真实 token）。
 */
export function sanitizeAuditCurl(raw: string): string {
  if (!raw) return raw;
  let s = raw.replace(/\s+/g, ' ').trim();
  s = s.replace(/'Content-Type:/gi, "' -H 'Content-Type:");
  s = s.replace(/-H\s+'\s+-H\s+'/g, "-H '");
  s = s.replace(/-H 'Authorization:[^']*'/gi, "-H 'Authorization: Bearer <token>'");
  return s;
}
