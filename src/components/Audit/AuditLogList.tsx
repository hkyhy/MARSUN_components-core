import { CommonDescriptions } from '@/components/Descriptions';
import InfoPage, { Flow } from '@/components/InfoPage';
import { Table } from '@/components/Table';
import { SEMANTIC_COLORS, SemanticTag } from '@/components/Tag';
import { VirtualScrollbar } from '@/components/VirtualScrollbar';
import { copyText } from '@/utils/copyText';
import { Button, Empty, Space, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { formatAuditJson, isTruncatedAuditText } from './formatAuditJson';
import { buildAuditReplayCurl, readBrowserReplaySession } from './formatAuditCurl';
import styles from './style.module.scss';
import type { AuditEventDetail, AuditEventListItem, AuditStep } from './types';

export type AuditLogListMode = 'app' | 'platform';

export type AuditLogListProps = {
  mode?: AuditLogListMode;
  dataSource: AuditEventListItem[];
  loading?: boolean;
  /** 点击行（进详情页） */
  onRowClick?: (row: AuditEventListItem) => void;
  filterSlot?: React.ReactNode;
  pagination?: false | object;
  className?: string;
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

function stepFlowStatus(s: AuditStep): string {
  if (s.stepType === 'ERROR' || s.status === 'error') return 'error';
  if (s.status === 'process' || s.status === 'processing') return 'process';
  if (s.status === 'wait') return 'wait';
  return 'finish';
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

export const AuditStepContent: React.FC<{ step: AuditStep }> = ({ step }) => {
  const httpStatus = parseHttpStatus(step.output);
  return (
    <div className={styles.stepBody}>
      <div className={styles.stepMeta}>
        {step.stepType ? (
          <SemanticTag color={SEMANTIC_COLORS.DEFAULT}>{step.stepType}</SemanticTag>
        ) : null}
        {httpStatus != null ? (
          <SemanticTag color={httpStatusColor(httpStatus)}>HTTP {httpStatus}</SemanticTag>
        ) : null}
        {step.occurredAt ? (
          <Typography.Text type="secondary">{formatCreatedAt(step.occurredAt)}</Typography.Text>
        ) : null}
        {typeof step.durationMs === 'number' ? (
          <Typography.Text type="secondary">{step.durationMs} ms</Typography.Text>
        ) : null}
      </div>
      {step.sqlText ? (
        <>
          <div className={styles.blockLabel}>SQL</div>
          <VirtualScrollbar className={styles.jsonScroll} style={{ maxHeight: 200 }}>
            <pre className={styles.jsonBlock}>{step.sqlText}</pre>
          </VirtualScrollbar>
        </>
      ) : null}
      {step.tables?.length ? (
        <Typography.Text type="secondary">表：{step.tables.join(', ')}</Typography.Text>
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

/** 审计事件详情：InfoPage + CommonDescriptions + Flow */
export const AuditEventDetailView: React.FC<{
  detail: AuditEventDetail | null;
  loading?: boolean;
  emptyDescription?: string;
  className?: string;
  /** 当前登录 token（不含 Bearer 前缀亦可）；复制 curl 用，不落库 */
  getAuthToken?: () => string | null | undefined;
}> = ({ detail, loading, emptyDescription = '暂无明细', className, getAuthToken }) => {
  if (loading) {
    return <Typography.Text type="secondary">加载中…</Typography.Text>;
  }
  if (!detail) {
    return <Empty description={emptyDescription} />;
  }
  const steps = detail.steps || [];
  const title = detail.actionLabel || detail.action;

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
    ...(detail.actionLabel
      ? [{ label: '动作码', value: <Typography.Text code>{detail.action}</Typography.Text> }]
      : []),
  ];

  return (
    <InfoPage className={classNames(styles.detail, className)}>
      <InfoPage.Part
        title={
          <Space size={8} wrap>
            <span>{title}</span>
            {detail.actionLabel ? (
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
        <CommonDescriptions content={descContent} column={3} bordered size="small" />
      </InfoPage.Part>

      <InfoPage.Part title="执行流程" subtitle="请求 → 响应步骤">
        {steps.length === 0 ? (
          <Empty description="无流程步骤" />
        ) : (
          <div className={styles.flowWrap}>
            <Flow
              dataSource={steps.map((s) => ({
                title: s.title || s.stepType,
                description: undefined,
                status: stepFlowStatus(s),
                content: <AuditStepContent step={s} />,
              }))}
            />
          </div>
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
  pagination,
  className,
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
        render: (_: unknown, row) => row.actionLabel || row.action,
      },
      { title: '摘要', dataIndex: 'summary', ellipsis: true },
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
      });
    }
    return cols;
  }, [mode]);

  return (
    <div className={classNames(styles.wrap, className)}>
      {filterSlot ? <div className={styles.filter}>{filterSlot}</div> : null}
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
