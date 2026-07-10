import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import CommonFilter from '../CommonFilter';
import FilterDatePicker, { findMatchingQuickKey } from '../FilterDatePicker';
import type { SingleQuickOption } from '../FilterDatePicker';

const monthQuickOptions: SingleQuickOption[] = [
  {
    key: 'thisMonth',
    label: '本月',
    getValue: () => dayjs('2026-07-01'),
  },
  {
    key: 'lastMonth',
    label: '上月',
    getValue: () => dayjs('2026-06-01'),
  },
];

describe('FilterDatePicker', () => {
  it('renders with label', () => {
    render(<FilterDatePicker filterKey="month" label="月份" picker="month" />);
    expect(screen.getByText('月份')).toBeInTheDocument();
  });

  it('findMatchingQuickKey matches month preset', () => {
    expect(findMatchingQuickKey('2026-07', 'month', monthQuickOptions)).toBe('thisMonth');
    expect(findMatchingQuickKey('2026-06', 'month', monthQuickOptions)).toBe('lastMonth');
    expect(findMatchingQuickKey('2026-05', 'month', monthQuickOptions)).toBeNull();
  });

  it('showDefaultAsSelected registers tag when value equals defaultValue', () => {
    render(
      <CommonFilter label="筛选">
        <FilterDatePicker
          filterKey="month"
          label="月份"
          picker="month"
          defaultValue="2026-07"
          showDefaultAsSelected
          value="2026-07"
        />
      </CommonFilter>,
    );

    expect(screen.getByText('2026-07')).toBeInTheDocument();
  });

  it('hides tag when value equals defaultValue without showDefaultAsSelected', () => {
    const { container } = render(
      <CommonFilter label="筛选">
        <FilterDatePicker
          filterKey="month"
          label="月份"
          picker="month"
          defaultValue="2026-07"
          value="2026-07"
        />
      </CommonFilter>,
    );

    expect(container.querySelector('.common-filter-selected')).toBeNull();
  });
});
