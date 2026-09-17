import classNames from 'classnames';
import React from 'react';
import type { DispositionAlertLevelCatalog } from './types';
import styles from './levelLegend.module.scss';

export type DispositionAlertLevelLegendProps = {
  catalog: DispositionAlertLevelCatalog;
  className?: string;
  /** 图例标题，默认「等级」 */
  title?: string;
};

/**
 * 等级图例：完全由 catalog 驱动，不内置任何产品级数/文案。
 */
const DispositionAlertLevelLegend: React.FC<DispositionAlertLevelLegendProps> = ({
  catalog,
  className,
  title = '等级',
}) => {
  if (!catalog.length) return null;

  return (
    <div
      className={classNames(
        'marsun-disposition-alert-level-legend',
        styles['marsun-disposition-alert-level-legend'],
        className,
      )}
      aria-label={title}
    >
      <span className={styles['marsun-disposition-alert-level-legend-title']}>{title}</span>
      {catalog.map((lv) => (
        <span key={lv.key} className={styles['marsun-disposition-alert-level-legend-item']}>
          <span
            className={styles['marsun-disposition-alert-level-legend-dot']}
            style={{ background: lv.tone }}
            aria-hidden
          />
          {lv.label}
        </span>
      ))}
    </div>
  );
};

export default DispositionAlertLevelLegend;
