// @ts-nocheck
/** Ported from https://github.com/kne-union/flex-box/blob/master/src/FlexBox.jsx */
import React from 'react';
import defaultColumns from './defaultColumns';
import useFlexBox from './useFlexBox';
import FlexBoxView, { Item } from './FlexBoxView';

const FlexBox = (props) => {
  const {
    columns,
    outerClassName,
    className,
    gutter,
    dataSource,
    renderItem,
    rowKey,
    onChange,
    children,
  } = Object.assign(
    {},
    {
      gutter: 16,
      columns: defaultColumns,
      dataSource: [],
    },
    props,
  );
  const { ref, column } = useFlexBox({ columns, onChange });
  return (
    <div ref={ref} className={outerClassName} style={{ width: '100%', minWidth: 0 }}>
      {column && (
        <FlexBoxView
          column={column}
          gutter={gutter}
          className={className}
          dataSource={dataSource}
          renderItem={renderItem}
          rowKey={rowKey}
        >
          {children}
        </FlexBoxView>
      )}
    </div>
  );
};

FlexBox.Item = Item;

export default FlexBox;
