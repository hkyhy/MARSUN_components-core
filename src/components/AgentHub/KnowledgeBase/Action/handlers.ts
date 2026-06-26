export type KnowledgeBaseActionHandlers = {
  onDelete?: (id: string) => Promise<void>;
  onCreate?: () => void;
  onUpload?: (datasetId: string) => void;
};
