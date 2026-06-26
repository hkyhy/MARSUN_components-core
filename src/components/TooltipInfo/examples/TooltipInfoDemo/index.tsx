import { SemanticTag, TooltipInfo } from '@/components';
import React from 'react';
import { MOCK_DELETE_META_ITEMS, MOCK_ROLE_META_ITEMS } from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

const TooltipInfoDemo: React.FC = () => (
  <div className={classNames('tooltip-info-demo-root', styles['tooltip-info-demo-root'])}>
    <TooltipInfo content={MOCK_ROLE_META_ITEMS}>
      <span className={classNames('tooltip-info-demo-container', styles['tooltip-info-demo-container'])}>高管</span>
    </TooltipInfo>
    <TooltipInfo content={MOCK_DELETE_META_ITEMS}>
      <SemanticTag color="danger" className={classNames('tooltip-info-demo-wrapper', styles['tooltip-info-demo-wrapper'])}>
        文件已删除
      </SemanticTag>
    </TooltipInfo>
  </div>
);

export default TooltipInfoDemo;
