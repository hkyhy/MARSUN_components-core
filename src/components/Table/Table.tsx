import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Key,
  type ReactNode,
} from 'react';
import { Button, Space, Table as AntTable, Tooltip } from 'antd';
import type { TableProps as AntTableProps } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import classNames from 'classnames';
import { Empty } from '../Empty';
import { Eye } from '../Icons';
import { ColumnConfigTrigger } from './ColumnConfigPanel';
import type {
  TableColumnConfigFetcher,
  TableColumnConfigItem,
  TableColumnConfigSaver,
} from './columnConfigTypes';
import {
  applyColumnConfig,
  columnsToConfig,
  columnsToPanelItems,
  COLUMN_CONFIG_COL_KEY,
  FLEX_SPACER_COL_KEY,
  hideColumnAtPath,
  isInternalColumnKey,
  shortChildId,
  type ColumnTypeAny,
} from './columnConfigUtils';
import type { TablePrefs, TablePrefsFetcher, TablePrefsSaver } from './tablePrefsTypes';
import { emptyTablePrefs } from './tablePrefsTypes';
import { applyHiddenRows, mergeTablePrefs, normalizeHiddenRowKeys } from './tablePrefsUtils';
import styles from './style.module.scss';
import gearStyles from './columnConfig.module.scss';

export type { TableColumnConfigItem, TableColumnConfigFetcher, TableColumnConfigSaver };
export type { TablePrefs, TablePrefsFetcher, TablePrefsSaver };

export type TableProps<RecordType extends object = Record<string, unknown>> =
  AntTableProps<RecordType> & {
    /** 稳定偏好 key；业务列表必填 */
    tableName?: string;
    /** 是否启用「编辑表格」列配置；默认 !!tableName */
    columnConfigEnabled?: boolean;
    /** @deprecated 优先用 fetchTablePrefs；仍支持仅列配置 */
    fetchColumnConfig?: TableColumnConfigFetcher;
    /** @deprecated 优先用 saveTablePrefs */
    saveColumnConfig?: TableColumnConfigSaver;
    onColumnConfigChange?: (items: TableColumnConfigItem[]) => void;
    /** 读写 TablePrefs（仅 columns，经 user_key） */
    fetchTablePrefs?: TablePrefsFetcher;
    saveTablePrefs?: TablePrefsSaver;
    onTablePrefsChange?: (prefs: TablePrefs) => void;
    /** 启用行隐藏（会话内 state，不进 user_key）；默认 false */
    rowConfigEnabled?: boolean;
    /** 不可隐藏的行 key（如主对标） */
    lockedRowKeys?: Key[];
    /** 受控隐藏行；不传则用组件内部会话 state */
    hiddenRowKeys?: Key[];
    onHiddenRowKeysChange?: (keys: string[]) => void;
    /** 行隐藏工具条：传入当前勾选 key 以启用「隐藏选中行」 */
    rowHideSelectedKeys?: Key[];
    /** 自定义行隐藏工具条；默认内置按钮 */
    rowConfigToolbar?: ReactNode | false;
  };

const DEFAULT_SCROLL = { x: 'max-content' as const };
const CONFIG_COL_WIDTH = 40;
/** 无 width 的弹性列计入 scroll 的最小占位，避免多列时被压扁 */
const AUTO_COL_SCROLL_FALLBACK = 64;

function defaultShowTotal(total: number): string {
  return `共 ${total} 项`;
}

/** 可见叶子列 width 合计；无 width 的列用 fallback（弹性列） */
function sumLeafColumnWidths(columns: ColumnsType<unknown> | undefined): number {
  if (!columns?.length) return 0;
  let sum = 0;
  for (const col of columns as ColumnTypeAny[]) {
    const key = col.key != null ? String(col.key) : '';
    if (key && isInternalColumnKey(key)) continue;
    if (col.children?.length) {
      sum += sumLeafColumnWidths(col.children as ColumnsType<unknown>);
      continue;
    }
    const w = col.width;
    if (typeof w === 'number' && Number.isFinite(w) && w > 0) sum += w;
    else sum += AUTO_COL_SCROLL_FALLBACK;
  }
  return sum;
}

function colFullKey(col: ColumnTypeAny, index: number): string {
  if (col.key != null && String(col.key) !== '') return String(col.key);
  if (col.dataIndex != null) {
    return Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : String(col.dataIndex);
  }
  return `__col_${index}`;
}

function resolveRecordKey<RecordType extends object>(
  row: RecordType,
  index: number,
  rowKey: AntTableProps<RecordType>['rowKey'],
): string {
  if (typeof rowKey === 'function') return String(rowKey(row, index));
  if (typeof rowKey === 'string' && rowKey) {
    const v = (row as Record<string, unknown>)[rowKey];
    if (v != null && v !== '') return String(v);
  }
  return String(index);
}

/** 一级组色带数量（与 SCSS headerGroup0..5 对齐） */
const HEADER_GROUP_PALETTE_SIZE = 6;

/** 多级表头 title 注入眼睛；同色系按一级组，depth 加深浅 */
function injectHeaderHideEyes<RecordType extends object>(
  columns: ColumnsType<RecordType>,
  onHidePath: (path: string[]) => void,
  parentFullKey?: string,
  path: string[] = [],
  depth = 0,
  groupIndex?: number,
): ColumnsType<RecordType> {
  let groupSeq = 0;

  return (columns as ColumnTypeAny[]).map((col, i) => {
    const full = colFullKey(col, i);
    if (isInternalColumnKey(full)) return col as ColumnType<RecordType>;
    const configId = parentFullKey ? shortChildId(parentFullKey, full) : full;
    const nextPath = [...path, configId];
    const prevOnHeaderCell = col.onHeaderCell;

    /** 顶层有 children 的列为一级组，分配色带；固定列叶子不着色 */
    let gIdx = groupIndex;
    if (depth === 0) {
      gIdx = col.children?.length ? groupSeq++ : undefined;
    }

    const depthClass =
      gIdx == null
        ? undefined
        : depth === 0
          ? styles.headerDepth0
          : depth === 1
            ? styles.headerDepth1
            : styles.headerDepth2;
    const groupClass =
      gIdx == null ? undefined : styles[`headerGroup${gIdx % HEADER_GROUP_PALETTE_SIZE}`];

    const titleNode = (
      <span className={styles.headerTitleWithEye}>
        <span className={styles.headerTitleText}>{col.title as ReactNode}</span>
        <Tooltip title="隐藏此列">
          <button
            type="button"
            className={styles.headerEyeBtn}
            aria-label="隐藏此列"
            onClick={(e) => {
              e.stopPropagation();
              onHidePath(nextPath);
            }}
          >
            <Eye size={12} />
          </button>
        </Tooltip>
      </span>
    );
    const mergeHeaderCell = (c: ColumnTypeAny) => {
      const prev =
        typeof prevOnHeaderCell === 'function'
          ? (prevOnHeaderCell as (col: ColumnTypeAny) => Record<string, unknown>)(c)
          : (prevOnHeaderCell as Record<string, unknown> | undefined) || {};
      return {
        ...prev,
        className: classNames((prev as { className?: string }).className, groupClass, depthClass),
      };
    };
    if (col.children?.length) {
      return {
        ...col,
        title: titleNode,
        onHeaderCell: mergeHeaderCell,
        children: injectHeaderHideEyes(
          col.children as ColumnsType<RecordType>,
          onHidePath,
          full,
          nextPath,
          depth + 1,
          gIdx,
        ),
      } as ColumnType<RecordType>;
    }
    return {
      ...col,
      title: titleNode,
      onHeaderCell: mergeHeaderCell,
    } as ColumnType<RecordType>;
  }) as ColumnsType<RecordType>;
}

/**
 * 基于 antd Table 的列表表格包装。
 * 列偏好经 user_key；行隐藏仅会话 state，不进 user_key。
 */
function Table<RecordType extends object = Record<string, unknown>>({
  className,
  style,
  scroll,
  pagination,
  locale,
  columns,
  dataSource,
  rowKey,
  tableName,
  columnConfigEnabled,
  fetchColumnConfig,
  saveColumnConfig,
  onColumnConfigChange,
  fetchTablePrefs,
  saveTablePrefs,
  onTablePrefsChange,
  rowConfigEnabled = false,
  lockedRowKeys,
  hiddenRowKeys: hiddenRowKeysProp,
  onHiddenRowKeysChange,
  rowHideSelectedKeys,
  rowConfigToolbar,
  rowSelection,
  ...rest
}: TableProps<RecordType>) {
  const enableConfig = columnConfigEnabled ?? Boolean(tableName);
  const defaultColumnsRef = useRef(columns);
  const [prefs, setPrefs] = useState<TablePrefs | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [loaded, setLoaded] = useState(!enableConfig);
  /** 行隐藏：仅前端会话，不写 user_key */
  const [localHiddenRowKeys, setLocalHiddenRowKeys] = useState<string[]>([]);

  useEffect(() => {
    defaultColumnsRef.current = columns;
  }, [columns]);

  useEffect(() => {
    if (!enableConfig || !tableName || !(fetchTablePrefs || fetchColumnConfig)) {
      setLoaded(true);
      return;
    }
    let cancelled = false;
    setLoaded(false);
    const load = async () => {
      try {
        if (fetchTablePrefs) {
          const next = await fetchTablePrefs(tableName);
          if (!cancelled) setPrefs(next?.columns?.length ? next : null);
        } else if (fetchColumnConfig) {
          const items = await fetchColumnConfig(tableName);
          if (!cancelled) setPrefs(items?.length ? emptyTablePrefs(items) : null);
        }
      } catch {
        if (!cancelled) setPrefs(null);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [enableConfig, tableName, fetchTablePrefs, fetchColumnConfig]);

  const savedConfig = prefs?.columns?.length ? prefs.columns : null;

  const resolvedHiddenKeys = useMemo(() => {
    if (hiddenRowKeysProp !== undefined) {
      return normalizeHiddenRowKeys(hiddenRowKeysProp, lockedRowKeys);
    }
    return normalizeHiddenRowKeys(localHiddenRowKeys, lockedRowKeys);
  }, [hiddenRowKeysProp, localHiddenRowKeys, lockedRowKeys]);

  const setHiddenRows = useCallback(
    (keys: string[]) => {
      const next = normalizeHiddenRowKeys(keys, lockedRowKeys);
      if (hiddenRowKeysProp === undefined) {
        setLocalHiddenRowKeys(next);
      }
      onHiddenRowKeysChange?.(next);
    },
    [hiddenRowKeysProp, lockedRowKeys, onHiddenRowKeysChange],
  );

  const persistColumnPrefs = useCallback(
    async (next: TablePrefs) => {
      setPrefs(next);
      onTablePrefsChange?.(next);
      onColumnConfigChange?.(next.columns);
      if (tableName && saveTablePrefs) {
        await saveTablePrefs(tableName, next);
        return;
      }
      if (tableName && saveColumnConfig) {
        await saveColumnConfig(tableName, next.columns);
      }
    },
    [tableName, saveTablePrefs, saveColumnConfig, onTablePrefsChange, onColumnConfigChange],
  );

  const appliedColumns = useMemo(() => {
    const base = (columns || []) as ColumnsType<RecordType>;
    if (!enableConfig) return base;
    return applyColumnConfig(base, savedConfig);
  }, [columns, enableConfig, savedConfig]);

  const defaultPanelItems = useMemo(
    () =>
      columnsToPanelItems(
        (defaultColumnsRef.current || columns) as ColumnsType<Record<string, unknown>>,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 随 columns 结构变
    [columns],
  );

  const handleConfirm = useCallback(
    async (items: TableColumnConfigItem[]) => {
      await persistColumnPrefs(mergeTablePrefs(prefs, { columns: items }));
    },
    [prefs, persistColumnPrefs],
  );

  const handleHideColumnPath = useCallback(
    async (path: string[]) => {
      if (!path.length) return;
      const base =
        prefs?.columns?.length && prefs.columns.length
          ? prefs.columns
          : columnsToConfig(
              (defaultColumnsRef.current || columns) as ColumnsType<Record<string, unknown>>,
            );
      await persistColumnPrefs(mergeTablePrefs(prefs, { columns: hideColumnAtPath(base, path) }));
    },
    [prefs, columns, persistColumnPrefs],
  );

  const handleHideSelected = useCallback(() => {
    const selected = (rowHideSelectedKeys || []).map(String);
    if (!selected.length) return;
    setHiddenRows([...resolvedHiddenKeys, ...selected]);
  }, [rowHideSelectedKeys, resolvedHiddenKeys, setHiddenRows]);

  const handleRestoreHidden = useCallback(() => {
    setHiddenRows([]);
  }, [setHiddenRows]);

  const handleHideOneRow = useCallback(
    (key: Key) => {
      const s = String(key);
      if (!s) return;
      if ((lockedRowKeys || []).map(String).includes(s)) return;
      setHiddenRows([...resolvedHiddenKeys, s]);
    },
    [lockedRowKeys, resolvedHiddenKeys, setHiddenRows],
  );

  const displayColumns = useMemo(() => {
    let cols = appliedColumns;
    if (enableConfig && loaded) {
      cols = injectHeaderHideEyes(cols, (path) => {
        void handleHideColumnPath(path);
      });
      const gearCol: ColumnType<RecordType> = {
        key: COLUMN_CONFIG_COL_KEY,
        width: CONFIG_COL_WIDTH,
        fixed: 'right',
        align: 'center',
        className: gearStyles.configCol,
        onHeaderCell: () => ({
          className: gearStyles.configColHeader,
          style: {
            width: CONFIG_COL_WIDTH,
            minWidth: CONFIG_COL_WIDTH,
            maxWidth: CONFIG_COL_WIDTH,
          },
        }),
        onCell: () => ({
          style: {
            width: CONFIG_COL_WIDTH,
            minWidth: CONFIG_COL_WIDTH,
            maxWidth: CONFIG_COL_WIDTH,
          },
        }),
        title: (
          <ColumnConfigTrigger
            open={configOpen}
            onOpenChange={setConfigOpen}
            defaultItems={defaultPanelItems}
            savedConfig={savedConfig}
            onConfirm={handleConfirm}
          />
        ),
        render: () => null,
      };
      cols = [...cols, gearCol] as ColumnsType<RecordType>;
    }
    return cols;
  }, [
    enableConfig,
    loaded,
    appliedColumns,
    configOpen,
    defaultPanelItems,
    savedConfig,
    handleConfirm,
    handleHideColumnPath,
  ]);

  const displayDataSource = useMemo(() => {
    if (!rowConfigEnabled) return dataSource;
    const keyFn = typeof rowKey === 'function' || typeof rowKey === 'string' ? rowKey : undefined;
    return applyHiddenRows(dataSource, resolvedHiddenKeys, keyFn, lockedRowKeys);
  }, [rowConfigEnabled, dataSource, resolvedHiddenKeys, rowKey, lockedRowKeys]);

  const mergedPagination =
    pagination === false
      ? false
      : {
          showSizeChanger: true,
          showTotal: defaultShowTotal,
          ...(pagination && typeof pagination === 'object' ? pagination : {}),
        };

  const mergedLocale = {
    emptyText: <Empty iconType="simple" description="暂无数据" />,
    ...locale,
  };

  const lockedSet = useMemo(() => new Set((lockedRowKeys || []).map(String)), [lockedRowKeys]);
  const canHideSelected =
    rowConfigEnabled &&
    (rowHideSelectedKeys || []).some((k) => {
      const s = String(k);
      return s && !lockedSet.has(s);
    });
  const hasHidden = rowConfigEnabled && resolvedHiddenKeys.length > 0;

  const defaultToolbar =
    rowConfigEnabled && rowConfigToolbar !== false ? (
      <Space
        size="small"
        className={classNames('marsun-table-row-config', styles['marsun-table-row-config'])}
      >
        <Button size="small" disabled={!canHideSelected} onClick={handleHideSelected}>
          隐藏选中行
        </Button>
        <Button size="small" disabled={!hasHidden} onClick={handleRestoreHidden}>
          恢复隐藏行{hasHidden ? `（${resolvedHiddenKeys.length}）` : ''}
        </Button>
      </Space>
    ) : null;

  const toolbarNode =
    rowConfigToolbar === false
      ? null
      : rowConfigToolbar !== undefined
        ? rowConfigToolbar
        : defaultToolbar;

  const mergedRowSelection = useMemo(() => {
    if (!rowSelection) return rowSelection;
    if (!rowConfigEnabled) return rowSelection;
    const baseWidth = typeof rowSelection.columnWidth === 'number' ? rowSelection.columnWidth : 48;
    return {
      ...rowSelection,
      columnWidth: baseWidth + 20,
      renderCell: (checked, record, index, originNode) => {
        const fromParent = rowSelection.renderCell?.(checked, record, index, originNode);
        const inner = (fromParent ?? originNode) as ReactNode;
        const key = resolveRecordKey(record as RecordType, index, rowKey);
        const locked = lockedSet.has(key);
        return (
          <span className={styles.rowSelectWithEye}>
            {inner}
            <Tooltip title={locked ? '主对标不可隐藏' : '隐藏此行'}>
              <button
                type="button"
                className={styles.rowEyeBtn}
                aria-label={locked ? '主对标不可隐藏' : '隐藏此行'}
                disabled={locked}
                onClick={(e) => {
                  e.stopPropagation();
                  handleHideOneRow(key);
                }}
              >
                <Eye size={14} />
              </button>
            </Tooltip>
          </span>
        );
      },
    };
  }, [rowSelection, rowConfigEnabled, rowKey, lockedSet, handleHideOneRow]);

  const fittedScrollX = useMemo(() => {
    const colsW = sumLeafColumnWidths(displayColumns as ColumnsType<unknown>);
    if (!colsW) return 0;
    const selW = mergedRowSelection
      ? typeof mergedRowSelection.columnWidth === 'number'
        ? mergedRowSelection.columnWidth
        : 48
      : 0;
    return colsW + selW;
  }, [displayColumns, mergedRowSelection]);

  const mergedScroll = useMemo(() => {
    const base = scroll === undefined ? { ...DEFAULT_SCROLL } : { ...scroll };
    if (fittedScrollX > 0) {
      // 作为最小内容宽：多于容器则横滚；少于容器时由 CSS width:100% 铺满
      return { ...base, x: fittedScrollX };
    }
    return base;
  }, [scroll, fittedScrollX]);

  return (
    <div className={classNames('marsun-table-shell', styles['marsun-table-shell'])}>
      {toolbarNode ? <div className={styles['marsun-table-toolbar']}>{toolbarNode}</div> : null}
      <AntTable<RecordType>
        className={classNames('marsun-table', styles['marsun-table'], className)}
        style={
          {
            ...style,
            ...(fittedScrollX > 0
              ? ({ ['--marsun-table-scroll-x']: `${fittedScrollX}px` } as CSSProperties)
              : null),
          } as CSSProperties
        }
        scroll={mergedScroll}
        pagination={mergedPagination}
        locale={mergedLocale}
        columns={displayColumns}
        dataSource={displayDataSource}
        rowKey={rowKey}
        rowSelection={mergedRowSelection}
        {...rest}
      />
    </div>
  );
}

export default Table;

export {
  columnsToConfig,
  applyColumnConfig,
  COLUMN_CONFIG_COL_KEY,
  FLEX_SPACER_COL_KEY,
  isInternalColumnKey,
  hideColumnAtPath,
};
export {
  parseTablePrefs,
  serializeTablePrefs,
  mergeTablePrefs,
  applyHiddenRows,
  normalizeHiddenRowKeys,
} from './tablePrefsUtils';
export { emptyTablePrefs } from './tablePrefsTypes';
