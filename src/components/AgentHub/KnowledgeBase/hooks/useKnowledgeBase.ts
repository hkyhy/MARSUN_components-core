import type { Dataset } from '@/components/AgentHub/types';
import { useMarsunFetch } from '@/provider';
import { useFetchData } from '@/hooks/useFetchData';
import { useCallback } from 'react';

export type UseKnowledgeBaseOptions = {
  listUrl?: string;
  transformList?: (raw: unknown) => Dataset[];
  deleteUrl?: string;
  onDeleteSuccess?: () => void;
};

export const useKnowledgeBase = (options: UseKnowledgeBaseOptions = {}) => {
  const fetchCtx = useMarsunFetch();
  const { data, loading, reload } = useFetchData<Dataset[]>({
    fetchUrl: options.listUrl,
    transformData:
      options.transformList ??
      ((raw) => {
        const r = raw as { data?: Dataset[] };
        return Array.isArray(r?.data) ? r.data : [];
      }),
    enabled: !!options.listUrl,
    baseUrl: fetchCtx.baseUrl,
    defaultHeaders: fetchCtx.headers,
    timeoutMs: fetchCtx.timeoutMs,
  });

  const deleteDataset = useCallback(
    async (id: string) => {
      if (!options.deleteUrl) return;
      const url = options.deleteUrl.replace('{id}', id);
      await fetch(`${fetchCtx.baseUrl ?? ''}${url}`, {
        method: 'DELETE',
        headers: fetchCtx.headers,
      });
      options.onDeleteSuccess?.();
      reload();
    },
    [options, fetchCtx, reload],
  );

  return { data: data ?? [], loading, fetchData: reload, deleteDataset };
};
