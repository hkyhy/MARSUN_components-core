import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatCardList from '../StatCardList';

describe('StatCardList', () => {
  it('renders all items', () => {
    const items = [
      { title: '总文件', value: 10 },
      { title: '待审核', value: 5 },
    ];
    render(<StatCardList items={items} />);
    expect(screen.getByText('总文件')).toBeInTheDocument();
    expect(screen.getByText('待审核')).toBeInTheDocument();
  });

  it('hides items with hidden=true', () => {
    const items = [
      { title: '可见', value: 1 },
      { title: '隐藏', value: 2, hidden: true },
    ];
    render(<StatCardList items={items} />);
    expect(screen.getByText('可见')).toBeInTheDocument();
    expect(screen.queryByText('隐藏')).not.toBeInTheDocument();
  });

  it('renders inline mode for all items', () => {
    const items = [{ title: '统计', value: 100 }];
    const { container } = render(<StatCardList items={items} inline />);
    expect(container.querySelector('.ant-card')).not.toBeInTheDocument();
  });
});
