import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import Alert from '../Alert';

describe('Alert', () => {
  it('renders message and description', () => {
    render(<Alert type="info" message="主文案" description="补充说明" />);
    expect(screen.getByText('主文案')).toBeInTheDocument();
    expect(screen.getByText('补充说明')).toBeInTheDocument();
  });

  it('hides icon when showIcon is false', () => {
    const { container } = render(<Alert type="warning" message="无图标" showIcon={false} />);
    expect(container.querySelector('.marsun-alert-icon')).toBeNull();
  });

  it('closes when closable and close clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Alert type="error" message="可关闭" closable onClose={onClose} />,
    );
    fireEvent.click(screen.getByRole('button', { name: '关闭' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.marsun-alert')).toBeNull();
  });
});
