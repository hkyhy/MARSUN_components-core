import { Empty } from '@/components/Empty';
import { RefreshCw } from '@/components/Icons';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { Button } from 'antd';
import styles from './style.module.scss';

export type ReportHtmlPreviewProps = {
  html?: string;
  loading?: boolean;
  title?: string;
  documentTitle?: string;
  onRefresh?: () => void;
  onPrint?: () => void;
  extraActions?: ReactNode;
  emptyDescription?: string;
  className?: string;
};

/** HTML 报告预览（iframe srcDoc）+ 刷新/打印 */
const ReportHtmlPreview: React.FC<ReportHtmlPreviewProps> = ({
  html,
  loading,
  title = '预览',
  documentTitle = '报告预览',
  onRefresh,
  onPrint,
  extraActions,
  emptyDescription,
  className,
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }
    if (!html) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <main
      className={classNames(
        'marsun-report-html-preview',
        styles['marsun-report-html-preview'],
        className,
      )}
    >
      <div
        className={classNames(
          'marsun-report-html-preview-head',
          styles['marsun-report-html-preview-head'],
        )}
      >
        <h3
          className={classNames(
            'marsun-report-html-preview-title',
            styles['marsun-report-html-preview-title'],
          )}
        >
          {title}
        </h3>
        <div
          className={classNames(
            'no-print',
            'marsun-report-html-preview-actions',
            styles['marsun-report-html-preview-actions'],
          )}
        >
          {onRefresh ? (
            <Button
              size="small"
              icon={<RefreshCw size={14} spin={loading} />}
              loading={loading}
              onClick={onRefresh}
            >
              刷新预览
            </Button>
          ) : null}
          <Button size="small" disabled={!html} onClick={handlePrint}>
            打印
          </Button>
          {extraActions}
        </div>
      </div>
      {html ? (
        <iframe
          title={documentTitle}
          className={classNames(
            'marsun-report-html-preview-frame',
            styles['marsun-report-html-preview-frame'],
          )}
          srcDoc={html}
        />
      ) : (
        <Empty
          iconType="simple"
          description={emptyDescription || (loading ? '预览加载中…' : '暂无预览内容')}
        />
      )}
    </main>
  );
};

export default ReportHtmlPreview;
