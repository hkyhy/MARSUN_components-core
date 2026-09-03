// @ts-nocheck
/** Ported from https://github.com/kne-union/flex-box/blob/master/src/FlexBoxView.jsx */
import React from 'react';
import { Row, Col } from 'antd';

const colBoxStyle = {
  display: 'grid',
  minWidth: 0,
  minHeight: 0,
};

const itemFillStyle = {
  display: 'grid',
  minWidth: 0,
  minHeight: 0,
};

export const getItemKey = (rowKey, item, index) => {
  if (typeof rowKey === 'function') {
    return rowKey(item);
  }
  if (rowKey) {
    return item?.[rowKey];
  }
  return item?.key ?? index;
};

export const Item = ({ className, style, children, ...props }) => {
  return (
    <div {...props} className={className} style={{ ...itemFillStyle, ...style }}>
      {children}
    </div>
  );
};

const FlexBoxView = ({ column, gutter, className, dataSource, renderItem, rowKey, children }) => {
  const colCount = column.col || 1;
  const span = 24 / colCount;
  const useSpan = Number.isInteger(span);
  const colWidth = `${100 / colCount}%`;
  const rowGutter = Array.isArray(gutter) ? gutter : [gutter ?? 0, gutter ?? 0];
  return (
    <Row
      className={className}
      gutter={rowGutter}
      align="stretch"
      wrap
      style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch' }}
    >
      {(dataSource || []).map((item, index) => (
        <Col
          key={getItemKey(rowKey, item, index)}
          span={useSpan ? span : undefined}
          style={
            useSpan ? colBoxStyle : { ...colBoxStyle, flex: `0 0 ${colWidth}`, maxWidth: colWidth }
          }
        >
          {renderItem ? renderItem(item, index) : null}
        </Col>
      ))}
      {children}
    </Row>
  );
};

export default FlexBoxView;
