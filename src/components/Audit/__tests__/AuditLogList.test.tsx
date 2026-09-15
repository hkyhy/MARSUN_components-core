import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuditLogList } from '../AuditLogList';
import type { AuditEventListItem } from '../types';

afterEach(() => {
  cleanup();
});

const row: AuditEventListItem = {
  id: 'e1',
  tenantId: 't1',
  systemAppId: 'equipment-agent',
  traceId: 'tr-1',
  actorName: '张三',
  action: 'alertClaim',
  actionLabel: '认领告警',
  category: 'OPERATION',
  httpMethod: 'POST',
  summary: '认领告警摘要',
  status: 'success',
  path: '/api/x',
  durationMs: 10,
  hasSteps: true,
  createdAt: '2026-09-11T02:53:53.476Z',
};

describe('AuditLogList', () => {
  it('formats time and shows Chinese action/status', () => {
    render(<AuditLogList mode="app" dataSource={[row]} />);
    expect(screen.getByText('认领告警')).toBeInTheDocument();
    expect(screen.getByText('成功')).toBeInTheDocument();
    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.getByText('业务操作')).toBeInTheDocument();
    expect(screen.queryByText('2026-09-11T02:53:53.476Z')).not.toBeInTheDocument();
    expect(screen.getByText(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)).toBeInTheDocument();
  });

  it('falls back to action code when actionLabel missing', () => {
    const bare = { ...row, actionLabel: null, summary: null };
    render(<AuditLogList mode="app" dataSource={[bare]} />);
    expect(screen.getByText('alertClaim')).toBeInTheDocument();
  });

  it('shows dash for empty actor', () => {
    render(<AuditLogList mode="app" dataSource={[{ ...row, actorName: null }]} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('platform mode shows system column', () => {
    render(<AuditLogList mode="platform" dataSource={[row]} />);
    expect(screen.getAllByText('系统').length).toBeGreaterThan(0);
    expect(screen.getByText('equipment-agent')).toBeInTheDocument();
  });

  it('calls onRowClick', () => {
    const onRowClick = vi.fn();
    const { container } = render(
      <AuditLogList mode="app" dataSource={[row]} onRowClick={onRowClick} />,
    );
    const dataRow = container.querySelector('tbody tr.ant-table-row');
    expect(dataRow).toBeTruthy();
    fireEvent.click(dataRow!);
    expect(onRowClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'e1' }));
  });

  it('has no expand affordance', () => {
    const { container } = render(<AuditLogList mode="app" dataSource={[row]} />);
    expect(container.querySelector('.ant-table-row-expand-icon')).toBeNull();
  });
});
