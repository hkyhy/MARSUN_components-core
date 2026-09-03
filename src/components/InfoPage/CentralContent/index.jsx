// @ts-nocheck
// Ported from https://github.com/kne-union/info-page/blob/master/src/CentralContent/index.js
import { isEmpty } from '@kne/is-empty';
import { Col, Row } from 'antd';
import classnames from 'classnames';
import React, { useMemo } from 'react';
import computeColumnsValue from '../computeColumnsValue';
import boxComputed from './boxComputed';
import style from './style.module.scss';

const toCssSize = (value) => (typeof value === 'number' ? `${value}px` : value);

const CentralContent = (props) => {
  const {
    dataSource,
    columns,
    type,
    col,
    valueIsEmpty,
    emptyIsPlaceholder,
    placeholder,
    className,
    context,
    labelMaxWidth,
    labelMinWidth,
    contentMinWidth,
  } = Object.assign(
    {
      dataSource: {}, //数据
      columns: [], //列定义
      col: 2, //展示列数
      valueIsEmpty: isEmpty,
      placeholder: '-',
      emptyIsPlaceholder: true,
      labelMinWidth: 100,
      contentMinWidth: 100,
    },
    props,
  );

  const renderColumns = useMemo(() => {
    return boxComputed(
      computeColumnsValue({
        dataSource,
        columns,
        valueIsEmpty,
        emptyIsPlaceholder,
        context,
      }),
      col,
    );
  }, [columns, col, dataSource, valueIsEmpty, emptyIsPlaceholder, context]);

  const allowLabelWrap = labelMaxWidth != null;
  const labelMaxWidthValue = toCssSize(labelMaxWidth);

  return (
    <div className={classnames(style['table-view-scroll'], 'table-view-scroll')}>
      <Row
        className={classnames(
          style['table-view'],
          'table-view',
          {
            compact: type === 'compact',
            [style['compact']]: type === 'compact',
          },
          className,
        )}
        style={{
          '--layout-col': col,
          '--label-min-width': toCssSize(labelMinWidth),
          '--content-min-width': toCssSize(contentMinWidth),
        }}
      >
        {renderColumns.map((item, index) => {
          return (
            <Col
              className={classnames(style['table-view-col'], 'table-view-col')}
              key={`${item.name}-${index}`}
              style={{
                '--col-width': `${(100 * item.span) / 24}%`,
              }}
            >
              <Row className={classnames(style['table-view-item'], 'table-view-item')} wrap={false}>
                <Col
                  className={classnames(style['table-view-label'], 'table-view-label', {
                    [style['allow-wrap']]: allowLabelWrap,
                    'allow-wrap': allowLabelWrap,
                  })}
                  style={{
                    '--col-label-width': `${(100 * 8) / (col * item.span)}%`,
                    ...(allowLabelWrap ? { '--label-max-width': labelMaxWidthValue } : null),
                  }}
                >
                  {item.title}
                </Col>
                <Col className={classnames(style['table-view-content'], 'table-view-content')}>
                  {computeColumnsValue.computeDisplay({
                    column: item,
                    placeholder,
                    context,
                  })}
                </Col>
              </Row>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default CentralContent;
