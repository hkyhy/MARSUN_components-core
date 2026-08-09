import classNames from 'classnames';
import type { ReactNode } from 'react';
import styles from './style.module.scss';

export type ReportWorkspaceProps = {
  /** 左侧列表（档案/会话等） */
  list: ReactNode;
  /** 右侧详情 / 预览 */
  detail: ReactNode;
  className?: string;
};

/**
 * 报告/档案主从工作区 — 左列表右详情栅格（无业务 API）
 */
const ReportWorkspace: React.FC<ReportWorkspaceProps> = ({ list, detail, className }) => {
  return (
    <div
      className={classNames(
        'marsun-report-workspace',
        styles['marsun-report-workspace'],
        className,
      )}
    >
      <div
        className={classNames(
          'marsun-report-workspace-list',
          styles['marsun-report-workspace-list'],
        )}
      >
        {list}
      </div>
      <div
        className={classNames(
          'marsun-report-workspace-detail',
          styles['marsun-report-workspace-detail'],
        )}
      >
        {detail}
      </div>
    </div>
  );
};

export default ReportWorkspace;
