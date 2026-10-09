import { useMarsunFetch } from '@/provider/context';

/** 相对 /api 等受护资源：须带 MarsunCoreProvider.fetch.headers（Bearer） */
export function needsAuthFetch(url: string, headers?: Record<string, string>): boolean {
  if (!url || !headers || Object.keys(headers).length === 0) return false;
  if (url.startsWith('blob:') || url.startsWith('data:')) return false;
  // 同源相对路径或明确 /api
  if (url.startsWith('/')) return true;
  try {
    const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://local');
    if (typeof window !== 'undefined' && u.origin === window.location.origin) return true;
  } catch {
    return false;
  }
  return false;
}

export async function fetchWithMarsunAuth(
  url: string,
  headers?: Record<string, string>,
): Promise<Response> {
  const init: RequestInit = {};
  if (needsAuthFetch(url, headers) && headers) {
    init.headers = headers;
  }
  return fetch(url, init);
}

export async function fetchAuthedArrayBuffer(
  url: string,
  headers?: Record<string, string>,
): Promise<ArrayBuffer> {
  const res = await fetchWithMarsunAuth(url, headers);
  if (!res.ok) throw new Error(`预览加载失败 (${res.status})`);
  return res.arrayBuffer();
}

export async function fetchAuthedObjectUrl(
  url: string,
  headers?: Record<string, string>,
): Promise<{ objectUrl: string; revoke: () => void }> {
  if (!needsAuthFetch(url, headers)) {
    return { objectUrl: url, revoke: () => undefined };
  }
  const res = await fetchWithMarsunAuth(url, headers);
  if (!res.ok) throw new Error(`预览加载失败 (${res.status})`);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  return {
    objectUrl,
    revoke: () => URL.revokeObjectURL(objectUrl),
  };
}

/** File 预览组件内读取 Provider 注入的鉴权头 */
export function useFileAuthHeaders(): Record<string, string> | undefined {
  const { headers } = useMarsunFetch();
  const raw = headers?.Authorization || headers?.authorization;
  if (!raw) return undefined;
  const Authorization =
    raw.startsWith('Bearer ') || raw.startsWith('bearer ') ? raw : `Bearer ${raw}`;
  return { Authorization };
}

/** effect 依赖用：仅 token 串，避免 headers 对象引用抖动 */
export function useFileAuthHeaderKey(): string {
  return useFileAuthHeaders()?.Authorization || '';
}
