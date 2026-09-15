/**
 * 浏览器「Copy as cURL」风格：用当前页 origin + 当前登录态拼可执行命令。
 * 库内 requestCurl 仍脱敏，复制时不回读落库 token。
 */

export type AuditReplayDetail = {
  httpMethod?: string | null;
  path?: string | null;
  requestCurl?: string | null;
  steps?: Array<{ stepType?: string; input?: unknown }>;
};

export type AuditReplaySession = {
  origin: string;
  authorization?: string | null;
  cookie?: string | null;
  userAgent?: string | null;
  acceptLanguage?: string | null;
  referer?: string | null;
};

function shellSingleQuote(s: string): string {
  return `'${s.replace(/'/g, `'\\''`)}'`;
}

function compactJsonBody(input: unknown): string | undefined {
  if (input == null) return undefined;
  if (typeof input === 'string') {
    const t = input.trim();
    return t || undefined;
  }
  try {
    return JSON.stringify(input);
  } catch {
    return undefined;
  }
}

function pathFromStoredCurl(curl: string): string | undefined {
  const abs = curl.match(/https?:\/\/[^/\s']+(\/[^'\s]*)/);
  if (abs?.[1]) {
    try {
      return new URL(abs[0]).pathname + new URL(abs[0]).search;
    } catch {
      return abs[1];
    }
  }
  const rel = curl.match(/'(?:https?:\/\/[^']+)?(\/[^']*)'/);
  return rel?.[1];
}

function methodFromStoredCurl(curl: string): string | undefined {
  const m = curl.match(/curl\s+(?:-X|--request)\s+(\w+)/i);
  return m?.[1];
}

function bodyFromStoredCurl(curl: string): string | undefined {
  const m = curl.match(/--data(?:-raw)?\s+'((?:\\'|[^'])*)'/);
  if (!m?.[1]) return undefined;
  return m[1].replace(/'\\''/g, "'");
}

export function resolveReplayPath(detail: AuditReplayDetail): string | undefined {
  const p = detail.path?.trim();
  if (p) {
    if (p.startsWith('http://') || p.startsWith('https://')) {
      try {
        const u = new URL(p);
        return u.pathname + u.search;
      } catch {
        return p;
      }
    }
    return p.startsWith('/') ? p : `/${p}`;
  }
  if (detail.requestCurl) return pathFromStoredCurl(detail.requestCurl);
  return undefined;
}

export function resolveReplayMethod(detail: AuditReplayDetail): string {
  const m = detail.httpMethod?.trim();
  if (m) return m.toUpperCase();
  if (detail.requestCurl) {
    const fromCurl = methodFromStoredCurl(detail.requestCurl);
    if (fromCurl) return fromCurl.toUpperCase();
  }
  return 'GET';
}

export function resolveReplayBody(detail: AuditReplayDetail): string | undefined {
  const req = (detail.steps || []).find((s) => String(s.stepType).toUpperCase() === 'REQUEST');
  const fromStep = compactJsonBody(req?.input);
  if (fromStep) return fromStep;
  if (detail.requestCurl) return bodyFromStoredCurl(detail.requestCurl);
  return undefined;
}

function headerLine(name: string, value: string): string {
  return `  -H ${shellSingleQuote(`${name}: ${value}`)} \\`;
}

/** Chrome Copy as cURL（bash）形态；可直接粘贴。 */
export function buildAuditReplayCurl(
  detail: AuditReplayDetail,
  session: AuditReplaySession,
): string {
  const path = resolveReplayPath(detail);
  if (!path) {
    throw new Error('无请求路径，无法生成 curl');
  }
  const origin = session.origin.replace(/\/$/, '');
  const url = `${origin}${path}`;
  const method = resolveReplayMethod(detail);
  const body = method === 'GET' || method === 'HEAD' ? undefined : resolveReplayBody(detail);
  const lang = session.acceptLanguage?.trim() || 'zh-CN,zh;q=0.9';
  const ua =
    session.userAgent?.trim() ||
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36';
  const referer = session.referer?.trim() || `${origin}/`;
  const lines: string[] = [
    `curl --url ${shellSingleQuote(url)} \\`,
    `  -X ${method} \\`,
    headerLine('Accept', 'application/json, text/plain, */*'),
    headerLine('Accept-Language', lang),
  ];
  const auth = session.authorization?.trim();
  if (auth) {
    const value = auth.toLowerCase().startsWith('bearer ') ? auth : `Bearer ${auth}`;
    lines.push(headerLine('Authorization', value));
  }
  lines.push(headerLine('Connection', 'keep-alive'));
  if (body) {
    lines.push(headerLine('Content-Type', 'application/json'));
  }
  const cookie = session.cookie?.trim();
  if (cookie) {
    lines.push(`  -b ${shellSingleQuote(cookie)} \\`);
  }
  lines.push(headerLine('Origin', origin));
  lines.push(headerLine('Referer', referer));
  lines.push(headerLine('Sec-Fetch-Dest', 'empty'));
  lines.push(headerLine('Sec-Fetch-Mode', 'cors'));
  lines.push(headerLine('Sec-Fetch-Site', 'same-origin'));
  lines.push(headerLine('User-Agent', ua));
  if (body) {
    lines.push(`  --data-raw ${shellSingleQuote(body)}`);
  } else {
    const last = lines.length ? lines[lines.length - 1] : undefined;
    if (typeof last === 'string' && last.endsWith(' \\')) {
      lines[lines.length - 1] = last.slice(0, -2);
    }
  }
  return lines.join('\n');
}

export function readBrowserReplaySession(
  getToken?: () => string | null | undefined,
): AuditReplaySession {
  if (typeof window === 'undefined') {
    return { origin: '' };
  }
  const token = getToken?.()?.trim();
  return {
    origin: window.location.origin,
    authorization: token
      ? token.toLowerCase().startsWith('bearer ')
        ? token
        : `Bearer ${token}`
      : null,
    cookie: document.cookie || null,
    userAgent: navigator.userAgent || null,
    acceptLanguage: navigator.language ? `${navigator.language},zh;q=0.9` : null,
    referer: window.location.href,
  };
}
