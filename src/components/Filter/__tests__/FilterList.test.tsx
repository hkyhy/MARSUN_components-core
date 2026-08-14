import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FilterList from '../FilterList';

const OPTIONS = [
  { label: '待处理', value: 'pending' },
  { label: '已完成', value: 'done' },
];

describe('FilterList', () => {
  it('renders popover trigger label', () => {
    render(<FilterList filterKey="s" label="状态" options={OPTIONS} />);
    expect(screen.getByText('状态')).toBeInTheDocument();
  });

  it('renders inline tags', () => {
    render(
      <FilterList filterKey="s" label="状态" mode="inline" options={OPTIONS} value="pending" />,
    );
    expect(screen.getByText('待处理')).toBeInTheDocument();
    expect(screen.getByText('已完成')).toBeInTheDocument();
  });
});
