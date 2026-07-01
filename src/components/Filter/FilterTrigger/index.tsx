import { ChevronDown, ChevronUp } from '@/components/Icons';
import classNames from 'classnames';
import React from 'react';
import type { BaseFilterProps } from '../types';
import styles from './style.module.scss';

interface FilterTriggerProps extends Omit<BaseFilterProps, 'filterKey'> {
  onClick?: (e: React.MouseEvent) => void;
  open?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * 筛选触发按钮
 * 未选中：灰色文字 + 下箭头
 * 已选：主题色文字 + 浅底 + 上箭头
 */
const FilterTrigger: React.FC<FilterTriggerProps> = ({
  label,
  active,
  onClick,
  open,
  className = '',
  children,
}) => (
  <span
    className={classNames('filter-trigger-root', styles['filter-trigger-root'],
      active
        ? ['filter-trigger-active', styles['filter-trigger-active']]
        : ['filter-trigger-inactive', styles['filter-trigger-inactive']],
      className,
    )}
    onClick={onClick}
  >
    {children ?? label}
    {open !== undefined ? (
      open ? (
        <ChevronUp className={classNames('filter-trigger-chevron', styles['filter-trigger-chevron'])} />
      ) : (
        <ChevronDown className={classNames('filter-trigger-chevron', styles['filter-trigger-chevron'])} />
      )
    ) : !active ? (
      <ChevronDown className={classNames('filter-trigger-chevron', styles['filter-trigger-chevron'])} />
    ) : (
      <ChevronUp className={classNames('filter-trigger-chevron', styles['filter-trigger-chevron'])} />
    )}
  </span>
);

export default FilterTrigger;
export type { FilterTriggerProps };
