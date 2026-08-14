import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FilterTypeDateRange from '../FilterTypeDateRange';

describe('FilterTypeDateRange', () => {
  it('renders label', () => {
    render(<FilterTypeDateRange filterKey="r" label="时间范围" />);
    expect(screen.getByText('时间范围')).toBeInTheDocument();
  });

  it('renders with value', () => {
    render(
      <FilterTypeDateRange
        filterKey="r"
        label="时间范围"
        value={{ type: 'date', range: ['2026-01-01', '2026-01-31'] }}
      />,
    );
    expect(screen.getAllByText('时间范围').length).toBeGreaterThan(0);
  });
});
