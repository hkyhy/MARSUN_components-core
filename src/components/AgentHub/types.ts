/** AgentHub 展示层类型（字段宽松，消费方 transformData 映射） */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Citation {
  id: string;
  title?: string;
  content?: string;
  source?: string;
  url?: string;
  doc_id?: string;
  doc_name?: string;
  positions?: unknown;
  score?: number;
  [key: string]: unknown;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt?: string;
  citations?: Citation[];
  thinking?: string;
  streaming?: boolean;
  thumbup?: boolean | null;
  widgets?: ChatWidget[];
  [key: string]: unknown;
}

export interface ChatWidgetSeries {
  name?: string;
  x?: string[];
  y?: number[];
  color?: string;
}

export interface ChatWidget {
  type: string;
  title?: string;
  series?: ChatWidgetSeries[];
  categories?: string[];
  columns?: { key: string; label: string; width?: number }[];
  rows?: Record<string, unknown>[];
  items?: Record<string, unknown>[];
  meta?: Record<string, unknown>;
}

export interface ChatSession {
  id: string;
  title?: string;
  name?: string;
  assistantId?: string;
  updatedAt?: string;
  update_time?: string;
  create_time?: string;
  messages?: ChatMessage[];
  message?: ChatMessage[];
  [key: string]: unknown;
}

export interface ChatAssistant {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  status?: string;
  datasetIds?: string[];
  dataset_ids?: string[];
  prompt_config?: {
    prologue?: string;
    empty_response?: string;
  };
  [key: string]: unknown;
}

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  documentCount?: number;
  document_count?: number;
  chunk_count?: number;
  token_num?: number;
  done_count?: number;
  running_count?: number;
  fail_count?: number;
  unstart_count?: number;
  updatedAt?: string;
  embedding_model?: string;
  chunk_method?: string;
  [key: string]: unknown;
}

export interface KBDocument {
  id: string;
  name: string;
  status?: string;
  run?: ParseStatus | string;
  size?: number;
  updatedAt?: string;
  [key: string]: unknown;
}

export type ParseStatus = 'pending' | 'parsing' | 'done' | 'failed' | string;

export interface SSEChunk {
  answer?: string;
  citations?: Citation[];
  [key: string]: unknown;
}
