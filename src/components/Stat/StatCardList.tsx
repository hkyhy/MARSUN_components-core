import { Col, Row } from 'antd';
import type { ColProps } from 'antd/es/grid';
import React from 'react';
import type { StatCardProps } from './StatCard';
import StatCard from './StatCard';

export interface StatItem extends Omit<StatCardProps, 'inline' | 'fontSize'> {
  /** 卡片占列配置，不传则根据总 items 数自动计算 */
  colProps?: ColProps;
  /** 是否隐藏，为 true 时不渲染 */
  hidden?: boolean;
  /** 后缀 */
  suffix?: React.ReactNode;
}

export interface StatCardListProps {
  /** 统计项列表 */
  items: StatItem[];
  /** 行间距 */
  gutter?: [number, number];
  /** 容器 className */
  className?: string;
  /** 是否内联模式 */
  inline?: boolean;
  /** 内联模式字体大小 */
  fontSize?: number;
}

/** 根据项数自动计算默认列宽 */
const getDefaultCol = (total: number): ColProps => {
  if (total <= 2) return { xs: 12, sm: 12, lg: 12 };
  if (total <= 3) return { xs: 12, sm: 8, lg: 8 };
  if (total <= 4) return { xs: 12, sm: 12, lg: 6 };
  return { xs: 12, sm: 8, lg: 4 };
};

/** 统计卡片列表 */
const StatCardList: React.FC<StatCardListProps> = ({
  items,
  gutter = [16, 16],
  className,
  inline = false,
  fontSize,
}) => {
  const visibleItems = items.filter((item) => !item.hidden);
  const defaultCol = getDefaultCol(visibleItems.length);

  return (
    <Row gutter={gutter} className={className}>
      {visibleItems.map((item, idx) => {
        const { colProps, hidden, ...cardProps } = item;
        return (
          <Col key={idx} {...(colProps ?? defaultCol)}>
            <StatCard {...cardProps} inline={inline} fontSize={fontSize} />
          </Col>
        );
      })}
    </Row>
  );
};

export default StatCardList;
