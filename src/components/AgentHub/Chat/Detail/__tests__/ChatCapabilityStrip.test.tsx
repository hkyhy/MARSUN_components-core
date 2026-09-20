import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ChatCapabilityStrip from '../ChatCapabilityStrip';

const CAPABILITIES = [
  {
    id: 'indicator',
    label: '指标时序',
    examples: ['样例 A', '样例 B'],
  },
  {
    id: 'alert_records',
    label: '预警落库',
    examples: ['预警样例'],
  },
] as const;

describe('ChatCapabilityStrip', () => {
  it('toggles expanded capability and selects example', () => {
    const onExpandedChange = vi.fn();
    const onSelectExample = vi.fn();

    const { rerender } = render(
      <ChatCapabilityStrip
        capabilities={CAPABILITIES}
        expandedId="indicator"
        onExpandedChange={onExpandedChange}
        onSelectExample={onSelectExample}
      />,
    );

    expect(screen.getByText('样例 A')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /预警落库/ }));
    expect(onExpandedChange).toHaveBeenCalledWith('alert_records');

    rerender(
      <ChatCapabilityStrip
        capabilities={CAPABILITIES}
        expandedId="alert_records"
        onExpandedChange={onExpandedChange}
        onSelectExample={onSelectExample}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '预警样例' }));
    expect(onSelectExample).toHaveBeenCalledWith('预警样例');
  });
});
