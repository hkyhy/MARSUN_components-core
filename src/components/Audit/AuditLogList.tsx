import { CommonDescriptions } from '@/components/Descriptions';
import InfoPage from '@/components/InfoPage';
import { StatCardList, type StatItem } from '@/components/Stat';
import { Table } from '@/components/Table';
import { SEMANTIC_COLORS, SemanticTag } from '@/components/Tag';
import { VirtualScrollbar } from '@/components/VirtualScrollbar';
import { copyText } from '@/utils/copyText';
import { Button, Collapse, Empty, Space, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { AuditDayStatsBar } from './AuditDayStatsBar';
import { AuditStepPerfChart } from './AuditStepPerfChart';
import { AuditWaterfall } from './AuditWaterfall';
import { computeDetailKpi, isErrorStep } from './detailKpi';
import { formatAuditJson, isTruncatedAuditText } from './formatAuditJson';
import { buildAuditReplayCurl, readBrowserReplaySession } from './formatAuditCurl';
import { displayActionLabel, displaySummary, labelOfAction } from './labels';
import styles from './style.module.scss';
import type { AuditDayStats, AuditEventDetail, AuditEventListItem, AuditStep } from './types';

export type AuditLogListMode = 'app' | 'platform';

export type AuditLogListProps = {
  mode?: AuditLogListMode;
  dataSource: AuditEventListItem[];
  loading?: boolean;
  /** 点击行（进详情页） */
  onRowClick?: (row: AuditEventListItem) => void;
  filterSlot?: React.ReactNode;
  /** 日汇总顶栏 */
  dayStats?: AuditDayStats | null;
  dayStatsLoading?: boolean;
  dayStatsError?: string | null;
  onExport?: () => void;
  exportLoading?: boolean;
  pagination?: false | object;
  className?: string;
  /** platform 系统列：SSO SystemApp.code → name；缺则回落 systemAppId */
  systemAppNames?: Record<string, string>;
};

function formatCreatedAt(iso: string): string {
  const d = dayjs(iso);
  return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : iso;
}

function statusLabel(status: string): string {
  if (status === 'success') return '成功';
  if (status === 'fail' || status === 'error') return '失败';
  return status;
}

function statusColor(status: string): string {
  if (status === 'success') return SEMANTIC_COLORS.SUCCESS;
  if (status === 'fail' || status === 'error') return SEMANTIC_COLORS.DANGER;
  return SEMANTIC_COLORS.DEFAULT;
}

function categoryLabel(c?: string | null): string {
  if (c === 'TRACE') return '请求线路';
  if (c === 'SYSTEM') return '系统';
  if (c === 'OPERATION' || !c) return '业务操作';
  return c;
}

function httpStatusColor(code: number): string {
  if (code >= 500) return SEMANTIC_COLORS.DANGER;
  if (code >= 400) return SEMANTIC_COLORS.WARNING;
  if (code >= 200 && code < 300) return SEMANTIC_COLORS.SUCCESS;
  return SEMANTIC_COLORS.DEFAULT;
}

function parseHttpStatus(output: unknown): number | null {
  if (!output || typeof output !== 'object' || Array.isArray(output)) return null;
  const v = (output as { httpStatus?: unknown }).httpStatus;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (v != null && String(v).trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function showActionCode(detail: AuditEventDetail): boolean {
  return Boolean(detail.actionLabel?.trim()) || Boolean(labelOfAction(detail.action));
}

const JsonBlock: React.FC<{ value: unknown; maxHeight?: number }> = ({
  value,
  maxHeight = 360,
}) => {
  const text = formatAuditJson(value);
  const truncated = isTruncatedAuditText(value) || text.includes('…[truncated]');
  return (
    <div className={styles.jsonWrap}>
      {truncated ? (
        <div className={styles.truncateHint}>内容已截断（采集侧 body 上限），以下为可读展开</div>
      ) : null}
      <VirtualScrollbar className={styles.jsonScroll} style={{ maxHeight }}>
        <pre className={styles.jsonBlock}>{text}</pre>
      </VirtualScrollbar>
    </div>
  );
};

function renderBody(label: string, value: unknown): React.ReactNode {
  if (value == null) return null;
  if (
    label === 'output' &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    value !== null &&
    ('httpStatus' in (value as object) || 'body' in (value as object))
  ) {
    const out = value as { body?: unknown; [k: string]: unknown };
    const rest = { ...out };
    delete rest.httpStatus;
    delete rest.body;
    const hasRest = Object.keys(rest).length > 0;
    return (
      <>
        {out.body !== undefined ? (
          <>
            <div className={styles.blockLabel}>响应体</div>
            <JsonBlock value={out.body} maxHeight={420} />
          </>
        ) : null}
        {hasRest ? (
          <>
            <div className={styles.blockLabel}>其它</div>
            <JsonBlock value={rest} />
          </>
        ) : null}
      </>
    );
  }
  return (
    <>
      <div className={styles.blockLabel}>{label}</div>
      <JsonBlock value={value} />
    </>
  );
}

function stepTypeTagColor(stepType: string): string {
  const t = stepType.toUpperCase();
  if (t === 'SQL') return SEMANTIC_COLORS.CYAN;
  if (t === 'ERROR') return SEMANTIC_COLORS.DANGER;
  if (t === 'RESPONSE') return SEMANTIC_COLORS.SUCCESS;
  if (t === 'REQUEST') return SEMANTIC_COLORS.DEFAULT;
  if (t === 'AUTH' || t === 'UPSTREAM') return SEMANTIC_COLORS.WARNING;
  return SEMANTIC_COLORS.INFO;
}

/** Collapse header：类型 / HTTP / 耗时 / 表 / 失败 — 折叠态也可见 */
export const AuditStepHeader: React.FC<{ step: AuditStep }> = ({ step }) => {
  const httpStatus = parseHttpStatus(step.output);
  const tables = step.tables?.filter(Boolean) ?? [];
  return (
    <div className={styles.stepHeader}>
      <span className={styles.stepHeaderTitle}>{step.title || step.stepType}</span>
      {step.stepType ? (
        <SemanticTag color={stepTypeTagColor(String(step.stepType))}>{step.stepType}</SemanticTag>
      ) : null}
      {httpStatus != null ? (
        <SemanticTag color={httpStatusColor(httpStatus)}>HTTP {httpStatus}</SemanticTag>
      ) : null}
      {typeof step.durationMs === 'number' ? (
        <SemanticTag color={SEMANTIC_COLORS.DEFAULT}>{step.durationMs} ms</SemanticTag>
      ) : null}
      {tables.length > 0 ? (
        <SemanticTag color={SEMANTIC_COLORS.INFO}>表：{tables.join(', ')}</SemanticTag>
      ) : null}
      {step.sqlText && String(step.stepType).toUpperCase() !== 'SQL' ? (
        <SemanticTag color={SEMANTIC_COLORS.CYAN}>SQL</SemanticTag>
      ) : null}
      {isErrorStep(step) ? <SemanticTag color={SEMANTIC_COLORS.DANGER}>失败</SemanticTag> : null}
    </div>
  );
};

export const AuditStepContent: React.FC<{ step: AuditStep }> = ({ step }) => {
  return (
    <div className={styles.stepBody}>
      {step.occurredAt ? (
        <Typography.Text type="secondary">{formatCreatedAt(step.occurredAt)}</Typography.Text>
      ) : null}
      {step.sqlText ? (
        <>
          <div className={styles.blockLabel}>SQL</div>
          <VirtualScrollbar className={styles.jsonScroll} style={{ maxHeight: 200 }}>
            <pre className={styles.jsonBlock}>{step.sqlText}</pre>
          </VirtualScrollbar>
        </>
      ) : null}
      {step.errorMessage ? (
        <Typography.Text type="danger">{step.errorMessage}</Typography.Text>
      ) : null}
      {step.errorCode ? (
        <Typography.Text type="secondary">错误码：{step.errorCode}</Typography.Text>
      ) : null}
      {step.input != null ? renderBody('请求体', step.input) : null}
      {step.output != null ? renderBody('output', step.output) : null}
    </div>
  );
};

/** 审计事件详情：KPI + Lazy 瀑布 + 默认折叠 Flow */
export const AuditEventDetailView: React.FC<{
  detail: AuditEventDetail | null;
  loading?: boolean;
  emptyDescription?: string;
  className?: string;
  /** 当前登录 token（不含 Bearer 前缀亦可）；复制 curl 用，不落库 */
  getAuthToken?: () => string | null | undefined;
}> = ({ detail, loading, emptyDescription = '暂无明细', className, getAuthToken }) => {
  const kpi = useMemo(() => computeDetailKpi(detail), [detail]);
  const kpiItems = useMemo((): StatItem[] => {
    const slow =
      kpi.slowestStep != null ? `${kpi.slowestStep.title} (${kpi.slowestStep.durationMs}ms)` : '—';
    return [
      {
        title: '总耗时',
        value: kpi.durationMs ?? '—',
        suffix: kpi.durationMs != null ? 'ms' : undefined,
        tone: 'blue',
        color: '#1677ff',
      },
      { title: '步数', value: kpi.stepCount, tone: 'lilac', color: '#722ed1' },
      { title: 'SQL 步', value: kpi.sqlCount, tone: 'mint', color: '#0d9f8a' },
      { title: '最慢步', value: slow, tone: 'peach', color: '#d46b08' },
    ];
  }, [kpi]);

  if (loading) {
    return <Typography.Text type="secondary">加载中…</Typography.Text>;
  }
  if (!detail) {
    return <Empty description={emptyDescription} />;
  }

  const steps = detail.steps || [];
  const title = displayActionLabel(detail.action, detail.actionLabel);
  const errorKeys = steps
    .map((s, i) => (isErrorStep(s) ? String(i) : null))
    .filter((k): k is string => k != null);

  const descContent = [
    {
      label: '操作人',
      value: detail.actorName?.trim() ? detail.actorName : '—',
    },
    { label: '时间', value: formatCreatedAt(detail.createdAt) },
    {
      label: '方法',
      value: detail.httpMethod?.trim() ? detail.httpMethod : '—',
    },
    {
      label: '状态',
      value: (
        <SemanticTag color={statusColor(detail.status)}>{statusLabel(detail.status)}</SemanticTag>
      ),
    },
    {
      label: '类别',
      value: detail.category ? categoryLabel(detail.category) : '—',
    },
    {
      label: '耗时',
      value: typeof detail.durationMs === 'number' ? `${detail.durationMs} ms` : '—',
    },
    {
      label: '路径',
      value: detail.path?.trim() ? (
        <Typography.Text code copyable={{ text: detail.path }}>
          {detail.path}
        </Typography.Text>
      ) : (
        '—'
      ),
      span: 2,
    },
    {
      label: 'traceId',
      value: detail.traceId ? (
        <Typography.Text copyable={{ text: detail.traceId }}>{detail.traceId}</Typography.Text>
      ) : (
        '—'
      ),
      span: 1,
    },
    ...(showActionCode(detail)
      ? [{ label: '动作码', value: <Typography.Text code>{detail.action}</Typography.Text> }]
      : []),
  ];

  return (
    <InfoPage className={classNames(styles.detail, className)}>
      <InfoPage.Part
        title={
          <Space size={8} wrap>
            <span>{title}</span>
            {title !== detail.action ? (
              <Typography.Text type="secondary" className={styles.actionCode}>
                {detail.action}
              </Typography.Text>
            ) : null}
          </Space>
        }
        subtitle="事件摘要"
        extra={
          detail.path || detail.requestCurl ? (
            <Button
              size="small"
              type="primary"
              onClick={async () => {
                try {
                  const text = buildAuditReplayCurl(detail, readBrowserReplaySession(getAuthToken));
                  const ok = await copyText(text);
                  if (ok) message.success('已复制 curl');
                  else message.error('复制失败');
                } catch (e) {
                  message.error(e instanceof Error ? e.message : '无法生成 curl');
                }
              }}
            >
              复制 curl
            </Button>
          ) : undefined
        }
      >
        <div className={styles.kpiBlock}>
          <StatCardList items={kpiItems} inline fontSize={20} gutter={[12, 8]} />
        </div>
        <CommonDescriptions content={descContent} column={3} bordered size="small" />
      </InfoPage.Part>

      <InfoPage.Part title="耗时瀑布">
        <AuditWaterfall steps={steps} />
      </InfoPage.Part>

      <InfoPage.Part title="性能分析">
        <AuditStepPerfChart steps={steps} />
      </InfoPage.Part>

      <InfoPage.Part title="执行流程">
        {detail.stepsTruncated ? (
          <div className={styles.truncateNote}>
            步骤已截断：展示 {steps.length} / {detail.stepsTotal ?? steps.length}
          </div>
        ) : null}
        {steps.length === 0 ? (
          <Empty description="无流程步骤" />
        ) : (
          <Collapse
            defaultActiveKey={errorKeys}
            items={steps.map((s, i) => ({
              key: String(i),
              label: <AuditStepHeader step={s} />,
              children: <AuditStepContent step={s} />,
            }))}
          />
        )}
      </InfoPage.Part>
    </InfoPage>
  );
};

export const AuditLogList: React.FC<AuditLogListProps> = ({
  mode = 'app',
  dataSource,
  loading,
  onRowClick,
  filterSlot,
  dayStats,
  dayStatsLoading,
  dayStatsError,
  onExport,
  exportLoading,
  pagination,
  className,
  systemAppNames,
}) => {
  const columns: ColumnsType<AuditEventListItem> = useMemo(() => {
    const cols: ColumnsType<AuditEventListItem> = [
      {
        title: '时间',
        dataIndex: 'createdAt',
        width: 180,
        render: (v: string) => formatCreatedAt(v),
      },
      {
        title: '类别',
        dataIndex: 'category',
        width: 96,
        render: (v: string | undefined) => categoryLabel(v),
      },
      {
        title: '方法',
        dataIndex: 'httpMethod',
        width: 72,
        render: (v: string | null | undefined) => (v && String(v).trim() ? v : '—'),
      },
      {
        title: '操作人',
        dataIndex: 'actorName',
        width: 100,
        ellipsis: true,
        render: (v: string | null | undefined) => (v && String(v).trim() ? v : '—'),
      },
      {
        title: '动作',
        dataIndex: 'action',
        width: 160,
        ellipsis: true,
        render: (_: unknown, row) => displayActionLabel(row.action, row.actionLabel),
      },
      {
        title: '摘要',
        dataIndex: 'summary',
        ellipsis: true,
        render: (_: unknown, row) =>
          displaySummary(row.summary, displayActionLabel(row.action, row.actionLabel), {
            httpMethod: row.httpMethod,
            path: row.path,
          }),
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 90,
        render: (v: string) => <SemanticTag color={statusColor(v)}>{statusLabel(v)}</SemanticTag>,
      },
      { title: '耗时ms', dataIndex: 'durationMs', width: 80 },
      { title: '路径', dataIndex: 'path', ellipsis: true },
    ];
    if (mode === 'platform') {
      cols.splice(2, 0, {
        title: '系统',
        dataIndex: 'systemAppId',
        width: 140,
        ellipsis: true,
        render: (v: string) => {
          const id = v && String(v).trim() ? String(v) : '';
          if (!id) return '—';
          const name = systemAppNames?.[id]?.trim();
          return name || id;
        },
      });
    }
    return cols;
  }, [mode, systemAppNames]);

  return (
    <div className={classNames(styles.wrap, className)}>
      {filterSlot ? <div className={styles.filter}>{filterSlot}</div> : null}
      {dayStats !== undefined || onExport ? (
        <AuditDayStatsBar
          stats={dayStats ?? null}
          loading={dayStatsLoading}
          error={dayStatsError}
          onExport={onExport}
          exportLoading={exportLoading}
        />
      ) : null}
      <Table<AuditEventListItem>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination === undefined ? false : pagination}
        onRow={
          onRowClick
            ? (record) => ({
                onClick: () => onRowClick(record),
                style: { cursor: 'pointer' },
              })
            : undefined
        }
      />
    </div>
  );
};

export default AuditLogList;
