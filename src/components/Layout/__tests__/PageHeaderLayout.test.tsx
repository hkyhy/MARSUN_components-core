import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PageHeaderLayout from '../PageHeaderLayout';

describe('PageHeaderLayout', () => {
  it('renders title', () => {
    render(<PageHeaderLayout title="用户管理" />);
    expect(screen.getByText('用户管理')).toBeInTheDocument();
  });

  it('renders back button when onBack provided', () => {
    const onBack = vi.fn();
    render(<PageHeaderLayout title="详情" onBack={onBack} />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('does not render back button when onBack not provided', () => {
    render(<PageHeaderLayout title="详情" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders actions', () => {
    render(<PageHeaderLayout title="管理" actions={<button>新增</button>} />);
    expect(screen.getByRole('button', { name: '新增' })).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<PageHeaderLayout title="管理"><div data-testid="child">Content</div></PageHeaderLayout>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <PageHeaderLayout title="任务管理" description="页面说明文字">
        <div>内容</div>
      </PageHeaderLayout>,
    );
    expect(screen.getByText('页面说明文字')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(<PageHeaderLayout title="任务管理" />);
    expect(screen.queryByText('页面说明文字')).not.toBeInTheDocument();
  });
});
