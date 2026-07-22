import { Table as AntTable } from 'antd';
import type { TableProps as AntTableProps } from 'antd';
import classNames from 'classnames';
import { Empty } from '../Empty';
import styles from './style.module.scss';

export type TableProps<RecordType extends object = Record<string, unknown>> =
  AntTableProps<RecordType>;

const DEFAULT_SCROLL = { x: 'max-content' as const };

function defaultShowTotal(total: number): string {
  return `共 ${total} 项`;
}

/**
 * 基于 antd Table 的列表表格包装。
 * 默认：横向滚动 max-content、受控分页 showSizeChanger + showTotal、空态 Empty。
 */
function Table<RecordType extends object = Record<string, unknown>>({
  className,
  scroll,
  pagination,
  locale,
  ...rest
}: TableProps<RecordType>) {
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
      {...rest}
    />
  );
}

export default Table;
