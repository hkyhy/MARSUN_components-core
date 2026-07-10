import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import { formatPickerValue, isValidPickerValue, parsePickerValue } from '../pickerDate';

describe('pickerDate utils', () => {
  it('formatPickerValue respects granularity', () => {
    const date = dayjs('2026-07-15');
    expect(formatPickerValue(date, 'date')).toBe('2026-07-15');
    expect(formatPickerValue(date, 'month')).toBe('2026-07');
    expect(formatPickerValue(date, 'year')).toBe('2026');
  });

  it('parsePickerValue respects granularity', () => {
    expect(parsePickerValue('2026-07-15', 'date').format('YYYY-MM-DD')).toBe('2026-07-15');
    expect(parsePickerValue('2026-07', 'month').format('YYYY-MM')).toBe('2026-07');
    expect(parsePickerValue('2026', 'year').format('YYYY')).toBe('2026');
  });

  it('isValidPickerValue validates format', () => {
    expect(isValidPickerValue('2026-07-15', 'date')).toBe(true);
    expect(isValidPickerValue('2026-07', 'month')).toBe(true);
    expect(isValidPickerValue('2026', 'year')).toBe(true);
    expect(isValidPickerValue('2026-7', 'month')).toBe(false);
  });
});
