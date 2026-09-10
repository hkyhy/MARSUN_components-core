import { Card, Statistic } from 'antd';
import React from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

/** 马卡龙底色（详情 / Summary KPI） */
export const STAT_MACARON = {
  rose: '#FFEDEF',
  lilac: '#F3EEFF',
  mint: '#E8F8F4',
  blue: '#EAF3FF',
  peach: '#FFF3E8',
  butter: '#FFF8E6',
} as const;

export type StatMacaronTone = keyof typeof STAT_MACARON;

const MACARON_TILE: React.CSSProperties = {
  borderRadius: 10,
  padding: '8px 12px',
  boxSizing: 'border-box',
  width: '100%',
  height: '100%',
};

export interface StatCardProps {
  /** 标题 */
  title: string;
  /** 数值（未接指标可用「—」等字符串，禁假 0） */
  value: number | string;
  /** 前缀图标 */
  prefix?: React.ReactNode;
  /** 后缀（如 %、单位） */
  suffix?: React.ReactNode;
  /** 小数精度 */
  precision?: number;
  /** 数值颜色 */
  color?: string;
  /** 点击回调 */
  onClick?: () => void;
  /** 是否内联模式（不使用 Card 包裹） */
  inline?: boolean;
  /** 内联模式下的字体大小 */
  fontSize?: number;
  /** 马卡龙底色；与 style 并存时显式 style 优先 */
  tone?: StatMacaronTone;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/** 可点击的统计卡片 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  precision,
  color = '#1677ff',
  onClick,
  inline = false,
  fontSize,
  tone,
  style,
}) => {
  const mergedStyle: React.CSSProperties | undefined = tone
    ? { ...MACARON_TILE, background: STAT_MACARON[tone], ...style }
    : style;

  const resolvedSuffix =
    typeof suffix === 'string' || typeof suffix === 'number' ? (
      <span className={classNames('stat-card-suffix-unit', styles['stat-card-suffix-unit'])}>
        {suffix}
      </span>
    ) : (
      suffix
    );

  const statistic = (
    <Statistic
      title={title}
      value={value}
      prefix={prefix}
      suffix={resolvedSuffix}
      precision={precision}
      valueStyle={{ color, ...(fontSize ? { fontSize } : {}) }}
    />
  );

  const rootClass = classNames(
    'stat-card-root',
    styles['stat-card-root'],
    onClick && classNames('stat-card-clickable', styles['stat-card-clickable']),
  );

  if (inline) {
    return (
      <div className={rootClass} onClick={onClick} style={mergedStyle} data-tone={tone}>
        {statistic}
      </div>
    );
  }

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      className={rootClass}
      styles={{ body: { height: '100%', display: 'flex', flexDirection: 'column' } }}
      style={mergedStyle}
      data-tone={tone}
    >
      {statistic}
    </Card>
  );
};

export default StatCard;
