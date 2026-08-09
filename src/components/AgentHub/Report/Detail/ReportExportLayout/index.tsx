import { useCallback, useEffect, useState, type ReactNode } from 'react';
import classNames from 'classnames';
import type { ReportExportApi, ReportVersionItem } from '../../types';
import ReportArchiveModal from '../ReportArchiveModal';
import ReportHtmlPreview from '../ReportHtmlPreview';
import ReportVersionList from '../ReportVersionList';
import styles from './style.module.scss';

export type ReportExportLayoutProps = {
  reportId: string;
  /** 注入 API；不传时需自行控制 versions/html（受控） */
  api?: ReportExportApi;
  archivedBy: string;
  snapshot?: unknown;
  eventSource?: string;
  eventLabel?: string;
  documentTitle?: string;
  metaLabel?: string;
  summary?: string;
  /** 受控：版本列表（优先于 api 拉取结果展示时可合并） */
  versions?: ReportVersionItem[];
  /** 受控预览 HTML；若提供则不自动用 api 覆盖，除非 refresh */
  html?: string;
  formatTime?: (value: string) => string;
  onError?: (message: string) => void;
  onArchived?: () => void;
  /** 页头操作区外的额外内容（如返回按钮所在页壳） */
  toolbarExtra?: ReactNode;
  className?: string;
  /** 打开归档弹窗的外部控制；默认内部「归档」由业务页头触发时用 openArchive / onOpenArchiveChange */
  archiveOpen?: boolean;
  onArchiveOpenChange?: (open: boolean) => void;
};

/**
 * 报告导出工作台：左版本列表 + 右 HTML 预览 + 可选 api 编排。
 * 纯 UI：无硬编码 `/api`；归档人由 props 传入。
 */
const ReportExportLayout: React.FC<ReportExportLayoutProps> = ({
  reportId,
  api,
  archivedBy,
  snapshot,
  eventSource,
  eventLabel,
  documentTitle = '报告预览',
  metaLabel,
  summary,
  versions: versionsProp,
  html: htmlProp,
  formatTime,
  onError,
  onArchived,
  className,
  archiveOpen: archiveOpenProp,
  onArchiveOpenChange,
}) => {
  const [versionsInner, setVersionsInner] = useState<ReportVersionItem[]>([]);
  const [htmlInner, setHtmlInner] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [archiveOpenInner, setArchiveOpenInner] = useState(false);

  const versions = versionsProp ?? versionsInner;
  const html = htmlProp ?? htmlInner;
  const archiveOpen = archiveOpenProp ?? archiveOpenInner;

  const setArchiveOpen = (open: boolean) => {
    onArchiveOpenChange?.(open);
    if (archiveOpenProp === undefined) setArchiveOpenInner(open);
  };

  const loadVersions = useCallback(async () => {
    if (!api || versionsProp) return;
    try {
      const list = await api.fetchVersions(reportId);
      setVersionsInner(list || []);
    } catch (e) {
      onError?.(e instanceof Error ? e.message : '归档历史加载失败');
    }
  }, [api, reportId, versionsProp, onError]);

  const loadPreview = useCallback(async () => {
    if (!api) return;
    setPreviewLoading(true);
    try {
      const res = await api.fetchPreviewHtml(reportId, snapshot);
      setHtmlInner(res?.html || '');
    } catch (e) {
      onError?.(e instanceof Error ? e.message : '预览加载失败');
      setHtmlInner('');
    } finally {
      setPreviewLoading(false);
    }
  }, [api, reportId, snapshot, onError]);

  useEffect(() => {
    if (!reportId || !api) return;
    void loadVersions();
    if (htmlProp === undefined) void loadPreview();
  }, [reportId, api, loadVersions, loadPreview, htmlProp]);

  const handleArchive = async () => {
    if (!api) return;
    if (!archivedBy.trim()) {
      onError?.('无法识别归档人');
      return;
    }
    setBusy(true);
    try {
      await api.archive({
        reportId,
        archivedBy: archivedBy.trim(),
        snapshot,
        eventSource,
        eventLabel,
      });
      setArchiveOpen(false);
      onArchived?.();
      await loadVersions();
    } catch (e) {
      onError?.(e instanceof Error ? e.message : '归档失败');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={classNames(
        'marsun-report-export-layout',
        styles['marsun-report-export-layout'],
        className,
      )}
    >
      <ReportVersionList items={versions} formatTime={formatTime} />
      <ReportHtmlPreview
        html={html}
        loading={previewLoading}
        documentTitle={documentTitle}
        onRefresh={api ? () => void loadPreview() : undefined}
      />
      <ReportArchiveModal
        open={archiveOpen}
        archivedBy={archivedBy}
        summary={summary}
        metaLabel={metaLabel}
        busy={busy}
        onCancel={() => setArchiveOpen(false)}
        onConfirm={() => void handleArchive()}
      />
    </div>
  );
};

export default ReportExportLayout;
