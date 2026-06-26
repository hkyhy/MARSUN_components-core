import type { ChatMessage, ChatSession, Citation, MessageRole } from '@/components/AgentHub/types';
import { normalizeCitation } from './citationContent';
import { hasCitationMarkers } from './messageContent';

interface RawSessionMessage {
  id?: string;
  role: MessageRole;
  content?: unknown;
  reference?: SessionReference;
  created_at?: number;
  create_time?: number;
  thumbup?: boolean;
}

type SessionReference =
  | { chunks?: Citation[] | Record<string, Citation> }
  | Citation[]
  | Record<string, unknown>
  | null;

const DEFAULT_SESSION_NAMES = new Set(['New session', '新会话']);
const SPURIOUS_NUMERIC_USER_RE = /^\d{1,4}$/;

export const formatSessionTime = (value?: string | number): string => {
  if (value == null) return '';
  const date = new Date(typeof value === 'number' && value < 1e12 ? value * 1000 : value);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const normalizeMessageContent = (content: unknown): string => {
  if (content == null) return '';
  if (typeof content === 'string') return content;
  if (typeof content === 'number' || typeof content === 'boolean') return String(content);

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object') {
          const record = part as Record<string, unknown>;
          if (typeof record.text === 'string') return record.text;
          if (typeof record.content === 'string') return record.content;
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }

  if (typeof content === 'object') {
    const record = content as Record<string, unknown>;
    if (typeof record.text === 'string') return record.text;
    if (typeof record.content === 'string') return record.content;
    if (typeof record.answer === 'string') return record.answer;
  }

  return '';
};

const getMessageTimestamp = (message: RawSessionMessage): number | undefined => {
  const value = message.created_at ?? message.create_time;
  return typeof value === 'number' ? value : undefined;
};

const sortMessagesChronologically = (messages: RawSessionMessage[]): RawSessionMessage[] => {
  const withTimestamp = messages.filter((item) => getMessageTimestamp(item) != null);
  // RAGFlow 常仅给 assistant 回复写 created_at；缺 timestamp 的消息不能当作 0 参与排序，否则会打乱 API 原始顺序
  if (withTimestamp.length < 2 || withTimestamp.length < messages.length) return messages;

  return [...messages].sort((left, right) => {
    const leftTime = getMessageTimestamp(left)!;
    const rightTime = getMessageTimestamp(right)!;
    return leftTime - rightTime;
  });
};

const isPlaceholderContent = (content: string): boolean => {
  const trimmed = content.trim();
  if (!trimmed) return true;
  return !/[\S\u4e00-\u9fff]/.test(trimmed);
};

export const getSessionDisplayName = (session: ChatSession): string => {
  const customName = session.name?.trim();
  if (customName && !DEFAULT_SESSION_NAMES.has(customName)) {
    return customName;
  }

  const rawMessages = session.messages ?? session.message ?? [];
  const firstUserMessage = rawMessages.find((item) => item.role === 'user');
  const text = normalizeMessageContent(firstUserMessage?.content).trim();
  if (text) {
    return text.length > 24 ? `${text.slice(0, 24)}…` : text;
  }

  return '新会话';
};

export const isWelcomeOnlyMessages = (messages: ChatMessage[], prologue?: string): boolean => {
  if (messages.length === 0) return true;
  if (messages.length !== 1 || messages[0]?.role !== 'assistant') return false;

  const content = messages[0].content.trim();
  if (!content) return true;
  if (!prologue?.trim()) return false;

  return content === prologue.trim();
};

const dedupeCitations = (chunks: Citation[]): Citation[] => {
  const seen = new Set<string>();
  return chunks.filter((chunk) => {
    const key = `${chunk.doc_id ?? ''}:${chunk.id ?? ''}:${chunk.content?.slice(0, 80) ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const toCitationArray = (chunks: unknown): Citation[] => {
  if (Array.isArray(chunks)) {
    return chunks
      .filter((chunk) => chunk && typeof chunk === 'object')
      .map((chunk) => normalizeCitation(chunk as Record<string, unknown>));
  }

  if (chunks && typeof chunks === 'object') {
    return Object.values(chunks as Record<string, unknown>)
      .filter((chunk) => chunk && typeof chunk === 'object')
      .map((chunk) => normalizeCitation(chunk as Record<string, unknown>));
  }

  return [];
};

export const extractCitations = (reference?: SessionReference): Citation[] | undefined => {
  if (reference == null) return undefined;

  if (Array.isArray(reference)) {
    const chunks = toCitationArray(reference);
    return chunks.length > 0 ? dedupeCitations(chunks) : undefined;
  }

  if (typeof reference !== 'object' || !('chunks' in reference)) {
    return undefined;
  }

  const chunks = toCitationArray(reference.chunks);
  return chunks.length > 0 ? dedupeCitations(chunks) : undefined;
};

const collectSessionCitations = (references: SessionReference[]): Citation[] => {
  const chunks: Citation[] = [];
  references.forEach((reference) => {
    const list = extractCitations(reference);
    if (list) chunks.push(...list);
  });
  return dedupeCitations(chunks);
};

const countUserMessagesBefore = (messages: RawSessionMessage[], index: number): number =>
  messages.slice(0, index).filter((message) => message.role === 'user').length;

const resolveMessageCitations = (
  item: RawSessionMessage,
  index: number,
  messages: RawSessionMessage[],
  references: SessionReference[],
  sessionCitations: Citation[],
  content: string,
): Citation[] | undefined => {
  // 引用仅属于 assistant 回复；RAGFlow reference[n] 按第 n 轮用户提问对齐，不能按消息下标直接挂到 user
  if (item.role !== 'assistant') return undefined;

  const fromMessage = extractCitations(item.reference);
  if (fromMessage?.length) return fromMessage;

  const userTurnsBefore = countUserMessagesBefore(messages, index);
  if (userTurnsBefore === 0) return undefined;

  const fromMessageIndex = extractCitations(references[index]);
  if (fromMessageIndex?.length) return fromMessageIndex;

  const fromTurnIndex = extractCitations(references[userTurnsBefore - 1]);
  if (fromTurnIndex?.length) return fromTurnIndex;

  if (hasCitationMarkers(content) && sessionCitations.length) {
    return sessionCitations;
  }

  return undefined;
};

export const parseSessionMessages = (
  rawMessages: RawSessionMessage[] = [],
  references: SessionReference[] = [],
): ChatMessage[] => {
  const sessionCitations = collectSessionCitations(references);
  const orderedMessages = sortMessagesChronologically(rawMessages);

  return orderedMessages
    .filter((item) => item.role === 'user' || item.role === 'assistant')
    .map((item, index) => {
      const content = normalizeMessageContent(item.content);
      return {
        id: item.id ?? `msg_${index}_${item.role}`,
        role: item.role,
        content,
        citations: resolveMessageCitations(
          item,
          index,
          orderedMessages,
          references,
          sessionCitations,
          content,
        ),
        thumbup: typeof item.thumbup === 'boolean' ? item.thumbup : undefined,
      };
    })
    .filter((item) => !isPlaceholderContent(item.content));
};

const stripPrologueMessages = (messages: ChatMessage[], prologue?: string): ChatMessage[] => {
  if (!prologue?.trim() || messages.length === 0) return messages;

  const trimmedPrologue = prologue.trim();
  let result = [...messages];

  while (
    result.length > 0 &&
    result[0]?.role === 'assistant' &&
    result[0]?.content.trim() === trimmedPrologue
  ) {
    result = result.slice(1);
  }

  while (
    result.length > 1 &&
    result[result.length - 1]?.role === 'assistant' &&
    result[result.length - 1]?.content.trim() === trimmedPrologue
  ) {
    result = result.slice(0, -1);
  }

  return result;
};

const filterSpuriousNumericUserMessages = (messages: ChatMessage[]): ChatMessage[] => {
  const numericCounts = new Map<string, number>();

  messages.forEach((item) => {
    if (item.role !== 'user') return;
    const content = item.content.trim();
    if (!SPURIOUS_NUMERIC_USER_RE.test(content)) return;
    numericCounts.set(content, (numericCounts.get(content) ?? 0) + 1);
  });

  const duplicatedNumerics = new Set(
    [...numericCounts.entries()].filter(([, count]) => count > 1).map(([content]) => content),
  );
  if (duplicatedNumerics.size === 0) return messages;

  // 仅过滤 RAGFlow 偶发的重复纯数字 user 消息（如连续两条 "12"），保留 "22"/"11" 等真实追问
  return messages.filter(
    (item) =>
      !(
        item.role === 'user' &&
        duplicatedNumerics.has(item.content.trim()) &&
        SPURIOUS_NUMERIC_USER_RE.test(item.content.trim())
      ),
  );
};

export const toDisplayMessages = (messages: ChatMessage[], prologue?: string): ChatMessage[] => {
  const withoutPrologue = stripPrologueMessages(messages, prologue);
  const cleaned = filterSpuriousNumericUserMessages(withoutPrologue);

  // 无用户消息时视为欢迎态（RAGFlow 新会话仅含 assistant 开场白）
  if (!cleaned.some((item) => item.role === 'user')) {
    return [];
  }

  return isWelcomeOnlyMessages(cleaned, prologue) ? [] : cleaned;
};
