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
