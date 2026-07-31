import type { Key } from 'react';
import type { TableColumnConfigItem } from './columnConfigTypes';
import { emptyTablePrefs, type TablePrefs } from './tablePrefsTypes';

/** 将任意持久化值解析为 TablePrefs；v1 纯数组 → columns；忽略历史 hiddenRowKeys */
export function parseTablePrefs(raw: unknown): TablePrefs | null {
  if (raw == null) return null;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    try {
      return parseTablePrefs(JSON.parse(trimmed) as unknown);
    } catch {
      return null;
    }
  }
  if (Array.isArray(raw)) {
    return emptyTablePrefs(raw as TableColumnConfigItem[]);
  }
  if (typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const columns = Array.isArray(obj.columns)
    ? (obj.columns as TableColumnConfigItem[])
    : Array.isArray(obj)
      ? (obj as unknown as TableColumnConfigItem[])
      : [];
  if (!columns.length && obj.version == null && !('columns' in obj)) {
    return null;
  }
  return {
    version: 2,
    columns,
  };
}

/** 只序列化列配置（不写 hiddenRowKeys） */
export function serializeTablePrefs(prefs: TablePrefs): string {
  return JSON.stringify({
    version: 2,
    columns: prefs.columns ?? [],
  });
}

export function mergeTablePrefs(
  base: TablePrefs | null | undefined,
  patch: Partial<Pick<TablePrefs, 'columns'>>,
): TablePrefs {
  return {
    version: 2,
    columns: patch.columns ?? base?.columns ?? [],
  };
}

function resolveRowKey<RecordType extends object>(
  row: RecordType,
  index: number,
  rowKey: string | ((record: RecordType, index: number) => Key) | undefined,
): string {
  if (typeof rowKey === 'function') return String(rowKey(row, index));
  if (typeof rowKey === 'string' && rowKey) {
    const v = (row as Record<string, unknown>)[rowKey];
    if (v != null && v !== '') return String(v);
  }
  return String(index);
}

/** 过滤隐藏行；locked 行始终保留（即使在 hidden 列表中） */
export function applyHiddenRows<RecordType extends object>(
  dataSource: readonly RecordType[] | undefined,
  hiddenRowKeys: readonly string[] | null | undefined,
  rowKey: string | ((record: RecordType, index: number) => Key) | undefined,
  lockedRowKeys?: readonly Key[] | null,
): RecordType[] {
  if (!dataSource?.length) return [];
  if (!hiddenRowKeys?.length) return [...dataSource];
  const hidden = new Set(hiddenRowKeys.map(String));
  const locked = new Set((lockedRowKeys || []).map(String));
  return dataSource.filter((row, index) => {
    const key = resolveRowKey(row, index, rowKey);
    if (locked.has(key)) return true;
    return !hidden.has(key);
  });
}

/** 合并隐藏：去掉 locked，去重 */
export function normalizeHiddenRowKeys(
  keys: readonly Key[] | null | undefined,
  lockedRowKeys?: readonly Key[] | null,
): string[] {
  const locked = new Set((lockedRowKeys || []).map(String));
  const out: string[] = [];
  const seen = new Set<string>();
  for (const k of keys || []) {
    const s = String(k);
    if (!s || locked.has(s) || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}
