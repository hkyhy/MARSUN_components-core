import dayjs from 'dayjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  recentDayRange,
  recentDayRangeStrings,
  recentYearRange,
  toApiStartEnd,
  toDateTimeRange,
} from '../date';

describe('date utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-07T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('recentDayRange uses start = N months ago + 1 day', () => {
    const [start, end] = recentDayRange(1);
    expect(start.format('YYYY-MM-DD')).toBe('2026-06-08');
    expect(end.format('YYYY-MM-DD')).toBe('2026-07-07');
  });

  it('recentDayRangeStrings returns YYYY-MM-DD for 3 months', () => {
    const [start, end] = recentDayRangeStrings(3);
    expect(start).toBe('2026-04-08');
    expect(end).toBe('2026-07-07');
  });

  it('recentYearRange uses start = 1 year ago + 1 day', () => {
    const [start, end] = recentYearRange();
    expect(start.format('YYYY-MM-DD')).toBe('2025-07-08');
    expect(end.format('YYYY-MM-DD')).toBe('2026-07-07');
  });

  it('toDateTimeRange appends day boundaries', () => {
    expect(toDateTimeRange(['2026-04-08', '2026-07-07'])).toEqual([
      '2026-04-08 00:00:00',
      '2026-07-07 23:59:59',
    ]);
  });

  it('toApiStartEnd formats API start/end', () => {
    expect(toApiStartEnd('2026-04-08', '2026-07-07')).toEqual({
      start: '2026-04-08 00:00:00',
      end: '2026-07-07 23:59:59',
    });
  });

  it('toApiStartEnd passes through values that already include time', () => {
    const input = {
      start: '2026-04-08 00:00:00',
      end: '2026-07-07 23:59:59',
    };
    expect(toApiStartEnd(input.start, input.end)).toEqual(input);
  });
});
