import type { Dataset, KBDocument, ParseStatus } from '@/components/AgentHub/types';

export type { Dataset, KBDocument };
export { ParseStatus };

export const PARSE_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; spinning?: boolean }
> = {
  UNSTART: { label: '待解析', color: 'warning' },
  RUNNING: { label: '解析中', color: 'processing', spinning: true },
  DONE: { label: '已完成', color: 'success' },
  FAIL: { label: '解析失败', color: 'error' },
  CANCEL: { label: '已取消', color: 'default' },
};

export const CHUNK_METHOD_OPTIONS = [
  { label: '智能分块', value: 'naive' },
  { label: '手册/书籍', value: 'book' },
  { label: '问答对', value: 'qa' },
  { label: '表格', value: 'table' },
  { label: '图文混合', value: 'paper' },
  { label: '法律条文', value: 'laws' },
  { label: '演示文稿', value: 'presentation' },
  { label: '图片', value: 'picture' },
  { label: 'One-pager', value: 'one_pager' },
];

export const EMBEDDING_MODEL_OPTIONS = [
  { label: 'BAAI/bge-m3', value: 'BAAI/bge-m3' },
  { label: 'BAAI/bge-large-zh-v1.5', value: 'BAAI/bge-large-zh-v1.5' },
  { label: 'text-embedding-3-small', value: 'text-embedding-3-small' },
  { label: 'text-embedding-3-large', value: 'text-embedding-3-large' },
];
