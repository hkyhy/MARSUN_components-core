/** Action handlers 由消费方注入 API 回调；core 仅导出类型占位 */

export type ChatActionHandlers = {
  onDelete?: (id: string) => Promise<void>;
  onCreate?: () => void;
  onEdit?: (id: string) => void;
};

export type KnowledgeBaseActionHandlers = {
  onDelete?: (id: string) => Promise<void>;
  onCreate?: () => void;
  onUpload?: (datasetId: string) => void;
};
