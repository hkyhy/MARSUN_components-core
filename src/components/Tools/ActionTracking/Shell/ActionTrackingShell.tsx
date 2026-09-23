import classNames from 'classnames';
import type { ReactNode } from 'react';
import ModulePageShell, { type ModulePageShellProps } from '../../../Layout/ModulePageShell';
import type { PageShellActionItem } from '../../../Layout/PageShell';
import styles from './style.module.scss';

export type ActionTrackingShellProps = {
  title?: string;
  description?: ReactNode;
  /** 顶栏操作（如「新建任务」）；权限由 App 决定是否传入 */
  actions?: PageShellActionItem[];
  spinning?: boolean;
  /** 筛选条（App 注入） */
  filterSlot?: ReactNode;
  /** 列表+分页（App 注入；含行执行闭环钮） */
  listSlot?: ReactNode;
  /** 告警处置等扩展槽（可选；S3 可空） */
  dispositionSlot?: ReactNode;
  /** 弹层：新建/跟进/取消等 */
  modalSlot?: ReactNode;
  className?: string;
  bodyClassName?: string;
  syncPageMeta?: boolean;
  fillHeight?: boolean;
};

/**
 * 行动跟踪页壳（D8）：布局 + 注入点；权限码 / 筛选项 / 列 / 处置 / API 均由 App 注入。
 * 告警处置与执行闭环分型由 App 遵守；壳不内置认领逻辑。
 */
const ActionTrackingShell: React.FC<ActionTrackingShellProps> = ({
  title = '行动跟踪',
  description,
  actions,
  spinning,
  filterSlot,
  listSlot,
  dispositionSlot,
  modalSlot,
  className,
  bodyClassName,
  syncPageMeta,
  fillHeight,
}) => {
  const shellProps: ModulePageShellProps = {
    title,
    description,
    actions,
    spinning,
    syncPageMeta,
    fillHeight,
    bodyClassName,
  };

  return (
    <ModulePageShell {...shellProps}>
      <div
        className={classNames('action-tracking-shell', styles['action-tracking-shell'], className)}
      >
        {filterSlot}
        {dispositionSlot}
        {listSlot}
      </div>
      {modalSlot}
    </ModulePageShell>
  );
};

export default ActionTrackingShell;
