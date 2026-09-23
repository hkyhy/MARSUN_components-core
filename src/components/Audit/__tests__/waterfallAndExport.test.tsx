import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuditWaterfall } from '../AuditWaterfall';
import { AuditDayStatsBar } from '../AuditDayStatsBar';

afterEach(() => {
  cleanup();
});

describe('AuditWaterfall empty', () => {
  it('shows honest Empty when no step durationMs', () => {
    render(
      <AuditWaterfall
        steps={[{ seq: 1, stepType: 'SQL', title: 'q', status: 'finish', sqlText: 'SELECT 1' }]}
      />,
    );
    expect(screen.getByText(/不伪造/)).toBeInTheDocument();
  });

  it('renders timing rows with labels outside bars', () => {
    render(
      <AuditWaterfall
        steps={[
          { seq: 1, stepType: 'REQUEST', title: '请求进入', status: 'finish', durationMs: 1 },
          { seq: 2, stepType: 'SQL', title: 'query', status: 'finish', durationMs: 40 },
        ]}
      />,
    );
    expect(screen.getByText('1. 请求进入')).toBeInTheDocument();
    expect(screen.getByText('2. query')).toBeInTheDocument();
    expect(screen.getByText('1 ms')).toBeInTheDocument();
    expect(screen.getByText('40 ms')).toBeInTheDocument();
    expect(screen.getByText('41 ms')).toBeInTheDocument();
    expect(screen.queryByText(/串行切分/)).not.toBeInTheDocument();
  });
});

describe('AuditStepPerfChart empty', () => {
  it('shows honest Empty when no step durationMs', async () => {
    const { AuditStepPerfChart } = await import('../AuditStepPerfChart');
    render(
      <AuditStepPerfChart
        steps={[{ seq: 1, stepType: 'SQL', title: 'q', status: 'finish', sqlText: 'SELECT 1' }]}
      />,
    );
    expect(screen.getByText(/不伪造/)).toBeInTheDocument();
  });
});

describe('AuditDayStatsBar export', () => {
  it('fires onExport and shows error', () => {
    const onExport = vi.fn();
    render(
      <AuditDayStatsBar
        stats={{
          day: '2026-09-18',
          total: 3,
          byStatus: { success: 2, fail: 1 },
          avgDurationMs: 10,
          maxDurationMs: 20,
        }}
        onExport={onExport}
      />,
    );
    screen.getByRole('button', { name: /导出 CSV/ }).click();
    expect(onExport).toHaveBeenCalledOnce();
  });

  it('shows error alert', () => {
    render(<AuditDayStatsBar stats={null} error="汇总失败" />);
    expect(screen.getByText('汇总失败')).toBeInTheDocument();
  });
});
