import { Sparkline } from '@/components';
import classNames from 'classnames';
import React from 'react';
import styles from './style.module.scss';

const TREND_UP = [12, 14, 13, 18, 22, 21, 28, 32, 30, 36];
const TREND_DOWN = [48, 45, 42, 40, 38, 35, 33, 30, 28, 24];
const TREND_FLAT = [20, 21, 19, 20, 21, 20, 19, 20, 21, 20];

/** Sparkline 微型趋势折线示例 */
const SparklineBasicDemo: React.FC = () => (
  <div className={classNames('sparkline-basic-demo', styles['sparkline-basic-demo'])}>
    <div className={classNames('sparkline-basic-demo-item', styles['sparkline-basic-demo-item'])}>
      <span className={styles['sparkline-basic-demo-label']}>上升趋势</span>
      <Sparkline data={TREND_UP} color="#1677ff" />
    </div>
    <div className={classNames('sparkline-basic-demo-item', styles['sparkline-basic-demo-item'])}>
      <span className={styles['sparkline-basic-demo-label']}>下降趋势</span>
      <Sparkline data={TREND_DOWN} color="#ff4d4f" />
    </div>
    <div className={classNames('sparkline-basic-demo-item', styles['sparkline-basic-demo-item'])}>
      <span className={styles['sparkline-basic-demo-label']}>平稳波动</span>
      <Sparkline data={TREND_FLAT} color="#52c41a" />
    </div>
  </div>
);

export default SparklineBasicDemo;
