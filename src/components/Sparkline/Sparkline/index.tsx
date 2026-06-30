import classNames from 'classnames';
import React from 'react';
import styles from './style.module.scss';

export interface SparklineProps {
  data?: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

/** 极细 Sparkline — 响应式微型趋势折线 */
const Sparkline: React.FC<SparklineProps> = ({
  data = [],
  width = 200,
  height = 28,
  color = '#52525b',
  className,
}) => {
  if (!data.length) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;

  const points = data
    .map((v, i) => {
      const x = pad + (i / Math.max(data.length - 1, 1)) * (width - pad * 2);
      const y = pad + (1 - (v - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const last = data[data.length - 1]!;
  const lastX = pad + ((data.length - 1) / Math.max(data.length - 1, 1)) * (width - pad * 2);
  const lastY = pad + (1 - (last - min) / range) * (height - pad * 2);

  return (
    <svg
      className={classNames('sparkline', styles.sparkline, className)}
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        opacity="0.9"
      />
      <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
    </svg>
  );
};

export default Sparkline;
