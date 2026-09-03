// @ts-nocheck
// Ported from https://github.com/kne-union/info-page/blob/master/src/Descriptions/index.js
import { Col, Row } from 'antd';
import classnames from 'classnames';
import React from 'react';

import style from './style.module.scss';

const Descriptions = ({ dataSource, isFull, className, itemRender, ...props }) => {
  return (
    <Row {...props} className={classnames(style['descriptions'], className)}>
      {dataSource.map((colItem, colIndex) => {
        const _colItem = colItem.slice(0, 2).filter((item) => {
          if (typeof item.display === 'function') {
            return item.display(item, dataSource);
          }
          return item.display !== false;
        });
        return _colItem.slice(0, 2).map((listItem, index) => {
          const { label, content } = listItem;
          const innerComponent = (
            <Col
              span={24 / _colItem.length}
              className={classnames(style['col-item'], 'descriptions-col-item')}
              key={`${colIndex}-${index}`}
            >
              <Row
                wrap={false}
                className={classnames(style['descriptions-item'], 'descriptions-item')}
              >
                <Col
                  span={isFull ? 8 : 4 * _colItem.length}
                  className={classnames(style['col-label'], 'descriptions-col-label')}
                >
                  {label}
                </Col>
                <Col
                  span={isFull ? 16 : 24 - 4 * _colItem.length}
                  className={classnames(style['col-content'], 'descriptions-col-content')}
                >
                  {content}
                </Col>
              </Row>
            </Col>
          );
          return typeof itemRender === 'function'
            ? itemRender(innerComponent, Object.assign({}, listItem, { index }))
            : innerComponent;
        });
      })}
    </Row>
  );
};

export default Descriptions;
