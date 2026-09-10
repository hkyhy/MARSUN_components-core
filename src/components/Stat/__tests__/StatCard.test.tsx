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

  it('renders suffix and precision', () => {
    const { container } = render(
      <StatCard title="采纳率" value={55.91} precision={1} suffix="%" />,
    );
    expect(container.textContent).toMatch(/55\.9/);
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('wraps string suffix in smaller unit span', () => {
    const { container } = render(<StatCard title="寿命" value={72.5} inline suffix="%" />);
    const unit = container.querySelector('.stat-card-suffix-unit');
    expect(unit).toBeTruthy();
    expect(unit?.textContent).toBe('%');
  });

  it('uses stacked label/value root layout', () => {
    const { container } = render(<StatCard title="节电参考（年化·仅供参考）" value={0} inline />);
    expect(container.querySelector('.stat-card-root')).toBeTruthy();
  });

  it('applies macaron tone background in inline mode', () => {
    const { container } = render(<StatCard title="寿命" value={12} inline tone="rose" />);
    const el = container.querySelector('[data-tone="rose"]') as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.style.background).toBe('#FFEDEF');
  });

  it('explicit style overrides tone background', () => {
    const { container } = render(
      <StatCard title="寿命" value={12} inline tone="rose" style={{ background: '#000000' }} />,
    );
    const el = container.querySelector('[data-tone="rose"]') as HTMLElement;
    expect(el.style.background).toBe('#000000');
  });
});
