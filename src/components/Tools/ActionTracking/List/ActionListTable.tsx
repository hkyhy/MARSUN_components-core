import { Table } from '../../../Table';
import type { TableColumnConfigFetcher, TableColumnConfigSaver } from '../../../Table';
import { VirtualScrollbar } from '../../../VirtualScrollbar';
import { ListTodo } from '../../../Icons';
import { Space } from 'antd';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import type { ActionListColumns, ActionListRowBase } from './listTypes';
import styles from './ActionListTable.module.scss';

export type ActionListTableProps<T extends ActionListRowBase = ActionListRowBase> = {
  loading: boolean;
  items: T[];
  columns: ActionListColumns<T> | never[];
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  /** 业务列表必填；列配置偏好 key */
  tableName: string;
  fetchColumnConfig?: TableColumnConfigFetcher;
  saveColumnConfig?: TableColumnConfigSaver;
  scrollX?: number;
  emptyText?: ReactNode;
  emptyIcon?: ReactNode;
  className?: string;
  wrapperClassName?: string;
  pageSizeOptions?: string[];
  /** antd Table components（如列宽拖拽） */
  components?: React.ComponentProps<typeof Table>['components'];
};

/**
 * 行动列表 Table 壳：VirtualScrollbar + core Table；列与行操作由 App 注入。
 */
function ActionListTable<T extends ActionListRowBase>({
  loading,
  items,
  columns,
  total,
  currentPage,
  pageSize,
  onPageChange,
  tableName,
  fetchColumnConfig,
  saveColumnConfig,
  scrollX = 1560,
  emptyText = '暂无跟踪任务，可点击「新建任务」主动添加',
  emptyIcon,
  className,
  wrapperClassName,
  pageSizeOptions = ['10', '20', '30', '50', '100'],
  components,
}: ActionListTableProps<T>) {
  return (
    <VirtualScrollbar
      className={classNames(
        'action-list-table-scroll',
        styles['action-list-table-scroll'],
        className,
      )}
      wrapperClassName={classNames(
        'action-list-table-card',
        styles['action-list-table-card'],
        wrapperClassName,
      )}
    >
      <Table<T>
        size="small"
        rowKey={(r) => r.id}
        loading={loading}
        columns={columns as never}
        dataSource={items}
        scroll={{ x: scrollX }}
        tableName={tableName}
        fetchColumnConfig={fetchColumnConfig}
        saveColumnConfig={saveColumnConfig}
        components={components}
        pagination={{
          current: currentPage,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions,
          showTotal: (n) => `共 ${n} 条`,
          onChange: onPageChange,
        }}
        locale={{
          emptyText: (
            <Space direction="vertical" align="center">
              {emptyIcon ?? <ListTodo size={28} strokeWidth={1.5} />}
              <span>{emptyText}</span>
            </Space>
          ),
        }}
      />
    </VirtualScrollbar>
  );
}

export default ActionListTable;
