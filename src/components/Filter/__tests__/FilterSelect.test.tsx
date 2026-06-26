import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FilterSelect from '../FilterSelect';

describe('FilterSelect', () => {
  const options = [
    { label: '选项一', value: 'opt1' },
    { label: '选项二', value: 'opt2' },
    { label: '选项三', value: 'opt3' },
  ];

  it('renders with label', () => {
    render(<FilterSelect filterKey="status" label="状态" options={options} />);
    expect(screen.getByText('状态')).toBeInTheDocument();
  });

  it('renders with active state', () => {
    render(<FilterSelect filterKey="status" label="状态" options={options} active />);
    expect(screen.getByText('状态')).toBeInTheDocument();
  });

  it('renders with selected value', () => {
    render(<FilterSelect filterKey="status" label="状态" options={options} value="opt1" />);
    expect(screen.getByText('状态')).toBeInTheDocument();
  });
});
