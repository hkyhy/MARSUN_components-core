import type { ColumnType, ColumnsType } from 'antd/es/table';

/** 与 user_key 持久化一致的列配置项（支持多级 children） */
export type TableColumnConfigItem = {
  id: string;
  hidden?: boolean;
  width?: number;
  children?: TableColumnConfigItem[];
};

export type TableColumnConfigFetcher = (
  tableName: string,
) => Promise<TableColumnConfigItem[] | null | undefined>;

export type TableColumnConfigSaver = (
  tableName: string,
  items: TableColumnConfigItem[],
) => Promise<void>;

export type ColumnConfigPanelItem = {
  id: string;
  title: unknown;
  label: string;
  hidden: boolean;
  children?: ColumnConfigPanelItem[];
};

export type ColumnTypeAny = ColumnType<Record<string, unknown>> & {
  key?: React.Key;
  children?: ColumnsType<Record<string, unknown>>;
  fixed?: 'left' | 'right' | boolean;
};
