import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import PageSpin from '../PageSpin';
import { usePageShell } from '../PageShell';
import styles from './style.module.scss';

export type ModulePageShellProps = {
  title?: string;
  description?: ReactNode;
  breadcrumb?: ReactNode;
  toolbar?: ReactNode;
  /** 页面级 loading，与 usePageShellLoading 注册的 ctx loading 合并 */
  spinning?: boolean;
  /** 是否同步 title/description/actions 到 PageShellProvider（App 顶栏），默认 true */
  syncPageMeta?: boolean;
  actions?: Record<string, unknown>[];
  children?: ReactNode;
  className?: string;
  bodyClassName?: string;
};

const ModulePageShell: React.FC<ModulePageShellProps> = ({
  title,
  description,
  breadcrumb,
  toolbar,
  spinning = false,
  syncPageMeta = true,
  actions,
  children,
  className,
  bodyClassName,
}) => {
  const { setPageMeta, pageLoading: ctxLoading } = usePageShell();
  const showSpinning = Boolean(spinning || ctxLoading);

  useEffect(() => {
    if (!syncPageMeta) return;
    setPageMeta({
      title,
      description,
      actionItems: actions,
    });
    return () => setPageMeta({});
  }, [title, description, actions, syncPageMeta, setPageMeta]);

  return (
    <div className={classNames('module-page-shell', styles['module-page-shell'], className)}>
      {breadcrumb ? (
        <div className={classNames('module-page-breadcrumb', styles['module-page-breadcrumb'])}>
          {breadcrumb}
        </div>
      ) : null}

      {toolbar ? (
        <div className={classNames('module-page-toolbar', styles['module-page-toolbar'])}>
          {toolbar}
        </div>
      ) : null}

      <div
        className={classNames('module-page-body', styles['module-page-body'], bodyClassName)}
      >
        <PageSpin spinning={showSpinning}>{children}</PageSpin>
      </div>
    </div>
  );
};

export default ModulePageShell;
