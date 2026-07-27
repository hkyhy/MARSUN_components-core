import { ChevronDown, ChevronUp, Loader2 } from '@/components/Icons';
import classNames from 'classnames';
import React from 'react';
import type { BaseFilterProps } from '../types';
import styles from './style.module.scss';

interface FilterTriggerProps extends Omit<BaseFilterProps, 'filterKey'> {
  onClick?: (e: React.MouseEvent) => void;
  open?: boolean;
  /** 选项加载中：右侧用 Loader2 spin 替换 chevron */
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * 筛选触发按钮
 * 未选中：灰色文字 + 下箭头
 * 已选：主题色文字 + 浅底 + 上箭头
 * loading：右侧 Loader2 spin（替换 chevron）
 */
const FilterTrigger: React.FC<FilterTriggerProps> = ({
  label,
  active,
  onClick,
  open,
  loading = false,
  className = '',
  children,
}) => {
  const chevron =
    open !== undefined ? (
      open ? (
        <ChevronUp
          className={classNames('filter-trigger-chevron', styles['filter-trigger-chevron'])}
        />
      ) : (
        <ChevronDown
          className={classNames('filter-trigger-chevron', styles['filter-trigger-chevron'])}
        />
      )
    ) : !active ? (
      <ChevronDown
        className={classNames('filter-trigger-chevron', styles['filter-trigger-chevron'])}
      />
    ) : (
      <ChevronUp
        className={classNames('filter-trigger-chevron', styles['filter-trigger-chevron'])}
      />
    );

  return (
    <span
      className={classNames(
        'filter-trigger-root',
        styles['filter-trigger-root'],
        active
          ? ['filter-trigger-active', styles['filter-trigger-active']]
          : ['filter-trigger-inactive', styles['filter-trigger-inactive']],
        loading && 'filter-trigger-loading',
        className,
      )}
      onClick={onClick}
      aria-busy={loading || undefined}
    >
      {children ?? (typeof label === 'function' ? null : label)}
      {loading ? (
        <Loader2
          spin
          size={12}
          className={classNames('filter-trigger-loader', styles['filter-trigger-loader'])}
        />
      ) : (
        chevron
      )}
    </span>
  );
};

export default FilterTrigger;
export type { FilterTriggerProps };
