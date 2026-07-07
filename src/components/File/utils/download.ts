export interface FileDownloadOptions {
  preview?: boolean;
  token?: string | null;
  /** API 前缀，默认 /api */
  apiPrefix?: string;
}

export interface FileDownloadAuthOptions {
  getToken?: () => string | null;
  apiPrefix?: string;
}

/** 带鉴权参数的文件下载 URL（用于新窗口打开、iframe 等场景） */
export function getFileDownloadUrl(
  fileId: string,
  options?: FileDownloadOptions & { getToken?: () => string | null },
): string {
  const apiPrefix = options?.apiPrefix ?? '/api';
  const token = options?.token === undefined ? (options?.getToken?.() ?? null) : options.token;
  const params = new URLSearchParams();
  if (token) params.set('token', token);
  if (options?.preview) params.set('preview', '1');
  const qs = params.toString();
  return `${apiPrefix}/files/${fileId}/download${qs ? `?${qs}` : ''}`;
}

export function getFileDownloadAuthHeaders(
  getToken?: () => string | null,
): HeadersInit | undefined {
  const token = getToken?.();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

/** 通过 fetch 鉴权后触发浏览器下载 */
export async function downloadFileItem(
  file: { id: string; name: string },
  options?: FileDownloadAuthOptions,
): Promise<boolean> {
  const apiPrefix = options?.apiPrefix ?? '/api';
  try {
    const res = await fetch(`${apiPrefix}/files/${file.id}/download`, {
      headers: getFileDownloadAuthHeaders(options?.getToken),
    });
    if (!res.ok) return false;

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(blobUrl);
    return true;
  } catch {
    return false;
  }
}
