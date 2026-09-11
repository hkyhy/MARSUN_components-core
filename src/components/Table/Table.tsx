import { useMarsunFetch } from '@/provider';
import type { TableProps as AntTableProps } from 'antd';
import { Table as AntTable, Button, Space, Tooltip } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import classNames from 'classnames';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ComponentType,
  type CSSProperties,
  type Key,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { flushSync } from 'react-dom';
import { Empty } from '../Empty';
import { Eye } from '../Icons';
import gearStyles from './columnConfig.module.scss';
import { ColumnConfigTrigger } from './ColumnConfigPanel';
import type {
  TableColumnConfigFetcher,
  TableColumnConfigItem,
  TableColumnConfigSaver,
} from './columnConfigTypes';
import {
  applyColumnConfig,
  applyLeafWidthOverrides,
  clearColumnWidthAtPath,
  clampColumnWidth,
  columnsLeafPathSignature,
  COLUMN_CONFIG_COL_KEY,
  COLUMN_RESIZE_MAX_WIDTH,
  COLUMN_RESIZE_MIN_WIDTH,
  columnsToConfig,
  columnsToPanelItems,
  configHasLeafWidths,
  copyColumnWidths,
  FLEX_SPACER_COL_KEY,
  hideColumnAtPath,
  isInternalColumnKey,
  setColumnWidthAtPath,
  shortChildId,
  type ColumnTypeAny,
} from './columnConfigUtils';
import ResizableHeaderCell from './ResizableHeaderCell';
import styles from './style.module.scss';
import type { TablePrefs, TablePrefsFetcher, TablePrefsSaver } from './tablePrefsTypes';
import { emptyTablePrefs } from './tablePrefsTypes';
import { applyHiddenRows, mergeTablePrefs, normalizeHiddenRowKeys } from './tablePrefsUtils';
import {
  useTableFetch,
  type TableFetchHandle,
  type TableFetchMapped,
  type TableFetchQuery,
} from './useTableFetch';

export type {
  TableColumnConfigFetcher,
  TableColumnConfigItem,
  TableColumnConfigSaver,
  TableFetchHandle,
  TableFetchMapped,
  TableFetchQuery,
  TablePrefs,
  TablePrefsFetcher,
  TablePrefsSaver,
};

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
    /** 叶子列拖宽；默认 !!tableName */
    columnResizeEnabled?: boolean;
    /** 拖宽最小 px；默认 48 */
    columnResizeMinWidth?: number;
    /** 拖宽最大 px；默认 480 */
    columnResizeMaxWidth?: number;
    /**
     * Fetch 模式：`dataSource === undefined` 且提供本回调（或 fetchUrl）时由 Table 拉数。
     * 优先于 fetchUrl。Marsun typed list 主路径。
     */
    fetchData?: (q: TableFetchQuery) => Promise<unknown>;
    /** Form FetchSelect 同构：GET/自定义 Request；需配合 transformData 或默认 pageData 解析 */
    fetchUrl?: string;
    fetchOptions?: RequestInit | ((q: TableFetchQuery) => RequestInit);
    transformData?: (raw: unknown) => TableFetchMapped<RecordType>;
    /** 筛选项；稳定序列化变则回第 1 页再请求 */
    fetchParams?: unknown;
    /** Tab 懒请求；默认 true */
    enabled?: boolean;
    /** fetch 模式默认 pageSize；默认 20 */
    defaultPageSize?: number;
    onFetched?: (r: TableFetchMapped<RecordType> & { error: Error | null }) => void;
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

/** 叶子列 onHeaderCell 注入拖宽；与眼睛 merge */
function injectLeafColumnResize<RecordType extends object>(
  columns: ColumnsType<RecordType>,
  opts: {
    minWidth: number;
    maxWidth: number;
    widthByPath: Record<string, number>;
    onResizeStartPath: (path: string[]) => void;
    onResizePath: (path: string[], width: number) => void;
    onResizeStopPath: (path: string[], width: number) => void;
    onResetPath: (path: string[]) => void;
  },
  parentFullKey?: string,
  path: string[] = [],
): ColumnsType<RecordType> {
  return (columns as ColumnTypeAny[]).map((col, i) => {
    const full = colFullKey(col, i);
    if (isInternalColumnKey(full)) return col as ColumnType<RecordType>;
    const configId = parentFullKey ? shortChildId(parentFullKey, full) : full;
    const nextPath = [...path, configId];
    const prevOnHeaderCell = col.onHeaderCell;

    if (col.children?.length) {
      return {
        ...col,
        children: injectLeafColumnResize(
          col.children as ColumnsType<RecordType>,
          opts,
          full,
          nextPath,
        ),
      } as ColumnType<RecordType>;
    }

    const pathKey = nextPath.join('/');
    const resolvedWidth =
      opts.widthByPath[pathKey] ??
      (typeof col.width === 'number' && Number.isFinite(col.width) ? col.width : undefined);

    return {
      ...col,
      onHeaderCell: (c: ColumnTypeAny) => {
        const prev =
          typeof prevOnHeaderCell === 'function'
            ? (prevOnHeaderCell as (col: ColumnTypeAny) => Record<string, unknown>)(c)
            : (prevOnHeaderCell as Record<string, unknown> | undefined) || {};
        return {
          ...prev,
          'data-marsun-col-path': pathKey,
          width: resolvedWidth,
          minWidth: opts.minWidth,
          maxWidth: opts.maxWidth,
          onResizeStart: () => opts.onResizeStartPath(nextPath),
          onResize: (w: number) => opts.onResizePath(nextPath, w),
          onResizeStop: (w: number) => opts.onResizeStopPath(nextPath, w),
          onReset: () => opts.onResetPath(nextPath),
        };
      },
    } as ColumnType<RecordType>;
  }) as ColumnsType<RecordType>;
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
 * Fetch：dataSource===undefined 且 fetchData/fetchUrl 时由 Table 拉 pageData。
 */
function TableInner<RecordType extends object = Record<string, unknown>>(
  {
    className,
    style,
    scroll,
    pagination,
    locale,
    columns,
    dataSource,
    rowKey,
    loading: loadingProp,
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
    columnResizeEnabled,
    columnResizeMinWidth = COLUMN_RESIZE_MIN_WIDTH,
    columnResizeMaxWidth = COLUMN_RESIZE_MAX_WIDTH,
    fetchData,
    fetchUrl,
    fetchOptions,
    transformData,
    fetchParams,
    enabled = true,
    defaultPageSize = 20,
    onFetched,
    components,
    ...rest
  }: TableProps<RecordType>,
  ref: Ref<TableFetchHandle>,
) {
  const fetchCtx = useMarsunFetch();
  const {
    fetchMode,
    rows: fetchRows,
    total: fetchTotal,
    loading: fetchLoading,
    error: fetchError,
    currentPage,
    pageSize,
    setPage,
    reload,
  } = useTableFetch<RecordType>({
    dataSource,
    fetchData,
    fetchUrl,
    fetchOptions,
    transformData,
    fetchParams,
    enabled,
    defaultPageSize,
    baseUrl: fetchCtx.baseUrl,
    defaultHeaders: fetchCtx.headers,
    timeoutMs: fetchCtx.timeoutMs,
    onFetched,
  });

  useImperativeHandle(ref, () => ({ reload }), [reload]);

  const resolvedDataSource = fetchMode ? fetchRows : dataSource;
  const resolvedLoading = Boolean(loadingProp) || (fetchMode && fetchLoading);

  const enableConfig = columnConfigEnabled ?? Boolean(tableName);
  const enableResize = columnResizeEnabled ?? Boolean(tableName);
  const resizeMin = columnResizeMinWidth;
  const resizeMax = columnResizeMaxWidth;
  const resizeOpts = useMemo(
    () => ({ minWidth: resizeMin, maxWidth: resizeMax }),
    [resizeMin, resizeMax],
  );

  const defaultColumnsRef = useRef(columns);
  const shellRef = useRef<HTMLDivElement>(null);
  const [prefs, setPrefs] = useState<TablePrefs | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [loaded, setLoaded] = useState(!enableConfig);
  /** 行隐藏：仅前端会话，不写 user_key */
  const [localHiddenRowKeys, setLocalHiddenRowKeys] = useState<string[]>([]);
  /** 拖宽会话覆盖；mouseup 后仍保留直至 prefs 回写 */
  const [widthOverrides, setWidthOverrides] = useState<Record<string, number>>({});
  const widthOverridesRef = useRef(widthOverrides);
  widthOverridesRef.current = widthOverrides;

  useEffect(() => {
    defaultColumnsRef.current = columns;
  }, [columns]);

  const columnsStructureKey = useMemo(
    () => columnsLeafPathSignature((columns || []) as ColumnsType<Record<string, unknown>>),
    [columns],
  );

  useEffect(() => {
    setWidthOverrides({});
    widthOverridesRef.current = {};
  }, [columnsStructureKey]);

  useEffect(() => {
    if ((!enableConfig && !enableResize) || !tableName || !(fetchTablePrefs || fetchColumnConfig)) {
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
  }, [enableConfig, enableResize, tableName, fetchTablePrefs, fetchColumnConfig]);

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
    let cols: ColumnsType<RecordType>;
    if (enableConfig) {
      cols = applyColumnConfig(base, savedConfig, resizeOpts);
    } else if (enableResize && savedConfig?.length) {
      const widthMap: Record<string, number> = {};
      const collect = (items: TableColumnConfigItem[], prefix: string) => {
        for (const it of items) {
          const key = prefix ? `${prefix}/${it.id}` : it.id;
          if (typeof it.width === 'number' && Number.isFinite(it.width)) {
            widthMap[key] = it.width;
          }
          if (it.children?.length) collect(it.children, key);
        }
      };
      collect(savedConfig, '');
      cols = applyLeafWidthOverrides(base, widthMap, resizeOpts);
    } else {
      cols = base;
    }
    if (enableResize && Object.keys(widthOverrides).length) {
      cols = applyLeafWidthOverrides(cols, widthOverrides, resizeOpts);
    }
    return cols;
  }, [columns, enableConfig, enableResize, savedConfig, resizeOpts, widthOverrides]);

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
      const withWidths = copyColumnWidths(items, prefs?.columns);
      await persistColumnPrefs(mergeTablePrefs(prefs, { columns: withWidths }));
    },
    [prefs, persistColumnPrefs],
  );

  const baseColumnConfig = useCallback(() => {
    if (prefs?.columns?.length) return prefs.columns;
    return columnsToConfig(
      (defaultColumnsRef.current || columns) as ColumnsType<Record<string, unknown>>,
    );
  }, [prefs, columns]);

  const handleResizePath = useCallback((path: string[], width: number) => {
    const key = path.join('/');
    setWidthOverrides((prev) => {
      const next = { ...prev, [key]: width };
      widthOverridesRef.current = next;
      return next;
    });
  }, []);

  /** 起拖时按 DOM 锁死所有叶子列宽，避免 table-layout:fixed + width:100% 把变化摊到其它列 */
  const handleResizeStartPath = useCallback(
    (_path: string[]) => {
      const root = shellRef.current;
      if (!root) return;
      const nodes = root.querySelectorAll<HTMLElement>('[data-marsun-col-path]');
      if (!nodes.length) return;
      flushSync(() => {
        setWidthOverrides((prev) => {
          const next = { ...prev };
          nodes.forEach((el) => {
            const p = el.getAttribute('data-marsun-col-path');
            if (!p) return;
            const w = el.offsetWidth;
            if (w > 0) next[p] = clampColumnWidth(w, resizeMin, resizeMax);
          });
          widthOverridesRef.current = next;
          return next;
        });
      });
    },
    [resizeMin, resizeMax],
  );

  const handleResizeStopPath = useCallback(
    async (path: string[], width: number) => {
      const key = path.join('/');
      const clamped = clampColumnWidth(width, resizeMin, resizeMax);
      const root = shellRef.current;
      const snapshot: Record<string, number> = { ...widthOverridesRef.current, [key]: clamped };
      if (root) {
        root.querySelectorAll<HTMLElement>('[data-marsun-col-path]').forEach((el) => {
          const p = el.getAttribute('data-marsun-col-path');
          if (!p || p === key) return;
          if (snapshot[p] != null) return;
          const w = el.offsetWidth;
          if (w > 0) snapshot[p] = clampColumnWidth(w, resizeMin, resizeMax);
        });
      }
      snapshot[key] = clamped;
      widthOverridesRef.current = snapshot;
      setWidthOverrides(snapshot);
      let nextCols = baseColumnConfig();
      for (const [p, w] of Object.entries(snapshot)) {
        nextCols = setColumnWidthAtPath(nextCols, p.split('/'), w, resizeOpts);
      }
      await persistColumnPrefs(mergeTablePrefs(prefs, { columns: nextCols }));
    },
    [baseColumnConfig, persistColumnPrefs, prefs, resizeMax, resizeMin, resizeOpts],
  );

  const handleResetPath = useCallback(
    async (path: string[]) => {
      const key = path.join('/');
      setWidthOverrides((prev) => {
        if (!(key in prev)) return prev;
        const next = { ...prev };
        delete next[key];
        widthOverridesRef.current = next;
        return next;
      });
      const nextCols = clearColumnWidthAtPath(baseColumnConfig(), path);
      await persistColumnPrefs(mergeTablePrefs(prefs, { columns: nextCols }));
    },
    [baseColumnConfig, persistColumnPrefs, prefs],
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
    }
    if (enableResize) {
      cols = injectLeafColumnResize(cols, {
        minWidth: resizeMin,
        maxWidth: resizeMax,
        widthByPath: widthOverrides,
        onResizeStartPath: handleResizeStartPath,
        onResizePath: handleResizePath,
        onResizeStopPath: (path, w) => {
          void handleResizeStopPath(path, w);
        },
        onResetPath: (path) => {
          void handleResetPath(path);
        },
      });
    }
    const needFlexSpacer =
      enableResize && (Object.keys(widthOverrides).length > 0 || configHasLeafWidths(savedConfig));
    if (needFlexSpacer) {
      const spacerCol: ColumnType<RecordType> = {
        key: FLEX_SPACER_COL_KEY,
        title: '',
        className: styles.flexSpacerCol,
        onHeaderCell: () => ({ className: styles.flexSpacerCol }),
        onCell: () => ({ className: styles.flexSpacerCol }),
        render: () => null,
      };
      cols = [...cols, spacerCol] as ColumnsType<RecordType>;
    }
    if (enableConfig && loaded) {
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
    enableResize,
    loaded,
    appliedColumns,
    configOpen,
    defaultPanelItems,
    savedConfig,
    handleConfirm,
    handleHideColumnPath,
    handleResizeStartPath,
    handleResizePath,
    handleResizeStopPath,
    handleResetPath,
    resizeMin,
    resizeMax,
    widthOverrides,
  ]);

  const displayDataSource = useMemo(() => {
    if (!rowConfigEnabled) return resolvedDataSource;
    const keyFn = typeof rowKey === 'function' || typeof rowKey === 'string' ? rowKey : undefined;
    return applyHiddenRows(resolvedDataSource, resolvedHiddenKeys, keyFn, lockedRowKeys);
  }, [rowConfigEnabled, resolvedDataSource, resolvedHiddenKeys, rowKey, lockedRowKeys]);

  const mergedPagination =
    pagination === false
      ? false
      : {
          showSizeChanger: true,
          showTotal: defaultShowTotal,
          ...(pagination && typeof pagination === 'object' ? pagination : {}),
          ...(fetchMode
            ? {
                current: currentPage,
                pageSize,
                total: fetchTotal,
                onChange: (page: number, size: number) => {
                  setPage(page, size);
                  if (pagination && typeof pagination === 'object' && pagination.onChange) {
                    pagination.onChange(page, size);
                  }
                },
              }
            : null),
        };

  const mergedLocale = {
    ...locale,
    emptyText:
      locale?.emptyText ??
      (fetchError ? (
        <Empty iconType="simple" description={fetchError.message || '加载失败'} />
      ) : (
        <Empty iconType="simple" description="暂无数据" />
      )),
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

  const mergedComponents = useMemo(() => {
    const userHeader = components?.header;
    const UserCell = userHeader && 'cell' in userHeader ? userHeader.cell : undefined;
    if (!enableResize) {
      return components;
    }
    const HeaderCell = (props: Record<string, unknown>) => {
      const hasResize = typeof props.onResize === 'function';
      if (!hasResize && UserCell) {
        const Comp = UserCell as ComponentType<Record<string, unknown>>;
        return <Comp {...props} />;
      }
      // 拖宽开启时以 ResizableHeaderCell 为准；onHeaderCell 的 className/style/title 仍透传
      return <ResizableHeaderCell {...(props as ComponentProps<typeof ResizableHeaderCell>)} />;
    };
    return {
      ...components,
      header: {
        ...userHeader,
        cell: HeaderCell,
      },
    };
  }, [components, enableResize]);

  return (
    <div ref={shellRef} className={classNames('marsun-table-shell', styles['marsun-table-shell'])}>
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
        loading={resolvedLoading}
        rowSelection={mergedRowSelection}
        components={mergedComponents}
        {...rest}
      />
    </div>
  );
}

const Table = forwardRef(TableInner) as <RecordType extends object = Record<string, unknown>>(
  props: TableProps<RecordType> & { ref?: Ref<TableFetchHandle> },
) => ReactElement | null;

export default Table;

export { emptyTablePrefs } from './tablePrefsTypes';
export {
  applyHiddenRows,
  mergeTablePrefs,
  normalizeHiddenRowKeys,
  parseTablePrefs,
  serializeTablePrefs,
} from './tablePrefsUtils';
export {
  applyColumnConfig,
  applyLeafWidthOverrides,
  clearColumnWidthAtPath,
  clampColumnWidth,
  columnsLeafPathSignature,
  COLUMN_CONFIG_COL_KEY,
  COLUMN_RESIZE_MAX_WIDTH,
  COLUMN_RESIZE_MIN_WIDTH,
  columnsToConfig,
  configHasLeafWidths,
  copyColumnWidths,
  FLEX_SPACER_COL_KEY,
  hideColumnAtPath,
  isInternalColumnKey,
  setColumnWidthAtPath,
};
