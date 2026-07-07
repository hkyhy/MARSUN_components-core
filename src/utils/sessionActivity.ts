/** localStorage 中记录最后一次用户操作时间的默认 key */
export const DEFAULT_LAST_ACTIVITY_STORAGE_KEY = 'maoyang_last_activity';

export function getLastActivityTime(storageKey = DEFAULT_LAST_ACTIVITY_STORAGE_KEY): number {
  const raw = localStorage.getItem(storageKey);
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : Date.now();
}

export function touchLastActivity(storageKey = DEFAULT_LAST_ACTIVITY_STORAGE_KEY): void {
  localStorage.setItem(storageKey, String(Date.now()));
}

export function clearLastActivity(storageKey = DEFAULT_LAST_ACTIVITY_STORAGE_KEY): void {
  localStorage.removeItem(storageKey);
}
