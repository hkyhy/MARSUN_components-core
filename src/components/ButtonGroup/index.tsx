import KneButtonGroup from '@kne/button-group';
import classNames from 'classnames';
import React, { useMemo } from 'react';
import { normalizeActionList, type ActionListItem } from './normalizeActionList';
import styles from './style.module.scss';

export type { ActionListItem, ActionListItemInput } from './normalizeActionList';
export type { NormalizeActionListOptions } from './normalizeActionList';
export { actionListItem, normalizeActionList } from './normalizeActionList';

export type ButtonGroupProps = {
  list?: Array<ActionListItem | ((...args: never[]) => unknown)>;
  /** 默认 true：unavailable → hidden，禁止 disabled 占位 */
  hideUnavailable?: boolean;
  moreType?: 'link' | 'default' | string;
  showLength?: number;
  className?: string;
  itemClassName?: string;
  [key: string]: unknown;
};

/**
 * 业务操作组 SSOT：薄封装 `@kne/button-group`。
 * 默认把 `unavailable` 收成 `hidden`（无权限/态到了不可再操作不置灰占位）。
 * 短暂 loading 用 `loading`/`disabled`，勿标 `unavailable`。
 */
const ButtonGroup: React.FC<ButtonGroupProps> = ({
  list,
  hideUnavailable = true,
  className,
  ...rest
}) => {
  const normalized = useMemo(
    () => normalizeActionList(list, { hideUnavailable }),
    [list, hideUnavailable],
  );

  return (
    <KneButtonGroup
      {...rest}
      list={normalized}
      className={classNames('marsun-button-group', styles['marsun-button-group'], className)}
    />
  );
};

export default ButtonGroup;
