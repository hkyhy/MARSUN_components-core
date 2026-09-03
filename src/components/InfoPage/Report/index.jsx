// @ts-nocheck
// Ported from https://github.com/kne-union/info-page/blob/master/src/Report/index.js
import React from 'react';
import style from './style.module.scss';
import { Flex } from 'antd';
import List from './List';
import Result from './Result';
import Table from './Table';
import Part from './Part';
import Score from '../Score';
import PrintPageBreak from './PrintPageBreak';
import classnames from 'classnames';

const Report = ({
  title,
  subtitle,
  extra,
  className,
  border,
  primaryColor,
  primaryColor1,
  children,
}) => {
  const themeStyle = {
    ...(primaryColor && { '--primary-color': primaryColor }),
    ...(primaryColor1 && { '--primary-color-1': primaryColor1 }),
  };

  return (
    <div
      className={classnames(
        style['report-view'],
        'report-view',
        {
          [style['no-title']]: !(title || extra),
          [style['no-border']]: border === false,
        },
        className,
      )}
      style={Object.keys(themeStyle).length ? themeStyle : undefined}
    >
      <Flex className={classnames('title-outer', style['title-outer'])} justify="space-between">
        {title && (
          <Flex vertical>
            <div className={classnames('title', style['title'])}>{title}</div>
            {subtitle && (
              <div className={classnames('subtitle', style['subtitle'])}>{subtitle}</div>
            )}
          </Flex>
        )}
        {extra && <div className={classnames('title-extra', style['title-extra'])}>{extra}</div>}
      </Flex>
      {children}
    </div>
  );
};

Report.List = List;
Report.Result = Result;
Report.Table = Table;
Report.Part = Part;
Report.Score = Score;
Report.PrintPageBreak = PrintPageBreak;

export default Report;
