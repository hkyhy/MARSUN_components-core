import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StateBar from '../StateBar';

describe('StateBar', () => {
  it('renders tabs and fires onChange', () => {
    const onChange = vi.fn();
    render(
      <StateBar
        activeKey="a"
        onChange={onChange}
        stateOption={[
          { key: 'a', tab: '甲' },
          { key: 'b', tab: '乙' },
        ]}
      />,
    );
    expect(screen.getByTestId('components-core-state-bar')).toBeInTheDocument();
    fireEvent.click(screen.getByText('乙'));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('renders Info icon next to tab label when info provided', () => {
    const { container } = render(
      <StateBar
        activeKey="a"
        stateOption={[
          { key: 'a', tab: '甲' },
          {
            key: 'b',
            tab: '乙',
            info: [{ label: '乙', value: '说明乙' }],
          },
        ]}
      />,
    );
    expect(container.querySelector('.marsun-state-bar-info')).toBeInTheDocument();
  });

  it('does not render Info icon when info absent', () => {
    const { container } = render(
      <StateBar
        activeKey="a"
        stateOption={[
          { key: 'a', tab: '甲' },
          { key: 'b', tab: '乙' },
        ]}
      />,
    );
    expect(container.querySelector('.marsun-state-bar-info')).not.toBeInTheDocument();
  });
});
