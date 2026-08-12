import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SegmentedRadio from '../SegmentedRadio';

describe('SegmentedRadio', () => {
  it('renders button-solid group and fires onChange with value', () => {
    const onChange = vi.fn();
    render(
      <SegmentedRadio
        value="a"
        onChange={onChange}
        options={[
          { label: '甲', value: 'a' },
          { label: '乙', value: 'b' },
        ]}
      />,
    );
    expect(screen.getByTestId('components-core-segmented-radio')).toBeInTheDocument();
    fireEvent.click(screen.getByText('乙'));
    expect(onChange).toHaveBeenCalledWith('b');
  });
});
