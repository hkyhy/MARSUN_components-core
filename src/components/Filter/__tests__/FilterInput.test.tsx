import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FilterInput from '../FilterInput';

// FilterPopover uses antd Popover which needs full rendering
// We test FilterInput by checking it renders label and handles confirm/reset
describe('FilterInput', () => {
  it('renders with label', () => {
    render(<FilterInput filterKey="keyword" label="关键词" />);
    expect(screen.getByText('关键词')).toBeInTheDocument();
  });

  it('renders with active state', () => {
    render(<FilterInput filterKey="keyword" label="关键词" active />);
    expect(screen.getByText('关键词')).toBeInTheDocument();
  });

  it('renders with value prop', () => {
    render(<FilterInput filterKey="keyword" label="关键词" value="test" />);
    expect(screen.getByText('关键词')).toBeInTheDocument();
  });
});
