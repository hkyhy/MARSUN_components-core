import { SemanticTag, TooltipInfo } from '@/components';
import React from 'react';
import { MOCK_DELETE_META_ITEMS, MOCK_ROLE_META_ITEMS } from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

const TooltipInfoDemo: React.FC = () => (
  <div className={classNames('tooltip-info-demo-root', styles['tooltip-info-demo-root'])}>
    <TooltipInfo content={MOCK_ROLE_META_ITEMS}>
      <span
        className={classNames('tooltip-info-demo-container', styles['tooltip-info-demo-container'])}
      >
        高管
      </span>
    </TooltipInfo>
    <TooltipInfo content={MOCK_DELETE_META_ITEMS}>
      <SemanticTag
        color="danger"
        className={classNames('tooltip-info-demo-wrapper', styles['tooltip-info-demo-wrapper'])}
      >
        文件已删除
      </SemanticTag>
    </TooltipInfo>
    <TooltipInfo
      type="note"
      note={{
        title: '考核对照 G-JZ（只读）',
        description:
          'data-service 考核标准六表（MySQL），按分厂与年度加载标准值、满分权重、考核说明与项目备注。',
      }}
    >
      <span
        className={classNames('tooltip-info-demo-container', styles['tooltip-info-demo-container'])}
      >
        考核对照 G-JZ ⓘ
      </span>
    </TooltipInfo>
    <TooltipInfo
      bordered
      minWidth={280}
      maxWidth={380}
      content={[
        { label: '说明', value: '同指标跨分厂或跨时期对比' },
        { label: '工具名', value: '跨厂品种对比' },
        { label: '工具英文名', value: 'compare_varieties' },
      ]}
    >
      <span
        className={classNames('tooltip-info-demo-container', styles['tooltip-info-demo-container'])}
      >
        bordered 表格 ⓘ
      </span>
    </TooltipInfo>
  </div>
);

export default TooltipInfoDemo;
