import dayjs, { type Dayjs } from 'dayjs';

/** 单 DatePicker 选择粒度 */
export type DatePickerGranularity = 'date' | 'month' | 'year';

/** Dayjs → 与 picker 粒度一致的字符串 */
export function formatPickerValue(date: Dayjs, picker: DatePickerGranularity = 'date'): string {
  switch (picker) {
    case 'year':
      return date.format('YYYY');
    case 'month':
      return date.format('YYYY-MM');
    default:
      return date.format('YYYY-MM-DD');
  }
}

/** 字符串 → Dayjs（按 picker 粒度解析） */
export function parsePickerValue(value: string, picker: DatePickerGranularity = 'date'): Dayjs {
  const trimmed = value.trim();
  switch (picker) {
    case 'year':
      return dayjs(`${trimmed.slice(0, 4)}-01-01`);
    case 'month':
      return dayjs(`${trimmed.slice(0, 7)}-01`);
    default:
      return dayjs(trimmed.slice(0, 10));
  }
}

/** 判断字符串是否与 picker 粒度格式一致 */
export function isValidPickerValue(value: string, picker: DatePickerGranularity = 'date'): boolean {
  if (!value) return false;
  const parsed = parsePickerValue(value, picker);
  if (!parsed.isValid()) return false;
  return (
    formatPickerValue(parsed, picker) ===
    value.slice(0, picker === 'year' ? 4 : picker === 'month' ? 7 : 10)
  );
}
