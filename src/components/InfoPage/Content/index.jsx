// @ts-nocheck
// Ported from https://github.com/kne-union/info-page/blob/master/src/Content/index.js
// Extended: layout="stack" — label above value；栅格走 FlexBox，优先一行排满。
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Col, Row, Space } from 'antd';
import classnames from 'classnames';
import React from 'react';
import FlexBox from '../../FlexBox';

import style from './style.module.scss';

/** 按条数生成 FlexBox columns：容器够宽时 col=条数 → 一行排完 */
export const buildStackFlexColumns = (itemCount, minItemWidth = 140) => {
  const capped = Math.max(1, Number(itemCount) || 1);
  const columns = [];
  for (let c = 1; c <= capped; c += 1) {
    columns.push({ width: minItemWidth * c, col: c });
  }
  return columns;
};

export const Label = ({ className, children, setWidth }) => {
  const ref = useRef(null);
  const setWidthRef = useRef(setWidth);
  setWidthRef.current = setWidth;
  useLayoutEffect(() => {
    const computed = () => {
      if (!ref.current) {
        return;
      }
      const { width } = ref.current.getBoundingClientRect();
      setWidth(width);
    };
    const resizeObserver = new ResizeObserver(computed);
    resizeObserver.observe(ref.current);
    computed();
    return () => {
      resizeObserver.disconnect();
    };
  }, [setWidth]);
  return (
    <div ref={ref} className={className}>
      {children}：
    </div>
  );
};

const renderStackCell = (listItem) => {
  const { label, content } = listItem;
  return (
    <div className={classnames(style['item-stack'], 'content-item')}>
      {label ? <div className={classnames(style['label'], 'content-label')}>{label}</div> : null}
      <div className={classnames(style['content-content'], 'content-content')}>{content}</div>
    </div>
  );
};

const Content = ({
  list = [],
  labelAlign = 'left',
  col = 1,
  gutter = 0,
  className,
  size,
  layout = 'inline',
  columns: columnsProp,
  minItemWidth = 140,
  itemRender,
}) => {
  const labelWidthListRef = useRef([]);
  const [maxLabelWidth, setMaxLabelWidth] = useState(0);
  const isStack = layout === 'stack';

  const visibleList = useMemo(
    () =>
      (list || []).filter((item) => {
        if (typeof item.display === 'function') {
          return item.display(item, list);
        }
        return item.display !== false;
      }),
    [list],
  );

  const stackDataSource = useMemo(
    () => visibleList.map((item, index) => ({ ...item, key: index })),
    [visibleList],
  );

  const stackColumns = useMemo(() => {
    if (columnsProp?.length) return columnsProp;
    // stack：按字段数自适应，够宽则一行排完（忽略 col，避免 col=3 把 5 项拆两行）
    return buildStackFlexColumns(visibleList.length, minItemWidth);
  }, [columnsProp, visibleList.length, minItemWidth]);

  if (isStack) {
    return (
      <div
        data-testid="components-core-content"
        data-layout={layout}
        className={classnames(style['content'], 'content', className, {
          [style['size-small']]: size === 'small',
          [style['layout-stack']]: true,
        })}
      >
        <FlexBox
          columns={stackColumns}
          gutter={gutter || [16, 10]}
          dataSource={stackDataSource}
          rowKey="key"
          renderItem={(listItem, index) => {
            const cell = renderStackCell(listItem);
            if (typeof itemRender === 'function') {
              return itemRender(cell, Object.assign({}, listItem, { index }));
            }
            return cell;
          }}
        />
      </div>
    );
  }

  return (
    <Row
      data-testid="components-core-content"
      data-layout={layout}
      className={classnames(style['content'], 'content', className, {
        [style['size-small']]: size === 'small',
      })}
      gutter={gutter}
    >
      {visibleList.map((listItem, index) => {
        const { label, content, block } = listItem;
        const labelNode = label ? (
          <div
            style={
              maxLabelWidth && labelAlign !== 'auto'
                ? {
                    minWidth: maxLabelWidth,
                    textAlign: labelAlign,
                  }
                : null
            }
          >
            <Label
              className={classnames(style['label'], 'content-label')}
              setWidth={(width) => {
                labelWidthListRef.current[index] = width;
                setMaxLabelWidth(Math.max(...labelWidthListRef.current));
              }}
            >
              {label}
            </Label>
          </div>
        ) : null;

        const valueNode = (
          <div className={classnames(style['content-content'], 'content-content')}>{content}</div>
        );

        const innerComponent = (
          <Col span={block === true ? 24 : 24 / col} className={style['item']}>
            <Space className={classnames(style['item'], 'content-item')}>
              {labelNode}
              {valueNode}
            </Space>
          </Col>
        );
        const item =
          typeof itemRender === 'function'
            ? itemRender(innerComponent, Object.assign({}, listItem, { index }))
            : innerComponent;
        return React.cloneElement(item, { key: index });
      })}
    </Row>
  );
};

export default Content;
