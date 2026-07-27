import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Table as AntTable } from 'antd';
import type { TableProps as AntTableProps } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import classNames from 'classnames';
import { Empty } from '../Empty';
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
} from './columnConfigUtils';
import styles from './style.module.scss';
import gearStyles from './columnConfig.module.scss';

export type { TableColumnConfigItem, TableColumnConfigFetcher, TableColumnConfigSaver };

export type TableProps<RecordType extends object = Record<string, unknown>> =
  AntTableProps<RecordType> & {
    /** 稳定偏好 key；业务列表必填 */
    tableName?: string;
    /** 是否启用「编辑表格」列配置；默认 !!tableName */
    columnConfigEnabled?: boolean;
    fetchColumnConfig?: TableColumnConfigFetcher;
    saveColumnConfig?: TableColumnConfigSaver;
    onColumnConfigChange?: (items: TableColumnConfigItem[]) => void;
  };

const DEFAULT_SCROLL = { x: 'max-content' as const };
const CONFIG_COL_WIDTH = 40;

function defaultShowTotal(total: number): string {
  return `共 ${total} 项`;
}

/**
 * 基于 antd Table 的列表表格包装。
 * 默认：横向滚动 max-content、受控分页 showSizeChanger + showTotal、空态 Empty。
 * tableName + columnConfigEnabled 时在最右侧追加独立齿轮列（跨多级表头高度）。
 */
function Table<RecordType extends object = Record<string, unknown>>({
  className,
  scroll,
  pagination,
  locale,
  columns,
  tableName,
  columnConfigEnabled,
  fetchColumnConfig,
  saveColumnConfig,
  onColumnConfigChange,
  ...rest
}: TableProps<RecordType>) {
  const enableConfig = columnConfigEnabled ?? Boolean(tableName);
  const defaultColumnsRef = useRef(columns);
  const [savedConfig, setSavedConfig] = useState<TableColumnConfigItem[] | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [loaded, setLoaded] = useState(!enableConfig);

  useEffect(() => {
    defaultColumnsRef.current = columns;
  }, [columns]);

  useEffect(() => {
    if (!enableConfig || !tableName || !fetchColumnConfig) {
      setLoaded(true);
      return;
    }
    let cancelled = false;
    setLoaded(false);
    fetchColumnConfig(tableName)
      .then((items) => {
        if (!cancelled) setSavedConfig(items?.length ? items : null);
      })
      .catch(() => {
        if (!cancelled) setSavedConfig(null);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [enableConfig, tableName, fetchColumnConfig]);

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
      if (tableName && saveColumnConfig) {
        await saveColumnConfig(tableName, items);
      }
      setSavedConfig(items);
      onColumnConfigChange?.(items);
    },
    [tableName, saveColumnConfig, onColumnConfigChange],
  );

  const displayColumns = useMemo(() => {
    if (!enableConfig || !loaded) return appliedColumns;
    const gearCol: ColumnType<RecordType> = {
      key: COLUMN_CONFIG_COL_KEY,
      width: CONFIG_COL_WIDTH,
      fixed: 'right',
      align: 'center',
      className: gearStyles.configCol,
      onHeaderCell: () => ({ className: gearStyles.configColHeader }),
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
    return [...appliedColumns, gearCol] as ColumnsType<RecordType>;
  }, [
    enableConfig,
    loaded,
    appliedColumns,
    configOpen,
    defaultPanelItems,
    savedConfig,
    handleConfirm,
  ]);

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

  return (
    <AntTable<RecordType>
      className={classNames('marsun-table', styles['marsun-table'], className)}
      scroll={scroll === undefined ? DEFAULT_SCROLL : scroll}
      pagination={mergedPagination}
      locale={mergedLocale}
      columns={displayColumns}
      {...rest}
    />
  );
}

export default Table;

/** 导出工具：业务侧也可手动生成默认配置 */
export { columnsToConfig, applyColumnConfig, COLUMN_CONFIG_COL_KEY };
