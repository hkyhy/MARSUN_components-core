import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StatCard from '../StatCard';

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="总文件" value={42} />);
    expect(screen.getByText('总文件')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders with custom color', () => {
    render(<StatCard title="待审核" value={5} color="#ff0000" />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders inline mode without Card', () => {
    const { container } = render(<StatCard title="统计" value={10} inline />);
    expect(container.querySelector('.ant-card')).not.toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<StatCard title="点击" value={1} onClick={onClick} />);
    fireEvent.click(screen.getByText('1'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
