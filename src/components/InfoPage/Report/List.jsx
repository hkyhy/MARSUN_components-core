// @ts-nocheck
// Ported from https://github.com/kne-union/info-page/blob/master/src/Report/List.js
import { useIsMobile } from '@kne/responsive-utils';
import { Flex } from 'antd';
import classnames from 'classnames';
import get from 'lodash/get';
import React from 'react';
import style from './style.module.scss';

const List = ({ className, report }) => {
  const isMobile = useIsMobile();
  return (
    <Flex
      vertical
      gap={isMobile ? 12 : 16}
      className={classnames('list-view', style['list-view'], className)}
    >
      {get(report, 'list', []).map(({ label, content }, index) => {
        return (
          <div className={classnames(style['list-item'], 'list-item')} key={index}>
            <div className={classnames('list-label-col', style['list-label-col'])}>
              <div className={classnames('list-label', style['list-label'])}>{label}</div>
            </div>
            <div className={classnames('list-content-col', style['list-content-col'])}>
              <div className={classnames('list-content', style['list-content'])}>{content}</div>
            </div>
          </div>
        );
      })}
    </Flex>
  );
};

export default List;
