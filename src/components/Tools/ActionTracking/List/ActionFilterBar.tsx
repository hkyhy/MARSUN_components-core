import classNames from 'classnames';
import type { ComponentType, ReactNode } from 'react';
import Filter from '../../../ReactFilter';
import type { FilterValue } from '../../../ReactFilter';
import styles from './ActionFilterBar.module.scss';

export type ActionFilterBarProps = {
  value: FilterValue;
  onChange: (next: FilterValue) => void;
  /** ReactFilter list 配置（App 注入选项/标签） */
  list: unknown;
  label?: string;
  className?: string;
  /**
   * F1：当前筛选是否可查（通常 = canQueryActionList）。
   * false 时展示 hint，不拦 onChange（由 App 在 load 前拒扫）。
   */
  canQuery?: boolean;
  /** !canQuery 时提示（默认文案） */
  queryBlockedHint?: ReactNode;
};

const ReactFilterBar = Filter as ComponentType<{
  value: FilterValue;
  onChange: (next: FilterValue) => void;
  list: unknown;
  label?: string;
}>;

/**
 * 行动列表筛选壳：Filter + canQuery 提示钩子。
 * 字段选项 / 默认窗逻辑由 App 注入；core 禁写死业务码表。
 */
const ActionFilterBar: React.FC<ActionFilterBarProps> = ({
  value,
  onChange,
  list,
  label = '筛选',
  className,
  canQuery = true,
  queryBlockedHint,
}) => {
  return (
    <div className={classNames('action-filter-bar', styles['action-filter-bar'], className)}>
      <ReactFilterBar label={label} value={value} onChange={onChange} list={list} />
      {!canQuery ? (
        <div
          className={classNames(
            'action-filter-bar-query-hint',
            styles['action-filter-bar-query-hint'],
          )}
          role="status"
        >
          {queryBlockedHint ?? '请保留创建时间范围后再查询（禁止无条件扫全表）'}
        </div>
      ) : null}
    </div>
  );
};

export default ActionFilterBar;
