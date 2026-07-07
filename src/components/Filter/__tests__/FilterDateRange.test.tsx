import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import CommonFilter from '../CommonFilter';
import FilterDateRange, { findMatchingQuickKey } from '../FilterDateRange';
import type { QuickOption } from '../FilterDateRange';

const quickOptions: QuickOption[] = [
  {
    key: '1m',
    label: '近1月',
    getValue: () => [dayjs('2026-06-08'), dayjs('2026-07-07')],
  },
  {
    key: '3m',
    label: '近3月',
    getValue: () => [dayjs('2026-04-08'), dayjs('2026-07-07')],
  },
];

describe('FilterDateRange', () => {
  it('renders with label', () => {
    render(<FilterDateRange filterKey="date" label="日期" />);
    expect(screen.getByText('日期')).toBeInTheDocument();
  });

  it('findMatchingQuickKey matches preset range', () => {
    expect(findMatchingQuickKey(['2026-06-08', '2026-07-07'], quickOptions)).toBe('1m');
    expect(findMatchingQuickKey(['2026-04-08', '2026-07-07'], quickOptions)).toBe('3m');
    expect(findMatchingQuickKey(['2026-01-01', '2026-07-07'], quickOptions)).toBeNull();
  });

  it('showDefaultAsSelected registers tag when value equals defaultValue', () => {
    const defaultValue: [string, string] = ['2026-06-08', '2026-07-07'];

    render(
      <CommonFilter label="筛选">
        <FilterDateRange
          filterKey="dateRange"
          label="日期"
          defaultValue={defaultValue}
          showDefaultAsSelected
          value={defaultValue}
          quickOptions={quickOptions}
          showQuickOptions
        />
      </CommonFilter>,
    );

    expect(screen.getByText(/2026-06-08 ~ 2026-07/)).toBeInTheDocument();
  });

  it('hides tag when value equals defaultValue without showDefaultAsSelected', () => {
    const defaultValue: [string, string] = ['2026-06-08', '2026-07-07'];

    render(
      <CommonFilter label="筛选">
        <FilterDateRange
          filterKey="dateRange"
          label="日期"
          defaultValue={defaultValue}
          value={defaultValue}
          quickOptions={quickOptions}
          showQuickOptions
        />
      </CommonFilter>,
    );

    expect(screen.queryByText('2026-06-08 ~ 2026-07-07')).not.toBeInTheDocument();
  });
});
