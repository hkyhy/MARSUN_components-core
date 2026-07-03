import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type PageShellMeta = {
  title?: string;
  description?: ReactNode;
  actionItems?: Record<string, unknown>[];
};

type PageShellContextValue = {
  meta: PageShellMeta;
  setPageMeta: (next: PageShellMeta) => void;
  pageLoading: boolean;
  setPageLoading: (loading: boolean) => void;
};

const EMPTY_META: PageShellMeta = {};

const PageShellContext = createContext<PageShellContextValue>({
  meta: EMPTY_META,
  setPageMeta: () => {},
  pageLoading: false,
  setPageLoading: () => {},
});

export function usePageShell() {
  return useContext(PageShellContext);
}

/** 深层子组件向 Layout body Spin 注册 loading（卸载时自动清除） */
export function usePageShellLoading(spinning: boolean) {
  const { setPageLoading } = usePageShell();
  useEffect(() => {
    setPageLoading(spinning);
    return () => setPageLoading(false);
  }, [spinning, setPageLoading]);
}

export type PageShellProviderProps = {
  children: ReactNode;
};

export function PageShellProvider({ children }: PageShellProviderProps) {
  const [meta, setMeta] = useState<PageShellMeta>(EMPTY_META);
  const [pageLoading, setPageLoadingState] = useState(false);

  const setPageMeta = useCallback((next: PageShellMeta) => {
    setMeta(next);
  }, []);

  const setPageLoading = useCallback((loading: boolean) => {
    setPageLoadingState(loading);
  }, []);

  const value = useMemo(
    () => ({
      meta,
      setPageMeta,
      pageLoading,
      setPageLoading,
    }),
    [meta, setPageMeta, pageLoading, setPageLoading],
  );

  return <PageShellContext.Provider value={value}>{children}</PageShellContext.Provider>;
}
