// @ts-nocheck
/** Ported from https://github.com/kne-union/flex-box/blob/master/src/FlexBoxFetch.jsx */
import React, { forwardRef, useState } from 'react';
import { Pagination } from 'antd';
import classnames from 'classnames';
import Fetch from '@kne/react-fetch';
import defaultColumns from './defaultColumns';
import useFlexBox from './useFlexBox';
import FlexBoxView, { Item } from './FlexBoxView';

const FlexBoxFetch = forwardRef((props, fetchRef) => {
  const {
    columns,
    api,
    getFetchApi,
    outerClassName,
    className,
    gutter,
    dataFormat,
    pagination,
    renderItem,
    rowKey,
    onChange,
    children,
  } = Object.assign(
    {},
    {
      gutter: 16,
      columns: defaultColumns,
      dataFormat: (data) => data.pageData,
    },
    props,
  );
  const { ref, column } = useFlexBox({ columns, onChange });
  const paginationObj =
    pagination && typeof pagination === 'object' ? pagination : pagination === true ? {} : null;
  const {
    position = 'bottom',
    align = 'end',
    defaultCurrent = 1,
    defaultPageSize = 10,
    current: currentProp,
    pageSize: pageSizeProp,
    total: totalProp,
    onChange: onPaginationChange,
    ...paginationRest
  } = paginationObj || {};
  const [current, setCurrent] = useState(defaultCurrent);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const mergedCurrent = currentProp ?? current;
  const mergedPageSize = pageSizeProp ?? pageSize;

  return (
    <div ref={ref} className={outerClassName} style={{ width: '100%', minWidth: 0 }}>
      {column && (
        <Fetch
          {...Object.assign({}, api || getFetchApi(column))}
          ref={fetchRef}
          loading={
            <div
              className={classnames(className, 'loading-container', 'is-loading')}
              style={{ width: '100%', minHeight: 80 }}
            />
          }
          render={({ data, isComplete }) => {
            const dataSource = dataFormat(data) || [];
            const total = totalProp ?? dataSource.length;
            const largestPage = Math.max(1, Math.ceil(total / mergedPageSize) || 1);
            const page = Math.min(mergedCurrent, largestPage);
            const pagedData = paginationObj
              ? dataSource.slice((page - 1) * mergedPageSize, page * mergedPageSize)
              : dataSource;
            const renderPagination = () =>
              paginationObj ? (
                <div style={{ marginBlockStart: 16 }}>
                  <Pagination
                    align={align}
                    {...paginationRest}
                    current={page}
                    pageSize={mergedPageSize}
                    total={total}
                    onChange={(nextPage, size) => {
                      setCurrent(nextPage);
                      setPageSize(size);
                      onPaginationChange?.(nextPage, size);
                    }}
                  />
                </div>
              ) : null;
            const showTop = paginationObj && (position === 'top' || position === 'both');
            const showBottom = paginationObj && (position === 'bottom' || position === 'both');
            return (
              <>
                {showTop ? renderPagination() : null}
                <div className={classnames('loading-container', { 'is-loading': !isComplete })}>
                  <FlexBoxView
                    column={column}
                    gutter={gutter}
                    className={className}
                    dataSource={pagedData}
                    renderItem={renderItem}
                    rowKey={rowKey}
                  >
                    {children}
                  </FlexBoxView>
                </div>
                {showBottom ? renderPagination() : null}
              </>
            );
          }}
        />
      )}
    </div>
  );
});

FlexBoxFetch.Item = Item;

export default FlexBoxFetch;
