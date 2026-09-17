import classNames from 'classnames';
import React from 'react';
import styles from './style.module.scss';

export type DispositionBarProps = {
  /** 左侧文案，默认「处置状态」 */
  label?: string;
  /** 状态徽章内容（string 或自定义节点） */
  statusBadge: React.ReactNode;
  /** 右侧操作区；由调用方注入业务钮 */
  actions?: React.ReactNode;
  /** true → 仅显示状态区，不渲染 actions */
  statusLoading?: boolean;
  className?: string;
};

/**
 * 处置条布局壳：左状态 + 右操作。不绑业务 API / EP。
 */
const DispositionBar: React.FC<DispositionBarProps> = ({
  label = '处置状态',
  statusBadge,
  actions,
  statusLoading,
  className,
}) => {
  const badgeNode =
    typeof statusBadge === 'string' || typeof statusBadge === 'number' ? (
      <span className={styles['marsun-disposition-badge']}>{statusBadge}</span>
    ) : (
      statusBadge
    );

  return (
    <div
      className={classNames('marsun-disposition-bar', styles['marsun-disposition-bar'], className)}
      role="group"
      aria-label={label}
    >
      <div className={classNames('marsun-disposition-status', styles['marsun-disposition-status'])}>
        <span className={styles['marsun-disposition-label']}>{label}</span>
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
