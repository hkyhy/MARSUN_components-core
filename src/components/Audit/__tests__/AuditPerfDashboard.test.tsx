import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuditPerfDashboard } from '../AuditPerfDashboard';
import type { AuditDashboardData } from '../types';

afterEach(() => {
  cleanup();
});

const sample: AuditDashboardData = {
  from: '2026-09-06T00:00:00.000Z',
  to: '2026-09-20T23:59:59.999Z',
  maxRangeDays: 14,
  topN: 20,
  daily: [
    { day: '2026-09-15', count: 10, avgDurationMs: 100 },
    { day: '2026-09-16', count: 5, avgDurationMs: 80 },
  ],
  topActions: [
    { action: 'alertClaim', actionLabel: null, count: 8, avgDurationMs: 50 },
    { action: 'noSuchAction', actionLabel: null, count: 3, avgDurationMs: 20 },
  ],
};

describe('AuditPerfDashboard', () => {
  it('defaults collapsed and shows Chinese header', () => {
    render(<AuditPerfDashboard data={sample} />);
    expect(screen.getByText('性能大盘')).toBeInTheDocument();
    expect(screen.queryByText('有数据天数')).not.toBeInTheDocument();
    expect(screen.queryByText(/TopN=/)).not.toBeInTheDocument();
  });

  it('expands to Chinese copy, macaron KPI, and action labels', () => {
    const onOpenChange = vi.fn();
    render(<AuditPerfDashboard data={sample} defaultOpen onOpenChange={onOpenChange} />);
    expect(screen.getByText(/前 20 名动作/)).toBeInTheDocument();
    expect(screen.getByText(/跨度上限 14 天/)).toBeInTheDocument();
    expect(screen.getByText('动作排名')).toBeInTheDocument();
    expect(screen.getByText('日均耗时（毫秒）')).toBeInTheDocument();
    expect(screen.getByText('有数据天数')).toBeInTheDocument();
    expect(screen.getByText('上榜动作数')).toBeInTheDocument();
    // Top 柱标签走 displayActionLabel；LazyColumn 在 jsdom 不落轴文，labels 单测另覆盖
    expect(screen.queryByText('日点数')).not.toBeInTheDocument();
    expect(screen.queryByText('Top 动作数')).not.toBeInTheDocument();
  });

  it('calls onOpenChange when toggled', () => {
    const onOpenChange = vi.fn();
    render(<AuditPerfDashboard data={sample} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByText('性能大盘'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
