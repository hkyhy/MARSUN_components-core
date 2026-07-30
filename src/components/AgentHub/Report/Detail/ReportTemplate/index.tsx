import classNames from 'classnames';
import type { ReactNode } from 'react';
import ReportMetaStrip, { type ReportMetaItem } from '../ReportMetaStrip';
import styles from './style.module.scss';

export type ReportTemplateProps = {
  badge?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  metaItems?: ReportMetaItem[];
  metaColumns?: number;
  toolbar?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

/**
 * Agent 报告布局模板 — Meta 四列 + 叙事区槽位（无业务 API）
 */
const ReportTemplate: React.FC<ReportTemplateProps> = ({
  badge,
  title,
  subtitle,
  metaItems,
  metaColumns = 4,
  toolbar,
  children,
  footer,
  className,
}) => {
  const showHeader = Boolean(badge || title || subtitle);

  return (
    <div
      className={classNames('marsun-report-template', styles['marsun-report-template'], className)}
    >
      {showHeader ? (
        <header
          className={classNames(
            'marsun-report-template-header',
            styles['marsun-report-template-header'],
          )}
        >
          {badge ? (
            <div
              className={classNames(
                'marsun-report-template-badge',
                styles['marsun-report-template-badge'],
              )}
            >
              {badge}
            </div>
          ) : null}
          {title ? (
            <div
              className={classNames(
                'marsun-report-template-title',
                styles['marsun-report-template-title'],
              )}
            >
              {title}
            </div>
          ) : null}
          {subtitle ? (
            <p
              className={classNames(
                'marsun-report-template-subtitle',
                styles['marsun-report-template-subtitle'],
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </header>
      ) : null}

      {toolbar ? (
        <div
          className={classNames(
            'marsun-report-template-toolbar',
            styles['marsun-report-template-toolbar'],
          )}
        >
          {toolbar}
        </div>
      ) : null}

      {metaItems && metaItems.length > 0 ? (
        <ReportMetaStrip items={metaItems} columns={metaColumns} />
      ) : null}

      <div
        className={classNames('marsun-report-template-body', styles['marsun-report-template-body'])}
      >
        {children}
      </div>

      {footer ? (
        <footer
          className={classNames(
            'marsun-report-template-footer',
            styles['marsun-report-template-footer'],
          )}
        >
          {footer}
        </footer>
      ) : null}
    </div>
  );
};

export default ReportTemplate;
