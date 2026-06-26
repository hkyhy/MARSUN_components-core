import type { ChatAssistant, Dataset } from '@/components/AgentHub/types';
import { useMarsunFetch } from '@/provider';
import { useFetchData } from '@/hooks/useFetchData';
import { useCallback, useState } from 'react';

export type UseChatOptions = {
  listUrl?: string;
  datasetsUrl?: string;
  transformList?: (raw: unknown) => ChatAssistant[];
  transformDatasets?: (raw: unknown) => Dataset[];
  /** 删除助手 fetch URL 模板，{id} 占位 */
  deleteUrl?: string;
  onDeleteSuccess?: () => void;
};

export const useChat = (options: UseChatOptions = {}) => {
  const [keyword, setKeyword] = useState('');
  const fetchCtx = useMarsunFetch();

  const listQuery = keyword ? `?name=${encodeURIComponent(keyword)}` : '';
  const { data, loading, reload } = useFetchData<ChatAssistant[]>({
    fetchUrl: options.listUrl ? `${options.listUrl}${listQuery}` : undefined,
    transformData: options.transformList ?? ((raw) => {
      const r = raw as { data?: { chats?: ChatAssistant[] } | ChatAssistant[] };
      if (Array.isArray(r?.data)) return r.data;
      return r?.data?.chats ?? [];
    }),
    enabled: !!options.listUrl,
    baseUrl: fetchCtx.baseUrl,
    defaultHeaders: fetchCtx.headers,
    timeoutMs: fetchCtx.timeoutMs,
  });

  const { data: datasets } = useFetchData<Dataset[]>({
    fetchUrl: options.datasetsUrl,
    transformData: options.transformDatasets ?? ((raw) => {
      const r = raw as { data?: Dataset[] };
      return Array.isArray(r?.data) ? r.data : [];
    }),
    enabled: !!options.datasetsUrl,
    baseUrl: fetchCtx.baseUrl,
    defaultHeaders: fetchCtx.headers,
    timeoutMs: fetchCtx.timeoutMs,
  });

  const deleteChat = useCallback(
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

  return {
    data: data ?? [],
    loading,
    datasets: datasets ?? [],
    keyword,
    setKeyword,
    fetchData: reload,
    deleteChat,
  };
};
