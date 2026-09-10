import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DrillNav from '../index';

afterEach(() => {
  cleanup();
});

describe('DrillNav', () => {
  it('highlights current step', () => {
    render(
      <DrillNav
        steps={[
          { id: 'a', label: '工厂A' },
          { id: 'b', label: '工序A' },
        ]}
        currentId="b"
      />,
    );
    expect(screen.getByText('工序A').closest('button')).toHaveAttribute('aria-current', 'step');
  });

  it('done step is clickable', () => {
    const onClick = vi.fn();
    render(
      <DrillNav
        steps={[
          { id: 'a', label: '工厂B', onClick },
          { id: 'b', label: '工序B' },
        ]}
        currentId="b"
      />,
    );
    fireEvent.click(screen.getByText('工厂B'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('future step is disabled', () => {
    render(
      <DrillNav
        steps={[
          { id: 'a', label: '工厂C' },
          { id: 'b', label: '工序C' },
          { id: 'c', label: '机台C' },
        ]}
        currentId="a"
      />,
    );
    expect(screen.getByText('工序C').closest('button')).toBeDisabled();
    expect(screen.getByText('机台C').closest('button')).toBeDisabled();
  });

  it('omits back button when backLabel/onBack missing', () => {
    render(<DrillNav steps={[{ id: 'a', label: '工厂D' }]} currentId="a" />);
    expect(screen.queryByRole('button', { name: /返回/ })).not.toBeInTheDocument();
  });

  it('renders back button when backLabel and onBack provided', () => {
    const onBack = vi.fn();
    render(
      <DrillNav
        steps={[{ id: 'a', label: '工厂E' }]}
        currentId="a"
        backLabel="返回上一级"
        onBack={onBack}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /返回上一级/ }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
