import { Empty, Typography } from 'antd';
import React, { useMemo } from 'react';
import { LazyPie } from './Chart/createLazyPlot';
import { waterfallChartData } from './detailKpi';
import type { AuditStep } from './types';

export type AuditStepPerfChartProps = {
  steps: AuditStep[];
  height?: number;
  className?: string;
};

/** 单事件逐步耗时占比（饼图）；无 durationMs → Empty */
export const AuditStepPerfChart: React.FC<AuditStepPerfChartProps> = ({
  steps,
  height = 340,
  className,
}) => {
  const data = useMemo(() => waterfallChartData(steps), [steps]);

  if (data.length === 0) {
    return (
      <Empty
        description={
          <Typography.Text type="secondary">
            无逐步耗时（旧事件未采集 durationMs，不伪造）
          </Typography.Text>
        }
      />
    );
  }

  return (
    <div className={className}>
      <LazyPie
        height={height}
        data={data}
        angleField="durationMs"
        colorField="title"
        radius={0.72}
        // G2/plots v2：按通道配 legend；bottom 避免与 outside 标签叠在顶部
        legend={{
          color: {
            position: 'bottom',
            layout: { justifyContent: 'center', flexWrap: 'wrap' },
          },
        }}
        // 扇区只标耗时；步骤名留给底部 legend，避免长文案顶到图例
        label={{
          text: (d: { durationMs?: number }) => `${d.durationMs ?? 0}ms`,
          position: 'outside',
          style: { fontSize: 11 },
          transform: [{ type: 'overlapHide' }],
        }}
        tooltip={{
          title: (d: { title?: string }) => d?.title ?? '',
          items: [{ field: 'durationMs', name: '耗时(ms)' }],
        }}
        interaction={{
          tooltip: { shared: false },
          elementHighlight: { background: true },
        }}
      />
    </div>
  );
};

export default AuditStepPerfChart;
