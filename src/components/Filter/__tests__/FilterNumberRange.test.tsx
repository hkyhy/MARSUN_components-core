import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FilterNumberRange from '../FilterNumberRange';

describe('FilterNumberRange', () => {
  it('renders with label', () => {
    render(<FilterNumberRange filterKey="size" label="文件大小" />);
    expect(screen.getByText('文件大小')).toBeInTheDocument();
  });

  it('renders with unit', () => {
    render(<FilterNumberRange filterKey="size" label="文件大小" unit="KB" />);
    expect(screen.getByText('文件大小')).toBeInTheDocument();
  });

  it('renders with value', () => {
    render(<FilterNumberRange filterKey="size" label="大小" value={[10, 100]} />);
    expect(screen.getByText('大小')).toBeInTheDocument();
  });
});
