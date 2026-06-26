import { Card, Statistic } from 'antd';
import React from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

export interface StatCardProps {
  /** 标题 */
  title: string;
  /** 数值 */
  value: number;
  /** 前缀图标 */
  prefix?: React.ReactNode;
  /** 数值颜色 */
  color?: string;
  /** 点击回调 */
  onClick?: () => void;
  /** 是否内联模式（不使用 Card 包裹） */
  inline?: boolean;
  /** 内联模式下的字体大小 */
  fontSize?: number;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/** 可点击的统计卡片 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix,
  color = '#1677ff',
  onClick,
  inline = false,
  fontSize,
  style,
}) => {
  if (inline) {
    return (
      <div className={onClick ? classNames('stat-card-clickable', styles['stat-card-clickable']) : undefined} onClick={onClick} style={style}>
        <Statistic
          title={title}
          value={value}
          prefix={prefix}
          valueStyle={{ color, ...(fontSize ? { fontSize } : {}) }}
        />
      </div>
    );
  }

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      className={onClick ? classNames('stat-card-clickable', styles['stat-card-clickable']) : undefined}
    >
      <Statistic title={title} value={value} prefix={prefix} valueStyle={{ color }} />
    </Card>
  );
};

export default StatCard;
