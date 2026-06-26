/** 文件展示项（纯 UI 字段，无业务语义） */
export interface FileDisplayItem {
  id: string;
  /** 文件名；缺省且提供 url 时由组件从 url 解析 */
  name?: string;
  size?: number;
  mimeType?: string;
  extension?: string;
  url?: string;
  thumbnailUrl?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface FileItemAction {
  key: string;
  label: string;
  hidden?: boolean;
  disabled?: boolean;
  onClick?: (item: FileDisplayItem) => void;
}
