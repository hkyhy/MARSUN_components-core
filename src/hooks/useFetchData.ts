import { useCallback, useEffect, useState } from 'react';

const DEFAULT_TIMEOUT_MS = 30_000;

export type FetchDataOptions<T> = {
  /** props 模式数据（优先于 fetch） */
  data?: T;
  fetchUrl?: string;
  fetchOptions?: RequestInit;
  transformData?: (raw: unknown) => T;
  enabled?: boolean;
  /** 默认 30s */
  timeoutMs?: number;
  /** Provider 注入的 baseUrl */
  baseUrl?: string;
  /** Provider 注入的默认 headers */
  defaultHeaders?: Record<string, string>;
};

export type FetchDataResult<T> = {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  reload: () => void;
};

function buildUrl(baseUrl: string | undefined, fetchUrl: string): string {
  if (fetchUrl.startsWith('http://') || fetchUrl.startsWith('https://')) {
    return fetchUrl;
  }
  const base = (baseUrl ?? '').replace(/\/$/, '');
  const path = fetchUrl.startsWith('/') ? fetchUrl : `/${fetchUrl}`;
  return `${base}${path}`;
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  } finally {
    clearTimeout(timer);
  }
}

export function useFetchData<T>(options: FetchDataOptions<T>): FetchDataResult<T> {
  const {
    data: propsData,
    fetchUrl,
    fetchOptions,
    transformData,
    enabled = true,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    baseUrl,
    defaultHeaders,
  } = options;

  const [fetchedData, setFetchedData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  const reload = useCallback(() => {
    setReloadTick((n) => n + 1);
    setFetchedData(undefined);
    setError(null);
  }, []);

  useEffect(() => {
    if (propsData !== undefined || !fetchUrl || !enabled) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = buildUrl(baseUrl, fetchUrl);
        const headers = { ...defaultHeaders, ...fetchOptions?.headers };
        const raw = await fetchWithTimeout(url, { ...fetchOptions, headers }, timeoutMs);
        if (cancelled) return;
        const result = transformData ? transformData(raw) : (raw as T);
        setFetchedData(result);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [
    propsData,
    fetchUrl,
    enabled,
    timeoutMs,
    baseUrl,
    defaultHeaders,
    fetchOptions,
    transformData,
    reloadTick,
  ]);

  if (propsData !== undefined) {
    return { data: propsData, loading: false, error: null, reload };
  }

  return { data: fetchedData, loading, error, reload };
}
