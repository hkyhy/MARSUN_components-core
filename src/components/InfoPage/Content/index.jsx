// @ts-nocheck
// Ported from https://github.com/kne-union/info-page/blob/master/src/Content/index.js
import { useLayoutEffect, useRef, useState } from 'react';
import { Col, Row, Space } from 'antd';
import classnames from 'classnames';
import React from 'react';

import style from './style.module.scss';

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

const Content = ({
  list = [],
  labelAlign = 'left',
  col = 1,
  gutter = 0,
  className,
  size,
  itemRender,
}) => {
  const labelWidthListRef = useRef([]);
  const [maxLabelWidth, setMaxLabelWidth] = useState(0);
  return (
    <Row
      data-testid="components-core-content"
      className={classnames(style['content'], 'content', className, {
        [style['size-small']]: size === 'small',
      })}
      gutter={gutter}
    >
      {list
        .filter((item) => {
          if (typeof item.display === 'function') {
            return item.display(item, list);
          }
          return item.display !== false;
        })
        .map((listItem, index) => {
          const { label, content, block } = listItem;
          const innerComponent = (
            <Col span={block === true ? 24 : 24 / col} className={style['item']}>
              <Space className={classnames(style['item'], 'content-item')}>
                {label ? (
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
                ) : null}
                <div className={classnames(style['content-content'], 'content-content')}>
                  {content}
                </div>
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
