import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SEMANTIC_COLORS } from '../SemanticTag';
import TagGroup from '../TagGroup';

describe('TagGroup', () => {
  it('renders empty placeholder when items is empty', () => {
    render(<TagGroup items={[]} empty="暂无" />);
    expect(screen.getByText('暂无')).toBeInTheDocument();
  });

  it('renders null when items is empty and empty is null', () => {
    const { container } = render(<TagGroup items={[]} empty={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders all items', () => {
    render(
      <TagGroup
        items={[
          { key: 'a', label: '槽位A' },
          { key: 'b', label: '槽位B', color: SEMANTIC_COLORS.WARNING },
        ]}
      />,
    );
    expect(screen.getByText('槽位A')).toBeInTheDocument();
    expect(screen.getByText('槽位B')).toBeInTheDocument();
  });

  it('calls onItemClick with the item', () => {
    const onItemClick = vi.fn();
    const items = [
      { key: 'a', label: '槽位A' },
      { key: 'b', label: '槽位B', selected: true },
    ];
    const { container } = render(<TagGroup items={items} onItemClick={onItemClick} />);
    const tag = container.querySelectorAll('.ant-tag')[1];
    expect(tag).toBeTruthy();
    fireEvent.click(tag!);
    expect(onItemClick).toHaveBeenCalledTimes(1);
    expect(onItemClick.mock.calls[0]?.[0]).toMatchObject({ key: 'b', label: '槽位B' });
  });

  it('does not call onItemClick when item is disabled', () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <TagGroup
        items={[{ key: 'a', label: '禁用项', disabled: true }]}
        onItemClick={onItemClick}
      />,
    );
    const tag = container.querySelector('.ant-tag');
    expect(tag).toBeTruthy();
    fireEvent.click(tag!);
    expect(onItemClick).not.toHaveBeenCalled();
  });

  it('renders item with title wrapper for Tooltip', () => {
    const { container } = render(
      <TagGroup items={[{ key: 'a', label: '带提示', title: '上车日：2026-01-01' }]} />,
    );
    expect(container.querySelector('.tag-group-item-wrap')).toBeTruthy();
    expect(screen.getByText('带提示')).toBeInTheDocument();
  });
});
