import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchWithTimeout } from '@/hooks/useFetchData';

export type TableFetchQuery = {
  currentPage: number;
  pageSize: number;
};

export type TableFetchMapped<T> = {
  pageData: T[];
  total: number;
  extra?: unknown;
};

export type TableFetchHandle = {
  reload: () => void;
};

export type UseTableFetchOptions<T extends object> = {
  /** props 模式：传了 dataSource（含 []）则不拉数 */
  dataSource: readonly T[] | T[] | undefined;
  fetchData?: (q: TableFetchQuery) => Promise<unknown>;
  fetchUrl?: string;
  fetchOptions?: RequestInit | ((q: TableFetchQuery) => RequestInit);
  transformData?: (raw: unknown) => TableFetchMapped<T>;
  fetchParams?: unknown;
  enabled?: boolean;
  defaultPageSize?: number;
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  timeoutMs?: number;
  onFetched?: (r: TableFetchMapped<T> & { error: Error | null }) => void;
};

export type UseTableFetchResult<T extends object> = {
  /** 是否处于 fetch 模式 */
  fetchMode: boolean;
  rows: readonly T[] | T[] | undefined;
  total: number;
  loading: boolean;
  error: Error | null;
  currentPage: number;
  pageSize: number;
  setPage: (page: number, size?: number) => void;
  reload: () => void;
};

/** 稳定序列化 fetchParams，避免父组件每渲新对象导致死循环 */
export function stableFetchParamsKey(params: unknown): string {
  if (params == null) return '';
  if (typeof params !== 'object') return JSON.stringify(params);
  if (Array.isArray(params)) {
    return `[${params.map((x) => stableFetchParamsKey(x)).join(',')}]`;
  }
  const obj = params as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableFetchParamsKey(obj[k])}`).join(',')}}`;
}

function buildUrl(baseUrl: string | undefined, fetchUrl: string): string {
  if (fetchUrl.startsWith('http://') || fetchUrl.startsWith('https://')) {
    return fetchUrl;
  }
  const base = (baseUrl ?? '').replace(/\/$/, '');
  const path = fetchUrl.startsWith('/') ? fetchUrl : `/${fetchUrl}`;
  return `${base}${path}`;
}

export function defaultTableTransformData<T extends object>(raw: unknown): TableFetchMapped<T> {
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.pageData)) {
      return {
        pageData: o.pageData as T[],
        total: typeof o.total === 'number' ? o.total : o.pageData.length,
        extra: 'mapping' in o ? o.mapping : o.extra,
      };
    }
    if (Array.isArray(raw)) {
      return { pageData: raw as T[], total: raw.length };
    }
  }
  return { pageData: [], total: 0 };
}

/**
 * Table 内部分页拉数。仅 Table 使用，不进包根导出。
 * fetchData 优先于 fetchUrl；dataSource !== undefined 时为 props 模式。
 */
export function useTableFetch<T extends object>(
  options: UseTableFetchOptions<T>,
): UseTableFetchResult<T> {
  const {
    dataSource,
    fetchData,
    fetchUrl,
    fetchOptions,
    transformData,
    fetchParams,
    enabled = true,
    defaultPageSize = 20,
    baseUrl,
    defaultHeaders,
    timeoutMs = 30_000,
    onFetched,
  } = options;

  const fetchMode = dataSource === undefined && Boolean(fetchData || fetchUrl);
  const depsKey = useMemo(() => stableFetchParamsKey(fetchParams), [fetchParams]);

  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [reloadTick, setReloadTick] = useState(0);
  const [committedDepsKey, setCommittedDepsKey] = useState(depsKey);

  // 筛变时同步回第 1 页，避免先用旧页码打一枪
  if (fetchMode && committedDepsKey !== depsKey) {
    setCommittedDepsKey(depsKey);
    if (currentPage !== 1) setCurrentPage(1);
  }

  const requestIdRef = useRef(0);
  const onFetchedRef = useRef(onFetched);
  onFetchedRef.current = onFetched;
  const transformRef = useRef(transformData);
  transformRef.current = transformData;
  const fetchDataRef = useRef(fetchData);
  fetchDataRef.current = fetchData;
  const fetchOptionsRef = useRef(fetchOptions);
  fetchOptionsRef.current = fetchOptions;

  const reload = useCallback(() => {
    setReloadTick((n) => n + 1);
  }, []);

  const setPage = useCallback((page: number, size?: number) => {
    setCurrentPage(page);
    if (size != null && size > 0) setPageSize(size);
  }, []);

  useEffect(() => {
    if (!fetchMode || !enabled) {
      if (!fetchMode) {
        setRows([]);
        setTotal(0);
        setError(null);
        setLoading(false);
      } else if (!enabled) {
        setLoading(false);
      }
      return;
    }

    const reqId = ++requestIdRef.current;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      const query: TableFetchQuery = { currentPage, pageSize };
      try {
        let raw: unknown;
        if (fetchDataRef.current) {
          raw = await fetchDataRef.current(query);
        } else if (fetchUrl) {
          const url = buildUrl(baseUrl, fetchUrl);
          const optRaw = fetchOptionsRef.current;
          const opts = typeof optRaw === 'function' ? optRaw(query) : (optRaw ?? {});
          const headers = {
            ...defaultHeaders,
            ...(opts.headers as Record<string, string> | undefined),
          };
          raw = await fetchWithTimeout(url, { ...opts, headers }, timeoutMs);
        } else {
          raw = { pageData: [], total: 0 };
        }
        if (cancelled || reqId !== requestIdRef.current) return;
        const mapped = (transformRef.current ?? defaultTableTransformData<T>)(raw);
        setRows(mapped.pageData ?? []);
        setTotal(mapped.total ?? 0);
        setError(null);
        onFetchedRef.current?.({ ...mapped, error: null });
      } catch (e) {
        if (cancelled || reqId !== requestIdRef.current) return;
        const err = e instanceof Error ? e : new Error(String(e));
        setRows([]);
        setTotal(0);
        setError(err);
        onFetchedRef.current?.({ pageData: [], total: 0, error: err });
      } finally {
        if (!cancelled && reqId === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [
    fetchMode,
    enabled,
    currentPage,
    pageSize,
    depsKey,
    reloadTick,
    fetchUrl,
    baseUrl,
    defaultHeaders,
    timeoutMs,
  ]);

  return {
    fetchMode,
    rows: (fetchMode ? rows : dataSource) as readonly T[] | undefined,
    total,
    loading: fetchMode ? loading : false,
    error: fetchMode ? error : null,
    currentPage,
    pageSize,
    setPage,
    reload,
  };
}
