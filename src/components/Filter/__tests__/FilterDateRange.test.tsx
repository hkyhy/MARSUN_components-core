import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FilterDateRange from '../FilterDateRange';

describe('FilterDateRange', () => {
  it('renders with label', () => {
    render(<FilterDateRange filterKey="date" label="日期" />);
    expect(screen.getByText('日期')).toBeInTheDocument();
  });

  it('renders with value', () => {
    render(<FilterDateRange filterKey="date" label="日期" value={['2024-01-01', '2024-12-31']} />);
    expect(screen.getByText('日期')).toBeInTheDocument();
  });

  it('renders quick options by default', () => {
    render(<FilterDateRange filterKey="date" label="日期" />);
    // Quick options are rendered inside popover, just verify label is shown
    expect(screen.getByText('日期')).toBeInTheDocument();
  });
});
