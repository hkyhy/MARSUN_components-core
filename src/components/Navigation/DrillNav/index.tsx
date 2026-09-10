import { ChevronLeft } from '@/components/Icons';
import { Button } from 'antd';
import classNames from 'classnames';
import React from 'react';
import styles from './style.module.scss';

export type DrillStep = {
  id: string;
  label: string;
  /** 已走过且可点回；当前步不传 onClick */
  onClick?: () => void;
};

export type DrillNavProps = {
  steps: DrillStep[];
  currentId: string;
  /** 主标题（当前上下文） */
  title?: string;
  /** 副文案 */
  subtitle?: string;
  /** 与 onBack 成对传入才渲染返回钮 */
  backLabel?: string;
  onBack?: () => void;
};

/**
 * 下钻导航：可选 primary「返回」+ 步骤胶囊。
 * 当前步高亮；已完成步可点回。
 */
const DrillNav: React.FC<DrillNavProps> = ({
  steps,
  currentId,
  title,
  subtitle,
  backLabel,
  onBack,
}) => {
  const currentIdx = steps.findIndex((s) => s.id === currentId);
  const showBack = Boolean(backLabel && onBack);

  return (
    <div
      className={classNames('marsun-drill-nav', styles['marsun-drill-nav'])}
      role="navigation"
      aria-label="下钻步骤"
    >
      <div className={styles['marsun-drill-nav-row']}>
        {showBack ? (
          <Button
            type="primary"
            icon={<ChevronLeft size={16} />}
            onClick={onBack}
            className={styles['marsun-drill-nav-back']}
          >
            {backLabel}
          </Button>
        ) : null}
        {steps.length > 0 ? (
          <div className={styles['marsun-drill-nav-steps']}>
            {steps.map((s, i) => {
              const isCurrent = s.id === currentId;
              const isDone = currentIdx > i;
              const clickable = isDone && !!s.onClick;
              return (
                <button
                  key={s.id}
                  type="button"
                  className={classNames(
                    styles['marsun-drill-nav-step'],
                    isCurrent && styles['marsun-drill-nav-step-current'],
                    isDone && styles['marsun-drill-nav-step-done'],
                  )}
                  onClick={() => {
                    if (clickable) s.onClick?.();
                  }}
                  disabled={!clickable && !isCurrent}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <span className={styles['marsun-drill-nav-step-index']}>{i + 1}</span>
                  {s.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      {title || subtitle ? (
        <div className={styles['marsun-drill-nav-context']}>
          {title ? <div className={styles['marsun-drill-nav-title']}>{title}</div> : null}
          {subtitle ? <div className={styles['marsun-drill-nav-sub']}>{subtitle}</div> : null}
        </div>
      ) : null}
    </div>
  );
};

export default DrillNav;
