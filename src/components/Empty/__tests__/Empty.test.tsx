import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import Empty from '../Empty';

describe('Empty', () => {
  it('renders description when provided', () => {
    render(<Empty description="暂无数据" />);
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('does not render description when omitted', () => {
    const { container } = render(<Empty iconType="simple" />);
    expect(container.querySelector('.ant-empty-description')).toBeNull();
  });

  it('hides icon when showIcon is false', () => {
    const { container } = render(<Empty showIcon={false} description="仅文案" />);
    expect(container.querySelector('.ant-empty-image img')).toBeNull();
    expect(container.querySelector('.ant-empty-image svg')).toBeNull();
    expect(screen.getByText('仅文案')).toBeInTheDocument();
  });

  it('renders simple icon preset', () => {
    const { container } = render(<Empty iconType="simple" description="简图空态" />);
    expect(container.querySelector('.ant-empty-image')).not.toBeNull();
    expect(screen.getByText('简图空态')).toBeInTheDocument();
  });
});
