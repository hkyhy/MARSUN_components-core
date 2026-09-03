// @ts-nocheck
// Ported from https://github.com/kne-union/info-page/blob/master/src/InfoPage/index.js
import { useIsMobile } from '@kne/responsive-utils';
import { Card, Flex } from 'antd';
import classnames from 'classnames';
import React from 'react';

import Collapse from './Collapse';
import style from './style.module.scss';

const Part = ({ className, title, subtitle, extra, children, bordered, ...props }) => {
  return (
    <Card
      className={classnames(style['part'], 'part', className, {
        'no-title': !title,
        [style['no-title']]: !title,
        bordered: bordered,
        [style['bordered']]: bordered,
      })}
      variant="borderless"
      title={
        title && (
          <>
            <div className={classnames('part-title', style['part-title'])}>{title}</div>
            {subtitle && (
              <div className={classnames('part-title-sub', style['part-title-sub'])}>
                {subtitle}
              </div>
            )}
          </>
        )
      }
      extra={extra}
      {...props}
    >
      {children}
    </Card>
  );
};

const InfoPage = ({ className, children, ...props }) => {
  const isMobile = useIsMobile();
  return (
    <Flex {...props} className={className} vertical gap={isMobile ? 12 : 24}>
      {children}
    </Flex>
  );
};

InfoPage.Part = Part;
InfoPage.Collapse = Collapse;
export default InfoPage;
