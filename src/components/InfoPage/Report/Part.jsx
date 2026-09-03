// @ts-nocheck
// Ported from https://github.com/kne-union/info-page/blob/master/src/Report/Part.js
import { useIsMobile } from '@kne/responsive-utils';
import { Space } from 'antd';
import classnames from 'classnames';
import get from 'lodash/get';
import React from 'react';
import style from './style.module.scss';

const Part = ({ className, report }) => {
  const isMobile = useIsMobile();
  return (
    <Space
      direction="vertical"
      size={isMobile ? 28 : 32}
      className={classnames('part-view', style['part-view'], className)}
      style={{ width: '100%' }}
    >
      {get(report, 'list', []).map(({ label, content, hasBgColor, ...props }, index) => {
        return (
          <div
            {...props}
            key={index}
            className={classnames(style['part-item'], 'part-item', props.className)}
          >
            <div className={classnames('part-label', style['part-label'])}>{label}</div>
            <div
              className={classnames('part-content', style['part-content'], {
                [style['part-content-bg']]: hasBgColor,
                'has-bg-color': hasBgColor,
              })}
            >
              {content}
            </div>
          </div>
        );
      })}
    </Space>
  );
};

export default Part;
