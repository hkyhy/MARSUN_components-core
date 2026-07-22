export const REDIRECT_URL_PARAM = 'redirect_url';

const DEFAULT_POST_LOGIN_PATH = '/dashboard';

export type BuildLoginPathOptions = {
  /** 登录页路径或绝对 URL（如 https://auth.parent.com/login） */
  loginPath?: string;
  /** 允许的绝对 redirect 源；未传时仅允许相对路径 */
  allowedRedirectOrigins?: string[];
  /** 为 true 时，默认 redirect 使用当前页绝对 URL（跨子系统 SSO） */
  useAbsoluteRedirect?: boolean;
};

function isSafeRelativeRedirect(url: string): boolean {
  if (!url.startsWith('/') || url.startsWith('//')) {
    return false;
  }
  if (url === '/login' || url.startsWith('/login?')) {
    return false;
  }
  return true;
}

function isSafeAbsoluteRedirect(url: string, allowedOrigins: string[]): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    if (allowedOrigins.length === 0) {
      return false;
    }
    return allowedOrigins.includes(parsed.origin);
  } catch {
    return false;
  }
}

function isSafeRedirectUrl(url: string, allowedOrigins: string[] = []): boolean {
  if (isSafeRelativeRedirect(url)) {
    return true;
  }
  return isSafeAbsoluteRedirect(url, allowedOrigins);
}

export function resolveRedirectUrl(
  value: string | null | undefined,
  allowedOrigins: string[] = [],
): string {
  if (!value || !isSafeRedirectUrl(value, allowedOrigins)) {
    return DEFAULT_POST_LOGIN_PATH;
  }
  return value;
}

export function buildLocationRedirectUrl(pathname: string, search = '', hash = ''): string {
  return `${pathname}${search}${hash}`;
}

/** 当前页绝对 URL（用于跨子域 SSO redirect_url） */
export function buildAbsoluteLocationRedirectUrl(
  pathname = window.location.pathname,
  search = window.location.search,
  hash = window.location.hash,
): string {
  return `${window.location.origin}${pathname}${search}${hash}`;
}

/**
 * 构建带 redirect_url 的登录页路径。
 * `loginPath` 可为相对路径或绝对 URL（VITE_AUTH_LOGIN_URL）。
 */
export function buildLoginPath(
  redirectUrl?: string,
  loginPathOrOptions: string | BuildLoginPathOptions = '/login',
): string {
  const options: BuildLoginPathOptions =
    typeof loginPathOrOptions === 'string' ? { loginPath: loginPathOrOptions } : loginPathOrOptions;

  const loginPath = options.loginPath || '/login';
  const allowedOrigins = options.allowedRedirectOrigins || [];

  const target =
    redirectUrl ??
    (options.useAbsoluteRedirect
      ? buildAbsoluteLocationRedirectUrl()
      : buildLocationRedirectUrl(
          window.location.pathname,
          window.location.search,
          window.location.hash,
        ));

  if (!isSafeRedirectUrl(target, allowedOrigins) && !isSafeRelativeRedirect(target)) {
    return loginPath;
  }

  const params = new URLSearchParams();
  params.set(REDIRECT_URL_PARAM, target);

  if (/^https?:\/\//i.test(loginPath)) {
    const url = new URL(loginPath);
    url.searchParams.set(REDIRECT_URL_PARAM, target);
    return url.toString();
  }

  return `${loginPath}?${params.toString()}`;
}

export function readRedirectUrlFromSearch(search: string, allowedOrigins: string[] = []): string {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return resolveRedirectUrl(params.get(REDIRECT_URL_PARAM), allowedOrigins);
}
