import { DispositionBar } from '@/components';
import { Button } from 'antd';
import React from 'react';

/** 有 lead：左侧预警摘要，不渲染「处置状态」label */
const LeadSummaryDemo: React.FC = () => (
  <DispositionBar
    lead={
      <>
        <span>报警</span>
        {' · '}用能 EI · 2026-09-18 · 值 42.1
      </>
    }
    statusBadge="未处置"
    actions={
      <>
        <Button type="primary" size="small">
          认领
        </Button>
        <Button size="small">下发任务</Button>
        <Button size="small">关闭/暂缓</Button>
      </>
    }
  />
);

export default LeadSummaryDemo;
