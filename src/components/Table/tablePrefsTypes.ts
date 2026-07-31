import type { TableColumnConfigItem } from './columnConfigTypes';

/**
 * user_key 持久化：仅列配置。
 * hiddenRowKeys 曾误入 v2，现已废弃——解析时忽略，序列化不写出。
 */
export type TablePrefs = {
  version: 2;
  columns: TableColumnConfigItem[];
};

export type TablePrefsFetcher = (tableName: string) => Promise<TablePrefs | null | undefined>;

export type TablePrefsSaver = (tableName: string, prefs: TablePrefs) => Promise<void>;

export function emptyTablePrefs(columns: TableColumnConfigItem[] = []): TablePrefs {
  return { version: 2, columns };
}
