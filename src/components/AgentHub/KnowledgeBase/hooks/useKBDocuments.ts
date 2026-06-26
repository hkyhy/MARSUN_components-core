import type { KBDocument } from '@/components/AgentHub/types';
import { useMarsunFetch } from '@/provider';
import { useFetchData } from '@/hooks/useFetchData';

export type UseKBDocumentsOptions = {
  listUrl?: string;
  transformList?: (raw: unknown) => KBDocument[];
};

export const useKBDocuments = (datasetId: string | undefined, options: UseKBDocumentsOptions = {}) => {
  const fetchCtx = useMarsunFetch();
  const url = options.listUrl?.replace('{datasetId}', datasetId ?? '');

  const { data, loading, reload } = useFetchData<KBDocument[]>({
    fetchUrl: url,
    transformData:
      options.transformList ??
      ((raw) => {
        const r = raw as { data?: KBDocument[] };
        return Array.isArray(r?.data) ? r.data : [];
      }),
    enabled: !!url && !!datasetId,
    baseUrl: fetchCtx.baseUrl,
    defaultHeaders: fetchCtx.headers,
    timeoutMs: fetchCtx.timeoutMs,
  });

  return { data: data ?? [], loading, fetchData: reload };
};
