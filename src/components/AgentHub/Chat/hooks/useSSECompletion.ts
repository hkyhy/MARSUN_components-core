import { normalizeCitation } from '@/components/AgentHub/Chat/utils/citationContent';
import { useMarsunFetch } from '@/provider';
import type { Citation } from '@/components/AgentHub/types';
import { useCallback, useRef, useState } from 'react';

export type SSECompletionOptions = {
  completionUrl: string;
  getAuthHeaders?: () => Record<string, string>;
};

export const useSSECompletion = ({ completionUrl, getAuthHeaders }: SSECompletionOptions) => {
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const fetchCtx = useMarsunFetch();

  const send = useCallback(
    async (
      messages: { role: 'user' | 'assistant'; content: string }[],
      onChunk: (text: string) => void,
      onCitations: (citations: Citation[]) => void,
      onDone: () => void,
      onError: (err: string) => void,
      sessionId?: string,
    ) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setStreaming(true);

      const question = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
      const url = completionUrl.startsWith('http')
        ? completionUrl
        : `${fetchCtx.baseUrl ?? ''}${completionUrl}`;

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...fetchCtx.headers,
            ...getAuthHeaders?.(),
          },
          body: JSON.stringify({ question, stream: true, session_id: sessionId }),
          signal: controller.signal,
        });

        if (!res.ok) {
          onError(await res.text() || `HTTP ${res.status}`);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          onError('No response body');
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (payload === '[DONE]') continue;
            try {
              const json = JSON.parse(payload) as {
                answer?: string;
                citations?: Citation[];
              };
              if (json.answer) onChunk(json.answer);
              if (json.citations?.length) {
                onCitations(json.citations.map((c) => normalizeCitation(c as Record<string, unknown>)));
              }
            } catch {
              // skip malformed chunk
            }
          }
        }
        onDone();
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          onError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        setStreaming(false);
      }
    },
    [completionUrl, fetchCtx, getAuthHeaders],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  return { send, streaming, abort };
};
