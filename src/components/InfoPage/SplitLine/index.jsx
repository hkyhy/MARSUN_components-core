// @ts-nocheck
// Ported from https://github.com/kne-union/info-page/blob/master/src/SplitLine/index.js
import React from 'react';
import { Divider, Space, Flex } from 'antd';
import { isEmpty } from '@kne/is-empty';
import computeColumnsValue from '../computeColumnsValue';
import classnames from 'classnames';
import style from './style.module.scss';

const SplitLine = ({
  className,
  dataSource,
  columns,
  valueIsEmpty = isEmpty,
  placeholder = '-',
  emptyIsPlaceholder = false,
  size = 0,
  labelGap = 4,
  labelMode = 'horizontal',
  split = <Divider type="vertical" />,
  context,
  ...props
}) => {
  return (
    <Space
      {...props}
      split={split}
      size={size}
      className={classnames(style['split-line'], 'split-line', className)}
    >
      {computeColumnsValue({
        columns,
        emptyIsPlaceholder,
        valueIsEmpty,
        dataSource,
        placeholder,
        context,
      }).map((item, index) => {
        return (
          <Flex
            key={item.key || index}
            flex={item.flex || 1}
            className="split-line-item"
            gap={labelGap}
            justify="space-between"
            align="center"
            vertical={labelMode === 'vertical'}
          >
            {item.title && (
              <div
                className={classnames('split-line-label', style['split-line-label'], {
                  [style['label-vertical']]: labelMode === 'vertical',
                  [style['label-horizontal']]: labelMode === 'horizontal',
                })}
              >
                {item.title}
              </div>
            )}
            <Flex className="split-line-content" gap={4}>
              {item.icon && <div className="split-line-icon">{item.icon}</div>}
              {computeColumnsValue.computeDisplay({ column: item, placeholder })}
            </Flex>
          </Flex>
        );
      })}
    </Space>
  );
};

export default SplitLine;
