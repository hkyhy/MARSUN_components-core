import dayjs, { type Dayjs } from 'dayjs';

/** 将日期范围转为不带时分秒的起止时间（YYYY-MM-DD） */
export function toDateRange(range: [string, string] | null): [string, string] | null {
  if (!range) return null;
  return [range[0], range[1]];
}

/** 将日期范围转为带时分秒的起止时间（YYYY-MM-DD HH:mm:ss） */
export function toDateTimeRange(range: [string, string] | null): [string, string] | null {
  if (!range) return null;
  return [`${range[0]} 00:00:00`, `${range[1]} 23:59:59`];
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_ONLY = /^\d{4}-\d{2}$/;

/** YYYY-MM → 月初/月末日；其余取前 10 位（YYYY-MM-DD 或已带时分秒） */
function toDayBound(value: string, bound: 'start' | 'end'): string {
  const raw = String(value || '').trim();
  if (MONTH_ONLY.test(raw)) {
    const month = dayjs(`${raw}-01`);
    return bound === 'start'
      ? month.startOf('month').format('YYYY-MM-DD')
      : month.endOf('month').format('YYYY-MM-DD');
  }
  return raw.slice(0, 10);
}

/**
 * UI 日期 → API start/end（`YYYY-MM-DD HH:mm:ss` 日界）。
 * `YYYY-MM` 展开为该月 1 日 00:00:00 / 月末 23:59:59（预警月、timeDuration 常用）。
 */
export function toApiStartEnd(start: string, end: string): { start: string; end: string } {
  const startDay = toDayBound(start, 'start');
  const endDay = toDayBound(end, 'end');
  const range = toDateTimeRange([startDay, endDay]);
  if (!range) return { start, end };
  return {
    start: DATE_ONLY.test(startDay) ? range[0] : start,
    end: DATE_ONLY.test(endDay) ? range[1] : end,
  };
}

/** 从今天往前推 months 个月（含今天；起始日为 N 月前同日 +1 天） */
export function recentDayRange(months: number): [Dayjs, Dayjs] {
  const end = dayjs().endOf('day');
  const start = dayjs().subtract(months, 'month').add(1, 'day').startOf('day');
  return [start, end];
}

/** 从今天往前推 1 年（含今天；起始日为 1 年前同日 +1 天） */
export function recentYearRange(): [Dayjs, Dayjs] {
  const end = dayjs().endOf('day');
  const start = dayjs().subtract(1, 'year').add(1, 'day').startOf('day');
  return [start, end];
}

/** 近 N 月 / 近1年 → YYYY-MM-DD（供 FilterDateRange UI） */
export function recentDayRangeStrings(span: number | '1y'): [string, string] {
  const [start, end] = span === '1y' ? recentYearRange() : recentDayRange(span);
  return [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')];
}

/**
 * 展示用日期时间：统一为 `YYYY-MM-DD HH:mm:ss`。
 * 非法 / 空串回退原文或 `—`。
 */
export function formatDateTimeDisplay(value?: string | null, empty = '—'): string {
  if (value == null) return empty;
  const raw = String(value).trim();
  if (!raw) return empty;
  const parsed = dayjs(raw);
  if (!parsed.isValid()) return raw;
  return parsed.format('YYYY-MM-DD HH:mm:ss');
}
