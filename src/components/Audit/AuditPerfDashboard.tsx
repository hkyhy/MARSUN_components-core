import { StatCardList, type StatItem } from '@/components/Stat';
import { Alert, Card, Col, Collapse, Empty, Row, Space, Typography } from 'antd';
import React, { useMemo, useState } from 'react';
import { LazyColumn, LazyLine } from './Chart/createLazyPlot';
import { displayActionLabel } from './labels';
import type { AuditDashboardData } from './types';

/** 图表系列名用中文，避免 tooltip/轴露出英文字段名 */
const Y_EVENT_COUNT = '事件数';
const Y_AVG_MS = '平均耗时毫秒';

export type AuditPerfDashboardProps = {
  data: AuditDashboardData | null;
  loading?: boolean;
  error?: string | null;
  className?: string;
  /** 图表高度 */
  chartHeight?: number;
  /** 默认是否展开；默认收起 */
  defaultOpen?: boolean;
  /** 展开/收起；父页可在 open=true 时懒拉 dashboard */
  onOpenChange?: (open: boolean) => void;
};

function DashboardBody({
  data,
  loading,
  error,
  chartHeight,
}: {
  data: AuditDashboardData | null;
  loading?: boolean;
  error?: string | null;
  chartHeight: number;
}) {
  const daily = useMemo(
    () =>
      (data?.daily || []).map((d) => ({
        day: d.day,
        [Y_EVENT_COUNT]: d.count,
        [Y_AVG_MS]: d.avgDurationMs ?? 0,
      })),
    [data],
  );
  const top = useMemo(
    () =>
      (data?.topActions || []).map((t) => ({
        label: displayActionLabel(t.action, t.actionLabel),
        [Y_EVENT_COUNT]: t.count,
      })),
    [data],
  );

  const kpiItems = useMemo((): StatItem[] => {
    if (!data) return [];
    return [
      {
        title: '有数据天数',
        value: daily.length,
        tone: 'blue',
        color: '#1677ff',
      },
      {
        title: '上榜动作数',
        value: top.length,
        tone: 'mint',
        color: '#0d9f8a',
      },
    ];
  }, [daily.length, data, top.length]);

  if (error) {
    return <Alert type="error" showIcon message={error} />;
  }
  if (loading) {
    return <Typography.Text type="secondary">加载中…</Typography.Text>;
  }
  if (!data) {
    return <Empty description="暂无大盘数据" />;
  }
  if (daily.length === 0 && top.length === 0) {
    return <Empty description="所选时间窗无事件" />;
  }

  const hasAvg = daily.some((d) => Number(d[Y_AVG_MS]) > 0);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Typography.Text type="secondary">
        {data.from.slice(0, 10)} ~ {data.to.slice(0, 10)} · 前 {data.topN} 名动作 · 跨度上限{' '}
        {data.maxRangeDays} 天
      </Typography.Text>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card size="small" title="日事件量">
            {daily.length === 0 ? (
              <Empty description="无趋势" />
            ) : (
              <LazyLine
                height={chartHeight}
                data={daily}
                xField="day"
                yField={Y_EVENT_COUNT}
                legend={false}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card size="small" title="动作排名">
            {top.length === 0 ? (
              <Empty description="无排名数据" />
            ) : (
              <LazyColumn
                height={chartHeight}
                data={top}
                xField="label"
                yField={Y_EVENT_COUNT}
                legend={false}
              />
            )}
          </Card>
        </Col>
      </Row>
      {hasAvg ? (
        <Card size="small" title="日均耗时（毫秒）">
          <LazyLine
            height={220}
            data={daily.filter((d) => Number(d[Y_AVG_MS]) > 0)}
            xField="day"
            yField={Y_AVG_MS}
            legend={false}
          />
        </Card>
      ) : null}
      <StatCardList items={kpiItems} inline fontSize={18} gutter={[12, 8]} />
    </Space>
  );
}

/** 多日趋势 + 动作排名；默认收起；数据窗 ≤14 天由 API 门禁 */
export const AuditPerfDashboard: React.FC<AuditPerfDashboardProps> = ({
  data,
  loading,
  error,
  className,
  chartHeight = 280,
  defaultOpen = false,
  onOpenChange,
}) => {
  const [activeKeys, setActiveKeys] = useState<string[]>(defaultOpen ? ['perf'] : []);

  return (
    <Collapse
      className={className}
      activeKey={activeKeys}
      onChange={(keys) => {
        const next = (Array.isArray(keys) ? keys : keys ? [keys] : []).map(String);
        setActiveKeys(next);
        onOpenChange?.(next.includes('perf'));
      }}
      items={[
        {
          key: 'perf',
          label: '性能大盘',
          children: (
            <DashboardBody data={data} loading={loading} error={error} chartHeight={chartHeight} />
          ),
        },
      ]}
    />
  );
};

export default AuditPerfDashboard;
