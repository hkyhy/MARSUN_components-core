export const REDIRECT_URL_PARAM = 'redirect_url';

const DEFAULT_POST_LOGIN_PATH = '/dashboard';

function isSafeRedirectUrl(url: string): boolean {
  if (!url.startsWith('/') || url.startsWith('//')) {
    return false;
  }
  if (url === '/login' || url.startsWith('/login?')) {
    return false;
  }
  return true;
}

export function resolveRedirectUrl(value: string | null | undefined): string {
  if (!value || !isSafeRedirectUrl(value)) {
    return DEFAULT_POST_LOGIN_PATH;
  }
  return value;
}

export function buildLocationRedirectUrl(pathname: string, search = '', hash = ''): string {
  return `${pathname}${search}${hash}`;
}

/** 构建带 redirect_url 的登录页路径 */
export function buildLoginPath(redirectUrl?: string, loginPath = '/login'): string {
  const target =
    redirectUrl ??
    buildLocationRedirectUrl(
      window.location.pathname,
      window.location.search,
      window.location.hash,
    );

  if (!isSafeRedirectUrl(target)) {
    return loginPath;
  }

  const params = new URLSearchParams();
  params.set(REDIRECT_URL_PARAM, target);
  return `${loginPath}?${params.toString()}`;
}

export function readRedirectUrlFromSearch(search: string): string {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return resolveRedirectUrl(params.get(REDIRECT_URL_PARAM));
}
