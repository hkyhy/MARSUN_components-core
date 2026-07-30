import classNames from 'classnames';
import type { ReactNode } from 'react';
import styles from './style.module.scss';

export type ReportMetaTone = 'default' | 'danger' | 'warning';

export type ReportMetaItem = {
  key: string;
  label: ReactNode;
  value: ReactNode;
  tone?: ReportMetaTone;
};

export type ReportMetaStripProps = {
  items: ReportMetaItem[];
  /** 默认 4 列均分 */
  columns?: number;
  className?: string;
};

/**
 * 报告指标条 — 默认四列均分
 */
const ReportMetaStrip: React.FC<ReportMetaStripProps> = ({ items, columns = 4, className }) => (
  <div
    className={classNames(
      'marsun-report-meta-strip',
      styles['marsun-report-meta-strip'],
      className,
    )}
    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
  >
    {items.map((item) => (
      <div
        key={item.key}
        className={classNames('marsun-report-meta-item', styles['marsun-report-meta-item'])}
      >
        <span
          className={classNames('marsun-report-meta-label', styles['marsun-report-meta-label'])}
        >
          {item.label}
        </span>
        <strong
          className={classNames(
            'marsun-report-meta-value',
            styles['marsun-report-meta-value'],
            item.tone === 'danger' && styles['marsun-report-meta-value--danger'],
            item.tone === 'warning' && styles['marsun-report-meta-value--warning'],
          )}
        >
          {item.value}
        </strong>
      </div>
    ))}
  </div>
);

export default ReportMetaStrip;
