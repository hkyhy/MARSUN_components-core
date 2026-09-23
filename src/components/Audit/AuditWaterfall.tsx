import { Empty, Typography } from 'antd';
import classNames from 'classnames';
import React, { useMemo } from 'react';
import { waterfallChartData } from './detailKpi';
import styles from './style.module.scss';
import type { AuditStep } from './types';

export type AuditWaterfallProps = {
  steps: AuditStep[];
  /** 保留兼容；CSS 时序条按内容自适应，不再依赖 canvas 定高 */
  height?: number;
  className?: string;
};

function barColor(stepType: string): string {
  const t = stepType.toUpperCase();
  if (t === 'SQL') return 'var(--success-color, #52c41a)';
  if (t === 'RESPONSE') return 'var(--primary-color, #1677ff)';
  if (t === 'ERROR') return 'var(--error-color, #ff4d4f)';
  if (t === 'AUTH' || t === 'UPSTREAM') return 'var(--warning-color, #fa8c16)';
  if (t === 'TRANSFORM') return '#13c2c2';
  return '#595959';
}

/**
 * DevTools Timing 风格：左标签 | 中区间条 | 右耗时。
 * 文案在条外，避免短条白字压底；CSS 条（非自研 SVG 业务图）。
 */
export const AuditWaterfall: React.FC<AuditWaterfallProps> = ({ steps, className }) => {
  const data = useMemo(() => waterfallChartData(steps), [steps]);
  const totalMs = data.length > 0 ? data[data.length - 1]!.endMs : 0;

  if (data.length === 0) {
    return (
      <Empty
        description={
          <Typography.Text type="secondary">
            无逐步耗时（旧事件未采集 durationMs，不伪造）
          </Typography.Text>
        }
      />
    );
  }

  const scale = totalMs > 0 ? totalMs : 1;

  return (
    <div className={classNames(styles.timing, className)}>
      <div className={styles.timingRows}>
        {data.map((row) => {
          const leftPct = (row.startMs / scale) * 100;
          const widthPct = Math.max((row.durationMs / scale) * 100, 0.35);
          const thin = row.durationMs / scale < 0.02;
          return (
            <div key={`${row.title}-${row.startMs}`} className={styles.timingRow}>
              <div className={styles.timingLabel} title={row.title}>
                {row.title}
              </div>
              <div className={styles.timingTrack} aria-hidden>
                <div
                  className={classNames(styles.timingBar, thin && styles.timingBarThin)}
                  style={{
                    left: `${leftPct}%`,
                    width: thin ? undefined : `${widthPct}%`,
                    background: barColor(row.stepType),
                  }}
                />
              </div>
              <div className={styles.timingMs}>{row.durationMs} ms</div>
            </div>
          );
        })}
      </div>
      <div className={styles.timingFoot}>
        <span />
        <Typography.Text strong>{totalMs} ms</Typography.Text>
      </div>
    </div>
  );
};

export default AuditWaterfall;
