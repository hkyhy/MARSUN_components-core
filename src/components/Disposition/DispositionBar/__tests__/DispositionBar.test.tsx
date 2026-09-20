import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import DispositionBar from '../index';

afterEach(() => {
  cleanup();
});

describe('DispositionBar', () => {
  it('renders label and status badge', () => {
    render(<DispositionBar statusBadge="未处置" />);
    expect(screen.getByText('处置状态')).toBeInTheDocument();
    expect(screen.getByText('未处置')).toBeInTheDocument();
  });

  it('hides actions when statusLoading', () => {
    render(
      <DispositionBar
        statusBadge="加载中"
        statusLoading
        actions={<button type="button">认领</button>}
      />,
    );
    expect(screen.getByText('加载中')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '认领' })).not.toBeInTheDocument();
  });

  it('shows status area without actions', () => {
    render(<DispositionBar statusBadge="已关闭" />);
    expect(screen.getByRole('group', { name: '处置状态' })).toBeInTheDocument();
    expect(screen.getByText('已关闭')).toBeInTheDocument();
  });

  it('renders actions when not loading', () => {
    render(<DispositionBar statusBadge="跟进中" actions={<button type="button">关闭</button>} />);
    expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument();
  });

  it('with lead: renders summary and omits 处置状态 label', () => {
    render(
      <DispositionBar
        lead="报警 · 用能 EI · 2026-09-18 · 值 42.1"
        statusBadge="未处置"
        actions={<button type="button">认领</button>}
      />,
    );
    expect(screen.queryByText('处置状态')).not.toBeInTheDocument();
    expect(screen.getByText('报警 · 用能 EI · 2026-09-18 · 值 42.1')).toBeInTheDocument();
    expect(screen.getByText('未处置')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '预警摘要' })).toBeInTheDocument();
  });
});
