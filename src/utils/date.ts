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

/** UI 日期 → API start/end（带时分秒） */
export function toApiStartEnd(start: string, end: string): { start: string; end: string } {
  const startDay = start.slice(0, 10);
  const endDay = end.slice(0, 10);
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
