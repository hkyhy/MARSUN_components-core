import type { ChatMessage, ChatSession } from '@/components/AgentHub/types';
import { useMarsunFetch } from '@/provider';
import { fetchWithTimeout } from '@/hooks/useFetchData';
import { useCallback, useEffect, useState } from 'react';
import { parseSessionMessages, toDisplayMessages } from '../utils/sessionMessages';

export type UseChatSessionsOptions = {
  chatId?: string;
  userId?: string;
  listUrl?: string;
  detailUrl?: string;
  transformList?: (raw: unknown) => ChatSession[];
  transformDetail?: (raw: unknown) => ChatSession | null;
};

export const useChatSessions = (options: UseChatSessionsOptions = {}) => {
  const { chatId, userId, listUrl, detailUrl, transformList, transformDetail } = options;
  const fetchCtx = useMarsunFetch();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const loadSessions = useCallback(async () => {
    if (!listUrl || !chatId) return;
    setSessionsLoading(true);
    try {
      const url = listUrl.replace('{chatId}', chatId);
      const raw = await fetchWithTimeout(
        `${fetchCtx.baseUrl ?? ''}${url}`,
        { headers: fetchCtx.headers },
        fetchCtx.timeoutMs,
      );
      const list = transformList
        ? transformList(raw)
        : ((raw as { data?: ChatSession[] })?.data ?? []);
      setSessions(list);
    } finally {
      setSessionsLoading(false);
    }
  }, [listUrl, chatId, fetchCtx, transformList]);

  const loadSession = useCallback(
    async (targetSessionId: string) => {
      if (!detailUrl || !chatId) return;
      setSessionLoading(true);
      try {
        const url = detailUrl.replace('{chatId}', chatId).replace('{sessionId}', targetSessionId);
        const raw = await fetchWithTimeout(
          `${fetchCtx.baseUrl ?? ''}${url}`,
          { headers: fetchCtx.headers },
          fetchCtx.timeoutMs,
        );
        const detail = transformDetail
          ? transformDetail(raw)
          : ((raw as { data?: ChatSession })?.data ?? null);
        if (detail) {
          const parsed = parseSessionMessages(detail as unknown as Parameters<typeof parseSessionMessages>[0]);
          setMessages(toDisplayMessages(parsed));
        }
      } finally {
        setSessionLoading(false);
      }
    },
    [detailUrl, chatId, fetchCtx, transformDetail],
  );

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (sessionId) void loadSession(sessionId);
  }, [sessionId, loadSession]);

  return {
    sessions,
    sessionId,
    setSessionId,
    sessionsLoading,
    sessionLoading,
    messages,
    setMessages,
    loadSessions,
    userId,
  };
};
