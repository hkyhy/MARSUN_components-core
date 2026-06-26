import { Card } from 'antd';
import React from 'react';
import type { StatItem } from '../StatCardList';
import StatCardList from '../StatCardList';
import styles from './style.module.scss';
import classNames from 'classnames';

export interface StatPendingBreakdownProps {
  /** 卡片标题 */
  title?: string;
  /** 数据可见范围说明，显示在标题下方 */
  subtitle?: React.ReactNode;
  /** 汇总统计项 */
  summaryItems?: StatItem[];
  /** 待审核明细统计项 */
  detailItems: StatItem[];
  /** 汇总区字体大小 */
  summaryFontSize?: number;
  /** 明细区字体大小 */
  detailFontSize?: number;
  /** 明细区标题 */
  detailLabel?: string;
  /** 容器 className */
  className?: string;
  /** 无 Card 包裹，仅展示统计内容（用于外层已有 Card 的场景） */
  plain?: boolean;
}

/** 待审核汇总 + 明细独立展示区块 */
const StatPendingBreakdown: React.FC<StatPendingBreakdownProps> = ({
  title = '待审核',
  subtitle,
  summaryItems,
  detailItems,
  summaryFontSize = 20,
  detailFontSize = 18,
  detailLabel = '待审核明细',
  className,
  plain = false,
}) => {
  const hasSummary = summaryItems?.some((item) => !item.hidden);
  const hasDetail = detailItems.some((item) => !item.hidden);

  if (!hasSummary && !hasDetail) {
    return null;
  }

  const content = (
    <>
      {hasSummary && summaryItems && (
        <StatCardList items={summaryItems} inline fontSize={summaryFontSize} />
      )}
      {hasDetail && (
        <div className={hasSummary ? classNames('stat-pending-breakdown-detail-divider', styles['stat-pending-breakdown-detail-divider']) : undefined}>
          <div className={classNames('stat-pending-breakdown-root', styles['stat-pending-breakdown-root'])}>{detailLabel}</div>
          <StatCardList items={detailItems} inline fontSize={detailFontSize} />
        </div>
      )}
    </>
  );

  if (plain) {
    return <div className={className}>{content}</div>;
  }

  const cardTitle = subtitle ? (
    <div>
      <div>{title}</div>
      <div className={classNames('stat-pending-breakdown-container', styles['stat-pending-breakdown-container'])}>{subtitle}</div>
    </div>
  ) : (
    title
  );

  return (
    <Card title={cardTitle} className={className}>
      {content}
    </Card>
  );
};

export default StatPendingBreakdown;
