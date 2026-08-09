import {
  ReportExportLayout,
  type ReportExportApi,
  type ReportVersionItem,
} from '@/components/AgentHub/Report';
import { Button, message } from 'antd';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import styles from './style.module.scss';

const MOCK_HTML = `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:24px">
<h1>质量对比分析报告</h1>
<p>分析编号：demo-report-001 · 一分厂 · 条干CV%</p>
<div style="background:#f0f9ff;padding:12px;border-radius:8px"><h2>根因结论</h2><p>Mock 预览内容。</p></div>
</body></html>`;

const initialVersions: ReportVersionItem[] = [
  { id: 'v1', at: '2026-08-07T18:01:35', by: '系统管理员' },
  { id: 'v2', at: '2026-08-06 09:12:00', by: '工艺员' },
];

/** ReportExportLayout + api DI Demo（无真实后端） */
const ReportExportLayoutDemo: React.FC = () => {
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [versions, setVersions] = useState(initialVersions);

  const api = useMemo<ReportExportApi>(
    () => ({
      fetchVersions: async () => versions,
      fetchPreviewHtml: async () => ({ html: MOCK_HTML }),
      archive: async ({ archivedBy }) => {
        setVersions((prev) => [
          { id: `v${Date.now()}`, at: new Date().toISOString(), by: archivedBy },
          ...prev,
        ]);
        message.success('已归档（Demo）');
      },
    }),
    [versions],
  );

  return (
    <div
      className={classNames(
        'marsun-report-export-layout-demo',
        styles['marsun-report-export-layout-demo'],
      )}
    >
      <div className={styles['marsun-report-export-layout-demo-toolbar']}>
        <Button type="primary" onClick={() => setArchiveOpen(true)}>
          归档
        </Button>
      </div>
      <ReportExportLayout
        reportId="demo-report-001"
        api={api}
        archivedBy="系统管理员"
        documentTitle="质量对比分析报告"
        metaLabel="一分厂 · 条干CV% · 对比分析"
        summary="Mock 根因结论摘要"
        archiveOpen={archiveOpen}
        onArchiveOpenChange={setArchiveOpen}
        onError={(m) => message.error(m)}
      />
    </div>
  );
};

export default ReportExportLayoutDemo;
