import { Empty, Typography } from 'antd';
import React, { useMemo } from 'react';
import { LazyBar } from './Chart/createLazyPlot';
import { waterfallChartData } from './detailKpi';
import type { AuditStep } from './types';

export type AuditWaterfallProps = {
  steps: AuditStep[];
  height?: number;
  className?: string;
};

/** 逐步耗时横向 Bar；无耗时 → Empty 诚实 */
export const AuditWaterfall: React.FC<AuditWaterfallProps> = ({
  steps,
  height = 280,
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
      <LazyBar
        height={height}
        data={data}
        xField="durationMs"
        yField="title"
        legend={false}
        axis={{
          x: { title: 'ms' },
          y: { title: false },
        }}
        tooltip={{
          title: (d: { title?: string }) => d.title,
          items: [{ field: 'durationMs', name: '耗时(ms)' }],
        }}
      />
    </div>
  );
};

export default AuditWaterfall;
