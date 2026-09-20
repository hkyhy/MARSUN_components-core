import classNames from 'classnames';
import React from 'react';
import styles from './style.module.scss';

export type DispositionBarProps = {
  /** 左侧文案，默认「处置状态」；有 lead 时不渲染 */
  label?: string;
  /**
   * 左侧预警摘要（S3 点操作条 lead）。
   * 有 lead 时不渲染「处置状态」label，左侧只展示摘要（+ 可选 statusBadge）。
   */
  lead?: React.ReactNode;
  /** 状态徽章内容（string 或自定义节点）；可与 lead 并存 */
  statusBadge?: React.ReactNode;
  /** 右侧操作区；由调用方注入业务钮 */
  actions?: React.ReactNode;
  /** true → 仅显示状态区，不渲染 actions */
  statusLoading?: boolean;
  className?: string;
};

/**
 * 处置条布局壳：左状态/摘要 + 右操作。不绑业务 API / EP。
 */
const DispositionBar: React.FC<DispositionBarProps> = ({
  label = '处置状态',
  lead,
  statusBadge,
  actions,
  statusLoading,
  className,
}) => {
  const hasLead = lead != null && lead !== false && lead !== '';
  const hasBadge = statusBadge != null && statusBadge !== false && statusBadge !== '';
  const badgeNode = hasBadge ? (
    typeof statusBadge === 'string' || typeof statusBadge === 'number' ? (
      <span className={styles['marsun-disposition-badge']}>{statusBadge}</span>
    ) : (
      statusBadge
    )
  ) : null;

  const ariaLabel = hasLead ? '预警摘要' : label;

  return (
    <div
      className={classNames('marsun-disposition-bar', styles['marsun-disposition-bar'], className)}
      role="group"
      aria-label={ariaLabel}
    >
      <div className={classNames('marsun-disposition-status', styles['marsun-disposition-status'])}>
        {hasLead ? (
          <div className={classNames('marsun-disposition-lead', styles['marsun-disposition-lead'])}>
            {lead}
          </div>
        ) : (
          <span className={styles['marsun-disposition-label']}>{label}</span>
        )}
        {badgeNode}
      </div>
      {!statusLoading && actions ? (
        <div
          className={classNames('marsun-disposition-actions', styles['marsun-disposition-actions'])}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
};

export default DispositionBar;
